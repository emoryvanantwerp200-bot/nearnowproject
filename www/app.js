// Real, hand-curated places to visit in and just outside Mobile, Alabama.
// Distances are approximate miles from downtown Mobile (ZIP 36602). This list
// is the default showcase; entering a ZIP swaps in live OpenStreetMap results.
const places = [
  {
    id: "bienville-square",
    name: "Bienville Square",
    mood: "outside",
    distance: 0.2,
    minutes: 4,
    status: "Open daily",
    statusClass: "status",
    detail: "Historic downtown park with a cast-iron fountain and live oaks.",
    color: "#65a30d",
    latitude: 30.6925,
    longitude: -88.0425,
    source: "Mobile, AL"
  },
  {
    id: "wintzells-oyster-house",
    name: "Wintzell's Oyster House",
    mood: "food",
    distance: 0.3,
    minutes: 6,
    status: "Open now",
    statusClass: "status",
    detail: "Dauphin Street institution serving Gulf oysters fried, stewed, or nude since 1938.",
    color: "#d97706",
    latitude: 30.6924,
    longitude: -88.0445,
    source: "Mobile, AL"
  },
  {
    id: "the-noble-south",
    name: "The Noble South",
    mood: "food",
    distance: 0.3,
    minutes: 6,
    status: "Dinner service",
    statusClass: "status",
    detail: "Farm-to-table Gulf Coast cooking from local growers on Dauphin Street.",
    color: "#ea580c",
    latitude: 30.6916,
    longitude: -88.042,
    source: "Mobile, AL"
  },
  {
    id: "serdas-coffee",
    name: "Serda's Coffee Co.",
    mood: "work",
    distance: 0.3,
    minutes: 6,
    status: "Open now",
    statusClass: "status",
    detail: "Downtown roaster with strong espresso, free Wi-Fi, and tables to work from.",
    color: "#7c3aed",
    latitude: 30.6916,
    longitude: -88.0408,
    source: "Mobile, AL"
  },
  {
    id: "soul-kitchen-music-hall",
    name: "Soul Kitchen Music Hall",
    mood: "music",
    distance: 0.3,
    minutes: 6,
    status: "Shows nightly",
    statusClass: "status soon",
    detail: "Dauphin Street live-music venue hosting touring and regional acts.",
    color: "#be123c",
    latitude: 30.6917,
    longitude: -88.0423,
    source: "Mobile, AL"
  },
  {
    id: "history-museum-of-mobile",
    name: "History Museum of Mobile",
    mood: "music",
    distance: 0.3,
    minutes: 6,
    status: "Open Tue–Sun",
    statusClass: "status",
    detail: "300 years of port-city history inside the restored 1857 city hall.",
    color: "#2563eb",
    latitude: 30.6905,
    longitude: -88.0408,
    source: "Mobile, AL"
  },
  {
    id: "saenger-theatre",
    name: "The Saenger Theatre",
    mood: "music",
    distance: 0.4,
    minutes: 7,
    status: "Check schedule",
    statusClass: "status soon",
    detail: "Ornate 1927 theatre hosting the symphony, touring shows, and concerts.",
    color: "#1d4ed8",
    latitude: 30.6913,
    longitude: -88.0428,
    source: "Mobile, AL"
  },
  {
    id: "gulfquest-maritime-museum",
    name: "GulfQuest National Maritime Museum",
    mood: "music",
    distance: 0.4,
    minutes: 7,
    status: "Open Wed–Sun",
    statusClass: "status",
    detail: "Hands-on museum of the Gulf of Mexico on the downtown riverfront.",
    color: "#0ea5e9",
    latitude: 30.6896,
    longitude: -88.039,
    source: "Mobile, AL"
  },
  {
    id: "dauphins-restaurant",
    name: "Dauphin's",
    mood: "food",
    distance: 0.4,
    minutes: 7,
    status: "Lunch & dinner",
    statusClass: "status",
    detail: "Creole fine dining on the 34th floor with sweeping Mobile Bay views.",
    color: "#b45309",
    latitude: 30.6928,
    longitude: -88.043,
    source: "Mobile, AL"
  },
  {
    id: "ben-may-main-library",
    name: "Ben May Main Library",
    mood: "work",
    distance: 0.4,
    minutes: 8,
    status: "Open now",
    statusClass: "status",
    detail: "Mobile Public Library's flagship branch with quiet reading rooms and desks.",
    color: "#6d28d9",
    latitude: 30.6886,
    longitude: -88.047,
    source: "Mobile, AL"
  },
  {
    id: "cooper-riverside-park",
    name: "Cooper Riverside Park",
    mood: "outside",
    distance: 0.5,
    minutes: 9,
    status: "Open daily",
    statusClass: "status",
    detail: "Waterfront green space to watch ships and cruise ships work the Mobile River.",
    color: "#0f766e",
    latitude: 30.6908,
    longitude: -88.0388,
    source: "Mobile, AL"
  },
  {
    id: "callaghans-irish-social-club",
    name: "Callaghan's Irish Social Club",
    mood: "food",
    distance: 1.1,
    minutes: 14,
    status: "Open now",
    statusClass: "status",
    detail: "Beloved Oakleigh neighborhood pub famous for its LA (Lower Alabama) burger.",
    color: "#c2410c",
    latitude: 30.679,
    longitude: -88.049,
    source: "Mobile, AL"
  },
  {
    id: "carpe-diem-coffee",
    name: "Carpe Diem Coffee & Tea House",
    mood: "work",
    distance: 2.8,
    minutes: 22,
    status: "Open now",
    statusClass: "status",
    detail: "Midtown cottage cafe on Old Shell Road with pastries and porch seating.",
    color: "#5b21b6",
    latitude: 30.684,
    longitude: -88.117,
    source: "Mobile, AL"
  },
  {
    id: "uss-alabama-battleship",
    name: "USS Alabama Battleship Memorial Park",
    mood: "outside",
    distance: 3.5,
    minutes: 30,
    status: "Open daily",
    statusClass: "status",
    detail: "Tour a WWII battleship, a submarine, and an aircraft pavilion on the bay.",
    color: "#15803d",
    latitude: 30.6817,
    longitude: -88.0147,
    source: "Mobile, AL"
  },
  {
    id: "mobile-botanical-gardens",
    name: "Mobile Botanical Gardens",
    mood: "outside",
    distance: 6.9,
    minutes: 48,
    status: "Open Wed–Sun",
    statusClass: "status",
    detail: "100 acres of longleaf pine, azaleas, and a rhododendron garden in Langan Park.",
    color: "#4d7c0f",
    latitude: 30.6953,
    longitude: -88.1525,
    source: "Mobile, AL"
  },
  {
    id: "five-rivers-delta-center",
    name: "Five Rivers Delta Resource Center",
    mood: "outside",
    distance: 7.5,
    minutes: 52,
    status: "Open daily",
    statusClass: "status",
    detail: "Boardwalks, exhibits, and kayak launches into the Mobile-Tensaw Delta in Spanish Fort.",
    color: "#047857",
    latitude: 30.665,
    longitude: -87.932,
    source: "Spanish Fort, AL"
  },
  {
    id: "fairhope-pier",
    name: "Downtown Fairhope & Municipal Pier",
    mood: "outside",
    distance: 14,
    minutes: 75,
    status: "Open daily",
    statusClass: "status",
    detail: "Bayfront arts town across Mobile Bay with a long pier, rose garden, and sunsets.",
    color: "#0d9488",
    latitude: 30.523,
    longitude: -87.911,
    source: "Fairhope, AL"
  },
  {
    id: "bellingrath-gardens",
    name: "Bellingrath Gardens and Home",
    mood: "outside",
    distance: 18,
    minutes: 95,
    status: "Open daily",
    statusClass: "status",
    detail: "65 acres of formal gardens and a riverside estate in Theodore, just south of Mobile.",
    color: "#16a34a",
    latitude: 30.4078,
    longitude: -88.1392,
    source: "Theodore, AL"
  },
  {
    id: "dauphin-island-estuarium",
    name: "Dauphin Island & the Estuarium",
    mood: "outside",
    distance: 33,
    minutes: 150,
    status: "Beaches open daily",
    statusClass: "status",
    detail: "Barrier-island beaches, Fort Gaines, and the Sea Lab's coastal aquarium.",
    color: "#0891b2",
    latitude: 30.251,
    longitude: -88.078,
    source: "Dauphin Island, AL"
  }
];

