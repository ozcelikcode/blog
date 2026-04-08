import { z } from "zod";

export const DEFAULT_NAVIGATION_ITEMS = [
  { href: "/", id: "home", label: "Home" },
  { href: "/blog", id: "blog", label: "Blog" },
  { href: "/search", id: "search", label: "Search" },
] as const;

export const DEFAULT_FOOTER_LINKS = [
  { href: "/rss.xml", id: "rss", label: "RSS" },
  { href: "/sitemap.xml", id: "sitemap", label: "Sitemap" },
] as const;

export const DEFAULT_FOOTER_TEXT = "Built with Astro, SQLite, and Drizzle.";

export const siteLinkHrefSchema = z
  .string()
  .trim()
  .refine(
    (value) =>
      value.length > 0 &&
      (value.startsWith("/") || value.startsWith("http://") || value.startsWith("https://")),
    {
      message: "Enter a relative path or absolute URL.",
    },
  );

export const siteLinkItemSchema = z.object({
  href: siteLinkHrefSchema,
  id: z.string().trim().min(1).max(80),
  label: z.string().trim().min(1).max(80),
});

export const siteLinkCollectionSchema = z.array(siteLinkItemSchema).max(12);

export type SiteLinkItem = z.output<typeof siteLinkItemSchema>;

function cloneSiteLinkItems(items: readonly SiteLinkItem[]): SiteLinkItem[] {
  return items.map((item) => ({ ...item }));
}

export function getDefaultNavigationItems(): SiteLinkItem[] {
  return cloneSiteLinkItems(DEFAULT_NAVIGATION_ITEMS);
}

export function getDefaultFooterLinks(): SiteLinkItem[] {
  return cloneSiteLinkItems(DEFAULT_FOOTER_LINKS);
}

export function serializeSiteLinkItems(items: readonly SiteLinkItem[]): string {
  return JSON.stringify(items);
}

export function parseSiteLinkItemsJson(
  rawValue: string | null | undefined,
  fallbackItems: readonly SiteLinkItem[],
): SiteLinkItem[] {
  if (!rawValue) {
    return cloneSiteLinkItems(fallbackItems);
  }

  try {
    const parsedValue = JSON.parse(rawValue);
    const validation = siteLinkCollectionSchema.safeParse(parsedValue);

    if (!validation.success) {
      return cloneSiteLinkItems(fallbackItems);
    }

    return cloneSiteLinkItems(validation.data);
  } catch {
    return cloneSiteLinkItems(fallbackItems);
  }
}
