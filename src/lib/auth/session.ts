import type { APIContext } from "astro";

import type { AdminRole, AdminSessionUser } from "@/features/admin/types";
import { canDeleteRecords, canManageMedia, canManageSettings } from "@/lib/auth/roles";

const ADMIN_AUTH_SESSION_KEY = "adminAuth";

function requireSession(context: Pick<APIContext, "session">): NonNullable<APIContext["session"]> {
  if (!context.session) {
    throw new Error("Sessions are not configured for this request.");
  }

  return context.session;
}

export async function getAdminSessionUser(
  context: Pick<APIContext, "session">,
): Promise<AdminSessionUser | undefined> {
  return context.session?.get<AdminSessionUser>(ADMIN_AUTH_SESSION_KEY);
}

export async function createAdminSession(
  context: Pick<APIContext, "session">,
  adminUser: AdminSessionUser,
): Promise<void> {
  const session = requireSession(context);
  await session.regenerate();
  session.set(ADMIN_AUTH_SESSION_KEY, adminUser, {
    ttl: 60 * 60 * 12,
  });
}

export function destroyAdminSession(context: Pick<APIContext, "session">): void {
  requireSession(context).destroy();
}

export async function requireAdminSessionUser(
  context: Pick<APIContext, "session">,
): Promise<AdminSessionUser> {
  const adminUser = await getAdminSessionUser(context);

  if (!adminUser) {
    throw new Error("Admin authentication is required.");
  }

  return adminUser;
}

export function assertCanManageSettings(role: AdminRole): void {
  if (!canManageSettings(role)) {
    throw new Error("You do not have permission to manage settings.");
  }
}

export function assertCanDeleteRecords(role: AdminRole): void {
  if (!canDeleteRecords(role)) {
    throw new Error("You do not have permission to delete records.");
  }
}

export function assertCanManageMedia(role: AdminRole): void {
  if (!canManageMedia(role)) {
    throw new Error("You do not have permission to manage media.");
  }
}
