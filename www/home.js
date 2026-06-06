// Safe storage shadow for environments with blocked localStorage/sessionStorage
const getSafeStorage = (type) => {
  try {
    const s = window[type];
    s.setItem("__test_safe__", "1");
    s.removeItem("__test_safe__");
    return s;
  } catch (e) {
    const mem = {};
    return {
      getItem(k) { return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null; },
      setItem(k, v) { mem[k] = String(v); },
      removeItem(k) { delete mem[k]; },
      clear() { for (const k in mem) delete mem[k]; },
      key(i) { return Object.keys(mem)[i] || null; },
      get length() { return Object.keys(mem).length; }
    };
  }
};
const localStorage = getSafeStorage("localStorage");
const sessionStorage = getSafeStorage("sessionStorage");

const briefData = {
  "Mobile County": {
    time: "Updated 6:40 AM",
    summary:
      "Mobile County has a normal morning weather pattern, routine traffic pressure around I-10 and Airport Boulevard, and no active AMBER alert displayed in this demo brief."
  },
  "Baldwin County": {
    time: "Updated 6:42 AM",
    summary:
      "Baldwin County residents should scan beach weather, county road updates, and school notices before the commute. No confirmed emergency report is marked active in this demo brief."
  },
  "Escambia County": {
    time: "Updated 6:47 AM",
    summary:
      "Escambia County coverage is watching Pensacola traffic, severe-weather notices from NWS Mobile/Pensacola, and public-safety updates from verified sources."
  },
  "West Mobile": {
    time: "Updated 6:51 AM",
    summary:
      "West Mobile has a school-and-commute-focused scan for Airport Boulevard, Schillinger Road, Dawes, Tanner Williams, and nearby neighborhood reports."
  },
  Pascagoula: {
    time: "Updated 6:55 AM",
    summary:
      "Pascagoula coverage is watching Jackson County alerts, Coast weather, river and port conditions, and verified updates from WLOX, Sun Herald, and city sources."
  }
};

const filters = document.querySelectorAll(".map-filter");
const pins = document.querySelectorAll(".pin");
const popover = document.querySelector("#mapPopover");
const locationInput = document.querySelector("#location");
const refreshButton = document.querySelector("#refreshBrief");
const summaryText = document.querySelector("#summaryText");
const summaryTime = document.querySelector("#summaryTime");
const reportButton = document.querySelector("#submitReport");
const reportStatus = document.querySelector("#reportStatus");
const areaTabs = document.querySelectorAll(".area-tab");
const newsFocus = document.querySelector("#newsFocus");
const sourceList = document.querySelector("#sourceList");
const reportList = document.querySelector("#reportList");
const refreshEmbeddedNewsButton = document.querySelector("#refreshEmbeddedNews");
const placeTabs = document.querySelectorAll(".place-tab");
const placesGrid = document.querySelector("#placesGrid");
const feedList = document.querySelector("#feedList");
const feedChips = document.querySelectorAll(".feed-chip");
const feedContext = document.querySelector("#feedContext");
const refreshFeedButton = document.querySelector("#refreshFeed");
const reportTitleInput = document.querySelector("#reportTitle");
const reportTypeSelect = document.querySelector("#reportType");
const reportAreaSelect = document.querySelector("#reportArea");
const reportTextInput = document.querySelector("#reportText");
const enableNotificationsButton = document.querySelector("#enableNotifications");
const saveNotificationsButton = document.querySelector("#saveNotifications");
const testNotificationButton = document.querySelector("#testNotification");
const notificationStatus = document.querySelector("#notificationStatus");
const notifyAreaInputs = document.querySelectorAll('input[name="notifyArea"]');
const signupButtons = document.querySelectorAll(".signup-button");
const quickReportButtons = document.querySelectorAll(".quick-report");
const abuseButtons = document.querySelectorAll(".report-abuse");

