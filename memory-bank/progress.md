# Progress

## Done

- Astro project scaffolded at repo root
- Strict TypeScript, Biome, Vitest, Playwright, and Drizzle configured
- SQLite schema, migration runner, seed script, backup script, and health check implemented
- Public blog routes, metadata outputs, newsletter, and health endpoint implemented
- Admin auth, protected layout, posts, tags, authors, subscribers, media, settings, and activity modules implemented
- Global theme persistence now applies consistently across public and admin pages
- Admin posts now expose explicit edit actions, preselect the logged-in admin author, and use a WYSIWYG editor while storing Markdown
- Site settings now drive public header branding, admin branding, and admin login branding
- Admin settings include live previews and now surface form-level save errors correctly
- Media uploads now surface form-level errors correctly and the post editor can reuse recent uploaded media assets for cover selection
- Admin command palette now exposes dynamic navigation across navigation links, posts, tags, authors, and media
- Public header navigation and footer links/text are now editable from admin settings with sortable previews and persisted in SQLite
- Responsive behavior is verified with Playwright on mobile viewport widths and supported by layout/editor overflow fixes
- README and local setup instructions updated
- `admin-frontend` removed after the Astro admin implementation was completed

## Known Tradeoffs

- Public and admin search still use pragmatic SQL `LIKE` matching instead of FTS
- Media usage tracking is intentionally limited to post cover image references in v1
- Role support is foundation-first: `admin` and `editor` exist in the schema, but only `admin` is exercised broadly in the current UI

## Verification Status

- `npm run db:setup` passes
- `npm run check` passes
- `npm run lint` passes
- `npm run build` passes
- `npm run test` passes
