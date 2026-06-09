import type { Config, Context } from "@netlify/functions";
import { getUser } from "@netlify/identity";
import { db } from "../../db/index.js";
import { misinformationReports } from "../../db/schema.js";
import { eq, and, count } from "drizzle-orm";

const FLAG_THRESHOLD = 3;

export default async (req: Request, context: Context) => {
  if (req.method !== "POST")
    return Response.json({ error: "Method not allowed" }, { status: 405 });

  const user = await getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { targetType, targetId, reason } = await req.json().catch(() => ({} as any));
  if (!targetType || !targetId)
    return Response.json({ error: "targetType and targetId required." }, { status: 400 });

  const tId = String(targetId);

  // One report per user per target
  const existing = await db
    .select()
    .from(misinformationReports)
    .where(
      and(
        eq(misinformationReports.reporterId, user.id),
        eq(misinformationReports.targetType, targetType),
        eq(misinformationReports.targetId, tId)
      )
    );
  if (existing.length) return Response.json({ ok: true, already: true });

  await db.insert(misinformationReports).values({
    reporterId: user.id,
    targetType,
    targetId: tId,
    reason: reason ?? null,
  });

  // Count total reports on this target
  const [{ value: total }] = await db
    .select({ value: count() })
    .from(misinformationReports)
    .where(
      and(
        eq(misinformationReports.targetType, targetType),
        eq(misinformationReports.targetId, tId)
      )
    );

  const flagged = Number(total) >= FLAG_THRESHOLD;
  if (flagged) {
    await db
      .update(misinformationReports)
      .set({ status: "flagged" })
      .where(
        and(
          eq(misinformationReports.targetType, targetType),
          eq(misinformationReports.targetId, tId),
          eq(misinformationReports.status, "pending")
        )
      );
  }

  return Response.json({ ok: true, flagged, reports: Number(total) });
};

export const config: Config = {
  path: "/api/misinformation",
};