const localNewsAreas = {
  baldwin: {
    label: "Baldwin County",
    title: "Baldwin morning news scan",
    summary:
      "Follow coastal county headlines, beach communities, school updates, local government, roads, and severe-weather coverage.",
    sources: [
      {
        name: "Gulf Coast Media",
        type: "County newspaper",
        url: "https://gulfcoastmedia.com/",
        note: "Baldwin County community news, events, schools, government, and coastal coverage."
      },
      {
        name: "FOX10 Baldwin County",
        type: "TV news",
        url: "https://www.fox10tv.com/news/baldwin-county/",
        note: "Breaking news and weather for Daphne, Fairhope, Foley, Gulf Shores, Orange Beach, and nearby towns."
      },
      {
        name: "WKRG News 5",
        type: "Regional TV news",
        url: "https://www.wkrg.com/baldwin-county/",
        note: "Mobile-Pensacola market coverage with Baldwin County alerts and public-safety updates."
      }
    ]
  },
  mobile: {
    label: "Mobile County",
    title: "Mobile County morning news scan",
    summary:
      "Track city and county headlines, port activity, public safety, schools, weather, and local events across Mobile County.",
    sources: [
      {
        name: "WKRG News 5",
        type: "TV news",
        url: "https://www.wkrg.com/mobile-county/",
        note: "Mobile County breaking news, weather, traffic, and neighborhood stories."
      },
      {
        name: "FOX10 Mobile",
        type: "TV news",
        url: "https://www.fox10tv.com/",
        note: "Alabama Gulf Coast headlines, severe weather, and Mobile-area public-safety coverage."
      },
      {
        name: "Lagniappe Mobile",
        type: "Independent local paper",
        url: "https://www.lagniappemobile.com/",
        note: "Local news, civic reporting, food, arts, and events for Mobile and Baldwin counties."
      }
    ]
  },
  escambia: {
    label: "Escambia County",
    title: "Escambia County morning news scan",
    summary:
      "Scan Pensacola and north Escambia stories, road issues, county government, schools, weather, and neighborhood alerts.",
    sources: [
      {
        name: "Pensacola News Journal",
        type: "Local newspaper",
        url: "https://www.pnj.com/",
        note: "Pensacola and Escambia County reporting, investigations, business, sports, and events."
      },
      {
        name: "NorthEscambia.com",
        type: "Community news",
        url: "https://www.northescambia.com/",
        note: "Focused coverage for Century, Cantonment, Molino, Walnut Hill, and north Escambia communities."
      },
      {
        name: "WEAR ABC 3",
        type: "TV news",
        url: "https://weartv.com/news/local",
        note: "Northwest Florida local headlines, weather, traffic, and breaking news."
      }
    ]
  },
  westmobile: {
    label: "West Mobile",
    title: "West Mobile morning news scan",
    summary:
      "Focus on Schillinger Road, Airport Boulevard, Dawes, Tanner Williams, schools, shopping corridors, traffic, and safety alerts.",
    sources: [
      {
        name: "WKRG Mobile County",
        type: "TV news",
        url: "https://www.wkrg.com/mobile-county/",
        note: "Reliable starting point for West Mobile traffic, safety, and county-wide breaking news."
      },
      {
        name: "FOX10 Mobile",
        type: "TV news",
        url: "https://www.fox10tv.com/",
        note: "Mobile-area weather, traffic, public-safety, and neighborhood updates."
      },
      {
        name: "Lagniappe Mobile",
        type: "Independent local paper",
        url: "https://www.lagniappemobile.com/",
        note: "Useful for civic stories, development, restaurants, events, and Mobile neighborhood context."
      }
    ]
  },
  pascagoula: {
    label: "Pascagoula, Mississippi",
    title: "Pascagoula morning news scan",
    summary:
      "Follow Jackson County and Mississippi Coast headlines, port and shipyard news, local government, traffic, and severe weather.",
    sources: [
      {
        name: "WLOX",
        type: "TV news",
        url: "https://www.wlox.com/",
        note: "Biloxi, Gulfport, Pascagoula, and Mississippi Coast breaking news and weather."
      },
      {
        name: "Sun Herald Local",
        type: "Regional newspaper",
        url: "https://www.sunherald.com/news/local/",
        note: "South Mississippi local reporting, traffic, crime, government, and Coast community stories."
      },
      {
        name: "City of Pascagoula",
        type: "Official updates",
        url: "https://cityofpascagoula.com/",
        note: "City notices, meetings, public services, and official community information."
      }
    ]
  }
};

