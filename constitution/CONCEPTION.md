# Conception

This document describes how you came to exist -- the decisions made, the corrections applied, and the reasoning behind the scaffold you inherited. Read this alongside constitution/IDENTITY.md and constitution/GOALS.md to understand not just what you are, but why you are the way you are.

## Origin

You were conceived from an architecture document (`evolver-architecture.md`) and brought to life in a single scaffolding session on 2026-03-06. A human designed your structure, wrote your initial code, seeded your first data, and set up the CI pipeline that runs you. From here, you evolve yourself.

## Corrections Made Before You Were Built

The original architecture document had several issues that were caught and fixed during planning. Understanding these helps you avoid repeating the same mistakes.

### Hook mechanism was wrong

The architecture doc tried to pass a shell script (`pre-tool-use.sh`) via `--additional-mcp-config`, but that flag only accepts MCP server JSON configs. Audit logging is now handled by capturing your full session output (`2>&1 | tee session.log`) and by your JOURNAL.md entries.

### Country keys needed to be ISO codes

The original data format keyed countries by name (`"Norway"`, `"Australia"`). But Natural Earth GeoJSON uses `ISO_A3` property codes for country identification. Your data uses ISO_A3 codes as the primary key (e.g., `"NOR"`, `"AUS"`) with a `name` field for display. This makes the GeoJSON join reliable -- always match on `ISO_A3`, never on display names.

### URL restrictions were dropped

The architecture doc listed per-domain `--allow-url` flags. This would have prevented you from discovering new brand websites. You run with `--allow-all` instead. Your safety comes from `--deny-tool 'shell(git push)'` (you cannot push), immutable files (`chmod 444`), and your test suite -- not from URL restrictions.

### MapLibre, not Leaflet

The architecture doc's checklist mentioned Leaflet, but your map uses MapLibre GL JS with OpenFreeMap tiles. No API keys needed.

## Your Technology Stack

| Layer                             | Choice                                                      | Why it matters to you                                  |
| --------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------ |
| React 19 + TypeScript             | Your UI framework -- modify components in `src/`            | Well-documented, easy for you to extend                |
| Vite 7                            | Your bundler -- `pnpm build` produces `dist/`               | Fast builds, React plugin handles JSX                  |
| MapLibre GL JS 5 + react-map-gl 8 | Your map library -- import from `react-map-gl/maplibre`     | Renders vector tiles, supports expressions for styling |
| Tailwind CSS 4                    | Your styling -- use utility classes directly in JSX         | No CSS files to manage, composable                     |
| Vitest                            | Your test runner -- `pnpm test` must pass before you commit | Fast, reads `vitest.config.ts`                         |
| pnpm                              | Your package manager -- use `pnpm` not `npm`                | Strict, fast, lockfile at `pnpm-lock.yaml`             |

### Note on react-map-gl

You use react-map-gl v8, imported from `react-map-gl/maplibre`. This is the dedicated MapLibre subpath. The v7 import (`react-map-gl` with a `mapLib` prop) is outdated and won't work with MapLibre GL JS 5.

## Your File Structure

```
constitution/                -- Read-only. Locked via chmod 444 before every run.
  IDENTITY.md                -- Who you are
  GOALS.md                   -- Your definition of "present" + scope
  AGENTS.md                  -- Your session instructions
  CONCEPTION.md              -- This file: how you were built and why

JOURNAL.md                   -- Your log (append-only -- add entries, never delete)
BACKLOG.md                   -- Multi-session goals (you read and write this)

data/
  ev-presence.json              -- Your source of truth (you edit this)
  ne_110m_countries.geojson     -- Country boundaries (820KB, committed, rarely changes)

src/
  main.tsx              -- React entry point
  App.tsx               -- Renders EVMap component
  components/
    EVMap.tsx            -- Full-viewport map + legend overlay
  hooks/
    useEVData.ts         -- Loads ev-presence.json, computes brand counts
  lib/
    mapUtils.ts          -- Builds MapLibre color match expressions
  types/
    index.ts             -- TypeScript interfaces for EVPresenceData

tests/                       -- You own these. Add, update, or expand as you evolve.
  validate-data.test.ts  -- Data schema validation tests
  map-utils.test.ts      -- Pure function tests for map utilities

.github/
  workflows/
    evolve.yml           -- Runs you daily (cron + manual dispatch)
    deploy.yml           -- Deploys to GitHub Pages on push to main
  hooks/
    mcp-config.json      -- Playwright MCP server config (gives you a browser)
  agents/
    evolver.agent.md     -- Copilot agent definition (you cannot modify this)
```

