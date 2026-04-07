# System Patterns

## Architecture

- `src/pages/` contains thin Astro routes for public and admin surfaces
- `src/features/blog/` owns public blog repositories, validators, and services
- `src/features/admin/` owns auth, posts, tags, authors, subscribers, media, settings, and activity modules
- `src/actions/` defines typed Astro Actions for admin mutations
- `src/lib/auth/` and `src/lib/sessions/` own session helpers, role checks, and login rate limiting
- `src/lib/db/` owns SQLite, Drizzle schema, migrations, seed, backup, and health utilities

## Data Flow

1. Astro page or endpoint parses route/query/form input
2. Service layer composes page data or mutation behavior
3. Repository layer performs SQL and persistence work
4. Components render typed view models or forms
5. Admin mutations record activity and set session-backed flash state when appropriate

## Persistence Pattern

- Drizzle defines schema and migration snapshots
- better-sqlite3 provides the runtime driver
- WAL mode and foreign keys are enabled on every connection
- `site_settings`, `admin_users`, `media_assets`, and `activity_logs` extend the original blog schema
- Seed data is idempotent by clearing tables in dependency-safe order

## Rendering Pattern

- Markdown is stored raw in SQLite
- Public post pages render sanitized HTML on the server
- Admin post editing stays Markdown-first with a server-rendered preview endpoint
- Client-side JavaScript is limited to narrow admin affordances such as preview refresh and command palette toggling
