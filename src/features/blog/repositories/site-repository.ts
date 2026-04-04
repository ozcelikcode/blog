import type { DatabaseContext } from "@/lib/db/client";
import { getDatabaseContext } from "@/lib/db/client";
import { siteSettings } from "@/lib/db/schema";

import type { SiteSettingsRecord } from "../types";

function getContext(context?: DatabaseContext): DatabaseContext {
  return context ?? getDatabaseContext();
}

export function getSiteSettings(context?: DatabaseContext): SiteSettingsRecord {
  const resolvedContext = getContext(context);
  const record = resolvedContext.db.select().from(siteSettings).limit(1).all()[0];

  if (!record) {
    throw new Error("Site settings are missing. Run the seed script to create the initial row.");
  }

  return {
    defaultOgImageUrl: record.defaultOgImageUrl,
    newsletterDescription: record.newsletterDescription,
    newsletterHeading: record.newsletterHeading,
    siteDescription: record.siteDescription,
    siteTitle: record.siteTitle,
    siteUrl: record.siteUrl,
    twitterHandle: record.twitterHandle,
  };
}
