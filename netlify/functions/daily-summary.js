import { db } from "../../db/index.js";
import { feedItems } from "../../db/schema.js";
import { eq, and, desc } from "drizzle-orm";

const areaLabels = {
  mobile: "Mobile County",
  baldwin: "Baldwin County",
  escambia: "Escambia County",
  westmobile: "West Mobile",
  pascagoula: "Pascagoula"
};

const fallbackSummaries = {
  mobile:
    "Good morning. For Mobile County: fog is possible early, one traffic issue is being watched near main commute routes, and community reports should be reviewed before leaving.",
  baldwin:
    "Good morning. For Baldwin County: check beach weather, Highway 98 traffic, and evening community events in Daphne and Fairhope.",
  escambia:
    "Good morning. For Escambia County: monitor Pensacola traffic, North Escambia community updates, and NWS Mobile/Pensacola weather changes.",
  westmobile:
    "Good morning. For West Mobile: watch Airport Boulevard and Schillinger Road traffic, school notices, and neighborhood reports.",
  pascagoula:
    "Good morning. For Pascagoula: storms may develop later, Jackson County headlines are active, and river or port updates should be checked before travel."
};

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Cache-Control": "public, max-age=120",
  "Content-Type": "application/json; charset=utf-8"
};

export default async (req) => {
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers });
  }

  const url = new URL(req.url);
  const area = url.searchParams.get("area") || "mobile";
  const areaLabel = areaLabels[area] || "your area";

  // 1. Fetch latest feed items for this area from the database
  let itemsText = "";
  try {
    const items = await db
      .select()
      .from(feedItems)
      .where(eq(feedItems.area, area))
      .orderBy(desc(feedItems.createdAt))
      .limit(6);

    if (items.length > 0) {
      itemsText = items.map((item) => `- [${item.category.toUpperCase()}] ${item.title}: ${item.body}`).join("\n");
    }
  } catch (err) {
    console.error("Failed to query feed items for AI summary:", err);
  }

  // 2. Check for AI Gateway configuration
  const aiGatewayUrl = process.env.OPENAI_BASE_URL || process.env.NETLIFY_AI_GATEWAY_BASE_URL;
  const aiGatewayKey = process.env.OPENAI_API_KEY || process.env.NETLIFY_AI_GATEWAY_KEY || "netlify-ai-gateway";

  if (aiGatewayUrl && itemsText) {
    try {
      const gatewayEndpoint = `${aiGatewayUrl.replace(/\/$/, "")}/chat/completions`;
      const response = await fetch(gatewayEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${aiGatewayKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are NearNow AI, a local morning briefing assistant. Write a warm, cohesive, professional 2-3 sentence morning briefing summary for ${areaLabel} based ONLY on the provided list of active local alerts, traffic, and community feed items. Highlight the most urgent alerts (e.g. weather, traffic, emergency) first. Keep it extremely concise, practical, and action-oriented. Do not mention that you were given a list or mention 'the provided context'.`
            },
            {
              role: "user",
              content: `Here is the current live local feed for ${areaLabel}:\n\n${itemsText}\n\nCohesive daily briefing:`
            }
          ],
          temperature: 0.5,
          max_tokens: 150
        })
      });

      if (response.ok) {
        const payload = await response.json();
        const summary = payload.choices?.[0]?.message?.content?.trim();
        if (summary) {
          return new Response(
            JSON.stringify({
              area,
              label: areaLabel,
              summary: `${summary}`,
              source: "ai",
              itemCount: itemsText.split("\n").length
            }),
            { headers }
          );
        }
      } else {
        console.warn("AI Gateway response was not OK:", response.status, await response.text());
      }
    } catch (err) {
      console.error("AI Gateway briefing generation failed:", err);
    }
  }

  // 3. Fallback to high-quality static rule-based briefing
  return new Response(
    JSON.stringify({
      area,
      label: areaLabel,
      summary: fallbackSummaries[area] || fallbackSummaries.mobile,
      source: "fallback",
      itemCount: 0
    }),
    { headers }
  );
};

export const config = {
  path: "/api/daily-summary"
};
