# Active Context

## Current State

The repo now contains a complete Astro SSR blog implementation with:

- SQLite/Drizzle schema and generated migration
- seed data for authors, tags, posts, site settings, and newsletter subscribers
- public routes and metadata endpoints
- newsletter and health API endpoints
- unit/integration and Playwright coverage

## Recent Decisions

- Kept SQL inside repositories instead of page files to preserve thin route templates
- Used simple search over title, excerpt, and tags instead of FTS for lower maintenance
- Rendered Markdown with `marked` plus `sanitize-html` instead of a large plugin stack
- Centralized database PRAGMAs and initialization in `src/lib/db/client.ts`

## Immediate Next Steps

- Replace seed content with real editorial content when ready
- Add admin/auth layers on top of the existing DB and service boundaries
- Introduce richer search only if content volume justifies it
