import { eq } from "drizzle-orm";

import type { DatabaseContext } from "@/lib/db/client";
import { getDatabaseContext } from "@/lib/db/client";
import { newsletterSubscribers } from "@/lib/db/schema";

export interface NewsletterSubscriberLookup {
  id: number;
  status: "active" | "unsubscribed";
}

function getContext(context?: DatabaseContext): DatabaseContext {
  return context ?? getDatabaseContext();
}

export function findSubscriberByEmail(
  email: string,
  context?: DatabaseContext,
): NewsletterSubscriberLookup | null {
  const resolvedContext = getContext(context);

  return (
    resolvedContext.db
      .select({
        id: newsletterSubscribers.id,
        status: newsletterSubscribers.status,
      })
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.email, email))
      .limit(1)
      .all()[0] ??
    null
  );
}

export function createSubscriber(email: string, source: string, context?: DatabaseContext): void {
  const resolvedContext = getContext(context);

  resolvedContext.db
    .insert(newsletterSubscribers)
    .values({
      email,
      source,
      status: "active",
    })
    .run();
}

export function reactivateSubscriber(email: string, source: string, context?: DatabaseContext): void {
  const resolvedContext = getContext(context);
  const timestamp = new Date().toISOString();

  resolvedContext.db
    .update(newsletterSubscribers)
    .set({
      source,
      status: "active",
      unsubscribedAt: null,
      updatedAt: timestamp,
    })
    .where(eq(newsletterSubscribers.email, email))
    .run();
}
