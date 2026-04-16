/**
 * In-memory IP-based rate limiting.
 * Abstracted behind a clean interface for easy Redis replacement later.
 */

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const store = new Map<string, RateLimitEntry>();
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

function getLimit(): number {
  const limit = parseInt(process.env.SCAN_RATE_LIMIT_PER_HOUR ?? "5", 10);
  return isNaN(limit) ? 5 : limit;
}

/**
 * Returns true if the IP is allowed to proceed, false if rate limited.
 */
export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = getLimit();
  const entry = store.get(ip);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    store.set(ip, { count: 1, windowStart: now });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count++;
  return true;
}

/**
 * Returns remaining requests in the current window for an IP.
 */
export function getRemainingRequests(ip: string): number {
  const now = Date.now();
  const limit = getLimit();
  const entry = store.get(ip);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    return limit;
  }

  return Math.max(0, limit - entry.count);
}

/**
 * Clears the rate limit store (useful for testing).
 */
export function clearRateLimitStore(): void {
  store.clear();
}
