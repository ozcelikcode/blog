# Tech Context

## Runtime

- Node 24 LTS
- Astro 6
- Node adapter in `standalone` mode

## Frontend

- Astro components and layouts
- Tailwind CSS v4
- Fontsource for Newsreader, Inter Variable, and JetBrains Mono

## Backend / Data

- SQLite database file under `data/`
- better-sqlite3 driver
- Drizzle ORM schema in [`schema.ts`](/Users/ozcelik/Documents/GitHub/blog/src/lib/db/schema.ts)
- Generated migrations in [`src/lib/db/migrations`](/Users/ozcelik/Documents/GitHub/blog/src/lib/db/migrations)

## Tooling

- Biome
- Vitest with coverage
- Playwright with Chromium
- `tsx` for maintenance scripts

## Environment

- `DATABASE_URL`
- `SITE_URL`
