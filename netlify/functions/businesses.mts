import type { Config, Context } from "@netlify/functions";
import { getUser } from "@netlify/identity";
import { db } from "../../db/index.js";
import { businesses, userProfiles, reputationEvents } from "../../db/schema.js";
import { eq, desc, sql } from "drizzle-orm";

async function award(userId: string, delta: number, reason: string) {
  await db.insert(reputationEvents).values({ userId, delta, reason });
  await db
    .update(userProfiles)
    .set({ reputationPoints: sql`"reputation_points" + ${delta}` })
    .where(eq(userProfiles.userId, userId));
}

export default async (req: Request, context: Context) => {
  const user = await getUser();

  // GET — list businesses (optionally verified-only)
  if (req.method === "GET") {
    const onlyVerified = new URL(req.url).searchParams.get("verified") === "true";
    const rows = await db
      .select()
      .from(businesses)
      .where(onlyVerified ? eq(businesses.verified, true) : undefined)
      .orderBy(desc(businesses.createdAt));
    return Response.json({ businesses: rows });
  }

  if (!user) return new Response("Unauthorized", { status: 401 });

  if (req.method === "POST") {
    const body = await req.json().catch(() => ({} as any));
    const action = body.action ?? "register";

    // Register a new business listing
    if (action === "register") {
      if (!body.name) return Response.json({ error: "Name is required." }, { status: 400 });
      const [row] = await db
        .insert(businesses)
        .values({
          ownerId: user.id,
          name: body.name,
          category: body.category ?? null,
          description: body.description ?? null,
        })
        .returning();
      return Response.json({ business: row }, { status: 201 });
    }

    // Admin: verify a business
    if (action === "verify") {
      const roles: string[] = (user as any).app_metadata?.roles ?? [];
      if (!roles.includes("admin"))
        return Response.json({ error: "Forbidden" }, { status: 403 });
      const [row] = await db
        .update(businesses)
        .set({ verified: true, verifiedAt: new Date() })
        .where(eq(businesses.id, body.businessId))
        .returning();
      if (row) await award(row.ownerId, 25, "business_verified");
      return Response.json({ business: row });
    }

    // Admin: verify a user account
    if (action === "verifyUser") {
      const roles: string[] = (user as any).app_metadata?.roles ?? [];
      if (!roles.includes("admin"))
        return Response.json({ error: "Forbidden" }, { status: 403 });
      await db
        .update(userProfiles)
        .set({ verified: true, verifiedAt: new Date() })
        .where(eq(userProfiles.userId, body.userId));
      await award(body.userId, 50, "account_verified");
      return Response.json({ ok: true });
    }

    return Response.json({ error: "Unknown action." }, { status: 400 });
  }

  return Response.json({ error: "Method not allowed" }, { status: 405 });
};

export const config: Config = {
  path: "/api/businesses",
};
