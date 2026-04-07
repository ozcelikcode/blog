# Progress

## Done

- Astro project scaffolded at repo root
- Strict TypeScript, Biome, Vitest, Playwright, and Drizzle configured
- SQLite schema, migration runner, seed script, backup script, and health check implemented
- Public blog routes, metadata outputs, newsletter, and health endpoint implemented
- Admin auth, protected layout, posts, tags, authors, subscribers, media, settings, and activity modules implemented
- Global theme persistence now applies consistently across public and admin pages
- Admin posts now expose explicit edit actions, preselect the logged-in admin author, and use a WYSIWYG editor while storing Markdown
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
