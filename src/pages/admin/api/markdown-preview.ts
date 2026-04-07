import type { APIRoute } from "astro";

import { renderMarkdownToHtml } from "@/lib/content/markdown";
import { getAdminSessionUser } from "@/lib/auth/session";

export const POST: APIRoute = async (context) => {
  const adminUser = await getAdminSessionUser(context);

  if (!adminUser) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      headers: {
        "content-type": "application/json",
      },
      status: 401,
    });
  }

  const payload = (await context.request.json().catch(() => null)) as
    | { markdown?: unknown }
    | null;
  const markdown = typeof payload?.markdown === "string" ? payload.markdown : "";

  return new Response(
    JSON.stringify({
      html: renderMarkdownToHtml(markdown),
    }),
    {
      headers: {
        "content-type": "application/json",
      },
    },
  );
};
