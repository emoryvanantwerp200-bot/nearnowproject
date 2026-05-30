import type { Config, Context } from "@netlify/functions";

const allowedFeeds = new Set([
  "https://openrss.org/reuters.com/world",
  "https://feeds.npr.org/1001/rss.xml",
  "https://rssfeeds.usatoday.com/usatoday-NewsTopStories",
  "https://www.politico.com/rss/politicopicks.xml",
  "http://rss.cnn.com/rss/cnn_topstories.rss",
  "https://moxie.foxnews.com/google-publisher/latest.xml",
  "https://www.cbsnews.com/latest/rss/main",
  "https://abcnews.go.com/abcnews/topstories",
  "https://feeds.nbcnews.com/nbcnews/public/news",
  "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml",
  "https://feeds.washingtonpost.com/rss/national",
  "https://feeds.a.dj.com/rss/RSSWorldNews.xml",
  "https://www.latimes.com/california/rss2.0.xml",
  "https://www.chicagotribune.com/arcio/rss/category/news/",
  "https://www.seattletimes.com/feed/",
  "https://www.cnbc.com/id/100003114/device/rss/rss.html",
  "https://feeds.content.dowjones.io/public/rss/mw_topstories",
  "https://www.businessinsider.com/rss",
  "https://techcrunch.com/feed/",
  "https://www.wired.com/feed/rss",
  "https://www.engadget.com/rss.xml",
  "https://venturebeat.com/feed/",
  "https://www.espn.com/espn/rss/news",
  "https://www.cbssports.com/rss/headlines/",
  "https://www.nfl.com/feeds/rss/news",
  "https://www.nba.com/rss/nba_rss.xml",
  "https://www.govinfo.gov/rss",
  "https://www.dol.gov/rss/releases.xml",
  "https://statesnewsroom.com/feed/",
  "https://www.boston.com/feed/",
  "https://ktla.com/feed/",
  "https://wgntv.com/feed/",
  "https://www.nbcnewyork.com/?rss=y",
  "https://www.cbsnews.com/boston/latest/rss/main"
]);

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Cache-Control": "public, max-age=300",
  "Content-Type": "application/json; charset=utf-8"
};

function decodeXml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function getTag(block: string, tag: string) {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? decodeXml(match[1]) : "";
}

function getAtomLink(block: string) {
  const alternate = block.match(/<link[^>]+rel=["']alternate["'][^>]+href=["']([^"']+)["']/i);
  const any = block.match(/<link[^>]+href=["']([^"']+)["']/i);
  return decodeXml((alternate || any)?.[1] || "");
}

function parseFeed(xml: string) {
  const blocks = xml.match(/<item[\s\S]*?<\/item>/gi) || xml.match(/<entry[\s\S]*?<\/entry>/gi) || [];

  return blocks.slice(0, 8).map((block) => {
    const atom = /^<entry/i.test(block);
    return {
      title: getTag(block, "title") || "Untitled",
      link: atom ? getAtomLink(block) : getTag(block, "link"),
      published: getTag(block, "pubDate") || getTag(block, "updated") || getTag(block, "published")
    };
  }).filter((item) => item.title && item.link);
}

export default async (req: Request, _context: Context) => {
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers });
  }

  const url = new URL(req.url).searchParams.get("url") || "";
  if (!allowedFeeds.has(url)) {
    return new Response(JSON.stringify({ error: "Feed is not allowlisted" }), { status: 400, headers });
  }

  try {
    const upstream = await fetch(url, {
      headers: {
        "User-Agent": "NearNow RSS Preview/1.0"
      }
    });

    if (!upstream.ok) {
      return new Response(JSON.stringify({ error: `Feed returned ${upstream.status}` }), { status: 502, headers });
    }

    const xml = await upstream.text();
    return new Response(JSON.stringify({ items: parseFeed(xml) }), { headers });
  } catch {
    return new Response(JSON.stringify({ error: "Unable to fetch feed" }), { status: 502, headers });
  }
};

export const config: Config = {
  path: "/api/rss"
};
