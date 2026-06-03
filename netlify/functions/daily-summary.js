const areaLabels = {
  mobile: "Mobile County",
  baldwin: "Baldwin County",
  escambia: "Escambia County",
  westmobile: "West Mobile",
  pascagoula: "Pascagoula"
};

const summaries = {
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
  "Cache-Control": "public, max-age=180",
  "Content-Type": "application/json; charset=utf-8"
};

export default async (req) => {
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers });
  }

  const area = new URL(req.url).searchParams.get("area") || "mobile";
  return new Response(
    JSON.stringify({
      area,
      label: areaLabels[area] || "your area",
      summary: summaries[area] || summaries.mobile,
      source: "rules",
      itemCount: 3
    }),
    { headers }
  );
};

export const config = {
  path: "/api/daily-summary"
};
