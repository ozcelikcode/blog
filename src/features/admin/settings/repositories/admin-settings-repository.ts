import { eq } from "drizzle-orm";

import {
  getDefaultFooterLinks,
  getDefaultNavigationItems,
  parseSiteLinkItemsJson,
  serializeSiteLinkItems,
  type SiteLinkItem,
} from "@/lib/site-chrome";
import type { DatabaseContext } from "@/lib/db/client";
import { getDatabaseContext } from "@/lib/db/client";
import { siteSettings } from "@/lib/db/schema";

export interface AdminSettingsRecord {
  defaultOgImageUrl: string | null;
  defaultSeoDescription: string;
  defaultSeoTitleTemplate: string;
  footerLinks: SiteLinkItem[];
  footerText: string;
  homepageHeroBody: string;
  homepageHeroTitle: string;
  navigationItems: SiteLinkItem[];
  newsletterDescription: string;
  newsletterHeading: string;
  siteDescription: string;
  siteTitle: string;
  siteUrl: string;
  twitterHandle: string | null;
}

function getContext(context?: DatabaseContext): DatabaseContext {
  return context ?? getDatabaseContext();
}

export function getAdminSettings(context?: DatabaseContext): AdminSettingsRecord {
  const resolvedContext = getContext(context);
  const record = resolvedContext.db.select().from(siteSettings).where(eq(siteSettings.id, 1)).limit(1).all()[0];

  if (!record) {
    throw new Error("Site settings are missing.");
  }

  return {
    defaultOgImageUrl: record.defaultOgImageUrl,
    defaultSeoDescription: record.defaultSeoDescription,
    defaultSeoTitleTemplate: record.defaultSeoTitleTemplate,
    footerLinks: parseSiteLinkItemsJson(record.footerLinksJson, getDefaultFooterLinks()),
    footerText: record.footerText,
    homepageHeroBody: record.homepageHeroBody,
    homepageHeroTitle: record.homepageHeroTitle,
    navigationItems: parseSiteLinkItemsJson(record.navigationItemsJson, getDefaultNavigationItems()),
    newsletterDescription: record.newsletterDescription,
    newsletterHeading: record.newsletterHeading,
    siteDescription: record.siteDescription,
    siteTitle: record.siteTitle,
    siteUrl: record.siteUrl,
    twitterHandle: record.twitterHandle,
  };
}

export function updateAdminSettings(
  input: AdminSettingsRecord & { updatedAt: string },
  context?: DatabaseContext,
): void {
  const resolvedContext = getContext(context);
  resolvedContext.db
    .update(siteSettings)
    .set({
      defaultOgImageUrl: input.defaultOgImageUrl,
      defaultSeoDescription: input.defaultSeoDescription,
      defaultSeoTitleTemplate: input.defaultSeoTitleTemplate,
      footerLinksJson: serializeSiteLinkItems(input.footerLinks),
      footerText: input.footerText,
      homepageHeroBody: input.homepageHeroBody,
      homepageHeroTitle: input.homepageHeroTitle,
      navigationItemsJson: serializeSiteLinkItems(input.navigationItems),
      newsletterDescription: input.newsletterDescription,
      newsletterHeading: input.newsletterHeading,
      siteDescription: input.siteDescription,
      siteTitle: input.siteTitle,
      siteUrl: input.siteUrl,
      twitterHandle: input.twitterHandle,
      updatedAt: input.updatedAt,
    })
    .where(eq(siteSettings.id, 1))
    .run();
}
