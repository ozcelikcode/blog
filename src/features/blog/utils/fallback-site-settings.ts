import type { SiteSettingsRecord } from "../types";

export function getFallbackSiteSettings(): SiteSettingsRecord {
  return {
    defaultOgImageUrl: null,
    defaultSeoDescription: "Developer blog",
    defaultSeoTitleTemplate: "%s | Developer Blog",
    homepageHeroBody: "Server-rendered publishing with Astro and SQLite.",
    homepageHeroTitle: "Developer Blog",
    newsletterDescription: "Subscribe for new posts.",
    newsletterHeading: "Stay up to date",
    siteDescription: "Developer blog",
    siteTitle: "Developer Blog",
    siteUrl: "http://localhost:4321",
    twitterHandle: null,
  };
}
