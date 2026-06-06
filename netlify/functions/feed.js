import { db } from "../../db/index.js";
import { feedItems } from "../../db/schema.js";
import { eq, and, desc } from "drizzle-orm";

const now = () => new Date().toISOString();

const baseItems = [
  {
    category: "weather",
    title: "Dense fog advisory through 9 AM",
    body: "Reduced visibility on low-lying roads and near the river. Slow down on the west-side commute.",
    area: "mobile",
    source: "NWS Mobile/Pensacola",
    sourceUrl: "https://www.weather.gov/mob/",
    trust: "official"
  },
  {
    category: "traffic",
    title: "Main St lane closure between 3rd and 5th",
    body: "Expect roughly 12 minute delays until mid-morning while crews clear a stalled vehicle.",
    area: "mobile",
    source: "Alabama 511",
    sourceUrl: "https://algotraffic.com/",
    trust: "official"
  },
  {
    category: "events",
    title: "Fairhope evening market",
    body: "Downtown vendors open at 5 PM with food, music, and family activities near the pier.",
    area: "baldwin",
    source: "Community calendar",
    sourceUrl: null,
    trust: "community"
  },
  {
    category: "community",
    title: "Tree blocking the right lane on Pine near 7th",
    body: "Resident report - crews not yet on scene. Use the left lane if heading north.",
    area: "mobile",
    source: "Community report",
    sourceUrl: null,
    trust: "unverified"
  },
  {
    category: "news",
    title: "Baldwin County school board meets tonight",
    body: "Agenda includes transportation updates and facilities planning.",
    area: "baldwin",
    source: "Verified local news",
    sourceUrl: "https://gulfcoastmedia.com/",
    trust: "official"
  },
  {
    category: "emergency",
    title: "No active emergency mode",
    body: "NearNow will surface shelters, closures, and official emergency contacts during major incidents.",
    area: "mobile",
    source: "NearNow status",
    sourceUrl: null,
    trust: "official"
  },
  {
    category: "weather",
    title: "Coast storms possible after 3 PM",
    body: "Pascagoula and Jackson County should watch for pop-up storms later today.",
    area: "pascagoula",
    source: "NWS New Orleans/Baton Rouge",
    sourceUrl: "https://www.weather.gov/lix/",
    trust: "official"
  },
  {
    category: "news",
    title: "North Escambia community update",
    body: "Local organizations have weekend events and public-meeting notices posted.",
    area: "escambia",
    source: "NorthEscambia.com",
    sourceUrl: "https://www.northescambia.com/",
    trust: "official"
  }
];

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Cache-Control": "no-store",
  "Content-Type": "application/json; charset=utf-8"
};

export default async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("", { headers });
  }

  // Ensure database is seeded with baseItems if empty
  try {
    const existing = await db.select().from(feedItems).limit(1);
    if (existing.length === 0) {
      await db.insert(feedItems).values(
        baseItems.map((item) => ({
          category: item.category,
          title: item.title,
          body: item.body,
          area: item.area,
          source: item.source,
          sourceUrl: item.sourceUrl,
          trust: item.trust,
          status: "published",
        }))
      );
    }
  } catch (err) {
    console.error("Seeding feedItems failed:", err);
  }

  if (req.method === "POST") {
    try {
      const body = await req.json();
      const title = String(body.title || "").trim();
      if (!title) {
        return new Response(JSON.stringify({ error: "Report title is required." }), { status: 400, headers });
      }

      const item = {
        category: String(body.category || "community"),
        title: title.slice(0, 180),
        body: String(body.body || "Submitted by a NearNow visitor.").slice(0, 500),
        area: String(body.area || "mobile"),
        source: String(body.source || "Community report").slice(0, 150),
        sourceUrl: body.sourceUrl ? String(body.sourceUrl) : null,
        trust: body.trust || "unverified",
        status: "published",
        latitude: body.latitude ? Number(body.latitude) : null,
        longitude: body.longitude ? Number(body.longitude) : null,
      };

      const [inserted] = await db.insert(feedItems).values(item).returning();

      return new Response(JSON.stringify({
        message: "Report submitted successfully.",
        item: inserted
      }), { headers });
    } catch (err) {
      return new Response(JSON.stringify({ error: "Invalid report data." }), { status: 400, headers });
    }
  }

  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers });
  }

  const url = new URL(req.url);
  const area = url.searchParams.get("area") || "mobile";
  const category = url.searchParams.get("category") || "all";

  try {
    let query = db.select().from(feedItems).orderBy(desc(feedItems.createdAt));
    const allItems = await query;

    const filteredItems = allItems.filter((item) => {
      const areaMatch = item.area === area || area === "all";
      const categoryMatch = category === "all" || item.category === category;
      return areaMatch && categoryMatch;
    }).slice(0, 18);

    return new Response(JSON.stringify({ area, category, items: filteredItems }), { headers });
  } catch (err) {
    // Fail-safe local fallback if database is completely unavailable
    const filtered = baseItems.filter((item) => {
      const areaMatch = item.area === area || area === "all";
      const categoryMatch = category === "all" || item.category === category;
      return areaMatch && categoryMatch;
    }).map((item, index) => ({
      id: index + 1000,
      ...item,
      status: "published",
      createdAt: now()
    })).slice(0, 12);

    return new Response(JSON.stringify({ area, category, items: filtered, error: "Database fallback active" }), { headers });
  }
};

export const config = {
  path: "/api/feed"
};
