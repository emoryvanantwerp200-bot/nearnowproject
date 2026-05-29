import type { Config, Context } from "@netlify/functions";
import { getUser } from "@netlify/identity";
import { db } from "../../db/index.js";
import { familyMembers } from "../../db/schema.js";
import { eq, and } from "drizzle-orm";

export default async (req: Request, context: Context) => {
  const user = await getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  if (req.method === "GET") {
    const rows = await db
      .select()
      .from(familyMembers)
      .where(eq(familyMembers.userId, user.id));

    return Response.json({ members: rows });
  }

  if (req.method === "POST") {
    const body = await req.json();
    const name = String(body.name || "").trim();
    const status = String(body.status || "").trim();
    const note = String(body.note || "").trim();
    const latitude = body.latitude !== undefined && body.latitude !== null && !isNaN(parseFloat(body.latitude)) ? parseFloat(body.latitude) : null;
    const longitude = body.longitude !== undefined && body.longitude !== null && !isNaN(parseFloat(body.longitude)) ? parseFloat(body.longitude) : null;

    if (!name || name.length > 120) {
      return Response.json({ error: "Name is required (max 120 chars)." }, { status: 400 });
    }

    const [row] = await db
      .insert(familyMembers)
      .values({ userId: user.id, name, status, note, latitude, longitude })
      .returning();

    return Response.json({ member: row }, { status: 201 });
  }

  if (req.method === "PUT") {
    const body = await req.json();
    const id = parseInt(body.id, 10);
    if (!id) return Response.json({ error: "Member ID required." }, { status: 400 });

    const updates: any = {};
    if (body.status !== undefined) updates.status = String(body.status).trim();
    if (body.note !== undefined) updates.note = String(body.note).trim();
    if (body.name !== undefined) updates.name = String(body.name).trim();
    if (body.latitude !== undefined) updates.latitude = body.latitude !== null && !isNaN(parseFloat(body.latitude)) ? parseFloat(body.latitude) : null;
    if (body.longitude !== undefined) updates.longitude = body.longitude !== null && !isNaN(parseFloat(body.longitude)) ? parseFloat(body.longitude) : null;

    const [row] = await db
      .update(familyMembers)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(familyMembers.id, id), eq(familyMembers.userId, user.id)))
      .returning();

    if (!row) return Response.json({ error: "Member not found." }, { status: 404 });
    return Response.json({ member: row });
  }

  if (req.method === "DELETE") {
    const url = new URL(req.url);
    const id = parseInt(url.searchParams.get("id") || "", 10);
    if (!id) return Response.json({ error: "Member ID required." }, { status: 400 });

    await db
      .delete(familyMembers)
      .where(and(eq(familyMembers.id, id), eq(familyMembers.userId, user.id)));

    return Response.json({ deleted: true });
  }

  return Response.json({ error: "Method not allowed" }, { status: 405 });
};

export const config: Config = {
  path: "/api/family",
};