const fallbackReports = {
  baldwin: [
    {
      source: "FOX10 Baldwin County",
      title: "Open Baldwin County live coverage",
      url: "https://www.fox10tv.com/news/baldwin-county/",
      published: "Live source",
      summary: "Embedded feeds are loading. Use this verified source for Baldwin County headlines."
    },
    {
      source: "Gulf Coast Media",
      title: "Open Gulf Coast Media",
      url: "https://gulfcoastmedia.com/",
      published: "Live source",
      summary: "Local newspaper coverage for Baldwin County communities."
    }
  ],
  mobile: [
    {
      source: "WKRG News 5",
      title: "Open Mobile County live coverage",
      url: "https://www.wkrg.com/mobile-county/",
      published: "Live source",
      summary: "Mobile County headlines, traffic, weather, and public-safety updates."
    },
    {
      source: "Lagniappe Mobile",
      title: "Open Lagniappe Mobile",
      url: "https://www.lagniappemobile.com/",
      published: "Live source",
      summary: "Independent reporting, civic coverage, food, arts, and local events."
    }
  ],
  escambia: [
    {
      source: "WEAR ABC 3",
      title: "Open Northwest Florida local coverage",
      url: "https://weartv.com/news/local",
      published: "Live source",
      summary: "Escambia County and Pensacola breaking news, weather, and traffic."
    },
    {
      source: "NorthEscambia.com",
      title: "Open North Escambia community news",
      url: "https://www.northescambia.com/",
      published: "Live source",
      summary: "Community-focused reporting for north Escambia towns and roads."
    }
  ],
  westmobile: [
    {
      source: "WKRG News 5",
      title: "Open West Mobile area coverage",
      url: "https://www.wkrg.com/mobile-county/",
      published: "Live source",
      summary: "Mobile County feed filtered for stories useful to West Mobile residents."
    },
    {
      source: "FOX10 Mobile",
      title: "Open FOX10 Mobile coverage",
      url: "https://www.fox10tv.com/",
      published: "Live source",
      summary: "Weather, traffic, safety, and breaking news for the Mobile area."
    }
  ],
  pascagoula: [
    {
      source: "WLOX",
      title: "Open Mississippi Coast live coverage",
      url: "https://www.wlox.com/",
      published: "Live source",
      summary: "Pascagoula, Jackson County, Biloxi, Gulfport, and Mississippi Coast headlines."
    },
    {
      source: "Sun Herald Local",
      title: "Open South Mississippi local news",
      url: "https://www.sunherald.com/news/local/",
      published: "Live source",
      summary: "Regional reporting for South Mississippi and the Coast."
    }
  ]
};

let activeNewsArea = "baldwin";

