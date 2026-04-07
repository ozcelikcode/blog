import { eq } from "drizzle-orm";

import type { DatabaseContext } from "@/lib/db/client";
import { getDatabaseContext } from "@/lib/db/client";
import { newsletterSubscribers } from "@/lib/db/schema";

export interface AdminSubscriberRecord {
  createdAt: string;
  email: string;
  id: number;
  source: string;
  status: "active" | "unsubscribed";
  unsubscribedAt: string | null;
  updatedAt: string;
}

function getContext(context?: DatabaseContext): DatabaseContext {
  return context ?? getDatabaseContext();
}

export function listAdminSubscribers(
  options: {
    limit?: number | undefined;
    offset?: number | undefined;
    searchQuery?: string | undefined;
  } = {},
  context?: DatabaseContext,
): AdminSubscriberRecord[] {
  const resolvedContext = getContext(context);
  const searchLike = options.searchQuery ? `%${options.searchQuery.toLowerCase()}%` : null;
  const limitClause = typeof options.limit === "number" ? "limit @limit offset @offset" : "";

  return resolvedContext.sqlite
    .prepare<
      { limit: number; offset: number; searchLike: string | null },
      AdminSubscriberRecord
    >(
      `
        select
          id,
          email,
          status,
          source,
          unsubscribed_at as unsubscribedAt,
          updated_at as updatedAt,
          created_at as createdAt
        from newsletter_subscribers
        where @searchLike is null or lower(email) like @searchLike or lower(source) like @searchLike
        order by created_at desc, id desc
        ${limitClause}
      `,
    )
    .all({
      limit: options.limit ?? Number.MAX_SAFE_INTEGER,
      offset: options.offset ?? 0,
      searchLike,
    });
}

export function countAdminSubscribers(
  searchQuery?: string | undefined,
  context?: DatabaseContext,
): number {
  const resolvedContext = getContext(context);
  const searchLike = searchQuery ? `%${searchQuery.toLowerCase()}%` : null;

  return (
    resolvedContext.sqlite
      .prepare<{ searchLike: string | null }, { count: number }>(
        `
          select count(*) as count
          from newsletter_subscribers
          where @searchLike is null or lower(email) like @searchLike or lower(source) like @searchLike
        `,
      )
      .get({ searchLike })?.count ?? 0
  );
}

export function getAdminSubscriberStats(context?: DatabaseContext): {
  active: number;
  total: number;
  unsubscribed: number;
} {
  const resolvedContext = getContext(context);

  const rows = resolvedContext.sqlite
    .prepare<[], { count: number; status: "active" | "unsubscribed" }>(
      `
        select status, count(*) as count
        from newsletter_subscribers
        group by status
      `,
    )
    .all();

  return {
    active: rows.find((row) => row.status === "active")?.count ?? 0,
    total: rows.reduce((total, row) => total + row.count, 0),
    unsubscribed: rows.find((row) => row.status === "unsubscribed")?.count ?? 0,
  };
}

export function getAdminSubscriberById(id: number, context?: DatabaseContext): AdminSubscriberRecord | null {
  const resolvedContext = getContext(context);
  return (
    resolvedContext.db
      .select({
        createdAt: newsletterSubscribers.createdAt,
        email: newsletterSubscribers.email,
        id: newsletterSubscribers.id,
        source: newsletterSubscribers.source,
        status: newsletterSubscribers.status,
        unsubscribedAt: newsletterSubscribers.unsubscribedAt,
        updatedAt: newsletterSubscribers.updatedAt,
      })
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.id, id))
      .limit(1)
      .all()[0] ?? null
  );
}

export function updateAdminSubscriberStatus(
  id: number,
  input: {
    status: "active" | "unsubscribed";
    unsubscribedAt: string | null;
    updatedAt: string;
  },
  context?: DatabaseContext,
): void {
  const resolvedContext = getContext(context);
  resolvedContext.db
    .update(newsletterSubscribers)
    .set(input)
    .where(eq(newsletterSubscribers.id, id))
    .run();
}
