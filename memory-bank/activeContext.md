# Active Context

## Current State

The repo now contains a complete Astro SSR blog plus a production-style admin panel with:

- admin login/logout and session-backed route protection
- CRUD flows for posts, tags, and authors
- a shared light/dark theme toggle that now applies across public and admin surfaces
- subscriber listing and CSV export
- media upload and metadata management with action-level error handling
- site settings editing with live previews for brand, search, and social metadata
- site settings editing with live previews for brand, search, social metadata, primary navigation, and footer content
- a Toast UI WYSIWYG editor that keeps Markdown as the canonical stored post body
- a dynamic admin command palette that surfaces posts, tags, authors, media, and settings navigation
- a post editor media picker for selecting recent uploaded assets as cover images
- activity/audit logging
- updated schema, migration, seed data, and automated coverage
- responsive admin and public layouts verified by Playwright at mobile viewport widths

## Recent Decisions

- Used Astro Actions for typed admin mutations instead of bespoke JSON endpoints
- Used Astro Sessions plus middleware for auth and route gating
- Kept admin page files thin by expanding services only where the page complexity justified it
- Chose simple SQL search and explicit audit records over heavier infrastructure
- Linked `admin_users` to `authors` so the logged-in admin can be preselected as post author
- Removed the temporary `admin-frontend` design source after adapting the UI into the Astro app
- Moved public and admin brand labels to `site_settings.siteTitle` so settings changes propagate consistently
- Added explicit UI feedback paths for failed media uploads and failed settings saves instead of silent refresh behavior
- Added JSON-backed site chrome settings so public header navigation and footer links/text are editable from the admin settings page
- Chose sortable card-based editors with live preview for navigation/footer instead of a separate CMS-like menu manager

## Immediate Next Steps

- Replace seeded editorial content and default admin credentials in non-local environments
- Add richer role expansion only when editor/admin separation has real product pressure
- Consider admin user management only when there is a real need to manage multiple staff accounts from the UI
- Consider revisions/version history only if editorial workflow proves the need
