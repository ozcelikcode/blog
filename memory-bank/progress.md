# Progress

## Done

- Astro project scaffolded at repo root
- Strict TypeScript, Biome, Vitest, Playwright, and Drizzle configured
- SQLite schema, migration generation, migration runner, seed script, backup script, and health check implemented
- Homepage, blog listing, post detail, tags, search, RSS, sitemap, robots, 404, newsletter, and health endpoint implemented
- Unit/integration tests and Playwright flows passing
- README updated with setup and operational instructions

## Known Tradeoffs

- Search uses SQL `LIKE` across title, excerpt, and tags instead of FTS
- Cover images are static SVG assets referenced from the seeded database
- There is no admin panel yet; the architecture is prepared for one

## Verification Status

- `npm run check` passes
- `npm run lint` passes
- `npm run build` passes
- `npm run test:unit` passes
- `npm run test:e2e` passes
