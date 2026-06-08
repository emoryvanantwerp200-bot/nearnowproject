import type { Config, Context } from "@netlify/functions";
import { getUser } from "@netlify/identity";
import { db } from "../../db/index.js";
import { userProfiles, friendships } from "../../db/schema.js";
import { eq, and, or, ne, ilike, inArray } from "drizzle-orm";

// Keep the caller's profile row current so they are discoverable by others.
async function upsertProfile(user: any) {
  const email = String(user.email || "").trim();
  const name = String(user.user_metadata?.full_name || email.split("@")[0] || "NearNow user").trim();
  const existing = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, user.id));

  if (existing.length) {
    await db
      .update(userProfiles)
      .set({ email, name, updatedAt: new Date() })
      .where(eq(userProfiles.userId, user.id));
  } else {
    await db.insert(userProfiles).values({ userId: user.id, email, name });
  }
}

// Every friendship row that involves a given user.
async function relationshipsFor(userId: string) {
  return db
    .select()
    .from(friendships)
    .where(or(eq(friendships.requesterId, userId), eq(friendships.addresseeId, userId)));
}

// Map of userId -> { name, email } for a set of ids.
async function profilesByIds(ids: string[]) {
  const unique = [...new Set(ids)].filter(Boolean);
  if (!unique.length) return new Map<string, { name: string; email: string }>();
  const rows = await db
    .select()
    .from(userProfiles)
    .where(inArray(userProfiles.userId, unique));
  return new Map(rows.map((r) => [r.userId, { name: r.name, email: r.email }]));
}

export default async (req: Request, context: Context) => {
  const user = await getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  await upsertProfile(user);
  const me = user.id;

  // ---- GET: search users, or list my friends + pending requests ----
  if (req.method === "GET") {
    const url = new URL(req.url);
    const search = (url.searchParams.get("search") || "").trim();

    if (search) {
      const term = `%${search}%`;
      const matches = await db
        .select()
        .from(userProfiles)
        .where(
          and(
            ne(userProfiles.userId, me),
            or(ilike(userProfiles.email, term), ilike(userProfiles.name, term))
          )
        );

      const rels = await relationshipsFor(me);
      const relFor = (otherId: string) => {
        const r = rels.find(
          (x) =>
            (x.requesterId === me && x.addresseeId === otherId) ||
            (x.requesterId === otherId && x.addresseeId === me)
        );
        if (!r) return "none";
        if (r.status === "accepted") return "friends";
        if (r.status === "pending") return r.requesterId === me ? "outgoing" : "incoming";
        return "none";
      };

      const results = matches.slice(0, 20).map((p) => ({
        userId: p.userId,
        name: p.name,
        email: p.email,
        relationship: relFor(p.userId),
      }));
      return Response.json({ results });
    }

    const rels = await relationshipsFor(me);
    const otherIds = rels.map((r) => (r.requesterId === me ? r.addresseeId : r.requesterId));
    const profiles = await profilesByIds(otherIds);
    const shape = (otherId: string) =>
      profiles.get(otherId) || { name: "NearNow user", email: "" };

    const friends = rels
      .filter((r) => r.status === "accepted")
      .map((r) => {
        const otherId = r.requesterId === me ? r.addresseeId : r.requesterId;
        return { id: r.id, userId: otherId, ...shape(otherId) };
      });

    const incoming = rels
      .filter((r) => r.status === "pending" && r.addresseeId === me)
      .map((r) => ({ id: r.id, userId: r.requesterId, ...shape(r.requesterId) }));

    const outgoing = rels
      .filter((r) => r.status === "pending" && r.requesterId === me)
      .map((r) => ({ id: r.id, userId: r.addresseeId, ...shape(r.addresseeId) }));

    return Response.json({ friends, incoming, outgoing });
  }

  // ---- POST: send (or auto-accept reciprocal) a friend request ----
  if (req.method === "POST") {
    const body = await req.json().catch(() => ({}));
    const email = String(body.email || "").trim();
    const targetUserId = String(body.userId || "").trim();

    let target;
    if (targetUserId) {
      [target] = await db.select().from(userProfiles).where(eq(userProfiles.userId, targetUserId));
    } else if (email) {
      [target] = await db.select().from(userProfiles).where(ilike(userProfiles.email, email));
    } else {
      return Response.json({ error: "Provide an email or user to add." }, { status: 400 });
    }

    if (!target) {
      return Response.json({ error: "No NearNow user found with that email or name." }, { status: 404 });
    }
    if (target.userId === me) {
      return Response.json({ error: "You can't friend yourself." }, { status: 400 });
    }

    const [existing] = await db
      .select()
      .from(friendships)
      .where(
        or(
          and(eq(friendships.requesterId, me), eq(friendships.addresseeId, target.userId)),
          and(eq(friendships.requesterId, target.userId), eq(friendships.addresseeId, me))
        )
      );

    if (existing) {
      if (existing.status === "accepted") {
        return Response.json({ error: "You're already friends." }, { status: 400 });
      }
      if (existing.status === "pending") {
        if (existing.requesterId === me) {
          return Response.json({ error: "Request already sent." }, { status: 400 });
        }
        // They already requested me — accept it now.
        const [row] = await db
          .update(friendships)
          .set({ status: "accepted", updatedAt: new Date() })
          .where(eq(friendships.id, existing.id))
          .returning();
        return Response.json({ friendship: row, accepted: true });
      }
      // Previously declined — revive as a fresh request from me.
      const [row] = await db
        .update(friendships)
        .set({ requesterId: me, addresseeId: target.userId, status: "pending", updatedAt: new Date() })
        .where(eq(friendships.id, existing.id))
        .returning();
      return Response.json({ friendship: row }, { status: 201 });
    }

    const [row] = await db
      .insert(friendships)
      .values({ requesterId: me, addresseeId: target.userId, status: "pending" })
      .returning();
    return Response.json({ friendship: row }, { status: 201 });
  }

  // ---- PUT: accept or decline an incoming request ----
  if (req.method === "PUT") {
    const body = await req.json().catch(() => ({}));
    const id = parseInt(body.id, 10);
    const action = String(body.action || "").trim();
    if (!id || !["accept", "decline"].includes(action)) {
      return Response.json({ error: "Request id and action (accept|decline) required." }, { status: 400 });
    }

    const [row] = await db
      .update(friendships)
      .set({ status: action === "accept" ? "accepted" : "declined", updatedAt: new Date() })
      .where(
        and(
          eq(friendships.id, id),
          eq(friendships.addresseeId, me),
          eq(friendships.status, "pending")
        )
      )
      .returning();

    if (!row) return Response.json({ error: "Pending request not found." }, { status: 404 });
    return Response.json({ friendship: row });
  }

  // ---- DELETE: unfriend, or cancel a request I sent ----
  if (req.method === "DELETE") {
    const url = new URL(req.url);
    const id = parseInt(url.searchParams.get("id") || "", 10);
    if (!id) return Response.json({ error: "Friendship id required." }, { status: 400 });

    await db
      .delete(friendships)
      .where(
        and(
          eq(friendships.id, id),
          or(eq(friendships.requesterId, me), eq(friendships.addresseeId, me))
        )
      );

    return Response.json({ deleted: true });
  }

  return Response.json({ error: "Method not allowed" }, { status: 405 });
};