const DEFAULT_ZIP = "36602"; // Mobile, Alabama

const state = {
  query: "",
  mood: "all",
  radius: 1,
  feedQuery: "",
  feedCategory: "All",
  zip: localStorage.getItem("nearnow:zip") || DEFAULT_ZIP,
  location: null,
  alerts: [],
  livePlaces: [],
  saved: new Set(JSON.parse(localStorage.getItem("nearnow:saved") || "[]"))
};

const placeList = document.querySelector("#place-list");
const timeline = document.querySelector("#timeline");
const openCount = document.querySelector("#open-count");
const timeWindow = document.querySelector("#time-window");
const locationName = document.querySelector("#location-name");
const locationDetail = document.querySelector("#location-detail");
const alertList = document.querySelector("#alert-list");
const mapCanvas = document.querySelector("#local-map");
const mapCard = document.querySelector("#map-card");
const mapReset = document.querySelector("#map-reset");
const mapToggleAlerts = document.querySelector("#map-toggle-alerts");
const mapTogglePlaces = document.querySelector("#map-toggle-places");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const clearSaved = document.querySelector("#clear-saved");
const zipForm = document.querySelector("#zip-form");
const zipInput = document.querySelector("#zip-input");
const zipStatus = document.querySelector("#zip-status");
const feedSection = document.querySelector("#feeds");
const feedSearchInput = document.querySelector("#feed-search-input");
const feedCategories = document.querySelector("#feed-categories");
const feedGrid = document.querySelector("#feed-grid");
const feedPreview = document.querySelector("#feed-preview");
const agentForm = document.querySelector("#agent-form");
const agentInput = document.querySelector("#agent-input");
const agentResponse = document.querySelector("#agent-response");
const agentSubmit = document.querySelector(".agent-submit");
const feeds = Array.isArray(window.NEARNOW_FEEDS) ? window.NEARNOW_FEEDS : [];
const mapState = {
  ready: false,
  showAlerts: true,
  showPlaces: true,
  scene: null,
  camera: null,
  renderer: null,
  group: null,
  raycaster: null,
  pointer: null,
  points: [],
  yaw: -0.55,
  pitch: 0.92,
  distance: 15,
  dragging: false,
  lastX: 0,
  lastY: 0
};

