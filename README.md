# NearNow

[![Netlify Status](https://api.netlify.com/api/v1/badges/58d5e047-9dd6-4852-910f-59642faa43df/deploy-status)](https://app.netlify.com/projects/nearnowproject/deploys)

NearNow is a small, Netlify-ready local discovery app for finding places, events, and useful US news feeds that are useful right now.

## RSS feeds

The RSS source directory was seeded from `US_RSS_Feed_List.xlsx`.

- `feeds.js` contains the browser-ready source registry.
- `/api/rss` is a Netlify Function that previews items from allowlisted feed URLs.
- Some workbook sources do not publish a reliable free public RSS feed, so they are included as source links without live preview.

## Run locally

Open `index.html` in a browser.

## Deploy

This folder is linked locally to the Netlify site ID in `.netlify/state.json`.

When the Netlify CLI is available and authenticated:

```powershell
netlify deploy
netlify deploy --prod
```
