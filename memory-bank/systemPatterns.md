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
5. Astro Actions wrap admin mutations and normalize success or form-level failure payloads
6. Admin mutations record activity and set session-backed flash state when appropriate

## Persistence Pattern

- Drizzle defines schema and migration snapshots
- better-sqlite3 provides the runtime driver
- WAL mode and foreign keys are enabled on every connection
- `site_settings`, `admin_users`, `media_assets`, and `activity_logs` extend the original blog schema
- `site_settings.navigation_items_json` and `site_settings.footer_links_json` store ordered site chrome links as JSON arrays, while `site_settings.footer_text` stores the editorial footer copy
- `admin_users.author_id` links admin identities to editorial authors for post defaults
- `posts.show_author_in_meta` stores whether public post headers should include the author byline
- Seed data is idempotent by clearing tables in dependency-safe order

## Rendering Pattern

- Markdown is stored raw in SQLite
- Public post pages render sanitized HTML on the server
- Admin post editing now uses a Toast UI WYSIWYG editor while syncing Markdown into the submitted form payload
- Theme state is initialized in the document head and shared across public and admin layouts via the same local preference key
- Public and admin shell branding read from `site_settings` instead of hardcoded labels
- Client-side JavaScript is limited to narrow admin affordances such as the editor bridge, unsaved-change warning, theme toggling, command palette toggling, and preview syncing for settings/post SEO cards
- Command palette panels use viewport-constrained scrolling to prevent clipping on shorter screens

## Admin UX Pattern

- The command palette is data-driven from admin services rather than hardcoded route lists
- Media management stays intentionally lightweight: uploaded files live under `public/uploads/media`, metadata lives in SQLite, and current usage checks only block assets referenced by post covers
- Responsive admin tables and editor surfaces prefer horizontal containment (`overflow-x-auto`, `min-w-0`) over separate mobile-only component forks
- Settings uses client-side sortable link editors for navigation and footer management, but the canonical stored format remains validated JSON submitted through a regular form post
