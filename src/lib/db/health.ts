import { sql } from "drizzle-orm";

import { getServerEnv } from "@/lib/env/server";

import { createDatabaseContext, type DatabaseContext } from "./client";
import { newsletterSubscribers, posts, tags } from "./schema";

export interface DatabaseHealthReport {
  databasePath: string;
  foreignKeysEnabled: boolean;
  journalMode: string;
  postsCount: number;
  siteUrl: string;
  status: "ok";
  subscribersCount: number;
  tagsCount: number;
  timestamp: string;
}

export function getDatabaseHealthReport(context?: DatabaseContext): DatabaseHealthReport {
  const ownedContext = context ?? createDatabaseContext();

  const journalMode = ownedContext.sqlite.pragma("journal_mode", { simple: true }) as string;
  const foreignKeysEnabled = Boolean(
    ownedContext.sqlite.pragma("foreign_keys", { simple: true }) as number,
  );

  const postsCount =
    ownedContext.db
    .select({ count: sql<number>`count(*)` })
    .from(posts)
    .all()[0]?.count ?? 0;
  const tagsCount =
    ownedContext.db.select({ count: sql<number>`count(*)` }).from(tags).all()[0]?.count ?? 0;
  const subscribersCount =
    ownedContext.db
    .select({ count: sql<number>`count(*)` })
    .from(newsletterSubscribers)
    .all()[0]?.count ?? 0;

  if (!context) {
    ownedContext.sqlite.close();
  }

  return {
    databasePath: ownedContext.filePath,
    foreignKeysEnabled,
    journalMode,
    postsCount,
    siteUrl: getServerEnv().SITE_URL,
    status: "ok",
    subscribersCount,
    tagsCount,
    timestamp: new Date().toISOString(),
  };
}
