import type { Config, Context } from "@netlify/functions";
import { db } from "../../db/index.js";
import { feedItems } from "../../db/schema.js";
import { and, desc, eq } from "drizzle-orm";

const AREAS = ["baldwin", "mobile", "escambia", "westmobile", "pascagoula"];

const AREA_LABELS: Record<string, string> = {
  baldwin: "Baldwin County",
  mobile: "Mobile County",
  escambia: "Escambia County",
  westmobile: "West Mobile",
  pascagoula: "Pascagoula, Mississippi",
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
};

function normalizeArea(value: string | null): string | null {
  if (!value) return null;
  const v = value.trim().toLowerCase();
  if (AREAS.includes(v)) return v;
  if (v.includes("baldwin") || v.includes("fairhope") || v.includes("daphne")) return "baldwin";
  if (v.includes("escambia") || v.includes("pensacola")) return "escambia";
  if (v.includes("west")) return "westmobile";
  if (v.includes("pascagoula") || v.includes("jackson")) return "pascagoula";
  if (v.includes("mobile")) return "mobile";
  return null;
}

// Plain, deterministic fallback used when AI Gateway is unavailable so the brief
// never renders empty. Counts items by category and stitches a short sentence.
function localSummary(items: Array<{ category: string; title: string }>, label: string): string {
  if (!items.length) {
    return `No active local alerts for ${label} right now. Check back through the day for weather, traffic, and community updates.`;
  }
  const byCat = (cat: string) => items.filter((i) => i.category === cat);
  const parts: string[] = [];
  const weather = byCat("weather");
  const traffic = byCat("traffic");
  const events = byCat("events");
  const emergency = byCat("emergency");
  const community = byCat("community");

  if (emergency.length) parts.push(`${emergency.length} emergency alert${emergency.length > 1 ? "s" : ""} active`);
  if (weather.length) parts.push(`weather: ${weather[0].title.toLowerCase()}`);
  if (traffic.length)
    parts.push(`${traffic.length} traffic item${traffic.length > 1 ? "s" : ""} reported`);
  if (events.length) parts.push(`${events.length} local event${events.length > 1 ? "s" : ""} today`);
  if (community.length)
    parts.push(`${community.length} community report${community.length > 1 ? "s" : ""} to review`);

  return `Good morning. For ${label}: ${parts.join(", ")}.`;
}

export default async (req: Request, _context: Context) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (req.method !== "GET") {
    return Response.json({ error: "Method not allowed" }, { status: 405, headers: corsHeaders });
  }

  try {
    const area = normalizeArea(new URL(req.url).searchParams.get("area"));
    const label = (area && AREA_LABELS[area]) || "your area";

    const filters = [eq(feedItems.status, "published")];
    if (area) filters.push(eq(feedItems.area, area));

    const items = await db
      .select({ category: feedItems.category, title: feedItems.title, trust: feedItems.trust })
      .from(feedItems)
      .where(and(...filters))
      .orderBy(desc(feedItems.createdAt))
      .limit(20);

    const fallback = localSummary(items, label);

    const gatewayUrl = process.env.NETLIFY_AI_GATEWAY_BASE_URL;
    const gatewayKey = process.env.NETLIFY_AI_GATEWAY_KEY;

    // Without the gateway (e.g. local dev or before the first prod deploy) return
    // the deterministic summary so the homepage still has a useful brief.
    if (!gatewayKey || !gatewayUrl || !items.length) {
      return Response.json(
        { area: area || "all", label, summary: fallback, source: "rules", itemCount: items.length },
        { headers: corsHeaders }
      );
    }

    const inventory = items
      .map((i) => `- [${i.category}] ${i.title} (${i.trust})`)
      .join("\n");

    const aiResponse = await fetch(`${gatewayUrl}anthropic/v1/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${gatewayKey}`,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 220,
        messages: [
          {
            role: "user",
            content: `You write a friendly, factual two-to-three sentence morning briefing for a hyperlocal alerts app called NearNow, covering ${label}. Use ONLY the items listed below — do not invent specifics. Start with a short greeting like "Good morning." Mention weather first if present, then traffic, then events and community reports. Keep it under 60 words. Plain text only.\n\nItems:\n${inventory}`,
          },
        ],
      }),
    });

    if (!aiResponse.ok) {
      return Response.json(
        { area: area || "all", label, summary: fallback, source: "rules", itemCount: items.length },
        { headers: corsHeaders }
      );
    }

    const aiData = await aiResponse.json();
    const text = aiData?.content?.[0]?.text?.trim();

    return Response.json(
      {
        area: area || "all",
        label,
        summary: text || fallback,
        source: text ? "ai" : "rules",
        itemCount: items.length,
      },
      { headers: corsHeaders }
    );
  } catch (err: any) {
    return Response.json(
      { error: err?.message || "Failed to build daily summary." },
      { status: 500, headers: corsHeaders }
    );
  }
};

export const config: Config = {
  path: "/api/daily-summary",
};
