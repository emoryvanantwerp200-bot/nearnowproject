const jsonHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Cache-Control": "public, max-age=600",
  "Content-Type": "application/json; charset=utf-8"
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders });
}

function cleanZip(value) {
  return String(value || "").trim().match(/^\d{5}$/)?.[0] || "";
}

async function fetchZip(zip) {
  const response = await fetch(`https://api.zippopotam.us/us/${zip}`, {
    headers: { "User-Agent": "NearNow ZIP lookup/1.0" }
  });

  if (!response.ok) return null;
  const payload = await response.json();
  const place = payload.places?.[0];
  if (!place) return null;

  return {
    zip,
    city: place["place name"],
    state: place["state abbreviation"],
    stateName: place.state,
    latitude: Number(place.latitude),
    longitude: Number(place.longitude)
  };
}

async function fetchWeatherAlerts(location) {
  const url = new URL("https://api.weather.gov/alerts/active");
  url.searchParams.set("point", `${location.latitude},${location.longitude}`);

  const response = await fetch(url, {
    headers: {
      "Accept": "application/geo+json",
      "User-Agent": "NearNow local alerts (contact: near-now.com)"
    }
  });

  if (!response.ok) return [];
  const payload = await response.json();

  return (payload.features || []).slice(0, 8).map((feature) => {
    const item = feature.properties || {};
    return {
      id: item.id || item.event || item.headline,
      title: item.headline || item.event || "Weather alert",
      category: "Weather",
      severity: item.severity || "Unknown",
      urgency: item.urgency || "Unknown",
      area: item.areaDesc || location.city,
      effective: item.effective || "",
      expires: item.expires || "",
      link: item["@id"] || ""
    };
  });
}

function overpassQuery(location) {
  const radius = 4500;
  const { latitude, longitude } = location;
  return `
    [out:json][timeout:18];
    (
      node(around:${radius},${latitude},${longitude})["amenity"~"cafe|restaurant|library|bar|theatre|cinema|community_centre"];
      node(around:${radius},${latitude},${longitude})["leisure"~"park|sports_centre|fitness_centre"];
      node(around:${radius},${latitude},${longitude})["tourism"~"museum|gallery|attraction"];
      way(around:${radius},${latitude},${longitude})["amenity"~"cafe|restaurant|library|bar|theatre|cinema|community_centre"];
      way(around:${radius},${latitude},${longitude})["leisure"~"park|sports_centre|fitness_centre"];
      way(around:${radius},${latitude},${longitude})["tourism"~"museum|gallery|attraction"];
    );
    out center tags 24;
  `;
}

function distanceMiles(a, b) {
  const earthMiles = 3958.8;
  const toRad = (value) => value * Math.PI / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * earthMiles * Math.asin(Math.sqrt(h));
}

function moodFromTags(tags = {}) {
  const amenity = tags.amenity || "";
  const leisure = tags.leisure || "";
  const tourism = tags.tourism || "";

  if (/cafe|restaurant|bar/.test(amenity)) return "food";
  if (/library/.test(amenity)) return "work";
  if (/park|sports_centre|fitness_centre/.test(leisure)) return "outside";
  if (/theatre|cinema|museum|gallery|attraction|community_centre/.test(`${amenity} ${tourism}`)) return "music";
  return "outside";
}

async function fetchPlaces(location) {
  const response = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "User-Agent": "NearNow local places/1.0"
    },
    body: new URLSearchParams({ data: overpassQuery(location) })
  });

  if (!response.ok) return [];
  const payload = await response.json();
  const seen = new Set();

  return (payload.elements || [])
    .map((element) => {
      const tags = element.tags || {};
      const latitude = element.lat ?? element.center?.lat;
      const longitude = element.lon ?? element.center?.lon;
      const name = tags.name;
      if (!name || !latitude || !longitude || seen.has(name.toLowerCase())) return null;
      seen.add(name.toLowerCase());

      const distance = distanceMiles(location, { latitude, longitude });
      return {
        id: String(element.id),
        name,
        mood: moodFromTags(tags),
        distance: Number(distance.toFixed(1)),
        minutes: Math.max(3, Math.round(distance * 20)),
        status: tags.opening_hours ? "Hours listed" : "Nearby",
        statusClass: "status",
        detail: [tags.cuisine, tags.amenity, tags.leisure, tags.tourism].filter(Boolean).join(" · ") || "Local place from OpenStreetMap.",
        latitude,
        longitude,
        source: "OpenStreetMap"
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 16);
}

export default async (req) => {
  if (req.method !== "GET") return json({ error: "Method not allowed" }, 405);

  const zip = cleanZip(new URL(req.url).searchParams.get("zip"));
  if (!zip) return json({ error: "Enter a valid 5-digit ZIP code." }, 400);

  const location = await fetchZip(zip);
  if (!location) return json({ error: "ZIP code not found." }, 404);

  const [alerts, places] = await Promise.all([
    fetchWeatherAlerts(location),
    fetchPlaces(location)
  ]);

  return json({ location, alerts, places });
};

export const config = {
  path: "/api/zip-data"
};
