# EVolver

A self-evolving agent that maintains an interactive map of Chinese EV brand presence by country.

## How it works

EVolver runs daily via GitHub Actions using a Copilot Pro subscription. Each run, the agent:

1. Reads its identity, goals, and current data
2. Self-assesses its own code for bugs and improvements
3. Verifies uncertain data points by visiting official brand websites
4. Updates the data file and/or improves the visualization
5. Runs tests to validate changes
6. Commits (if tests pass) and logs what it did in JOURNAL.md

The map is built with React + MapLibre GL JS + OpenFreeMap tiles, deployed to GitHub Pages.

## Development

```bash
pnpm install
pnpm dev      # Start dev server
pnpm test     # Run tests
pnpm build    # Production build
```

## Architecture

- `constitution/` -- Agent's immutable files: identity, goals, instructions, conception story (read-only during runs)
- `data/ev-presence.json` -- Source of truth: brand x country presence matrix
- `src/` -- React + MapLibre visualization
- `tests/` -- Data validation + utility tests (agent can evolve these)
- `JOURNAL.md` -- Append-only log of agent activity
- `.github/workflows/` -- CI/CD: daily evolution + GitHub Pages deployment
