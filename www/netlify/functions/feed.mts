import type { Config } from "@netlify/functions";

const now = () => new Date().toISOString();

const baseItems = [
  {
    title: "NWS Mobile morning weather scan",
    body: "Monitor coastal rain chances, heat index changes, and commute-time alerts from official weather sources.",
    category: "weather",
    area: "mobile",
    trust: "official",
    source: "NWS Mobile",
    sourceUrl: "https://www.weather.gov/mob/",
    createdAt: now(),
  },
  {
    title: "I-10 and Airport Boulevard commute watch",
    body: "NearNow is watching recurring traffic pressure around key Mobile routes and bridge approaches.",
    category: "traffic",
    area: "mobile",
    trust: "official",
    source: "511 traffic feeds",
    sourceUrl: "https://www.511.org/",
    createdAt: now(),
  },
  {
    title: "Mobile County public safety source check",
    body: "Verified local public-safety links are grouped for fast morning review.",
    category: "emergency",
    area: "mobile",
    trust: "official",
    source: "Mobile County Sheriff",
    sourceUrl: "https://www.mobileso.com/",
    createdAt: now(),
  },
  {
    title: "Baldwin beach and county update scan",
    body: "Coastal communities, school notices, roads, weather, and city notices are grouped for Baldwin County.",
    category: "news",
    area: "baldwin",
    trust: "official",
    source: "Baldwin County Sheriff",
    sourceUrl: "https://sheriff.baldwincountyal.gov/",
    createdAt: now(),
  },
  {
    title: "Pensacola and Escambia severe-weather watch",
    body: "Escambia County coverage includes weather, traffic, and public-safety sources around Pensacola.",
    category: "weather",
    area: "escambia",
    trust: "official",
    source: "NWS Mobile/Pensacola",
    sourceUrl: "https://www.weather.gov/mob/",
    createdAt: now(),
  },
  {
    title: "West Mobile school and commute scan",
    body: "Airport Boulevard, Schillinger Road, Dawes, Tanner Williams, and nearby neighborhoods are grouped.",
    category: "traffic",
    area: "westmobile",
    trust: "community",
    source: "NearNow local scan",
    sourceUrl: "https://www.near-now.com/",
    createdAt: now(),
  },
  {
    title: "Pascagoula coast and port conditions",
    body: "Pascagoula coverage watches Jackson County alerts, coast weather, river conditions, and city notices.",
    category: "news",
    area: "pascagoula",
    trust: "official",
    source: "Mississippi DPS",
    sourceUrl: "https://www.dps.ms.gov/investigation/amber-alert",
    createdAt: now(),
  },
  {
    title: "Community event picks for the Gulf Coast",
    body: "Local family events and public meetings can be filtered into the same briefing flow.",
    category: "events",
    area: "mobile",
    trust: "community",
    source: "NearNow community",
    sourceUrl: "https://www.near-now.com/",
    createdAt: now(),
  },
];

export default async (req: Request) => {
  if (req.method === "POST") {
    const body = await req.json().catch(() => ({}));
    const title = String(body.title || "").trim();
    if (!title) {
      return Response.json({ error: "Report title is required." }, { status: 400 });
    }
    return Response.json({
      message: "Report submitted for verification.",
      item: {
        title,
        body: String(body.body || ""),
        category: String(body.category || "community"),
        area: String(body.area || "mobile"),
        trust: "community",
        source: "Community report",
        createdAt: now(),
      },
    });
  }

  const url = new URL(req.url);
  const area = url.searchParams.get("area") || "mobile";
  const category = url.searchParams.get("category") || "all";
  const items = baseItems.filter((item) => {
    const areaMatch = item.area === area || (area === "all" && true);
    const categoryMatch = category === "all" || item.category === category;
    return areaMatch && categoryMatch;
  });

  return Response.json({ items: items.length ? items : baseItems.filter((item) => category === "all" || item.category === category) });
};

export const config: Config = {
  path: "/api/feed",
};
