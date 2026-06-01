const briefData = {
  Downtown: {
    time: "Updated 6:30 AM",
    summary:
      "Light fog is slowing the west side commute, Main Street has a lane closure near 4th, and the farmers market opens early. No severe weather has been issued for your area."
  },
  Midtown: {
    time: "Updated 6:42 AM",
    summary:
      "A light rain band is moving east, buses are running normally, and two school events begin after 4 PM. Watch the 6th Avenue signal outage during the morning commute."
  },
  Riverside: {
    time: "Updated 6:51 AM",
    summary:
      "River fog is heavier than usual, the south bridge is backed up, and city crews are clearing branches near the park. No emergency closures are active."
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
const placeTabs = document.querySelectorAll(".place-tab");
const placesGrid = document.querySelector("#placesGrid");

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
      pin.classList.toggle("visible", matchesFilter || pin.dataset.type === "news");
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
  const area = briefData[normalized] ? normalized : "Downtown";
  summaryText.textContent = briefData[area].summary;
  summaryTime.textContent = briefData[area].time;
  locationInput.value = area;
});

reportButton.addEventListener("click", () => {
  reportStatus.textContent = "Badge status: Submitted for moderator verification";
});

function renderLocalNews(areaKey) {
  const area = localNewsAreas[areaKey] || localNewsAreas.baldwin;
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
