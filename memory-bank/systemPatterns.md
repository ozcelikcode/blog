# System Patterns

## Architecture

- `src/pages/` contains thin Astro routes
- `src/features/blog/` owns blog-specific repositories, validators, and services
- `src/features/newsletter/` owns newsletter write logic
- `src/lib/db/` owns SQLite, Drizzle schema, migrations, seed, backup, and health utilities
- `src/lib/seo/`, `src/lib/http/`, and `src/lib/utils/` contain cross-cutting helpers

## Data Flow

1. Astro page parses route/query input
2. Service layer composes page-specific data
3. Repository layer performs SQL/DB access
4. Components render typed view models

## Persistence Pattern

- Drizzle defines schema and migrations
- better-sqlite3 provides the runtime driver
- WAL mode and foreign keys are enabled on every connection
- Seed data is idempotent by clearing tables before inserts

## Rendering Pattern

- Markdown is stored raw in SQLite
- Services prepare article detail models
- Markdown is rendered and sanitized on the server
- No unnecessary client-side framework code is used
