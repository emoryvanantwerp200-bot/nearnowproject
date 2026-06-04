import type { Config } from "@netlify/functions";

type FeedItem = {
  title: string;
  link: string;
  pubDate: string;
  guid: string;
  categories: string[];
  sourceName: string;
  sourceUrl: string;
};

type FeedSource = {
  name: string;
  url: string;
  areas: string[];
  terms: string[];
  primary?: boolean;
};

const MOBILE_CATEGORY_RSS = "https://www.al.com/arc/outboundfeeds/rss/category/mobile/?outputType=xml";
const ALCOM_RSS = "https://www.al.com/arc/outboundfeeds/rss/?outputType=xml";

const FEED_SOURCES: FeedSource[] = [
  {
    name: "AL.com Mobile",
    url: MOBILE_CATEGORY_RSS,
    areas: ["mobile", "mobile al", "mobile alabama", "baldwin county", "gulf coast"],
    terms: ["mobile", "baldwin", "gulf shores", "orange beach", "fairhope", "daphne", "spanish fort", "prichard", "saraland", "foley", "bay minette", "theodore", "chickasaw", "satsuma", "citronelle"],
    primary: true,
  },
  {
    name: "AL.com",
    url: ALCOM_RSS,
    areas: ["mobile", "mobile al", "mobile alabama", "baldwin county", "gulf coast", "alabama"],
    terms: ["mobile", "baldwin", "gulf shores", "orange beach", "fairhope", "daphne", "spanish fort", "prichard", "saraland", "foley", "bay minette", "theodore", "chickasaw", "satsuma", "citronelle"],
  },
  {
    name: "Boston.com",
    url: "https://www.boston.com/feed/",
    areas: ["boston", "massachusetts", "ma"],
    terms: ["boston", "massachusetts", "cambridge", "somerville", "brookline", "dorchester"],
  },
  {
    name: "CBS Boston",
    url: "https://www.cbsnews.com/boston/latest/rss/main",
    areas: ["boston", "massachusetts", "ma"],
    terms: ["boston", "massachusetts", "cambridge", "somerville", "brookline", "dorchester"],
  },
  {
    name: "KTLA",
    url: "https://ktla.com/feed/",
    areas: ["los angeles", "la", "southern california", "california"],
    terms: ["los angeles", "orange county", "long beach", "hollywood", "pasadena", "southern california"],
  },
  {
    name: "WGN-TV",
    url: "https://wgntv.com/feed/",
    areas: ["chicago", "illinois", "il"],
    terms: ["chicago", "illinois", "cook county", "evanston", "naperville", "waukegan"],
  },
  {
    name: "NBC New York",
    url: "https://www.nbcnewyork.com/?rss=y",
    areas: ["new york", "nyc", "new york city", "ny"],
    terms: ["new york", "nyc", "manhattan", "brooklyn", "queens", "bronx", "staten island"],
  },
  {
    name: "The Seattle Times",
    url: "https://www.seattletimes.com/feed/",
    areas: ["seattle", "washington", "wa"],
    terms: ["seattle", "washington", "king county", "bellevue", "tacoma", "everett"],
  },
  {
    name: "NPR",
    url: "https://feeds.npr.org/1001/rss.xml",
    areas: ["national", "us", "usa", "united states"],
    terms: [],
  },
  {
    name: "CNBC",
    url: "https://www.cnbc.com/id/100003114/device/rss/rss.html",
    areas: ["business", "national", "us", "usa"],
    terms: [],
  },
  {
    name: "ESPN",
    url: "https://www.espn.com/espn/rss/news",
    areas: ["sports", "national", "us", "usa"],
    terms: [],
  },
  {
    name: "GovInfo",
    url: "https://www.govinfo.gov/rss/bills.xml",
    areas: ["government", "national", "us", "usa"],
    terms: [],
  },
];

