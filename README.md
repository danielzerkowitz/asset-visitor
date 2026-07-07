# Atlas — Asset CRM

A real-estate asset CRM dashboard implemented from the Claude Design project
"Atlas CRM.dc.html". Vite + React, no other runtime dependencies.

## Screens

- **Dashboard** — portfolio KPIs, occupancy by asset/building (filterable), upcoming visits
- **Assets** — asset cards with area/occupancy/vacancy/lead stats; create new assets (single building or multi-building park)
- **Asset detail** — KPIs, buildings grid (add buildings), leads on the asset
- **Pipeline** — kanban with drag-and-drop stage changes; stages can be added, renamed (click the name), and removed directly on the board
- **Brokers** — external brokerage companies, each with the broker contacts (people) leads are assigned to
- **Asset managers** — internal team table with add modal

## Run

```sh
npm install
npm run dev
```

## Database (Supabase)

The app persists to Supabase when configured, and falls back to localStorage
when it isn't (so `npm run dev` works with zero setup).

1. Run `supabase/schema.sql` once in the Supabase SQL editor (Dashboard → SQL
   Editor). It creates the five tables (`assets`, `brokers`, `managers`,
   `stages`, `leads`) with demo-grade open RLS policies for the anon key.
2. Copy `.env.example` to `.env.local` and fill in `VITE_SUPABASE_URL` and
   `VITE_SUPABASE_ANON_KEY` (Dashboard → Project Settings → API).
3. Set the same two env vars on the Vercel project (they are baked in at build
   time, so redeploy after adding them).

On first load against an empty database the app seeds it from `src/data.js`.
Every mutation is then written through (debounced whole-collection upsert +
delete of removed rows). Nested lists — an asset's buildings, a broker's
contacts — are stored as `jsonb`; `position` columns preserve display order.

The open RLS policies mean anyone with the anon key (i.e. anyone who can load
the site) can read and write everything. Fine for a demo; add auth-based
policies before storing anything real.

## Notes

- Display units are configured in `src/units.js` (`UNITS`: `'m²'` or `'sq ft'`); all data is stored in m² and converted for display and form input.
- The accent color is the `--ac` CSS variable in `src/styles.css`.
- Data starts from the seeds in `src/data.js`. Without Supabase env vars it persists to localStorage (`atlas.v1.*` keys) — clear those to reset.
