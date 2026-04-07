# Tech Context

## Runtime

- Node 24 LTS
- Astro 6
- Node adapter in `standalone` mode

## Frontend

- Astro components and layouts
- Tailwind CSS v4
- Fontsource for Newsreader, Inter Variable, and JetBrains Mono
- Toast UI Editor for the admin post authoring surface

## Backend / Data

- SQLite database files under `data/`
- better-sqlite3 driver
- Drizzle ORM schema in [`src/lib/db/schema.ts`](/Users/ozcelik/Documents/GitHub/blog/src/lib/db/schema.ts)
- Generated migrations in [`src/lib/db/migrations`](/Users/ozcelik/Documents/GitHub/blog/src/lib/db/migrations)
- Astro Actions for typed admin mutations
- Astro Sessions for authenticated admin state
- Astro Middleware for admin route protection

## Tooling

- Biome
- Vitest with coverage
- Playwright with Chromium, including responsive viewport verification for public and admin pages
- `tsx` for maintenance scripts

## Environment

- `DATABASE_URL`
- `SITE_URL`

## Local Defaults

- Local admin email: `admin@example.com`
- Local admin password: `ChangeMe123!`
