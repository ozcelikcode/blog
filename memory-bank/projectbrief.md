# Project Brief

## Goal

Build a production-grade developer blog with an integrated admin panel on Astro and SQLite. The product should stay editorial, minimal, and maintainable while supporting real content operations without introducing a heavy CMS.

## Scope

- Public pages: home, blog index, post detail, tag archive, search, 404
- SEO outputs: RSS, sitemap, robots metadata
- Operational endpoints: newsletter signup and health check
- Admin pages: login, dashboard, posts, tags, authors, subscribers, media, settings, activity
- Tooling: Biome, Vitest, Playwright, Drizzle migrations, seed, backup, DB health

## Non-Negotiables

- Astro SSR with the Node adapter
- Tailwind CSS v4
- SQLite via better-sqlite3
- Drizzle ORM + drizzle-kit
- TypeScript strict mode
- Thin routes with real logic in services and repositories
- Session-based admin authentication with protected admin routes
