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
