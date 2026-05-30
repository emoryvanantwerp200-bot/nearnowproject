const places = [
  {
    id: "river-market",
    name: "River Market Hall",
    mood: "food",
    distance: 0.6,
    minutes: 8,
    status: "Open now",
    statusClass: "status",
    detail: "Counter-service ramen, tacos, and late espresso under one roof.",
    color: "#0f766e"
  },
  {
    id: "signal-room",
    name: "Signal Room",
    mood: "music",
    distance: 1.1,
    minutes: 14,
    status: "Starts soon",
    statusClass: "status soon",
    detail: "Tiny listening room with a 7:30 acoustic set and no-cover tables.",
    color: "#2563eb"
  },
  {
    id: "third-desk",
    name: "Third Desk",
    mood: "work",
    distance: 1.8,
    minutes: 20,
    status: "Open now",
    statusClass: "status",
    detail: "Quiet coworking cafe with outlets, booths, and strong tea.",
    color: "#7c3aed"
  },
  {
    id: "canopy-yard",
    name: "Canopy Yard",
    mood: "outside",
    distance: 2.5,
    minutes: 28,
    status: "Open now",
    statusClass: "status",
    detail: "Tree-lined courtyard with food trucks and a rotating maker stall.",
    color: "#65a30d"
  },
  {
    id: "afterglow",
    name: "Afterglow Bakery",
    mood: "food",
    distance: 4.2,
    minutes: 42,
    status: "Closes at 6",
    statusClass: "status soon",
    detail: "Small-batch pastries, savory hand pies, and window seats.",
    color: "#d97706"
  },
  {
    id: "northline-stage",
    name: "Northline Stage",
    mood: "music",
    distance: 6.5,
    minutes: 55,
    status: "Tonight",
    statusClass: "status soon",
    detail: "Outdoor stage with rotating local bands and open-air seating.",
    color: "#be123c"
  }
];

const state = {
  query: "",
  mood: "all",
  radius: 1,
  feedQuery: "",
  feedCategory: "All",
  zip: localStorage.getItem("nearnow:zip") || "",
  saved: new Set(JSON.parse(localStorage.getItem("nearnow:saved") || "[]"))
};

const placeList = document.querySelector("#place-list");
const timeline = document.querySelector("#timeline");
const openCount = document.querySelector("#open-count");
const timeWindow = document.querySelector("#time-window");
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

const zipRegions = [
  { min: 10000, max: 14999, state: "NY", metro: "New York" },
  { min: 1500, max: 2799, state: "MA", metro: "Boston" },
  { min: 3000, max: 3899, state: "MA", metro: "Boston" },
  { min: 60000, max: 62999, state: "IL", metro: "Chicago" },
  { min: 90000, max: 93599, state: "CA", metro: "Los Angeles" }
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
}

function persistSaved() {
  localStorage.setItem("nearnow:saved", JSON.stringify([...state.saved]));
}

function getFilteredPlaces() {
  const query = state.query.trim().toLowerCase();

  return places.filter((place) => {
    const matchesRadius = place.distance <= state.radius;
    const matchesMood = state.mood === "all" || place.mood === state.mood;
    const matchesQuery = !query || [place.name, place.mood, place.detail].join(" ").toLowerCase().includes(query);
    return matchesRadius && matchesMood && matchesQuery;
  });
}

function renderPlaces() {
  const filtered = getFilteredPlaces();
  openCount.textContent = `${filtered.length} ${filtered.length === 1 ? "place" : "places"} open`;
  timeWindow.textContent = `Updated ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;

  if (!filtered.length) {
    placeList.innerHTML = '<div class="empty">No matches in this radius. Try widening the search or switching moods.</div>';
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
            <span>${place.minutes} min walk</span>
            <span>${place.mood}</span>
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
  return {
    places: places.map(({ id, name, mood, distance, minutes, status, detail }) => ({
      id,
      name,
      mood,
      distance,
      minutes,
      status,
      detail
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

  state.zip = zip;
  state.feedCategory = "All";
  localStorage.setItem("nearnow:zip", zip);
  renderFeedCategories();
  renderFeeds();
  document.querySelector("#feeds")?.scrollIntoView({ behavior: "smooth", block: "start" });
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
renderFeedCategories();
renderFeeds();
