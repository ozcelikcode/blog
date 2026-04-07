import { defineMiddleware } from "astro:middleware";

import { getFlashMessage } from "@/lib/sessions/flash";
import { getAdminSessionUser } from "@/lib/auth/session";

const PUBLIC_ADMIN_PATHS = new Set(["/admin/login"]);

export const onRequest = defineMiddleware(async (context, next) => {
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