const zipRegions = [
  { min: 10000, max: 14999, state: "NY", metro: "New York" },
  { min: 1500, max: 2799, state: "MA", metro: "Boston" },
  { min: 3000, max: 3899, state: "MA", metro: "Boston" },
  { min: 60000, max: 62999, state: "IL", metro: "Chicago" },
  { min: 90000, max: 93599, state: "CA", metro: "Los Angeles" },
  { min: 36500, max: 36699, state: "AL", metro: "Mobile" },
  { min: 35000, max: 36999, state: "AL", metro: "Alabama" }
];

function getZipLocation(zip) {
  const numeric = Number(zip);
  return zipRegions.find((region) => numeric >= region.min && numeric <= region.max) || null;
}

function isValidZip(zip) {
  return /^\d{5}$/.test(zip);
}

function getLocationLabel() {
  const location = getZipLocation(state.zip);
  if (!isValidZip(state.zip)) return "";
  return location ? `${location.metro}, ${location.state}` : `ZIP ${state.zip}`;
}

function updateZipUi() {
  if (!zipInput || !zipStatus) return;

  zipInput.value = state.zip;
  const label = getLocationLabel();
  const ready = isValidZip(state.zip);
  zipStatus.textContent = ready
    ? `Showing national feeds and local matches for ${label}.`
    : "RSS feeds unlock after a valid 5-digit ZIP code.";
  zipStatus.classList.toggle("is-ready", ready);
  feedSection?.classList.toggle("is-locked", !ready);

  if (locationName && locationDetail) {
    locationName.textContent = state.location ? `${state.location.city}, ${state.location.state}` : ready ? `ZIP ${state.zip}` : "Enter ZIP";
    locationDetail.textContent = state.location
      ? `${state.livePlaces.length} real places · ${state.alerts.length} active alerts`
      : "Real places and alerts load by ZIP code.";
  }
}

function currentPlaces() {
  return state.livePlaces.length ? state.livePlaces : places;
}

function persistSaved() {
  localStorage.setItem("nearnow:saved", JSON.stringify([...state.saved]));
}

