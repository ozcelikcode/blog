const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

interface RateLimitEntry {
  attempts: number;
  blockedUntil?: number;
  firstAttemptAt: number;
}

const attemptsByKey = new Map<string, RateLimitEntry>();

function getEntry(key: string, now: number): RateLimitEntry {
  const existing = attemptsByKey.get(key);

  if (!existing || now - existing.firstAttemptAt > WINDOW_MS) {
    const fresh = { attempts: 0, firstAttemptAt: now } satisfies RateLimitEntry;
    attemptsByKey.set(key, fresh);
    return fresh;
  }

  return existing;
}

export function isLoginRateLimited(key: string, now = Date.now()): boolean {
  const entry = getEntry(key, now);
  return Boolean(entry.blockedUntil && entry.blockedUntil > now);
}

export function recordLoginFailure(key: string, now = Date.now()): void {
  const entry = getEntry(key, now);
  entry.attempts += 1;

  if (entry.attempts >= MAX_ATTEMPTS) {
    entry.blockedUntil = now + WINDOW_MS;
  }

  attemptsByKey.set(key, entry);
}

export function clearLoginFailures(key: string): void {
  attemptsByKey.delete(key);
}

export function resetLoginRateLimitStore(): void {
  attemptsByKey.clear();
}
