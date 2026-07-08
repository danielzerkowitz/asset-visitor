---
name: verify
description: How to build, launch, and drive this app to verify changes at the UI surface.
---

# Verifying asset-visitor

Vite + React SPA (no backend needed for UI work; Supabase client is in `src/db.js`).

## Build / launch

```bash
npm run build            # quick compile check
npm run dev -- --port 5199 &   # vite may bump the port if taken — read the log for the actual URL
```

App serves at the printed `Local:` URL (e.g. http://localhost:5200/). Loads with seeded demo data, no login flow blocking.

## Drive

Use the claude-in-chrome tools: navigate to the local URL, screenshot, click.

- Dashboard is the landing page; header holds FILTER (asset/building selects) and VISITS (range picker button, top right).
- Native `<input type="date">` fields are best set with `form_input` using refs from `find` (avoids fighting the native calendar popup).
- KPI cards, the "Leads by asset" VISITS column, and the "Recent visits" card should all move together when the visits range changes.

## Gotchas

- Clicking preset options in popovers by coordinate is fine; popovers close on outside click and Escape — probe both.
- Kill the dev server when done: `pkill -f "vite.*519"` or similar.