function getFilteredPlaces() {
  const query = state.query.trim().toLowerCase();

  return currentPlaces().filter((place) => {
    const matchesRadius = place.distance <= state.radius;
    const matchesMood = state.mood === "all" || place.mood === state.mood;
    const matchesQuery = !query || [place.name, place.mood, place.detail].join(" ").toLowerCase().includes(query);
    return matchesRadius && matchesMood && matchesQuery;
  });
}

function renderPlaces() {
  const filtered = getFilteredPlaces();
  openCount.textContent = `${filtered.length} ${filtered.length === 1 ? "place" : "places"} ${state.livePlaces.length ? "nearby" : "open"}`;
  timeWindow.textContent = `Updated ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;

  if (!filtered.length) {
    placeList.innerHTML = state.location
      ? '<div class="empty">No real places matched this radius or mood. Try widening the search or switching moods.</div>'
      : '<div class="empty">Enter your ZIP code above to load real nearby places.</div>';
    renderTimeline([]);
    return;
  }

  placeList.innerHTML = filtered.map((place) => {
    const saved = state.saved.has(place.id);
    return `
      <article class="place-card">
        <div class="place-art" style="background:${place.color}" aria-hidden="true"></div>
        <div>
          <span class="${place.statusClass}">${place.status}</span>
          <h3>${place.name}</h3>
          <p>${place.detail}</p>
          <div class="meta">
            <span>${place.distance.toFixed(1)} mi</span>
            <span>${place.minutes} min ${state.livePlaces.length ? "away" : "walk"}</span>
            <span>${place.mood}</span>
            ${place.source ? `<span>${place.source}</span>` : ""}
          </div>
        </div>
        <button class="save-button ${saved ? "is-saved" : ""}" type="button" data-save="${place.id}">
          ${saved ? "Saved" : "Save"}
        </button>
      </article>
    `;
  }).join("");

  renderTimeline(filtered);
}

function renderAlerts() {
  if (!alertList) return;

  if (!isValidZip(state.zip)) {
    alertList.innerHTML = '<div class="empty">Enter your ZIP code to load local weather alerts.</div>';
    return;
  }

  if (!state.alerts.length) {
    alertList.innerHTML = '<div class="empty">No active National Weather Service alerts were found for this ZIP code.</div>';
    return;
  }

  alertList.innerHTML = state.alerts.map((alert) => `
    <article class="alert-card">
      <span class="feed-pill">${alert.category} · ${alert.severity}</span>
      <h3>${alert.title}</h3>
      <p>${alert.area}</p>
      ${alert.expires ? `<p>Expires ${new Date(alert.expires).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</p>` : ""}
      ${alert.link ? `<a href="${alert.link}" target="_blank" rel="noreferrer">View alert</a>` : ""}
    </article>
  `).join("");
}

function projectPoint(latitude, longitude) {
  if (!state.location) return { x: 0, z: 0 };
  const milesPerLat = 69;
  const milesPerLon = 69 * Math.cos(state.location.latitude * Math.PI / 180);
  return {
    x: (longitude - state.location.longitude) * milesPerLon,
    z: -(latitude - state.location.latitude) * milesPerLat
  };
}

function updateMapCard(title, body) {
  if (!mapCard) return;
  mapCard.innerHTML = `<strong>${title}</strong><span>${body}</span>`;
}

function initMap() {
  if (mapState.ready || !mapCanvas || !window.THREE) return;

  const THREE = window.THREE;
  mapState.scene = new THREE.Scene();
  mapState.scene.background = new THREE.Color(0x0b1118);
  mapState.camera = new THREE.PerspectiveCamera(52, 1, 0.1, 1000);
  mapState.renderer = new THREE.WebGLRenderer({ canvas: mapCanvas, antialias: true });
  mapState.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  mapState.group = new THREE.Group();
  mapState.scene.add(mapState.group);
  mapState.raycaster = new THREE.Raycaster();
  mapState.pointer = new THREE.Vector2();

  const ambient = new THREE.AmbientLight(0xffffff, 0.78);
  const sun = new THREE.DirectionalLight(0xffffff, 1.15);
  sun.position.set(6, 10, 4);
  mapState.scene.add(ambient, sun);

  const grid = new THREE.GridHelper(18, 18, 0x2dd4bf, 0x334155);
  grid.material.opacity = 0.42;
  grid.material.transparent = true;
  mapState.group.add(grid);

  mapCanvas.addEventListener("pointerdown", (event) => {
    mapState.dragging = true;
    mapState.lastX = event.clientX;
    mapState.lastY = event.clientY;
    mapCanvas.setPointerCapture(event.pointerId);
  });

  mapCanvas.addEventListener("pointermove", (event) => {
    if (mapState.dragging) {
      const dx = event.clientX - mapState.lastX;
      const dy = event.clientY - mapState.lastY;
      mapState.yaw -= dx * 0.008;
      mapState.pitch = Math.max(0.35, Math.min(1.25, mapState.pitch + dy * 0.006));
      mapState.lastX = event.clientX;
      mapState.lastY = event.clientY;
      updateCamera();
      return;
    }
    pickMapPoint(event);
  });

  mapCanvas.addEventListener("pointerup", () => {
    mapState.dragging = false;
  });

  mapCanvas.addEventListener("wheel", (event) => {
    event.preventDefault();
    mapState.distance = Math.max(7, Math.min(26, mapState.distance + event.deltaY * 0.015));
    updateCamera();
  }, { passive: false });

  window.addEventListener("resize", resizeMap);
  mapState.ready = true;
  resizeMap();
  updateCamera();
  renderMap();
  animateMap();
}

function resizeMap() {
  if (!mapState.ready) return;
  const rect = mapCanvas.getBoundingClientRect();
  mapState.camera.aspect = rect.width / Math.max(1, rect.height);
  mapState.camera.updateProjectionMatrix();
  mapState.renderer.setSize(rect.width, rect.height, false);
}

function updateCamera() {
  if (!mapState.ready) return;
  const r = mapState.distance;
  mapState.camera.position.set(
    Math.sin(mapState.yaw) * Math.cos(mapState.pitch) * r,
    Math.sin(mapState.pitch) * r,
    Math.cos(mapState.yaw) * Math.cos(mapState.pitch) * r
  );
  mapState.camera.lookAt(0, 0, 0);
}

function makeLabelSprite(text, color) {
  const THREE = window.THREE;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.width = 384;
  canvas.height = 96;
  context.fillStyle = "rgba(255,255,255,0.92)";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = color;
  context.font = "700 32px sans-serif";
  context.fillText(text.slice(0, 22), 18, 58);
  const texture = new THREE.CanvasTexture(canvas);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }));
  sprite.scale.set(2.7, 0.68, 1);
  return sprite;
}

function addMapMarker(item, type) {
  const THREE = window.THREE;
  const color = type === "alert" ? 0xf59e0b : 0x14b8a6;
  const geometry = type === "alert"
    ? new THREE.ConeGeometry(0.22, 0.72, 24)
    : new THREE.SphereGeometry(0.2, 24, 16);
  const material = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.18 });
  const mesh = new THREE.Mesh(geometry, material);
  const point = type === "alert"
    ? { x: 0, z: 0 }
    : projectPoint(item.latitude, item.longitude);
  mesh.position.set(point.x, type === "alert" ? 0.8 : 0.28, point.z);
  mesh.userData = { item, type };
  mesh.visible = type === "alert" ? mapState.showAlerts : mapState.showPlaces;
  mapState.group.add(mesh);
  mapState.points.push(mesh);

  const label = makeLabelSprite(type === "alert" ? item.severity || "Alert" : item.name, type === "alert" ? "#92400e" : "#134e4a");
  label.position.set(point.x, type === "alert" ? 1.35 : 0.72, point.z);
  label.userData = { item, type, isLabel: true };
  label.visible = mesh.visible;
  mapState.group.add(label);
  mapState.points.push(label);
}

function renderMap() {
  initMap();
  if (!mapState.ready) return;

  mapState.points.forEach((point) => mapState.group.remove(point));
  mapState.points = [];

  if (!state.location) {
    updateMapCard("Enter a ZIP code", "Real places and alerts will appear on the 3D map.");
    return;
  }

  state.livePlaces.slice(0, 18).forEach((place) => addMapMarker(place, "place"));
  state.alerts.slice(0, 6).forEach((alert) => addMapMarker(alert, "alert"));
  updateMapCard(`${state.location.city}, ${state.location.state}`, `${state.livePlaces.length} places and ${state.alerts.length} alerts loaded.`);
}

function animateMap() {
  if (!mapState.ready) return;
  requestAnimationFrame(animateMap);
  mapState.points.forEach((point) => {
    if (point.userData.type === "alert" && !point.userData.isLabel) {
      point.rotation.y += 0.018;
    }
  });
  mapState.renderer.render(mapState.scene, mapState.camera);
}

function pickMapPoint(event) {
  if (!mapState.ready || !mapState.points.length) return;
  const rect = mapCanvas.getBoundingClientRect();
  mapState.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mapState.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  mapState.raycaster.setFromCamera(mapState.pointer, mapState.camera);
  const hit = mapState.raycaster.intersectObjects(mapState.points, false)[0];
  if (!hit) return;
  const { item, type } = hit.object.userData;
  if (type === "alert") {
    updateMapCard(item.title, `${item.severity} · ${item.area}`);
  } else {
    updateMapCard(item.name, `${item.distance} mi · ${item.detail}`);
  }
}

function updateMapVisibility() {
  mapState.points.forEach((point) => {
    point.visible = point.userData.type === "alert" ? mapState.showAlerts : mapState.showPlaces;
  });
  mapToggleAlerts?.classList.toggle("is-muted", !mapState.showAlerts);
  mapTogglePlaces?.classList.toggle("is-muted", !mapState.showPlaces);
}

function resetMapView() {
  mapState.yaw = -0.55;
  mapState.pitch = 0.92;
  mapState.distance = 15;
  updateCamera();
}

function scheduleMapInit() {
  if (window.THREE) {
    initMap();
  } else {
    window.addEventListener("load", initMap, { once: true });
  }
}

mapReset?.addEventListener("click", resetMapView);
mapToggleAlerts?.addEventListener("click", () => {
  mapState.showAlerts = !mapState.showAlerts;
  updateMapVisibility();
});
mapTogglePlaces?.addEventListener("click", () => {
  mapState.showPlaces = !mapState.showPlaces;
  updateMapVisibility();
});

async function loadZipData(zip) {
  zipStatus.textContent = "Loading real places and local alerts...";
  zipStatus.classList.add("is-ready");

  try {
    const response = await fetch(`/api/zip-data?zip=${encodeURIComponent(zip)}`);
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Could not load ZIP data.");

    state.location = payload.location;
    state.alerts = payload.alerts || [];
    state.livePlaces = payload.places || [];
    updateZipUi();
    renderPlaces();
    renderAlerts();
    renderMap();
    renderFeedCategories();
    renderFeeds();
  } catch (error) {
    state.location = null;
    state.alerts = [];
    state.livePlaces = [];
    updateZipUi();
    renderPlaces();
    renderAlerts();
    renderMap();
    zipStatus.textContent = `${error.message} Showing feed personalization only.`;
  }
}

function renderTimeline(filtered) {
  const route = filtered.filter((place) => state.saved.has(place.id)).slice(0, 3);

  if (!route.length) {
    timeline.innerHTML = '<div class="empty">Save a few places to sketch a simple route.</div>';
    return;
  }

  timeline.innerHTML = route.map((place, index) => `
    <div class="timeline-item">
      <span class="timeline-time">${index + 1}:00</span>
      <div>
        <strong>${place.name}</strong>
        <p>${place.minutes} minutes away. ${place.status.toLowerCase()}.</p>
      </div>
    </div>
  `).join("");
}

function getFilteredFeeds() {
  if (!isValidZip(state.zip)) return [];

  const query = state.feedQuery.trim().toLowerCase();
  const location = getZipLocation(state.zip);

  return feeds.filter((feed) => {
    const isLocal = feed.category === "Local News";
    const matchesLocation = !isLocal
      || Boolean(location && (
        feed.regions?.includes(location.state) || feed.metros?.includes(location.metro)
      ));
    const matchesCategory = state.feedCategory === "All" || feed.category === state.feedCategory;
    const matchesQuery = !query || [feed.category, feed.source, feed.note, feed.feedUrl].join(" ").toLowerCase().includes(query);
    return matchesLocation && matchesCategory && matchesQuery;
  });
}

function renderFeedCategories() {
  const visibleFeeds = isValidZip(state.zip) ? getFilteredFeedsForCategories() : [];
  const categories = ["All", ...new Set(visibleFeeds.map((feed) => feed.category))];
  feedCategories.innerHTML = categories.map((category) => `
    <button class="chip ${category === state.feedCategory ? "is-active" : ""}" type="button" data-feed-category="${category}">
      ${category}
    </button>
  `).join("");
}

function getFilteredFeedsForCategories() {
  const location = getZipLocation(state.zip);
  return feeds.filter((feed) => {
    if (feed.category !== "Local News") return true;
    return Boolean(location && (feed.regions?.includes(location.state) || feed.metros?.includes(location.metro)));
  });
}

function renderFeeds() {
  if (!feedGrid) return;

  updateZipUi();

  if (!isValidZip(state.zip)) {
    feedGrid.innerHTML = '<div class="empty">Enter your ZIP code above to unlock feeds for your area.</div>';
    feedPreview.innerHTML = "";
    return;
  }

  const filtered = getFilteredFeeds();

  if (!filtered.length) {
    feedGrid.innerHTML = '<div class="empty">No feed sources match that search.</div>';
    return;
  }

  feedGrid.innerHTML = filtered.map((feed) => {
    const hasFeed = Boolean(feed.feedUrl);
    return `
      <article class="feed-card">
        <div class="feed-meta">
          <span class="feed-pill">${feed.category}</span>
          <span class="${hasFeed ? "status" : "status soon"}">${hasFeed ? "RSS ready" : "No public RSS"}</span>
        </div>
          <h3>${feed.source}</h3>
          <p>${feed.note}</p>
          ${feed.category === "Local News" ? `<span class="feed-location">${(feed.metros || feed.regions || []).join(", ")}</span>` : ""}
          ${hasFeed ? `<code title="${feed.feedUrl}">${feed.feedUrl}</code>` : ""}
        <div class="feed-actions">
          <a href="${feed.homepageUrl}" target="_blank" rel="noreferrer">Website</a>
          ${hasFeed ? `<button class="feed-action secondary" type="button" data-copy-feed="${feed.source}">Copy RSS</button>` : ""}
          <button class="feed-action" type="button" data-preview-feed="${feed.source}" ${hasFeed ? "" : "disabled"}>Preview</button>
        </div>
      </article>
    `;
  }).join("");
}

function renderFeedPreview(feed, items, message = "") {
  if (!feedPreview) return;

  if (message) {
    feedPreview.innerHTML = `<div class="preview-panel"><h3>${feed.source}</h3><p>${message}</p></div>`;
    return;
  }

  feedPreview.innerHTML = `
    <div class="preview-panel">
      <h3>${feed.source} latest</h3>
      <ol>
        ${items.map((item) => `
          <li>
            <a href="${item.link}" target="_blank" rel="noreferrer">${item.title}</a>
          </li>
        `).join("")}
      </ol>
    </div>
  `;
}

async function previewFeed(source) {
  const feed = feeds.find((item) => item.source === source);
  if (!feed || !feed.feedUrl) return;

  renderFeedPreview(feed, [], "Loading the latest items...");

  try {
    const response = await fetch(`/api/rss?url=${encodeURIComponent(feed.feedUrl)}`);
    if (!response.ok) {
      throw new Error("Feed preview is not available yet.");
    }
    const payload = await response.json();
    renderFeedPreview(feed, payload.items || [], payload.items?.length ? "" : "No items were returned by this feed.");
  } catch (error) {
    renderFeedPreview(feed, [], "Live previews run after the site is deployed on Netlify. The feed link is still ready to use.");
  }
}

async function copyFeedUrl(source) {
  const feed = feeds.find((item) => item.source === source);
  if (!feed || !feed.feedUrl) return;

  try {
    await navigator.clipboard.writeText(feed.feedUrl);
    renderFeedPreview(feed, [], "RSS URL copied to your clipboard.");
  } catch {
    renderFeedPreview(feed, [], `Copy this RSS URL: ${feed.feedUrl}`);
  }
}

function setAgentResponse(message) {
  if (agentResponse) {
    agentResponse.textContent = message;
  }
}

function buildAgentContext() {
  const activePlaces = currentPlaces();
  return {
    location: state.location
      ? { city: state.location.city, state: state.location.state, zip: state.zip }
      : null,
    places: activePlaces.map(({ id, name, mood, distance, minutes, status, detail }) => ({
      id,
      name,
      mood,
      distance,
      minutes,
      status,
      detail
    })),
    alerts: state.alerts.map(({ title, severity, area, expires }) => ({
      title,
      severity,
      area,
      expires
    })),
    feeds: feeds.map(({ category, source, feedUrl, note }) => ({
      category,
      source,
      hasFeed: Boolean(feedUrl),
      note
    })),
    filters: {
      query: state.query,
      mood: state.mood,
      radius: state.radius,
      feedQuery: state.feedQuery,
      feedCategory: state.feedCategory,
      savedPlaceIds: [...state.saved]
    }
  };
}

async function askAgent(prompt) {
  const question = prompt.trim();
  if (!question) {
    setAgentResponse("Ask a question first.");
    return;
  }

  agentSubmit.disabled = true;
  setAgentResponse("Thinking...");

  try {
    const response = await fetch("/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question,
        context: buildAgentContext()
      })
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || "The agent is unavailable right now.");
    }

    setAgentResponse(payload.answer || "I did not get an answer back.");
  } catch (error) {
    setAgentResponse(error.message || "The agent is unavailable right now.");
  } finally {
    agentSubmit.disabled = false;
  }
}

document.querySelectorAll("[data-radius]").forEach((button) => {
  button.addEventListener("click", () => {
    state.radius = Number(button.dataset.radius);
    document.querySelectorAll("[data-radius]").forEach((item) => item.classList.toggle("is-active", item === button));
    renderPlaces();
  });
});

document.querySelectorAll("[data-mood]").forEach((button) => {
  button.addEventListener("click", () => {
    state.mood = button.dataset.mood;
    document.querySelectorAll("[data-mood]").forEach((item) => item.classList.toggle("is-active", item === button));
    renderPlaces();
  });
});

placeList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-save]");
  if (!button) return;

  const id = button.dataset.save;
  if (state.saved.has(id)) {
    state.saved.delete(id);
  } else {
    state.saved.add(id);
  }

  persistSaved();
  renderPlaces();
});

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  state.query = searchInput.value;
  renderPlaces();
});

searchInput.addEventListener("input", () => {
  state.query = searchInput.value;
  renderPlaces();
});

zipForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const zip = zipInput.value.trim();
  if (!isValidZip(zip)) {
    zipInput.focus();
    updateZipUi();
    return;
  }

  applyZip(zip);
  document.querySelector("#feeds")?.scrollIntoView({ behavior: "smooth", block: "start" });
});

function applyZip(zip) {
  state.zip = zip;
  state.feedCategory = "All";
  zipInput.value = zip;
  localStorage.setItem("nearnow:zip", zip);
  renderFeedCategories();
  renderFeeds();
  loadZipData(zip);
}

document.querySelectorAll("[data-zip]").forEach((button) => {
  button.addEventListener("click", () => {
    applyZip(button.dataset.zip);
    document.querySelector("#places")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

clearSaved.addEventListener("click", () => {
  state.saved.clear();
  persistSaved();
  renderPlaces();
});

feedCategories?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-feed-category]");
  if (!button) return;

  state.feedCategory = button.dataset.feedCategory;
  renderFeedCategories();
  renderFeeds();
});

feedSearchInput?.addEventListener("input", () => {
  state.feedQuery = feedSearchInput.value;
  renderFeeds();
});

feedGrid?.addEventListener("click", (event) => {
  const previewButton = event.target.closest("[data-preview-feed]");
  if (previewButton) {
    previewFeed(previewButton.dataset.previewFeed);
    return;
  }

  const copyButton = event.target.closest("[data-copy-feed]");
  if (copyButton) {
    copyFeedUrl(copyButton.dataset.copyFeed);
  }
});

agentForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  askAgent(agentInput.value);
});

document.querySelectorAll("[data-agent-prompt]").forEach((button) => {
  button.addEventListener("click", () => {
    agentInput.value = button.dataset.agentPrompt;
    askAgent(agentInput.value);
  });
});

renderPlaces();
updateZipUi();
renderAlerts();
renderFeedCategories();
renderFeeds();
scheduleMapInit();
if (isValidZip(state.zip)) {
  loadZipData(state.zip);
}
