import { eq } from "drizzle-orm";

import type { DatabaseContext } from "@/lib/db/client";
import { getDatabaseContext } from "@/lib/db/client";
import { newsletterSubscribers } from "@/lib/db/schema";

function getContext(context?: DatabaseContext): DatabaseContext {
  return context ?? getDatabaseContext();
}

export function findSubscriberByEmail(email: string, context?: DatabaseContext): { id: number } | null {
  const resolvedContext = getContext(context);

  return (
    resolvedContext.db
      .select({
        id: newsletterSubscribers.id,
      })
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.email, email))
      .limit(1)
      .all()[0] ??
    null
  );
}

export function createSubscriber(email: string, context?: DatabaseContext): void {
  const resolvedContext = getContext(context);

  resolvedContext.db.insert(newsletterSubscribers).values({ email }).run();
}
