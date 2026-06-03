import type { Config, Context } from "@netlify/functions";
import { db } from "../../db/index.js";
import { feedItems } from "../../db/schema.js";
import { and, desc, eq, sql } from "drizzle-orm";

const AREAS = ["baldwin", "mobile", "escambia", "westmobile", "pascagoula"] as const;
const CATEGORIES = ["weather", "traffic", "news", "community", "events", "emergency"] as const;
const TRUST = ["official", "community", "unverified"] as const;

type Area = (typeof AREAS)[number];
type Category = (typeof CATEGORIES)[number];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
};

// Seed content used the first time the feed table is empty so the homepage has
// realistic, source-attributed items to render on a fresh database branch.
const SEED: Array<{
  category: Category;
  title: string;
  body: string;
  area: Area;
  source: string;
  sourceUrl?: string;
  trust: (typeof TRUST)[number];
}> = [
  {
    category: "weather",
    title: "Dense fog advisory through 9 AM",
    body: "Reduced visibility on low-lying roads and near the river. Slow down on the west-side commute.",
    area: "mobile",
    source: "NWS Mobile/Pensacola",
    sourceUrl: "https://www.weather.gov/mob/",
    trust: "official",
  },
  {
    category: "traffic",
    title: "Main St lane closure between 3rd and 5th",
    body: "Expect roughly 12 minute delays until mid-morning while crews clear a stalled vehicle.",
    area: "mobile",
    source: "Alabama 511",
    sourceUrl: "https://algotraffic.com/",
    trust: "official",
  },
  {
    category: "events",
    title: "Farmers market opens at 8 AM",
    body: "Community lot vendors are active today with two roadside stalls near downtown.",
    area: "baldwin",
    source: "City of Fairhope",
    sourceUrl: "https://www.fairhopeal.gov/",
    trust: "official",
  },
  {
    category: "community",
    title: "Tree blocking the right lane on Pine near 7th",
    body: "Resident report — crews not yet on scene. Use the left lane if heading north.",
    area: "mobile",
    source: "Community report",
    trust: "unverified",
  },
  {
    category: "news",
    title: "School board meeting scheduled tonight",
    body: "Budget and calendar items on the agenda. Public comment opens at 6 PM.",
    area: "baldwin",
    source: "Gulf Coast Media",
    sourceUrl: "https://gulfcoastmedia.com/",
    trust: "official",
  },
  {
    category: "weather",
    title: "Marine small craft advisory on the bay",
    body: "Choppy conditions through the afternoon. Boaters should plan for higher waves near the pass.",
    area: "pascagoula",
    source: "NWS",
    sourceUrl: "https://www.weather.gov/",
    trust: "official",
  },
  {
    category: "community",
    title: "Found dog near Schillinger Road",
    body: "Friendly brown lab, no tags. Being held by a neighbor until an owner is located.",
    area: "westmobile",
    source: "Community report",
    trust: "community",
  },
  {
    category: "traffic",
    title: "Accident reported on Highway 98",
    body: "Two vehicles, right shoulder blocked. Emergency crews en route — expect brief slowing.",
    area: "escambia",
    source: "Community report",
    trust: "unverified",
  },
];

function normalizeArea(value: string | null): Area | null {
  if (!value) return null;
  const v = value.trim().toLowerCase();
  if ((AREAS as readonly string[]).includes(v)) return v as Area;
  // Friendly aliases coming from the hero search box.
  if (/^\d{5}$/.test(v)) {
    const zip = parseInt(v, 10);
    if (zip >= 32500 && zip <= 32599) return "escambia"; // Pensacola, FL
    if (zip >= 39560 && zip <= 39599) return "pascagoula"; // Jackson County, MS
    if (zip >= 36500 && zip <= 36590) return "baldwin"; // Baldwin County, AL
    if (zip >= 36600 && zip <= 36699) return "mobile"; // Mobile, AL
    return "mobile";
  }
  if (v.includes("baldwin") || v.includes("fairhope") || v.includes("daphne")) return "baldwin";
  if (v.includes("escambia") || v.includes("pensacola")) return "escambia";
  if (v.includes("west")) return "westmobile";
  if (v.includes("pascagoula") || v.includes("jackson")) return "pascagoula";
  if (v.includes("mobile")) return "mobile";
  return null;
}

async function ensureSeeded() {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(feedItems);
  if (count === 0) {
    await db.insert(feedItems).values(SEED);
  }
}

export default async (req: Request, _context: Context) => {
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

  try {
    await ensureSeeded();

    if (req.method === "GET") {
      const url = new URL(req.url);
      const area = normalizeArea(url.searchParams.get("area"));
      const categoryParam = (url.searchParams.get("category") || "all").toLowerCase();
      const limit = Math.min(parseInt(url.searchParams.get("limit") || "30", 10) || 30, 100);

      const filters = [eq(feedItems.status, "published")];
      if (area) filters.push(eq(feedItems.area, area));
      if ((CATEGORIES as readonly string[]).includes(categoryParam)) {
        filters.push(eq(feedItems.category, categoryParam));
      }

      const rows = await db
        .select()
        .from(feedItems)
        .where(and(...filters))
        .orderBy(desc(feedItems.createdAt))
        .limit(limit);

      return Response.json(
        { area: area || "all", category: categoryParam, items: rows },
        { headers: corsHeaders }
      );
    }

    if (req.method === "POST") {
      const body = await req.json();
      const title = String(body.title || "").trim();
      const detail = String(body.body || body.text || "").trim();
      const category = String(body.category || "community").toLowerCase();
      const area = normalizeArea(String(body.area || "")) || "mobile";

      if (!title || title.length > 200) {
        return Response.json(
          { error: "A short title is required (max 200 characters)." },
          { status: 400, headers: corsHeaders }
        );
      }

      // Resident submissions always enter the feed unverified. They are only ever
      // promoted to "community" or "official" by a moderator — never on submission.
      const [row] = await db
        .insert(feedItems)
        .values({
          category: (CATEGORIES as readonly string[]).includes(category) ? category : "community",
          title,
          body: detail.slice(0, 1000),
          area,
          source: "Community report",
          trust: "unverified",
          status: "published",
          latitude:
            body.latitude !== undefined && body.latitude !== null && !isNaN(parseFloat(body.latitude))
              ? parseFloat(body.latitude)
              : null,
          longitude:
            body.longitude !== undefined && body.longitude !== null && !isNaN(parseFloat(body.longitude))
              ? parseFloat(body.longitude)
              : null,
        })
        .returning();

      return Response.json(
        {
          message:
            "Report submitted. It appears in the feed marked Unverified until a trusted source or moderator confirms it.",
          item: row,
        },
        { status: 201, headers: corsHeaders }
      );
    }

    return Response.json({ error: "Method not allowed" }, { status: 405, headers: corsHeaders });
  } catch (err: any) {
    return Response.json(
      { error: err?.message || "Feed request failed." },
      { status: 500, headers: corsHeaders }
    );
  }
};

export const config: Config = {
  path: "/api/feed",
};
