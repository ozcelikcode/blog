import { eq } from "drizzle-orm";

import type { DatabaseContext } from "@/lib/db/client";
import { getDatabaseContext } from "@/lib/db/client";
import { adminUsers } from "@/lib/db/schema";

import type { AdminRole } from "@/features/admin/types";

export interface AdminUserRecord {
  authorId: number | null;
  email: string;
  id: number;
  lastLoginAt: string | null;
  name: string;
  passwordHash: string;
  role: AdminRole;
}

function getContext(context?: DatabaseContext): DatabaseContext {
  return context ?? getDatabaseContext();
}

export function findAdminUserByEmail(
  email: string,
  context?: DatabaseContext,
): AdminUserRecord | null {
  const resolvedContext = getContext(context);

  return (
    resolvedContext.db
      .select({
        authorId: adminUsers.authorId,
        email: adminUsers.email,
        id: adminUsers.id,
        lastLoginAt: adminUsers.lastLoginAt,
        name: adminUsers.name,
        passwordHash: adminUsers.passwordHash,
        role: adminUsers.role,
      })
      .from(adminUsers)
      .where(eq(adminUsers.email, email))
      .limit(1)
      .all()[0] ?? null
  );
}

export function findAdminUserById(id: number, context?: DatabaseContext): AdminUserRecord | null {
  const resolvedContext = getContext(context);

  return (
    resolvedContext.db
      .select({
        authorId: adminUsers.authorId,
        email: adminUsers.email,
        id: adminUsers.id,
        lastLoginAt: adminUsers.lastLoginAt,
        name: adminUsers.name,
        passwordHash: adminUsers.passwordHash,
        role: adminUsers.role,
      })
      .from(adminUsers)
      .where(eq(adminUsers.id, id))
      .limit(1)
      .all()[0] ?? null
  );
}

export function updateAdminLastLogin(id: number, timestamp: string, context?: DatabaseContext): void {
  const resolvedContext = getContext(context);

  resolvedContext.db
    .update(adminUsers)
    .set({
      lastLoginAt: timestamp,
      updatedAt: timestamp,
    })
    .where(eq(adminUsers.id, id))
    .run();
}
