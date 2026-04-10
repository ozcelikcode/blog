const DEFAULT_WINDOW_MS = 10 * 60 * 1000;
const DEFAULT_MAX_ATTEMPTS = 10;

interface RateLimitEntry {
  attempts: number;
  blockedUntil?: number;
  firstAttemptAt: number;
}

export interface RateLimitOptions {
  maxAttempts?: number;
  windowMs?: number;
}

export function createRateLimiter(options: RateLimitOptions = {}) {
  const windowMs = options.windowMs ?? DEFAULT_WINDOW_MS;
  const maxAttempts = options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const store = new Map<string, RateLimitEntry>();

  function getEntry(key: string, now: number): RateLimitEntry {
    const existing = store.get(key);

    if (!existing || now - existing.firstAttemptAt > windowMs) {
      const fresh: RateLimitEntry = { attempts: 0, firstAttemptAt: now };
      store.set(key, fresh);
      return fresh;
    }

    return existing;
  }

  return {
    isRateLimited(key: string, now = Date.now()): boolean {
      const entry = getEntry(key, now);
      return Boolean(entry.blockedUntil && entry.blockedUntil > now);
    },

    recordAttempt(key: string, now = Date.now()): void {
      const entry = getEntry(key, now);
      entry.attempts += 1;

      if (entry.attempts >= maxAttempts) {
        entry.blockedUntil = now + windowMs;
      }

      store.set(key, entry);
    },

    reset(key: string): void {
      store.delete(key);
    },

    resetAll(): void {
      store.clear();
    },
  };
}