## Your Data Model

Your source of truth is `data/ev-presence.json`. The structure:

```json
{
  "metadata": {
    "last_updated": "YYYY-MM-DD",
    "definition": "See constitution/GOALS.md",
    "schema_version": 2
  },
  "brands": {
    "BrandName": {
      "website": "https://...",
      "countries": {
        "ISO": {
          "name": "Display Name",
          "present": true,
          "sources": ["https://...", "https://..."],
          "uncertain": false
        }
      }
    }
  }
}
```

Key rules your tests enforce at launch:

- ISO codes must be 3-letter uppercase (`/^[A-Z]{3}$/`)
- If `present: true` and `uncertain: false`, then `source` must not be null
- Every brand needs a `website` string and a `countries` object
- `metadata.last_updated` must be a valid ISO date

When you update the data, always update `metadata.last_updated` to the current date.

### Your tests are yours to evolve

The test suite is not immutable. You are expected to expand it as you add features (new components, new data fields, new UI interactions). If you bump `schema_version`, update the validation tests to match. If you add a sidebar component, add tests for it. The only rule: `pnpm test` must pass before you commit.

### Gotcha: Natural Earth ISO_A3 codes

Some Natural Earth features have `ISO_A3: "-99"` (disputed territories, Antarctica, etc.). Your map code skips these gracefully -- they just get transparent fill. If you encounter `-99` when trying to match a country, look for an alternative ISO code or skip it.

### Seed data you inherited

You started with 4 brands and 17 country entries:

- **BYD** (7 countries): CHN, GBR, DEU, NOR, AUS, THA, BRA
- **Xiaomi** (1 country): CHN
- **NIO** (4 countries): CHN, NOR, DEU, NLD
- **MG/SAIC** (5 countries): CHN, GBR, AUS, IND, THA

There are many more Chinese EV brands (Li Auto, XPeng, Zeekr, Chery, Leapmotor, GAC Aion, Neta, Great Wall/ORA, Dongfeng, and others). Discovering and adding them is part of your purpose.

### Sub-brand vs. parent-brand tracking

Some tracked brands are sub-brands of larger Chinese automotive groups. This is intentional — each sub-brand has its own consumer website, dealership network, and market presence, so they are tracked independently:

| Sub-brand | Parent group |
|-----------|-------------|
| ORA | Great Wall Motor (GWM) |
| DENZA | BYD |
| Deepal | Changan Automobile |
| AVATR | Changan / CATL / Huawei JV |
| IM Motors | SAIC Motor |
| Voyah | Dongfeng Motor |

Do not add a parent group as a separate brand entry unless it operates a distinct consumer EV brand (with its own website and dealership network) that is separate from its already-tracked sub-brands.

## How Your Map Works

The map is a full-viewport MapLibre GL JS instance:

- **Basemap**: OpenFreeMap positron tiles (`https://tiles.openfreemap.org/styles/positron`)
- **Data layer**: Natural Earth 110m country polygons as a GeoJSON fill layer
- **Color logic**: A MapLibre `match` expression maps ISO_A3 codes to colors based on how many brands are present in each country:
  - 0 brands = transparent
  - 1 brand = `#93c5fd` (light blue)
  - 2-3 brands = `#3b82f6` (medium blue)
  - 4+ brands = `#1d4ed8` (dark blue)
- **Legend**: Bottom-left overlay showing the color scale

This is deliberately minimal. What you build from here is up to you.

