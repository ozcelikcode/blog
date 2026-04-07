# Active Context

## Current State

The repo now contains a complete Astro SSR blog plus a production-style admin panel with:

- admin login/logout and session-backed route protection
- CRUD flows for posts, tags, and authors
- a shared light/dark theme toggle that now applies across public and admin surfaces
- subscriber listing and CSV export
- media upload and metadata management
- site settings editing
- a Toast UI WYSIWYG editor that keeps Markdown as the canonical stored post body
- activity/audit logging
- updated schema, migration, seed data, and automated coverage

## Recent Decisions

- Used Astro Actions for typed admin mutations instead of bespoke JSON endpoints
- Used Astro Sessions plus middleware for auth and route gating
- Kept admin page files thin by expanding services only where the page complexity justified it
- Chose simple SQL search and explicit audit records over heavier infrastructure
- Linked `admin_users` to `authors` so the logged-in admin can be preselected as post author
- Removed the temporary `admin-frontend` design source after adapting the UI into the Astro app

## Immediate Next Steps

- Replace seeded editorial content and default admin credentials in non-local environments
- Add richer role expansion only when editor/admin separation has real product pressure
- Consider admin user management only when there is a real need to manage multiple staff accounts from the UI
- Consider revisions/version history only if editorial workflow proves the need