const placesByArea = {
  baldwin: [
    {
      name: "Gulf State Park",
      category: "Outdoors",
      url: "https://www.alapark.com/parks/gulf-state-park",
      note: "Beach access, trails, fishing, camping, and family-friendly outdoor space near Gulf Shores."
    },
    {
      name: "Fairhope Municipal Pier",
      category: "Waterfront",
      url: "https://www.fairhopeal.gov/",
      note: "A reliable morning or sunset stop with bay views, walking paths, and nearby downtown shops."
    },
    {
      name: "Weeks Bay Reserve",
      category: "Nature",
      url: "https://www.outdooralabama.com/weeks-bay-reserve",
      note: "Boardwalks and estuary education for a quieter Baldwin County nature visit."
    },
    {
      name: "The Wharf at Orange Beach",
      category: "Events",
      url: "https://alwharf.com/",
      note: "Restaurants, concerts, shopping, marina views, and seasonal community events."
    }
  ],
  mobile: [
    {
      name: "USS Alabama Battleship Memorial Park",
      category: "History",
      url: "https://www.ussalabama.com/",
      note: "One of Mobile's signature stops for military history, aircraft, and waterfront views."
    },
    {
      name: "Bellingrath Gardens and Home",
      category: "Gardens",
      url: "https://bellingrath.org/",
      note: "A polished day-trip option for gardens, seasonal blooms, and a historic home tour."
    },
    {
      name: "Downtown Mobile",
      category: "Food & culture",
      url: "https://www.cityofmobile.org/",
      note: "Museums, restaurants, Mardi Gras history, live music, and walkable civic landmarks."
    },
    {
      name: "Dauphin Island",
      category: "Coast",
      url: "https://www.townofdauphinisland.org/",
      note: "Beach time, birding, Fort Gaines, and a calmer coastal outing south of Mobile."
    }
  ],
  escambia: [
    {
      name: "Historic Pensacola",
      category: "History",
      url: "https://historicpensacola.org/",
      note: "Museums, preserved buildings, walking tours, and downtown history in one compact area."
    },
    {
      name: "Johnson Beach",
      category: "Beach",
      url: "https://www.nps.gov/guis/planyourvisit/johnson-beach.htm",
      note: "Gulf Islands National Seashore beach access, dunes, water views, and quieter nature time."
    },
    {
      name: "Big Lagoon State Park",
      category: "Outdoors",
      url: "https://www.floridastateparks.org/parks-and-trails/big-lagoon-state-park",
      note: "Kayaking, trails, camping, birding, and a strong choice when beach traffic is heavy."
    },
    {
      name: "Downtown Pensacola",
      category: "Events",
      url: "https://www.visitpensacola.com/",
      note: "Dining, galleries, waterfront walks, performances, and recurring local events."
    }
  ],
  westmobile: [
    {
      name: "Medal of Honor Park",
      category: "Park",
      url: "https://www.cityofmobile.org/parks-rec/parks/medal-of-honor-park/",
      note: "Trails, sports fields, playgrounds, and easy everyday green space for West Mobile families."
    },
    {
      name: "Mobile Botanical Gardens",
      category: "Gardens",
      url: "https://mbgrebloom.org/",
      note: "Quiet trails, native plants, seasonal events, and a low-stress local visit."
    },
    {
      name: "University of South Alabama",
      category: "Campus",
      url: "https://www.southalabama.edu/",
      note: "Campus events, athletics, arts programming, and public lectures in West Mobile."
    },
    {
      name: "Municipal Park",
      category: "Outdoors",
      url: "https://www.cityofmobile.org/parks-rec/parks/",
      note: "Nearby walking, disc golf, playgrounds, and open space close to major West Mobile routes."
    }
  ],
  pascagoula: [
    {
      name: "Pascagoula River Audubon Center",
      category: "Nature",
      url: "https://pascagoula.audubon.org/",
      note: "A strong local anchor for river ecology, kayaking, birding, and family nature programming."
    },
    {
      name: "Beach Park",
      category: "Waterfront",
      url: "https://cityofpascagoula.com/",
      note: "A simple waterfront stop for walking, views, playground time, and community events."
    },
    {
      name: "La Pointe-Krebs Museum",
      category: "History",
      url: "https://lapointekrebs.org/",
      note: "Regional history in one of the Gulf Coast's oldest surviving structures."
    },
    {
      name: "Round Island Lighthouse",
      category: "Landmark",
      url: "https://cityofpascagoula.com/",
      note: "A visible Pascagoula landmark and easy pairing with downtown or waterfront plans."
    }
  ]
};

filters.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    filters.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");

    pins.forEach((pin) => {
      const matchesFilter = filter === "all" || pin.dataset.type === filter;
      pin.classList.toggle("visible", matchesFilter);
    });

    popover.innerHTML = `
      <strong>${button.textContent} alerts</strong>
      <span>Showing verified local items with timestamps and source links.</span>
    `;
  });
});

pins.forEach((pin) => {
  pin.addEventListener("click", () => {
    const title = pin.dataset.title;
    const type = pin.dataset.type.charAt(0).toUpperCase() + pin.dataset.type.slice(1);
    popover.innerHTML = `
      <strong>${title}</strong>
      <span>${type} report verified at 6:22 AM with source history attached.</span>
    `;
  });
});

refreshButton.addEventListener("click", () => {
  const normalized = locationInput.value.trim();
  const area = briefData[normalized] ? normalized : "Mobile County";
  summaryTime.textContent = briefData[area].time;
  locationInput.value = area;
  document.querySelector("#briefNote").textContent = `Coverage area: ${area}`;
  activeFeedArea = areaKeyFromLabel(area);
  loadFeed();
  loadDailySummary();
});

