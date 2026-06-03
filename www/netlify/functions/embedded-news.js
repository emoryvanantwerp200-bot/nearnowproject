const areaFeeds = {
  baldwin: [
    {
      source: "FOX10 Baldwin County",
      url: "https://www.fox10tv.com/arc/outboundfeeds/rss/?outputType=xml",
      keywords: ["baldwin", "daphne", "fairhope", "foley", "gulf shores", "orange beach", "spanish fort", "bay minette"]
    },
    {
      source: "WKRG News 5",
      url: "https://www.wkrg.com/feed/",
      keywords: ["baldwin", "daphne", "fairhope", "foley", "gulf shores", "orange beach", "spanish fort"]
    }
  ],
  mobile: [
    {
      source: "WKRG News 5",
      url: "https://www.wkrg.com/feed/",
      keywords: ["mobile", "prichard", "saraland", "theodore", "semmes", "chickasaw", "citronelle"]
    },
    {
      source: "FOX10 Mobile",
      url: "https://www.fox10tv.com/arc/outboundfeeds/rss/?outputType=xml",
      keywords: ["mobile", "prichard", "saraland", "theodore", "semmes", "i-10"]
    },
    {
      source: "AL.com Mobile",
      url: "https://www.al.com/arc/outboundfeeds/rss/category/news/mobile/?outputType=xml",
      keywords: ["mobile", "mobile county"]
    }
  ],
  escambia: [
    {
      source: "WEAR ABC 3",
      url: "https://weartv.com/news/local.rss",
      keywords: ["escambia", "pensacola", "cantonment", "century", "molino", "perdido", "florida"]
    },
    {
      source: "NorthEscambia.com",
      url: "https://www.northescambia.com/feed",
      keywords: ["escambia", "century", "cantonment", "molino", "walnut hill", "bratt", "mcdavid"]
    }
  ],
  westmobile: [
    {
      source: "WKRG News 5",
      url: "https://www.wkrg.com/feed/",
      keywords: ["west mobile", "airport boulevard", "schillinger", "dawes", "tanner williams", "mobile"]
    },
    {
      source: "FOX10 Mobile",
      url: "https://www.fox10tv.com/arc/outboundfeeds/rss/?outputType=xml",
      keywords: ["west mobile", "airport boulevard", "schillinger", "dawes", "mobile"]
    }
  ],
  pascagoula: [
    {
      source: "WLOX",
      url: "https://www.wlox.com/arc/outboundfeeds/rss/?outputType=xml",
      keywords: ["pascagoula", "jackson county", "moss point", "gautier", "ocean springs"]
    },
    {
      source: "Sun Herald Local",
      url: "https://www.sunherald.com/news/local/?widgetName=rssfeed&widgetContentId=6199&getXmlFeed=true",
      keywords: ["pascagoula", "jackson county", "south ms", "mississippi coast"]
    }
  ]
};

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Cache-Control": "public, max-age=300",
  "Content-Type": "application/json; charset=utf-8"
};

function decodeXml(value = "") {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function getTag(block, tag) {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? decodeXml(match[1]) : "";
}

function parseFeed(xml, source) {
  const blocks = xml.match(/<item[\s\S]*?<\/item>/gi) || [];
  return blocks.map((block) => {
    const title = getTag(block, "title");
    const summary = getTag(block, "description");
    return {
      source,
      title,
      summary: summary.slice(0, 180),
      url: getTag(block, "link"),
      published: getTag(block, "pubDate") || "Latest update"
    };
  }).filter((item) => item.title && item.url);
}

function scoreItem(item, keywords) {
  const haystack = `${item.title} ${item.summary}`.toLowerCase();
  return keywords.reduce((score, keyword) => score + (haystack.includes(keyword) ? 1 : 0), 0);
}

async function fetchFeed(feed) {
  const response = await fetch(feed.url, {
    headers: { "User-Agent": "NearNow Embedded Local News/1.0" }
  });

  if (!response.ok) return [];

  const xml = await response.text();
  return parseFeed(xml, feed.source)
    .map((item) => ({ ...item, score: scoreItem(item, feed.keywords) }))
    .filter((item) => item.score > 0)
    .slice(0, 5);
}

export default async (req) => {
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers });
  }

  const area = new URL(req.url).searchParams.get("area") || "baldwin";
  const feeds = areaFeeds[area] || areaFeeds.baldwin;
  const results = await Promise.allSettled(feeds.map(fetchFeed));
  const items = results
    .flatMap((result) => result.status === "fulfilled" ? result.value : [])
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(({ score, ...item }) => item);

  return new Response(JSON.stringify({ area, items }), { headers });
};

export const config = {
  path: "/api/embedded-news"
};
