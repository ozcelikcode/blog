import type { APIContext } from "astro";

import { clearLoginFailures, isLoginRateLimited, recordLoginFailure } from "@/lib/auth/login-rate-limit";
import { createAdminSession, destroyAdminSession } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/password";
import { setFlashMessage } from "@/lib/sessions/flash";
import type { AdminSessionUser } from "@/features/admin/types";

import { recordAdminActivity } from "@/features/admin/activity/services/activity-service";

import { findAdminUserByEmail, updateAdminLastLogin } from "../repositories/admin-user-repository";
import { validateLoginForm } from "../validators/login-form";

export interface AdminLoginActionState {
  formError?: string | undefined;
  ok: boolean;
  redirectTo?: string | undefined;
  values: {
    email: string;
  };
}

function resolveSafeRedirectTarget(requestUrl: string, nextValue: string | null): string {
  if (!nextValue?.startsWith("/admin")) {
    return "/admin";
  }

  try {
    const targetUrl = new URL(nextValue, requestUrl);
    return targetUrl.pathname + targetUrl.search;
  } catch {
    return "/admin";
  }
}

export async function loginAdmin(
  formData: FormData,
  context: Pick<APIContext, "clientAddress" | "request" | "session">,
): Promise<AdminLoginActionState> {
  const validation = validateLoginForm(formData);

  if (!validation.isValid) {
    return {
      formError: validation.formError,
      ok: false,
      values: validation.values,
    };
  }

  const rateLimitKey = `${context.clientAddress}:${validation.values.email}`;

  if (isLoginRateLimited(rateLimitKey)) {
    return {
      formError: "Too many failed attempts. Try again in a few minutes.",
      ok: false,
      values: validation.values,
    };
  }

  const adminUser = findAdminUserByEmail(validation.values.email);

  if (!adminUser || !(await verifyPassword(String(formData.get("password") ?? ""), adminUser.passwordHash))) {
    recordLoginFailure(rateLimitKey);

    return {
      formError: "The email or password is incorrect.",
      ok: false,
      values: validation.values,
    };
  }

  clearLoginFailures(rateLimitKey);

  const sessionUser: AdminSessionUser = {
    authorId: adminUser.authorId,
    email: adminUser.email,
    id: adminUser.id,
    name: adminUser.name,
    role: adminUser.role,
  };

  await createAdminSession(context, sessionUser);
  const timestamp = new Date().toISOString();
  updateAdminLastLogin(adminUser.id, timestamp);

  recordAdminActivity({
    action: "auth.login",
    actor: sessionUser,
    entityId: String(adminUser.id),
    entityLabel: adminUser.email,
    entityType: "admin_user",
    ipAddress: context.clientAddress,
  });

  setFlashMessage(context, {
    title: "Signed in",
    tone: "success",
  });

  return {
    ok: true,
    redirectTo: resolveSafeRedirectTarget(
      context.request.url,
      typeof formData.get("next") === "string" ? String(formData.get("next")) : null,
    ),
    values: {
      email: adminUser.email,
    },
  };
}

export function logoutAdmin(context: Pick<APIContext, "clientAddress" | "locals" | "session">): void {
  if (context.locals.adminUser) {
    recordAdminActivity({
      action: "auth.logout",
      actor: context.locals.adminUser,
      entityId: String(context.locals.adminUser.id),
      entityLabel: context.locals.adminUser.email,
      entityType: "admin_user",
      ipAddress: context.clientAddress,
    });
  }

  destroyAdminSession(context);
}