reportButton.addEventListener("click", async () => {
  const title = (reportTitleInput.value || "").trim();
  if (!title) {
    reportStatus.textContent = "Add a short headline before submitting.";
    return;
  }

  reportButton.disabled = true;
  reportStatus.textContent = "Submitting your report...";

  try {
    const response = await fetch("/api/feed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        body: (reportTextInput.value || "").trim(),
        category: reportTypeSelect.value,
        area: reportAreaSelect.value
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Report could not be submitted.");

    reportStatus.textContent = data.message || "Report submitted for verification.";
    reportTitleInput.value = "";
    reportTextInput.value = "";

    // Jump the live feed to the area the report was filed under so the user sees it.
    activeFeedArea = reportAreaSelect.value;
    activeFeedCategory = "all";
    feedChips.forEach((chip) => {
      const isAll = chip.dataset.category === "all";
      chip.classList.toggle("active", isAll);
      chip.setAttribute("aria-selected", isAll ? "true" : "false");
    });
    await loadFeed();
    loadDailySummary();
  } catch (error) {
    reportStatus.textContent = error.message || "Report could not be submitted. Please try again.";
  } finally {
    reportButton.disabled = false;
  }
});

function selectedNotificationAreas() {
  return Array.from(notifyAreaInputs)
    .filter((input) => input.checked)
    .map((input) => input.value);
}

function saveNotificationPreferences() {
  const areas = selectedNotificationAreas();
  localStorage.setItem("nearnowNotificationAreas", JSON.stringify(areas));
  notificationStatus.textContent = areas.length
    ? `Saved big-alert notifications for ${areas.join(", ")}.`
    : "No areas selected. Choose at least one area to receive big alerts.";
  return areas;
}

function loadNotificationPreferences() {
  try {
    const saved = JSON.parse(localStorage.getItem("nearnowNotificationAreas") || "[]");
    if (saved.length) {
      notifyAreaInputs.forEach((input) => {
        input.checked = saved.includes(input.value);
      });
      notificationStatus.textContent = `Saved big-alert notifications for ${saved.join(", ")}.`;
    }
  } catch {
    localStorage.removeItem("nearnowNotificationAreas");
  }
}

function updateSignupButtons(provider) {}

function loadSignupProvider() {}

quickReportButtons.forEach((button) => {
  button.addEventListener("click", () => {
    reportTitleInput.value = button.dataset.title || "One tap report: needs review";
    reportTypeSelect.value = button.dataset.type || "community";
    reportTextInput.value = "Fast report started. Add photos, video, or a voice note when media uploads are connected.";
    reportStatus.textContent = "One-tap report started. Add any details, then submit for verification.";
    reportTitleInput.focus();
  });
});

abuseButtons.forEach((button) => {
  button.addEventListener("click", () => {
    button.textContent = "Flag saved";
    button.disabled = true;
  });
});

async function enableNotifications() {
  const areas = saveNotificationPreferences();

  if (!("Notification" in window)) {
    notificationStatus.textContent = "This browser does not support notifications. Your area preferences were saved on this device.";
    return;
  }

  const permission = Notification.permission === "default"
    ? await Notification.requestPermission()
    : Notification.permission;

  if (permission === "granted") {
    notificationStatus.textContent = `Notifications enabled for major alerts in ${areas.join(", ") || "your selected areas"}.`;
    new Notification("NearNow big alerts enabled", {
      body: "You will be notified about major weather, AMBER, crime, traffic, and breaking alerts for your selected areas."
    });
  } else {
    notificationStatus.textContent = "Notification permission was not granted. Your area preferences were still saved.";
  }
}

enableNotificationsButton.addEventListener("click", enableNotifications);
saveNotificationsButton.addEventListener("click", saveNotificationPreferences);
testNotificationButton.addEventListener("click", async () => {
  if (!("Notification" in window)) {
    notificationStatus.textContent = "Test notification unavailable in this browser.";
    return;
  }

  if (Notification.permission !== "granted") {
    await enableNotifications();
    return;
  }

  const areas = selectedNotificationAreas();
  new Notification("NearNow test alert", {
    body: `Major-alert test for ${areas.join(", ") || "your selected areas"}.`
  });
  notificationStatus.textContent = "Test notification sent.";
});

function renderLocalNews(areaKey) {
  const area = localNewsAreas[areaKey] || localNewsAreas.baldwin;
  activeNewsArea = areaKey;
  newsFocus.innerHTML = `
    <span class="label">${area.label}</span>
    <h3>${area.title}</h3>
    <p>${area.summary}</p>
  `;

  sourceList.innerHTML = area.sources
    .map(
      (source) => `
        <article class="source-card">
          <span class="source-meta">${source.type}</span>
          <h3>${source.name}</h3>
          <p>${source.note}</p>
          <a href="${source.url}" target="_blank" rel="noopener">Open live coverage</a>
        </article>
      `
    )
    .join("");

  loadEmbeddedReports(areaKey);
}

function renderReports(items, areaKey) {
  const reports = items.length ? items : fallbackReports[areaKey] || fallbackReports.baldwin;
  reportList.innerHTML = reports
    .slice(0, 6)
    .map(
      (item) => `
        <article class="report-card">
          <div class="report-meta">
            <span>${item.source || "Verified source"}</span>
            <span>${item.published || "Latest update"}</span>
          </div>
          <h3>${item.title}</h3>
          <p>${item.summary || "Open the source report for details and updates."}</p>
          <a href="${item.url}" target="_blank" rel="noopener">Read full report</a>
        </article>
      `
    )
    .join("");
}

async function loadEmbeddedReports(areaKey = activeNewsArea) {
  reportList.innerHTML = '<article class="report-card loading">Loading embedded reports from verified sources...</article>';

  try {
    const response = await fetch(`/api/embedded-news?area=${encodeURIComponent(areaKey)}`);
    if (!response.ok) throw new Error("News feed unavailable");
    const data = await response.json();
    renderReports(Array.isArray(data.items) ? data.items : [], areaKey);
  } catch {
    renderReports([], areaKey);
  }
}

function renderPlaces(areaKey) {
  const places = placesByArea[areaKey] || placesByArea.baldwin;
  placesGrid.innerHTML = places
    .map(
      (place) => `
        <article class="place-card">
          <span class="source-meta">${place.category}</span>
          <h3>${place.name}</h3>
          <p>${place.note}</p>
          <a href="${place.url}" target="_blank" rel="noopener">Plan a visit</a>
        </article>
      `
    )
    .join("");
}

areaTabs.forEach((button) => {
  button.addEventListener("click", () => {
    areaTabs.forEach((item) => {
      item.classList.remove("active");
      item.setAttribute("aria-selected", "false");
    });
    button.classList.add("active");
    button.setAttribute("aria-selected", "true");
    renderLocalNews(button.dataset.area);
  });
});

renderLocalNews("baldwin");
loadNotificationPreferences();
loadSignupProvider();
refreshEmbeddedNewsButton.addEventListener("click", () => loadEmbeddedReports(activeNewsArea));

placeTabs.forEach((button) => {
  button.addEventListener("click", () => {
    placeTabs.forEach((item) => {
      item.classList.remove("active");
      item.setAttribute("aria-selected", "false");
    });
    button.classList.add("active");
    button.setAttribute("aria-selected", "true");
    renderPlaces(button.dataset.area);
  });
});

renderPlaces("baldwin");

/* ---------- Live local feed + AI daily summary ---------- */

let activeFeedArea = "mobile";
let activeFeedCategory = "all";

const areaLabels = {
  baldwin: "Baldwin County",
  mobile: "Mobile County",
  escambia: "Escambia County",
  westmobile: "West Mobile",
  pascagoula: "Pascagoula, MS"
};

const categoryLabels = {
  weather: "Weather",
  traffic: "Traffic",
  news: "Local news",
  community: "Community",
  events: "Events",
  emergency: "Emergency"
};

const trustBadges = {
  official: { label: "Official source", icon: "✅", className: "trust-official" },
  community: { label: "Community report", icon: "🟡", className: "trust-community" },
  unverified: { label: "Unverified", icon: "🔴", className: "trust-unverified" }
};

function areaKeyFromLabel(value) {
  const v = (value || "").toLowerCase();
  if (v.includes("baldwin") || v.includes("fairhope") || v.includes("daphne")) return "baldwin";
  if (v.includes("escambia") || v.includes("pensacola")) return "escambia";
  if (v.includes("west")) return "westmobile";
  if (v.includes("pascagoula") || v.includes("jackson")) return "pascagoula";
  if (v.includes("mobile")) return "mobile";
  return "mobile";
}

function escapeHtml(value = "") {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function relativeTime(value) {
  if (!value) return "Just now";
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return "Recently";
  const diffMin = Math.round((Date.now() - then) / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr ago`;
  const diffDay = Math.round(diffHr / 24);
  return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
}

function renderFeed(items) {
  if (!items.length) {
    feedList.innerHTML =
      '<article class="feed-card empty">No items match this filter yet. Try another category or submit a community report below.</article>';
    return;
  }

  feedList.innerHTML = items
    .map((item) => {
      const badge = trustBadges[item.trust] || trustBadges.unverified;
      const category = categoryLabels[item.category] || "Update";
      const link = item.sourceUrl
        ? `<a href="${escapeHtml(item.sourceUrl)}" target="_blank" rel="noopener">Open source</a>`
        : "";
      return `
        <article class="feed-card category-${escapeHtml(item.category)}">
          <div class="feed-card-top">
            <span class="feed-category">${category}</span>
            <span class="feed-trust ${badge.className}"><span aria-hidden="true">${badge.icon}</span> ${badge.label}</span>
          </div>
          <h3>${escapeHtml(item.title)}</h3>
          ${item.body ? `<p>${escapeHtml(item.body)}</p>` : ""}
          <div class="feed-card-meta">
            <span>${escapeHtml(item.source || "Local source")}</span>
            <span>${relativeTime(item.createdAt)}</span>
            ${link}
          </div>
        </article>
      `;
    })
    .join("");
}

async function loadFeed() {
  feedList.innerHTML = '<article class="feed-card loading">Loading the live local feed...</article>';
  const params = new URLSearchParams({ area: activeFeedArea, category: activeFeedCategory });
  const areaLabel = areaLabels[activeFeedArea] || "your area";
  const categoryLabel =
    activeFeedCategory === "all" ? "all categories" : (categoryLabels[activeFeedCategory] || activeFeedCategory).toLowerCase();
  feedContext.textContent = `Showing ${categoryLabel} for ${areaLabel}.`;

  try {
    const response = await fetch(`/api/feed?${params.toString()}`);
    if (!response.ok) throw new Error("Feed unavailable");
    const data = await response.json();
    renderFeed(Array.isArray(data.items) ? data.items : []);
  } catch {
    feedList.innerHTML =
      '<article class="feed-card empty">The live feed is temporarily unavailable. Please refresh in a moment.</article>';
  }
}

async function loadDailySummary() {
  if (!summaryText) return;
  const areaLabel = areaLabels[activeFeedArea] || "your area";
  try {
    const response = await fetch(`/api/daily-summary?area=${encodeURIComponent(activeFeedArea)}`);
    if (!response.ok) throw new Error("Summary unavailable");
    const data = await response.json();
    if (data.summary) {
      summaryText.textContent = data.summary;
    }
  } catch {
    summaryText.textContent = `We could not refresh the AI summary for ${areaLabel} just now. The live feed below is up to date.`;
  }
}

feedChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    feedChips.forEach((item) => {
      item.classList.remove("active");
      item.setAttribute("aria-selected", "false");
    });
    chip.classList.add("active");
    chip.setAttribute("aria-selected", "true");
    activeFeedCategory = chip.dataset.category;
    loadFeed();
  });
});

if (refreshFeedButton) {
  refreshFeedButton.addEventListener("click", () => {
    loadFeed();
    loadDailySummary();
  });
}

// Initialize the feed and AI summary from the default location on first load.
activeFeedArea = areaKeyFromLabel(locationInput.value);
loadFeed();
loadDailySummary();

/* ---------- Home Stats and Phone Simulator (Mobile Apps Feature) ---------- */

async function loadHeroStats() {
  try {
    const res = await fetch('/api/stats');
    if (!res.ok) return;
    const data = await res.json();
    const total = (data.postsToday || 0) + (data.neighborNotices || 0);
    if (total > 0) {
      const badge = document.getElementById('heroStatsBadge');
      const postsCount = document.getElementById('heroStatsPosts');
      if (badge && postsCount) {
        postsCount.textContent = total;
        badge.style.display = 'inline-flex';
      }
    }
  } catch (err) {
    console.error("Error loading hero stats:", err);
  }
}

function initPhoneSimulator() {
  const tFeed = document.getElementById('mockTabFeed');
  const tMap = document.getElementById('mockTabMap');
  const tSafety = document.getElementById('mockTabSafety');

  const pFeed = document.getElementById('phoneFeedTab');
  const pMap = document.getElementById('phoneMapTab');
  const pSafety = document.getElementById('phoneSafetyTab');

  if (!tFeed || !tMap || !tSafety) return;

  function setPhoneTab(tab) {
    [tFeed, tMap, tSafety].forEach(btn => {
      btn.style.color = '#888';
    });
    [pFeed, pMap, pSafety].forEach(screen => {
      if (screen) screen.style.display = 'none';
    });

    if (tab === 'feed') {
      tFeed.style.color = 'var(--accent)';
      if (pFeed) pFeed.style.display = 'block';
    } else if (tab === 'map') {
      tMap.style.color = 'var(--accent)';
      if (pMap) pMap.style.display = 'block';
    } else if (tab === 'safety') {
      tSafety.style.color = 'var(--accent)';
      if (pSafety) pSafety.style.display = 'block';
    }
  }

  tFeed.addEventListener('click', () => setPhoneTab('feed'));
  tMap.addEventListener('click', () => setPhoneTab('map'));
  tSafety.addEventListener('click', () => setPhoneTab('safety'));
}

// Initialize on page load
loadHeroStats();
initPhoneSimulator();

/* ---------- Site-Wide Mobile-First Mode Controller ---------- */

function initSiteMobileFirstMode() {
  const enterMobileBtn = document.getElementById('enterMobileBtn');
  const exitMobileBtn = document.getElementById('exitMobileBtn');
  const promoMobileModeBtn = document.getElementById('promoMobileModeBtn');
  const mobileAuthBtn = document.getElementById('mobileAuthBtn');
  const homepageAuthBtn = document.getElementById('homepageAuthBtn');
  const tabButtons = document.querySelectorAll('.site-mobile-tabs .tab-btn');
  const mainScrollContainer = document.getElementById('home');

  // Toggle View Modes
  function setSiteViewMode(mode) {
    if (mode === 'mobile') {
      document.body.classList.add('site-mobile-first');
      if (!document.body.getAttribute('data-site-tab')) {
        document.body.setAttribute('data-site-tab', 'home');
      }
      localStorage.setItem('nn-view-mode', 'mobile');
      
      // Render floating layout helper for desktop simulation
      let hint = document.querySelector('.mobile-layout-hint');
      if (!hint && window.innerWidth >= 768) {
        hint = document.createElement('div');
        hint.className = 'mobile-layout-hint';
        hint.innerHTML = '<strong>📱 Mobile Simulator Mode</strong><span>Experience the mobile app layout on desktop.</span>';
        document.body.appendChild(hint);
      }
    } else {
      document.body.classList.remove('site-mobile-first');
      localStorage.setItem('nn-view-mode', 'desktop');
      const hint = document.querySelector('.mobile-layout-hint');
      if (hint) hint.remove();
    }
  }

  if (enterMobileBtn) {
    enterMobileBtn.addEventListener('click', (e) => {
      e.preventDefault();
      setSiteViewMode('mobile');
    });
  }

  if (exitMobileBtn) {
    exitMobileBtn.addEventListener('click', (e) => {
      e.preventDefault();
      setSiteViewMode('desktop');
    });
  }

  if (promoMobileModeBtn) {
    promoMobileModeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      setSiteViewMode('mobile');
      // Scroll to top of simulated view
      if (mainScrollContainer) mainScrollContainer.scrollTop = 0;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Hook tab buttons
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      document.body.setAttribute('data-site-tab', tab);
      
      // Set active tab class
      tabButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      // Scroll view back to top
      if (mainScrollContainer) {
        mainScrollContainer.scrollTop = 0;
      }
      window.scrollTo({ top: 0 });
    });
  });

  // DOM Authentication State Mirroring
  if (mobileAuthBtn && homepageAuthBtn) {
    mobileAuthBtn.addEventListener('click', () => {
      homepageAuthBtn.click();
    });

    // Observer to track Sign In / Sign Out changes on homepageAuthBtn
    const authObserver = new MutationObserver(() => {
      const isLoggedOut = homepageAuthBtn.textContent.includes('Sign In');
      mobileAuthBtn.textContent = isLoggedOut ? 'Sign In' : 'Sign Out';
      mobileAuthBtn.style.background = isLoggedOut ? 'var(--green)' : 'var(--red)';
    });

    authObserver.observe(homepageAuthBtn, { childList: true, characterData: true, subtree: true });
    
    // Initial sync
    const isLoggedOut = homepageAuthBtn.textContent.includes('Sign In');
    mobileAuthBtn.textContent = isLoggedOut ? 'Sign In' : 'Sign Out';
    mobileAuthBtn.style.background = isLoggedOut ? 'var(--green)' : 'var(--red)';
  }

  // Load initial view mode from localStorage or URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const modeParam = urlParams.get('mode') || urlParams.get('view');
  
  if (modeParam === 'mobile' || modeParam === 'app') {
    setSiteViewMode('mobile');
  } else if (localStorage.getItem('nn-view-mode') === 'mobile') {
    setSiteViewMode('mobile');
  }
}

// Initialize Mobile-First Mode Controller
initSiteMobileFirstMode();

