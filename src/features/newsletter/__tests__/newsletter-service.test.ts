import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createSeededTestDatabase } from "@/lib/db/test-utils";

import { findSubscriberByEmail } from "../repositories/newsletter-repository";
import { subscribeToNewsletter } from "../services/newsletter-service";

let cleanup: (() => void) | undefined;

beforeEach(() => {
  cleanup = createSeededTestDatabase().cleanup;
});

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe("newsletter service", () => {
  it("adds a new subscriber", () => {
    const result = subscribeToNewsletter("new-reader@example.com");

    expect(result.status).toBe("subscribed");
    expect(findSubscriberByEmail("new-reader@example.com")).not.toBeNull();
  });

  it("returns already-subscribed for an existing email", () => {
    expect(subscribeToNewsletter("reader@example.com").status).toBe("already-subscribed");
  });

  it("reactivates an unsubscribed email", () => {
    const result = subscribeToNewsletter("former-reader@example.com");

    expect(result.status).toBe("subscribed");
    expect(findSubscriberByEmail("former-reader@example.com")?.status).toBe("active");
  });

  it("rejects invalid email addresses", () => {
    expect(subscribeToNewsletter("invalid-email").status).toBe("invalid");
  });
});
