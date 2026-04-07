import type { APIRoute } from "astro";

import { logoutAdmin } from "@/features/admin/auth/services/auth-service";

export const POST: APIRoute = async (context) => {
  logoutAdmin(context);
  return context.redirect("/admin/login?logged-out=1");
};
