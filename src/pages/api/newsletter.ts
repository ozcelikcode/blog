import { subscribeToNewsletter } from "@/features/newsletter/services/newsletter-service";

function resolveRedirectTarget(input: string | null): string {
  if (!input?.startsWith("/")) {
    return "/";
  }

  return input;
}

export async function POST({ request }: { request: Request }) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "");
  const redirectTo = resolveRedirectTarget(
    typeof formData.get("redirectTo") === "string" ? String(formData.get("redirectTo")) : null,
  );

  const result = subscribeToNewsletter(email, "website");

  if (request.headers.get("accept")?.includes("application/json")) {
    const statusCode =
      result.status === "subscribed" ? 201 : result.status === "already-subscribed" ? 200 : 400;

    return Response.json(result, { status: statusCode });
  }

  return Response.redirect(
    new URL(
      `${redirectTo}${redirectTo.includes("?") ? "&" : "?"}newsletter=${result.status}`,
      request.url,
    ),
    303,
  );
}
