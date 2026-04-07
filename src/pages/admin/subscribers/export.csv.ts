import type { APIRoute } from "astro";

import { exportSubscribersCsv } from "@/features/admin/subscribers/services/admin-subscriber-service";
import { getAdminSessionUser } from "@/lib/auth/session";

export const GET: APIRoute = async (context) => {
  const adminUser = await getAdminSessionUser(context);

  if (!adminUser) {
    return context.redirect("/admin/login");
  }

  const query = context.url.searchParams.get("q") ?? undefined;
  const csv = exportSubscribersCsv(query);

  return new Response(csv, {
    headers: {
      "content-disposition": 'attachment; filename="newsletter-subscribers.csv"',
      "content-type": "text/csv; charset=utf-8",
    },
  });
};