export const config: Config = {
  path: "/api/friends",
};
import { pgTable, serial, text, timestamp, integer, varchar, doublePrecision } from "drizzle-orm/pg-core";

export const posts = pgTable("posts", {
  id: serial().primaryKey(),
  authorId: text("author_id").notNull(),
  authorName: varchar("author_name", { length: 120 }).notNull(),
  type: varchar("type", { length: 20 }).notNull().default("social"),
  text: text().notNull(),
  reactions: integer().notNull().default(0),
  replies: integer().notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const neighborBoardItems = pgTable("neighbor_board_items", {
  id: serial().primaryKey(),
  authorId: text("author_id").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  zone: varchar("zone", { length: 120 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const familyMembers = pgTable("family_members", {
  id: serial().primaryKey(),
  userId: text("user_id").notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  status: varchar("status", { length: 200 }).notNull().default(""),
  note: varchar("note", { length: 200 }).notNull().default(""),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const feedItems = pgTable("feed_items", {
  id: serial().primaryKey(),
  category: varchar("category", { length: 20 }).notNull().default("community"),
  title: varchar("title", { length: 200 }).notNull(),
  body: text().notNull().default(""),
  area: varchar("area", { length: 60 }).notNull().default("mobile"),
  source: varchar("source", { length: 160 }).notNull().default("Community report"),
  sourceUrl: text("source_url"),
  trust: varchar("trust", { length: 20 }).notNull().default("unverified"),
  status: varchar("status", { length: 20 }).notNull().default("published"),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Public-ish profile row so users are discoverable by email/name for friend search.
// Upserted automatically whenever an authenticated user hits the friends API.
export const userProfiles = pgTable("user_profiles", {
  id: serial().primaryKey(),
  userId: text("user_id").notNull().unique(),
  email: varchar("email", { length: 255 }).notNull(),
  name: varchar("name", { length: 120 }).notNull().default(""),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// One row per friend relationship. requesterId sent the request to addresseeId.
// status: "pending" | "accepted" | "declined".
export const friendships = pgTable("friendships", {
  id: serial().primaryKey(),
  requesterId: text("requester_id").notNull(),
  addresseeId: text("addressee_id").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: serial().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 120 }),
  status: varchar("status", { length: 50 }).notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});
-- NearNow: friend system tables
-- Run this once against your Netlify DB (Neon SQL console), OR regenerate the
-- tracked Drizzle migration with:  npx drizzle-kit generate

CREATE TABLE IF NOT EXISTS "user_profiles" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "email" varchar(255) NOT NULL,
  "name" varchar(120) DEFAULT '' NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now(),
  CONSTRAINT "user_profiles_user_id_key" UNIQUE("user_id")
);

CREATE TABLE IF NOT EXISTS "friendships" (
  "id" serial PRIMARY KEY NOT NULL,
  "requester_id" text NOT NULL,
  "addressee_id" text NOT NULL,
  "status" varchar(20) DEFAULT 'pending' NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "friendships_requester_idx" ON "friendships" ("requester_id");
CREATE INDEX IF NOT EXISTS "friendships_addressee_idx" ON "friendships" ("addressee_id");
CREATE INDEX IF NOT EXISTS "user_profiles_email_idx" ON "user_profiles" ("email");