function decodeXml(value: string) {
  return value
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function tagValue(block: string, tag: string) {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? decodeXml(match[1]).trim() : "";
}

function parseItems(xml: string, source: FeedSource) {
  const blocks = xml.match(/<item\b[\s\S]*?<\/item>/gi) || [];
  return blocks.map((block) => {
    const categories = Array.from(block.matchAll(/<category[^>]*>([\s\S]*?)<\/category>/gi))
      .map((match) => decodeXml(match[1]).trim())
      .filter(Boolean);

    return {
      title: tagValue(block, "title"),
      link: tagValue(block, "link"),
      pubDate: tagValue(block, "pubDate"),
      guid: tagValue(block, "guid"),
      categories,
      sourceName: source.name,
      sourceUrl: source.url,
    };
  }).filter((item) => item.title && item.link);
}

function normalizeArea(area: string | null) {
  return (area || "mobile").trim().toLowerCase();
}

function matchesSourceTerms(item: FeedItem, source: FeedSource) {
  if (!source.terms.length) return true;
  const haystack = `${item.title} ${item.link} ${item.categories.join(" ")}`.toLowerCase();
  return source.terms.some((term) => haystack.includes(term));
}

function sourcesForArea(area: string) {
  const directMatches = FEED_SOURCES.filter((source) => {
    return source.areas.some((candidate) => area.includes(candidate) || candidate.includes(area));
  });
  if (directMatches.length) return directMatches;

  const termMatches = FEED_SOURCES.filter((source) => {
    return source.terms.some((term) => area.includes(term));
  });
  if (termMatches.length) return termMatches;

  return FEED_SOURCES.filter((source) => source.areas.includes("national"));
}

async function loadSourceItems(source: FeedSource) {
  const response = await fetch(source.url, {
    headers: { "User-Agent": "NearNow RSS Reader" },
  });
  if (!response.ok) return [];
  const xml = await response.text();
  return parseItems(xml, source).filter((item) => source.primary || matchesSourceTerms(item, source));
}

async function loadAreaItems(area: string) {
  const settled = await Promise.allSettled(sourcesForArea(area).map(loadSourceItems));
  const items = settled.flatMap((result) => result.status === "fulfilled" ? result.value : []);
  const deduped = new Map<string, FeedItem>();

  for (const item of items) {
    const key = item.link || item.guid || item.title;
    if (!deduped.has(key)) deduped.set(key, item);
  }

  return Array.from(deduped.values()).sort((a, b) => {
    const dateA = Date.parse(a.pubDate) || 0;
    const dateB = Date.parse(b.pubDate) || 0;
    return dateB - dateA;
  });
}

function displayArea(area: string) {
  return area.replace(/\b\w/g, (char) => char.toUpperCase());
}

function renderFeed(items: FeedItem[], area: string) {
  const now = new Date().toUTCString();
  const renderedItems = items.slice(0, 25).map((item) => {
    const guid = item.guid || item.link;
    const pubDate = item.pubDate || now;
    return `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(item.link)}</link>
      <guid isPermaLink="false">${escapeXml(guid)}</guid>
      <pubDate>${escapeXml(pubDate)}</pubDate>
      <source url="${escapeXml(item.sourceUrl)}">${escapeXml(item.sourceName)}</source>
      <description>${escapeXml(`${item.sourceName} headline matched for ${displayArea(area)}. Open the original story for the full report.`)}</description>
    </item>`;
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>NearNow ${escapeXml(displayArea(area))} Local News</title>
    <link>https://www.near-now.com/</link>
    <atom:link href="https://www.near-now.com/feed.xml?area=${encodeURIComponent(area)}" rel="self" type="application/rss+xml" />
    <description>Area-aware local headlines from RSS sources listed for NearNow, including AL.com Mobile for the Mobile, Alabama area.</description>
    <language>en-us</language>
    <lastBuildDate>${escapeXml(now)}</lastBuildDate>
    <ttl>15</ttl>
${renderedItems}
  </channel>
</rss>`;
}

export default async (req: Request) => {
  try {
    const url = new URL(req.url);
    const area = normalizeArea(url.searchParams.get("area"));
    const items = await loadAreaItems(area);

    return new Response(renderFeed(items, area), {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=900",
      },
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to generate RSS feed." },
      { status: 500 }
    );
  }
};

export const config: Config = {
  path: "/feed.xml",
};
