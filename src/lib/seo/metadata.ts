import type { SiteSettingsRecord } from "@/features/blog/types";

export interface SeoMetadata {
  authorName?: string | undefined;
  canonicalUrl: string;
  description: string;
  imageUrl?: string | undefined;
  modifiedTime?: string | undefined;
  publishedTime?: string | undefined;
  siteName: string;
  title: string;
  twitterHandle?: string | null | undefined;
  type: "article" | "website";
  url: string;
}

export function toAbsoluteUrl(siteUrl: string, value: string): string {
  return new URL(value, siteUrl).toString();
}

export function buildPageSeoMetadata(input: {
  canonicalUrl?: string | null | undefined;
  description?: string | undefined;
  imageUrl?: string | null | undefined;
  pathname: string;
  settings: SiteSettingsRecord;
  title?: string | undefined;
  type?: "article" | "website" | undefined;
}): SeoMetadata {
  const title = input.title ? `${input.title} | ${input.settings.siteTitle}` : input.settings.siteTitle;
  const url = toAbsoluteUrl(input.settings.siteUrl, input.pathname);

  return {
    canonicalUrl: input.canonicalUrl ?? url,
    description: input.description ?? input.settings.siteDescription,
    imageUrl: input.imageUrl
      ? toAbsoluteUrl(input.settings.siteUrl, input.imageUrl)
      : input.settings.defaultOgImageUrl
        ? toAbsoluteUrl(input.settings.siteUrl, input.settings.defaultOgImageUrl)
        : undefined,
    siteName: input.settings.siteTitle,
    title,
    twitterHandle: input.settings.twitterHandle,
    type: input.type ?? "website",
    url,
  };
}

export function buildArticleJsonLd(input: {
  authorName: string;
  description: string;
  headline: string;
  imageUrl?: string | undefined;
  publishedTime: string;
  settings: SiteSettingsRecord;
  url: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    author: {
      "@type": "Person",
      name: input.authorName,
    },
    description: input.description,
    headline: input.headline,
    image: input.imageUrl,
    mainEntityOfPage: input.url,
    publisher: {
      "@type": "Organization",
      name: input.settings.siteTitle,
      url: input.settings.siteUrl,
    },
    url: input.url,
    datePublished: input.publishedTime,
  };
}
