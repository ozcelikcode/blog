# Developer Blog

Production-grade Astro blog with SQLite, Drizzle, Tailwind v4, Biome, Vitest, and Playwright.

## Stack

- Astro 6 with the Node adapter in `standalone` mode
- TypeScript strict mode
- Tailwind CSS v4
- SQLite via `better-sqlite3`
- Drizzle ORM + drizzle-kit migrations
- Biome for linting/formatting
- Vitest for unit/integration tests
- Playwright for end-to-end tests

## Requirements

- Node 24 LTS
- npm 11+

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy environment defaults if needed:

   ```bash
   cp .env.example .env
   ```

3. Create the database, run migrations, and seed content:

   ```bash
   npm run db:setup
   ```

4. Install the Playwright browser once:

   ```bash
   npx playwright install chromium
   ```

## Development

```bash
npm run dev
```

App routes:

- `/`
- `/blog`
- `/blog/[slug]`
- `/tags/[slug]`
- `/search`
- `/404`
- `/rss.xml`
- `/sitemap.xml`
- `/robots.txt`
- `/api/newsletter`
- `/api/health`

## Scripts

- `npm run dev` starts the Astro dev server
- `npm run build` builds the server output into `dist/`
- `npm run preview` previews the production build
- `npm run check` runs Astro and TypeScript checks
- `npm run lint` runs Biome
- `npm run format` formats the repository with Biome
- `npm run db:generate` generates Drizzle SQL migrations from the schema
- `npm run db:migrate` applies migrations
- `npm run db:seed` seeds the configured database
- `npm run db:setup` migrates and seeds the configured database
- `npm run db:backup` writes a backup into `backups/`
- `npm run db:health` prints a JSON health report for the configured database
- `npm run db:studio` opens Drizzle Studio
- `npm run test:unit` runs Vitest with coverage on an isolated test database
- `npm run test:e2e` reseeds the test database and runs Playwright
- `npm run test` runs both unit/integration and E2E suites

## Database

Canonical content lives in SQLite. The schema covers:

- `authors`
- `posts`
- `tags`
- `post_tags`
- `site_settings`
- `newsletter_subscribers`

Database concerns are centralized under [`src/lib/db`](/Users/ozcelik/Documents/GitHub/blog/src/lib/db):

- `client.ts` owns connection setup and PRAGMAs
- `schema.ts` defines the Drizzle schema
- `migrate.ts` applies Drizzle migrations
- `seed.ts` inserts the initial site content
- `backup.ts` performs SQLite backups
- `health.ts` reports DB health for scripts and `/api/health`

## Testing

Unit and integration coverage lives beside the feature and utility code.

Playwright covers the primary user flows:

- homepage loads
- blog index renders
- post detail renders
- search works
- newsletter submission works

## Deployment

This project builds with `@astrojs/node` in server mode.

Typical deploy sequence:

1. Set `DATABASE_URL` and `SITE_URL`
2. Run `npm ci`
3. Run `npm run db:migrate`
4. Run `npm run build`
5. Start the generated Node server from `dist/server/entry.mjs`

## Backup

Create a timestamped SQLite backup:

```bash
npm run db:backup
```

## Notes

- The app auto-applies migrations when opening the configured database.
- Seed data includes published, draft, and scheduled posts so visibility logic is testable.
- Markdown is rendered on the server and sanitized before output.
