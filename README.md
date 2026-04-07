# Developer Blog

Production-grade Astro blog and admin panel backed by SQLite, Drizzle, and `better-sqlite3`.

## Stack

- Astro 6 SSR with the Node adapter
- TypeScript strict mode
- Tailwind CSS v4
- SQLite via `better-sqlite3`
- Drizzle ORM + drizzle-kit
- Astro Actions, Sessions, and Middleware for admin mutations and auth
- Biome
- Vitest
- Playwright

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

3. Create or migrate the database and seed local content:

   ```bash
   npm run db:setup
   ```

4. Install the Playwright browser once:

   ```bash
   npx playwright install chromium
   ```

## Local Credentials

Seeded local admin account:

- Email: `admin@example.com`
- Password: `ChangeMe123!`

Change it after first local boot if you use the project beyond development.

## Development

```bash
npm run dev
```

Public routes:

- `/`
- `/blog`
- `/blog/[slug]`
- `/tags/[slug]`
- `/search`
- `/rss.xml`
- `/sitemap.xml`
- `/robots.txt`
- `/api/newsletter`
- `/api/health`

Admin routes:

- `/admin`
- `/admin/login`
- `/admin/posts`
- `/admin/posts/new`
- `/admin/posts/[id]`
- `/admin/tags`
- `/admin/authors`
- `/admin/subscribers`
- `/admin/media`
- `/admin/settings`
- `/admin/activity`

## Scripts

- `npm run dev` starts the Astro dev server
- `npm run build` builds the production server bundle
- `npm run preview` previews the built app
- `npm run check` runs Astro and TypeScript checks
- `npm run lint` runs Biome linting
- `npm run format` formats the repository with Biome
- `npm run db:generate` generates Drizzle SQL migrations
- `npm run db:migrate` applies migrations
- `npm run db:seed` seeds the configured database
- `npm run db:setup` migrates and seeds the configured database
- `npm run db:backup` writes a timestamped SQLite backup into `backups/`
- `npm run db:health` prints a database health report
- `npm run db:studio` opens Drizzle Studio
- `npm run test:unit` runs Vitest against an isolated test database
- `npm run test:e2e` reseeds the test database and runs Playwright
- `npm run test` runs the full automated test suite

## Architecture

- `src/pages/` stays thin and delegates data loading and mutations to features
- `src/features/blog/` owns public blog repositories, services, and validators
- `src/features/admin/` owns auth, posts, tags, authors, subscribers, media, settings, and activity modules
- `src/actions/` defines typed Astro Actions for admin mutations
- `src/middleware.ts` protects `/admin` routes and loads session-backed admin context
- `src/lib/db/` centralizes SQLite connection setup, PRAGMAs, migrations, seed, backup, and health checks

Content is canonical in SQLite. Post bodies are stored as Markdown and rendered server-side with `marked` plus `sanitize-html`.

## Database

Core tables:

- `authors`
- `posts`
- `tags`
- `post_tags`
- `site_settings`
- `newsletter_subscribers`
- `admin_users`
- `media_assets`
- `activity_logs`

SQLite behavior:

- foreign keys are enabled on every connection
- WAL mode is enabled on every connection
- migrations are applied from `src/lib/db/migrations`
- local seed data resets tables in dependency-safe order

## Media

Uploaded admin media is stored under `public/uploads/media/`.

The admin media view supports:

- image upload with validation
- alt text editing
- copy URL action
- usage inspection against post cover images

## Testing

Vitest coverage includes public and admin business logic.

Playwright covers:

- homepage load
- blog list
- post detail
- search
- newsletter signup
- admin auth redirect
- admin login/logout
- admin post create/edit/publish
- admin tags CRUD basics
- admin settings update

## Deployment

This app targets a Node runtime with persistent disk for SQLite.

Typical deploy flow:

1. Set `DATABASE_URL` and `SITE_URL`
2. Run `npm ci`
3. Run `npm run db:migrate`
4. Run `npm run build`
5. Start `dist/server/entry.mjs`

## Backup And Restore

Create a backup:

```bash
npm run db:backup
```

Restore by stopping the app and replacing the active SQLite file plus its `-wal` and `-shm` companions if they exist.

## Verification

Verified locally:

- `npm run db:setup`
- `npm run check`
- `npm run lint`
- `npm run build`
- `npm run test`
