/**
 * Simple token bucket rate limiter
 * For production, consider Redis-based rate limiting for distributed systems
 */

interface RateLimitEntry {
  tokens: number;
  lastRefill: number;
}

export class RateLimiter {
  private buckets = new Map<string, RateLimitEntry>();
  private maxTokens: number;
  private refillRate: number; // tokens per second
  private refillInterval: number; // ms

  constructor(
    maxTokens: number = 10,
    refillRate: number = 1,
    refillIntervalMs: number = 1000,
  ) {
    this.maxTokens = maxTokens;
    this.refillRate = refillRate;
    this.refillInterval = refillIntervalMs;
  }

  private refillTokens(entry: RateLimitEntry): void {
    const now = Date.now();
    const timePassed = now - entry.lastRefill;
    const intervalsElapsed = Math.floor(timePassed / this.refillInterval);

    if (intervalsElapsed > 0) {
      entry.tokens = Math.min(
        this.maxTokens,
        entry.tokens + intervalsElapsed * this.refillRate,
      );
      entry.lastRefill = now;
    }
  }

  /**
   * Check if request is allowed and consume a token
   * @param key - Identifier (e.g., IP address, user ID)
   * @param tokens - Number of tokens to consume (default: 1)
   * @returns Object with allowed status and retry info
   */
  checkLimit(
    key: string,
    tokens: number = 1,
  ): {
    allowed: boolean;
    remaining: number;
    resetAt: number;
    retryAfter?: number;
  } {
    let entry = this.buckets.get(key);

    if (!entry) {
      entry = {
        tokens: this.maxTokens,
        lastRefill: Date.now(),
      };
      this.buckets.set(key, entry);
    }

    this.refillTokens(entry);

    const allowed = entry.tokens >= tokens;

    if (allowed) {
      entry.tokens -= tokens;
    }

    const resetAt = entry.lastRefill + this.refillInterval;
    const retryAfter = allowed
      ? undefined
      : Math.ceil((resetAt - Date.now()) / 1000);

    return {
      allowed,
      remaining: Math.floor(entry.tokens),
      resetAt,
      retryAfter,
    };
  }

  /**
   * Reset limits for a specific key
   */
  reset(key: string): void {
    this.buckets.delete(key);
  }

  /**
   * Clear all rate limit data
   */
  clear(): void {
    this.buckets.clear();
  }

  /**
   * Cleanup old entries (entries with full tokens that haven't been used recently)
   */
  cleanup(): number {
    let removed = 0;
    const now = Date.now();
    const staleThreshold = 3600000; // 1 hour
    const keysToDelete: string[] = [];

    // Collect keys to delete first to avoid modifying map during iteration
    this.buckets.forEach((entry, key) => {
      if (
        entry.tokens === this.maxTokens &&
        now - entry.lastRefill > staleThreshold
      ) {
        keysToDelete.push(key);
      }
    });

    // Delete stale keys
    keysToDelete.forEach((key) => {
      this.buckets.delete(key);
      removed++;
    });

    return removed;
  }
}

// Export singleton instances for different endpoints
export const apiRateLimiter = new RateLimiter(10, 1, 1000); // 10 requests per second
export const healthRateLimiter = new RateLimiter(60, 10, 1000); // 60 requests per second

// Cleanup old entries every 10 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const apiRemoved = apiRateLimiter.cleanup();
    const healthRemoved = healthRateLimiter.cleanup();
    if (apiRemoved > 0 || healthRemoved > 0) {
      console.log(
        `Rate limiter cleanup: API=${apiRemoved}, Health=${healthRemoved}`,
      );
    }
  }, 600000);
}
