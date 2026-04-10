import { subscribeToNewsletter } from "@/features/newsletter/services/newsletter-service";
import { createRateLimiter } from "@/lib/http/rate-limit";

const newsletterLimiter = createRateLimiter({ maxAttempts: 5, windowMs: 10 * 60 * 1000 });

function resolveRedirectTarget(input: string | null): string {
  if (!input?.startsWith("/")) {
    return "/";
  }

  return input;
}

function getClientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export async function POST({ request }: { request: Request }) {
  const clientIp = getClientIp(request);

  if (newsletterLimiter.isRateLimited(clientIp)) {
    return new Response("Too Many Requests", { status: 429 });
  }

  newsletterLimiter.recordAttempt(clientIp);

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

