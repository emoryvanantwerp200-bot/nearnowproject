import type { Config, Context } from "@netlify/functions";
import { getUser } from "@netlify/identity";
import { db } from "../../db/index.js";
import { posts } from "../../db/schema.js";
import { desc, eq } from "drizzle-orm";

export default async (req: Request, context: Context) => {
  if (req.method === "GET") {
    const url = new URL(req.url);
    const typeFilter = url.searchParams.get("type");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 100);

    let query = db.select().from(posts).orderBy(desc(posts.createdAt)).limit(limit);
    if (typeFilter && ["social", "neighbor", "family"].includes(typeFilter)) {
      query = query.where(eq(posts.type, typeFilter)) as typeof query;
    }

    const rows = await query;
    return Response.json({ posts: rows });
  }

  if (req.method === "POST") {
    const user = await getUser();
    if (!user) return new Response("Unauthorized", { status: 401 });

    const body = await req.json();
    const text = String(body.text || "").trim();
    const type = ["social", "neighbor", "family"].includes(body.type) ? body.type : "social";

    if (!text || text.length > 2000) {
      return Response.json({ error: "Post text is required (max 2000 chars)." }, { status: 400 });
    }

    const authorName = user.user_metadata?.full_name || user.email || "Neighbor";

    const [row] = await db
      .insert(posts)
      .values({ authorId: user.id, authorName, type, text })
      .returning();

    return Response.json({ post: row }, { status: 201 });
  }

  return Response.json({ error: "Method not allowed" }, { status: 405 });
};

export const config: Config = {
  path: "/api/posts",
};
