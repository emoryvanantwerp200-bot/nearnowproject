import type { Config } from "@netlify/functions";

const summaries: Record<string, string> = {
  mobile: "Mobile County briefing: check NWS Mobile for weather, Mobile County Sheriff for public-safety notices, and AL.com Mobile for local headlines. Traffic attention is highest around I-10, Airport Boulevard, and bridge approaches.",
  baldwin: "Baldwin County briefing: scan coastal weather, sheriff notices, school updates, beach traffic, and city notices for Daphne, Fairhope, Foley, Gulf Shores, and Orange Beach.",
  escambia: "Escambia County briefing: watch Pensacola traffic, NWS Mobile/Pensacola weather, and Florida public-safety alert sources before the morning commute.",
  westmobile: "West Mobile briefing: focus on school routes, Airport Boulevard, Schillinger Road, Dawes, Tanner Williams, and neighborhood reports.",
  pascagoula: "Pascagoula briefing: monitor Jackson County alerts, Mississippi coast weather, port and river conditions, and official state alert sources.",
};

export default async (req: Request) => {
  const url = new URL(req.url);
  const area = url.searchParams.get("area") || "mobile";
  return Response.json({ summary: summaries[area] || summaries.mobile });
};

export const config: Config = {
  path: "/api/daily-summary",
};
