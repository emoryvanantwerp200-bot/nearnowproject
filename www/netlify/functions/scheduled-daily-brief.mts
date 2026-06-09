import { getStore } from "@netlify/blobs";
import type { Config } from "@netlify/functions";

const areaInputs: Record<string, string[]> = {
  mobile: [
    "NWS Mobile weather scan for coastal rain, heat index, and commute-time warnings.",
    "ALDOT traffic watch around I-10, Airport Boulevard, and bridge approaches.",
    "Mobile County Sheriff public-safety checks and AL.com Mobile local headlines.",
  ],
  baldwin: [
    "Baldwin County Sheriff notices, coastal city updates, and beach traffic.",
    "Daphne, Fairhope, Foley, Gulf Shores, and Orange Beach school and weather updates.",
  ],
  escambia: [
    "Pensacola weather, public-safety, and commute alerts.",
    "NWS Mobile/Pensacola severe-weather watch.",
  ],
  westmobile: [
    "Airport Boulevard, Schillinger Road, Dawes, Tanner Williams, and school-route reports.",
    "Community reports stay unverified until reviewed.",
  ],
  pascagoula: [
    "Jackson County alerts, Mississippi coast weather, port conditions, and state public-safety notices.",
  ],
};

function fallbackBrief(area: string) {
  const items = areaInputs[area] || areaInputs.mobile;
  return `${area} morning brief: ${items.join(" ")}`;
}

async function generateBrief(area: string, inputs: string[]) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return fallbackBrief(area);

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-3-5-haiku-latest",
      max_tokens: 220,
      messages: [
        {
          role: "user",
          content: `Write a concise NearNow daily local safety brief for ${area}. Use natural language, mention official vs community trust clearly, and keep it under 90 words.\n\nRecent alerts:\n- ${inputs.join("\n- ")}`,
        },
      ],
    }),
  });

  if (!response.ok) return fallbackBrief(area);
  const data = await response.json();
  const text = data?.content?.find?.((part: { type?: string }) => part.type === "text")?.text;
  return typeof text === "string" && text.trim() ? text.trim() : fallbackBrief(area);
}

export default async () => {
  const summaries: Record<string, string> = {};
  for (const [area, inputs] of Object.entries(areaInputs)) {
    summaries[area] = await generateBrief(area, inputs);
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    summaries,
  };
  await getStore("daily-briefs").setJSON("latest", payload);
  return Response.json(payload);
};

export const config: Config = {
  schedule: "0 11 * * *",
};
