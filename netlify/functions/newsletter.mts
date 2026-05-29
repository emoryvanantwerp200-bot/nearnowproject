import type { Config, Context } from "@netlify/functions";
import { db } from "../../db/index.js";
import { newsletterSubscribers } from "../../db/schema.js";
import { eq } from "drizzle-orm";

export default async (req: Request, context: Context) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  if (req.method === "POST") {
    try {
      const body = await req.json();
      const email = String(body.email || "").trim().toLowerCase();
      const name = String(body.name || "").trim();
      const action = String(body.action || "").trim();

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return Response.json(
          { error: "A valid email address is required." },
          { status: 400, headers: corsHeaders }
        );
      }

      if (action === "unsubscribe") {
        const [updated] = await db
          .update(newsletterSubscribers)
          .set({ status: "unsubscribed" })
          .where(eq(newsletterSubscribers.email, email))
          .returning();
          
        return Response.json(
          { message: "You have been successfully unsubscribed from the newsletter.", subscriber: updated },
          { status: 200, headers: corsHeaders }
        );
      }

      // Check if subscriber already exists
      const existing = await db
        .select()
        .from(newsletterSubscribers)
        .where(eq(newsletterSubscribers.email, email))
        .limit(1);

      if (existing.length > 0) {
        if (existing[0].status === "active") {
          return Response.json(
            { message: "You are already subscribed to the newsletter!", subscriber: existing[0] },
            { status: 200, headers: corsHeaders }
          );
        } else {
          // Re-activate
          const [updated] = await db
            .update(newsletterSubscribers)
            .set({ status: "active" })
            .where(eq(newsletterSubscribers.email, email))
            .returning();
          return Response.json(
            { message: "Welcome back! Your subscription has been reactivated.", subscriber: updated },
            { status: 200, headers: corsHeaders }
          );
        }
      }

      // Insert new subscriber
      const [inserted] = await db
        .insert(newsletterSubscribers)
        .values({ email, name: name || null, status: "active" })
        .returning();

      return Response.json(
        { message: "Thank you for subscribing to the NearNow newsletter!", subscriber: inserted },
        { status: 201, headers: corsHeaders }
      );
    } catch (err: any) {
      return Response.json(
        { error: err.message || "Failed to process subscription." },
        { status: 500, headers: corsHeaders }
      );
    }
  }

  if (req.method === "GET") {
    try {
      const url = new URL(req.url);
      const checkEmail = url.searchParams.get("email");

      if (checkEmail) {
        const existing = await db
          .select()
          .from(newsletterSubscribers)
          .where(eq(newsletterSubscribers.email, checkEmail.trim().toLowerCase()))
          .limit(1);

        if (existing.length > 0) {
          return Response.json(
            { subscribed: true, status: existing[0].status, name: existing[0].name },
            { status: 200, headers: corsHeaders }
          );
        } else {
          return Response.json(
            { subscribed: false },
            { status: 200, headers: corsHeaders }
          );
        }
      }

      // Allow fetching subscriber count
      const subscribers = await db.select().from(newsletterSubscribers);
      return Response.json(
        { count: subscribers.length },
        { status: 200, headers: corsHeaders }
      );
    } catch (err: any) {
      return Response.json(
        { error: err.message || "Failed to fetch subscriber info." },
        { status: 500, headers: corsHeaders }
      );
    }
  }

  return Response.json(
    { error: "Method not allowed" },
    { status: 405, headers: corsHeaders }
  );
};

export const config: Config = {
  path: "/api/newsletter",
};
