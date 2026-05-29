import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { posts, neighborBoardItems } from "../../db/schema.js";
import { sql, gte } from "drizzle-orm";

export default async (req: Request) => {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [postStats] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(posts)
    .where(gte(posts.createdAt, since));

  const [neighborStats] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(neighborBoardItems)
    .where(gte(neighborBoardItems.createdAt, since));

  return Response.json({
    postsToday: postStats?.count || 0,
    neighborNotices: neighborStats?.count || 0,
  });
};

export const config: Config = {
  path: "/api/stats",
};
