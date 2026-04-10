import { describe, expect, it } from "vitest";

import { createRateLimiter } from "../rate-limit";

describe("rate limiter", () => {
  it("allows requests below the threshold", () => {
    const limiter = createRateLimiter({ maxAttempts: 3, windowMs: 60_000 });
    const now = 1_000_000;

    limiter.recordAttempt("client-a", now);
    limiter.recordAttempt("client-a", now + 100);

    expect(limiter.isRateLimited("client-a", now + 200)).toBe(false);
  });

  it("blocks after reaching the threshold", () => {
    const limiter = createRateLimiter({ maxAttempts: 3, windowMs: 60_000 });
    const now = 1_000_000;

    limiter.recordAttempt("client-a", now);
    limiter.recordAttempt("client-a", now + 100);
    limiter.recordAttempt("client-a", now + 200);

    expect(limiter.isRateLimited("client-a", now + 300)).toBe(true);
  });

  it("resets after the window expires", () => {
    const limiter = createRateLimiter({ maxAttempts: 2, windowMs: 5_000 });
    const now = 1_000_000;

    limiter.recordAttempt("client-a", now);
    limiter.recordAttempt("client-a", now + 100);

    expect(limiter.isRateLimited("client-a", now + 100)).toBe(true);
    expect(limiter.isRateLimited("client-a", now + 6_000)).toBe(false);
  });

  it("isolates keys from each other", () => {
    const limiter = createRateLimiter({ maxAttempts: 1, windowMs: 60_000 });
    const now = 1_000_000;

    limiter.recordAttempt("client-a", now);

    expect(limiter.isRateLimited("client-a", now)).toBe(true);
    expect(limiter.isRateLimited("client-b", now)).toBe(false);
  });
});
