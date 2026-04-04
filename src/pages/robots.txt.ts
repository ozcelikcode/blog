import { getSiteSettings } from "@/features/blog/repositories/site-repository";

export function GET() {
  const settings = getSiteSettings();
  const body = `User-agent: *
Allow: /

Sitemap: ${new URL("/sitemap.xml", settings.siteUrl).toString()}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
