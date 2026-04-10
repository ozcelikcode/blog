import { defineMiddleware } from "astro:middleware";

import { getFlashMessage } from "@/lib/sessions/flash";
import { getAdminSessionUser } from "@/lib/auth/session";

const PUBLIC_ADMIN_PATHS = new Set(["/admin/login"]);
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function isOriginAllowed(request: Request, siteUrl: string): boolean {
  const origin = request.headers.get("origin");

  if (!origin) {
    return true;
  }

  try {
    return new URL(origin).origin === new URL(siteUrl).origin;
  } catch {
    return false;
  }
}

export const onRequest = defineMiddleware(async (context, next) => {
  if (!SAFE_METHODS.has(context.request.method) && !isOriginAllowed(context.request, context.site?.href ?? context.url.origin)) {
    return new Response("Forbidden", { status: 403 });
  }

  const adminUser = await getAdminSessionUser(context);
  const flashMessage = await getFlashMessage(context);

  if (adminUser) {
    context.locals.adminUser = adminUser;
  }

  if (flashMessage) {
    context.locals.flashMessage = flashMessage;
  }

  const pathname = context.url.pathname;

  if (pathname.startsWith("/admin") && !PUBLIC_ADMIN_PATHS.has(pathname) && !adminUser) {
    return context.redirect(`/admin/login?next=${encodeURIComponent(pathname)}`);
  }

  if (pathname === "/admin/login" && adminUser) {
    return context.redirect("/admin");
  }

  return next();
});
