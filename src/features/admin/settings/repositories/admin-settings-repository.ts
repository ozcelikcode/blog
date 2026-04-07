import { eq } from "drizzle-orm";

import type { DatabaseContext } from "@/lib/db/client";
import { getDatabaseContext } from "@/lib/db/client";
import { siteSettings } from "@/lib/db/schema";

export interface AdminSettingsRecord {
  defaultOgImageUrl: string | null;
  defaultSeoDescription: string;
  defaultSeoTitleTemplate: string;
  homepageHeroBody: string;
  homepageHeroTitle: string;
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
    homepageHeroBody: record.homepageHeroBody,
    homepageHeroTitle: record.homepageHeroTitle,
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
    .set(input)
    .where(eq(siteSettings.id, 1))
    .run();
}
