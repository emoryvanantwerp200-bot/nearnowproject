import type { Config } from "@netlify/functions";

type FeedItem = {
  title: string;
  body: string;
  category: string;
  area: string;
  trust: "official" | "community" | "unverified" | "reviewed";
  source: string;
  sourceUrl?: string;
  createdAt: string;
  lat: number;
  lng: number;
  distanceMiles?: number;
};

const now = () => new Date().toISOString();

const baseItems: FeedItem[] = [
  {
    title: "NWS Mobile morning weather scan",
    body: "Monitor coastal rain chances, heat index changes, and commute-time alerts from official weather sources.",
    category: "weather",
    area: "mobile",
    trust: "official",
    source: "NWS Mobile",
    sourceUrl: "https://www.weather.gov/mob/",
    createdAt: now(),
    lat: 30.6954,
    lng: -88.0399,
  },
  {
    title: "I-10 and Airport Boulevard commute watch",
    body: "NearNow is watching recurring traffic pressure around key Mobile routes and bridge approaches.",
    category: "traffic",
    area: "mobile",
    trust: "official",
    source: "ALDOT 511 traffic feeds",
    sourceUrl: "https://algotraffic.com/",
    createdAt: now(),
    lat: 30.675,
    lng: -88.09,
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
    lat: 30.6815,
    lng: -88.0832,
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
    lat: 30.5229,
    lng: -87.9033,
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
    lat: 30.4213,
    lng: -87.2169,
  },
  {
    title: "West Mobile school and commute scan",
    body: "Airport Boulevard, Schillinger Road, Dawes, Tanner Williams, and nearby neighborhoods are grouped.",
    category: "traffic",
    area: "westmobile",
    trust: "unverified",
    source: "NearNow local scan",
    sourceUrl: "https://www.near-now.com/",
    createdAt: now(),
    lat: 30.684,
    lng: -88.208,
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
    lat: 30.3658,
    lng: -88.5561,
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
    lat: 30.688,
    lng: -88.0431,
  },
];

const officialSourceTerms = [
  "nws",
  "aldot",
  "511",
  "sheriff",
  "police",
  "dps",
  "city of",
  "county",
  "weather.gov",
  "algotraffic",
];

function normalizeTrust(item: FeedItem): FeedItem["trust"] {
  const sourceText = `${item.source} ${item.sourceUrl || ""}`.toLowerCase();
  if (officialSourceTerms.some((term) => sourceText.includes(term))) return "official";
  if (item.trust === "reviewed" || item.trust === "community") return item.trust;
  return "unverified";
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function distanceMiles(aLat: number, aLng: number, bLat: number, bLng: number) {
  const earthRadiusMiles = 3958.8;
  const dLat = toRadians(bLat - aLat);
  const dLng = toRadians(bLng - aLng);
  const lat1 = toRadians(aLat);
  const lat2 = toRadians(bLat);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadiusMiles * Math.asin(Math.sqrt(a));
}

function withTrustAndDistance(item: FeedItem, lat: number, lng: number): FeedItem {
  return {
    ...item,
    trust: normalizeTrust(item),
    distanceMiles: Number(distanceMiles(lat, lng, item.lat, item.lng).toFixed(1)),
  };
}

export default async (req: Request) => {
  if (req.method === "POST") {
    const body = await req.json().catch(() => ({}));
    const title = String(body.title || "").trim();
    if (!title) {
      return Response.json({ error: "Report title is required." }, { status: 400 });
    }
    const item: FeedItem = {
      title,
      body: String(body.body || ""),
      category: String(body.category || "community"),
      area: String(body.area || "mobile"),
      trust: "unverified",
      source: "Community report",
      createdAt: now(),
      lat: Number(body.lat || body.latitude || 30.6954),
      lng: Number(body.lng || body.longitude || -88.0399),
    };
    return Response.json({
      message: "Report submitted for verification.",
      item: withTrustAndDistance(item, item.lat, item.lng),
    });
  }

  const url = new URL(req.url);
  const area = url.searchParams.get("area") || "mobile";
  const category = url.searchParams.get("category") || "all";
  const radius = url.searchParams.get("radius") || "10";
  const lat = Number(url.searchParams.get("lat") || 30.6954);
  const lng = Number(url.searchParams.get("lng") || -88.0399);

  const filtered = baseItems
    .filter((item) => (area === "all" ? true : item.area === area))
    .filter((item) => category === "all" || item.category === category)
    .map((item) => withTrustAndDistance(item, lat, lng))
    .filter((item) => radius === "all" || item.distanceMiles! <= Number(radius))
    .sort((a, b) => a.distanceMiles! - b.distanceMiles! || Date.parse(b.createdAt) - Date.parse(a.createdAt));

  const fallback = baseItems
    .filter((item) => category === "all" || item.category === category)
    .map((item) => withTrustAndDistance(item, lat, lng))
    .sort((a, b) => a.distanceMiles! - b.distanceMiles!);

  return Response.json({ items: filtered.length ? filtered : fallback });
};

export const config: Config = {
  path: "/api/feed",
};
