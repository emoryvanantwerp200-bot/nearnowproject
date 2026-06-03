const seedItems = [
  {
    id: 1,
    category: "weather",
    title: "Dense fog advisory through 9 AM",
    body: "Reduced visibility on low-lying roads and near the river. Slow down on the west-side commute.",
    area: "mobile",
    source: "NWS Mobile/Pensacola",
    sourceUrl: "https://www.weather.gov/mob/",
    trust: "official"
  },
  {
    id: 2,
    category: "traffic",
    title: "Main St lane closure between 3rd and 5th",
    body: "Expect roughly 12 minute delays until mid-morning while crews clear a stalled vehicle.",
    area: "mobile",
    source: "Alabama 511",
    sourceUrl: "https://algotraffic.com/",
    trust: "official"
  },
  {
    id: 3,
    category: "events",
    title: "Fairhope evening market",
    body: "Downtown vendors open at 5 PM with food, music, and family activities near the pier.",
    area: "baldwin",
    source: "Community calendar",
    sourceUrl: null,
    trust: "community"
  },
  {
    id: 4,
    category: "community",
    title: "Tree blocking the right lane on Pine near 7th",
    body: "Resident report - crews not yet on scene. Use the left lane if heading north.",
    area: "mobile",
    source: "Community report",
    sourceUrl: null,
    trust: "unverified"
  },
  {
    id: 5,
    category: "news",
    title: "Baldwin County school board meets tonight",
    body: "Agenda includes transportation updates and facilities planning.",
    area: "baldwin",
    source: "Verified local news",
    sourceUrl: "https://gulfcoastmedia.com/",
    trust: "official"
  },
  {
    id: 6,
    category: "emergency",
    title: "No active emergency mode",
    body: "NearNow will surface shelters, closures, and official emergency contacts during major incidents.",
    area: "mobile",
    source: "NearNow status",
    sourceUrl: null,
    trust: "official"
  },
  {
    id: 7,
    category: "weather",
    title: "Coast storms possible after 3 PM",
    body: "Pascagoula and Jackson County should watch for pop-up storms later today.",
    area: "pascagoula",
    source: "NWS New Orleans/Baton Rouge",
    sourceUrl: "https://www.weather.gov/lix/",
    trust: "official"
  },
  {
    id: 8,
    category: "news",
    title: "North Escambia community update",
    body: "Local organizations have weekend events and public-meeting notices posted.",
    area: "escambia",
    source: "NorthEscambia.com",
    sourceUrl: "https://www.northescambia.com/",
    trust: "official"
  }
];

let nextId = 100;
const memoryReports = [];

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Cache-Control": "no-store",
  "Content-Type": "application/json; charset=utf-8"
};

function withTime(item, index) {
  const createdAt = new Date(Date.now() - index * 7 * 60 * 1000).toISOString();
  return {
    latitude: null,
    longitude: null,
    status: "published",
    createdAt,
    ...item
  };
}

export default async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("", { headers });
  }

  if (req.method === "POST") {
    try {
      const body = await req.json();
      const item = {
        id: nextId++,
        category: body.category || "community",
        title: String(body.title || "Community report").slice(0, 180),
        body: String(body.body || "Submitted by a NearNow visitor.").slice(0, 500),
        area: body.area || "mobile",
        source: "Community report",
        sourceUrl: null,
        trust: "unverified",
        createdAt: new Date().toISOString(),
        status: "published",
        latitude: null,
        longitude: null
      };
      memoryReports.unshift(item);
      return new Response(JSON.stringify({ item, message: "Report submitted for moderation." }), { headers });
    } catch {
      return new Response(JSON.stringify({ error: "Invalid report." }), { status: 400, headers });
    }
  }

  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers });
  }

  const url = new URL(req.url);
  const area = url.searchParams.get("area") || "mobile";
  const category = url.searchParams.get("category") || "all";
  const items = [...memoryReports, ...seedItems.map(withTime)]
    .filter((item) => item.area === area || area === "all")
    .filter((item) => category === "all" || item.category === category)
    .slice(0, 12);

  return new Response(JSON.stringify({ area, category, items }), { headers });
};

export const config = {
  path: "/api/feed"
};
