const headers = {
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json; charset=utf-8"
};

function getEnv(name) {
  try {
    if (globalThis.Netlify?.env?.get) {
      return Netlify.env.get(name);
    }
  } catch {
    return "";
  }

  return globalThis.process?.env?.[name] || "";
}

function fallbackAnswer(question, context) {
  const lower = question.toLowerCase();
  const places = Array.isArray(context?.places) ? context.places : [];
  const feeds = Array.isArray(context?.feeds) ? context.feeds : [];
  const alerts = Array.isArray(context?.alerts) ? context.alerts : [];
  const saved = new Set(context?.filters?.savedPlaceIds || []);
  const where = context?.location ? `${context.location.city}, ${context.location.state}` : "your area";

  if (lower.includes("alert") || lower.includes("weather") || lower.includes("storm") || lower.includes("warning")) {
    if (!alerts.length) {
      return `There are no active National Weather Service alerts for ${where} right now. The Local alerts panel refreshes whenever you change your ZIP code.`;
    }
    return `${alerts.length} active alert${alerts.length > 1 ? "s" : ""} for ${where}: ${alerts
      .slice(0, 3)
      .map((alert) => `${alert.title} (${alert.severity})`)
      .join("; ")}. See the Local alerts panel for full details.`;
  }

  if (lower.includes("rss") || lower.includes("news") || lower.includes("source") || lower.includes("feed")) {
    const readyFeeds = feeds.filter((feed) => feed.hasFeed).slice(0, 6);
    return `Try these RSS-ready sources first: ${readyFeeds.map((feed) => `${feed.source} (${feed.category})`).join(", ")}. Use Preview for readable headlines or Copy RSS for the raw feed URL.`;
  }

  const routePlaces = places
    .filter((place) => saved.size ? saved.has(place.id) : true)
    .filter((place) => {
      if (lower.includes("food")) return place.mood === "food";
      if (lower.includes("music")) return place.mood === "music";
      if (lower.includes("work") || lower.includes("quiet")) return place.mood === "work";
      if (lower.includes("outside")) return place.mood === "outside";
      return true;
    })
    .slice(0, 3);

  if (!routePlaces.length) {
    return `I do not see a matching place near ${where} yet. Widen the radius or switch the mood filter, then ask again.`;
  }

  return `Start with ${routePlaces[0].name}: ${routePlaces[0].detail} ${routePlaces.length > 1 ? `Then add ${routePlaces.slice(1).map((place) => place.name).join(" and ")} for a simple route around ${where}.` : ""}`;
}

async function callGateway(question, context) {
  const baseUrl = getEnv("OPENAI_BASE_URL");
  const apiKey = getEnv("OPENAI_API_KEY") || "netlify-ai-gateway";

  if (!baseUrl) {
    return "";
  }

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are NearNow Agent, a concise local discovery assistant focused on Mobile, Alabama and whatever ZIP the user has loaded. Use the provided location, places, weather alerts, feeds, filters, and saved items. Recommend practical next actions and surface any active alerts when relevant. Do not invent live events, places, or alerts outside the provided context."
        },
        {
          role: "user",
          content: JSON.stringify({ question, context })
        }
      ],
      temperature: 0.4,
      max_tokens: 260
    })
  });

  if (!response.ok) {
    return "";
  }

  const payload = await response.json();
  return payload.choices?.[0]?.message?.content || "";
}

export default async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers });
  }

  const question = String(body.question || "").trim();
  if (!question) {
    return new Response(JSON.stringify({ error: "Question is required" }), { status: 400, headers });
  }

  const context = body.context || {};
  const gatewayAnswer = await callGateway(question, context);
  const answer = gatewayAnswer || fallbackAnswer(question, context);

  return new Response(JSON.stringify({
    answer,
    mode: gatewayAnswer ? "ai" : "local"
  }), { headers });
};

export const config = {
  path: "/api/agent",
  method: "POST"
};
