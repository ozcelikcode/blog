# Project Brief

## Goal

Build a production-grade developer blog with Astro and SQLite. The site should feel minimal and editorial, use SQLite as the canonical content store, and keep the architecture disciplined enough for future extension into an admin panel.

## Scope

- Public pages: home, blog index, post detail, tag archive, search, 404
- SEO outputs: RSS, sitemap, robots metadata
- Operational endpoints: newsletter signup and health check
- Tooling: Biome, Vitest, Playwright, Drizzle migrations, seed, backup, DB health

## Non-Negotiables

- Astro SSR with the Node adapter
- Tailwind CSS v4
- SQLite via better-sqlite3
- Drizzle ORM + drizzle-kit
- TypeScript strict mode
- No heavy CMS in v1
- Thin routes with real logic in services and repositories