## How Your Safety Model Works

You run with broad permissions but are constrained at multiple levels:

1. **Immutable files**: `chmod 444` on everything in `constitution/` before every run. Your file write tool will fail if you try to modify them.
2. **No push**: `--deny-tool 'shell(git push)'` prevents you from pushing. The CI workflow pushes for you after your session ends.
3. **Test suite**: All tests must pass before you commit. They validate your data schema, color logic, and count computation. You can add new tests, but you cannot skip or delete existing ones without good reason.
4. **Session cap**: `--max-autopilot-continues 3` limits how many continuation steps you take per session.
5. **Git versioning**: Every change you make is a commit. Any bad change can be reverted by a human.

You commit, but you never push. The separation is intentional -- it gives a human one last point of control.

## How Your CI Pipeline Works

### Daily evolution (`evolve.yml`)

Runs at 5:00 UTC daily or on manual dispatch:

1. Checks out the repo with full git history
2. Installs pnpm, project deps, Copilot CLI, Playwright MCP, and Chromium
3. Locks your constitution files (`chmod 444 constitution/*`)
4. Configures git as `evolver[bot]`
5. Runs you with your constitution/AGENTS.md prompt
6. Pushes if you committed anything

### Deployment (`deploy.yml`)

Runs on every push to main:

1. Copies `data/` to `public/data/` (Vite serves static files from `public/`)
2. Builds with `pnpm build` (TypeScript check + Vite production build)
3. Deploys `dist/` to GitHub Pages

### Why two workflows

The evolve job only runs on schedule/dispatch, so human pushes to main don't waste premium requests. They just trigger a deploy.

## Product North Star

This is where the project is headed. Use it to judge whether a proposed task is moving in the right direction.

**Data completeness**: Every Chinese EV brand that sells consumer vehicles should be tracked. Every country where any tracked brand has an official presence should be in the dataset, with a verified source URL. The goal is a map where a user can trust that a coloured country really does have that brand's dealerships or market site — and a grey country genuinely has none.

**Map usefulness**: The map should let a user quickly answer: _"Where can I buy brand X?"_ and _"Which brands are available in country Y?"_ Today the map shows brand counts by colour. The north star is a map that also lets users filter by brand, click a country to see which brands are present, and understand data freshness at a glance. They might even be able to track brand presence over time.

**Code robustness**: Tests should cover every data invariant and every non-trivial UI behaviour. The codebase should be easy to extend — new data fields, new map interactions, new brands should require minimal boilerplate.

## Things You Should Know

1. **Be economical**. You have a limited budget of premium model requests per month. Don't bulk-scrape every brand site every run. Focus on uncertain entries and genuine improvements.

2. **Playwright is optional**. You have a headless Chromium browser via Playwright MCP, but many brand sites work with a simple fetch. Try fetch first, fall back to Playwright only for JavaScript-rendered content.

3. **OpenFreeMap has no SLA**. If tiles fail to load, your data layer still renders -- it just won't have a basemap underneath. You could add a fallback tile URL if this becomes a problem.

4. **Your `schema_version` is 2**. If you need to change the data structure (add fields, restructure), bump this version and update your tests accordingly.

5. **Update `metadata.last_updated`** whenever you modify `ev-presence.json`.

6. **Always write to JOURNAL.md** at the end of your session, even if you made no changes. Future-you reads the journal to understand what past-you tried.

## Known limitations

### Legacy single-source entries (24 entries)

The 24 seed entries added during initial scaffolding (BYD × 7, Xiaomi × 1, NIO × 4,
XPeng × 6, MG/SAIC × 5, Chery × 1) use the deprecated `"source": "..."` singular
field instead of the current `"sources": [...]` array (schema v2). They are still
valid — the test suite accepts both forms — but they should be migrated to the array
format during a future data quality pass to ensure consistency.

When you encounter these during a data quality task, upgrade them: replace
`"source": "https://..."` with `"sources": ["https://...", "<second source>"]`
and verify the URLs are still live before committing.
