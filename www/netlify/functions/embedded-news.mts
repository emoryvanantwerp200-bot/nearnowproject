import type { Config } from "@netlify/functions";

const reportsByArea: Record<string, Array<Record<string, string>>> = {
  baldwin: [
    { title: "Baldwin County sheriff updates", summary: "Public-safety and county notices for Daphne, Fairhope, Foley, Gulf Shores, and nearby communities.", source: "Baldwin County Sheriff", published: "Latest source", url: "https://sheriff.baldwincountyal.gov/" },
    { title: "Baldwin coastal weather source", summary: "Official coastal weather and severe-weather notices for the Alabama Gulf Coast.", source: "NWS Mobile", published: "Updated today", url: "https://www.weather.gov/mob/" },
  ],
  mobile: [
    { title: "Mobile County public-safety source", summary: "Sheriff and public-safety links for Mobile County residents.", source: "Mobile County Sheriff", published: "Latest source", url: "https://www.mobileso.com/" },
    { title: "Mobile local news from AL.com", summary: "Mobile-area headlines and local reporting from AL.com.", source: "AL.com Mobile", published: "Latest feed", url: "https://www.al.com/mobile/" },
  ],
  escambia: [
    { title: "Escambia and Pensacola weather watch", summary: "Official weather alerts and Gulf Coast severe-weather updates.", source: "NWS Mobile/Pensacola", published: "Updated today", url: "https://www.weather.gov/mob/" },
    { title: "Florida AMBER Alert source", summary: "Official Florida alert information for missing children and urgent public notices.", source: "FDLE", published: "Official source", url: "https://www.fdle.state.fl.us/AMBER-Plan/Amber-Alert" },
  ],
  westmobile: [
    { title: "West Mobile road and commute scan", summary: "Morning route checks for Airport Boulevard, Schillinger Road, Dawes, and Tanner Williams.", source: "NearNow local scan", published: "Demo source", url: "https://www.near-now.com/" },
  ],
  pascagoula: [
    { title: "Pascagoula and Mississippi coast alert source", summary: "Official Mississippi public-safety and AMBER Alert source links.", source: "Mississippi DPS", published: "Official source", url: "https://www.dps.ms.gov/investigation/amber-alert" },
  ],
};

export default async (req: Request) => {
  const url = new URL(req.url);
  const area = url.searchParams.get("area") || "baldwin";
  return Response.json({ items: reportsByArea[area] || reportsByArea.baldwin });
};

export const config: Config = {
  path: "/api/embedded-news",
};
