import { getSitemapEntries } from "@/features/blog/services/post-service";
import { getSiteSettings } from "@/features/blog/repositories/site-repository";

export function GET() {
  const settings = getSiteSettings();
  const entries = getSitemapEntries();

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (entry) => `  <url>
    <loc>${new URL(entry.path, settings.siteUrl).toString()}</loc>
    <lastmod>${entry.updatedAt}</lastmod>
  </url>`,
  )
  .join("\n")}
</urlset>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
