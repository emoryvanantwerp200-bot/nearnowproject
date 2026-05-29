import type { Config, Context } from "@netlify/functions";
import { getUser } from "@netlify/identity";
import { db } from "../../db/index.js";
import { neighborBoardItems } from "../../db/schema.js";
import { desc } from "drizzle-orm";

export default async (req: Request, context: Context) => {
  if (req.method === "GET") {
    const rows = await db
      .select()
      .from(neighborBoardItems)
      .orderBy(desc(neighborBoardItems.createdAt))
      .limit(20);

    return Response.json({ items: rows });
  }

  if (req.method === "POST") {
    const user = await getUser();
    if (!user) return new Response("Unauthorized", { status: 401 });

    const body = await req.json();
    const title = String(body.title || "").trim();
    const zone = String(body.zone || "").trim();

    if (!title || title.length > 200) {
      return Response.json({ error: "Title is required (max 200 chars)." }, { status: 400 });
    }
    if (!zone || zone.length > 120) {
      return Response.json({ error: "Zone is required (max 120 chars)." }, { status: 400 });
    }

    const [row] = await db
      .insert(neighborBoardItems)
      .values({ authorId: user.id, title, zone })
      .returning();

    return Response.json({ item: row }, { status: 201 });
  }

  return Response.json({ error: "Method not allowed" }, { status: 405 });
};

export const config: Config = {
  path: "/api/neighbor-board",
};
