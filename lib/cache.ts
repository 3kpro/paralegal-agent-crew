/**
 * Simple in-memory cache with TTL (Time To Live)
 * For production, consider Redis or similar distributed cache
 */

interface CacheEntry<T> {
  value: T
  expiresAt: number
}

class SimpleCache<T> {
  private cache = new Map<string, CacheEntry<T>>()
  private defaultTTL: number

  constructor(defaultTTLMs: number = 300000) { // 5 minutes default
    this.defaultTTL = defaultTTLMs
  }

  set(key: string, value: T, ttl?: number): void {
    const expiresAt = Date.now() + (ttl || this.defaultTTL)
    this.cache.set(key, { value, expiresAt })
  }

  get(key: string): T | null {
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return entry.value
  }

  has(key: string): boolean {
    return this.get(key) !== null
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Cleanup expired entries
  cleanup(): number {
    let removed = 0
    const now = Date.now()

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key)
        removed++
      }
    }

    return removed
  }

  size(): number {
    return this.cache.size
  }
}

// Export singleton instance for Twitter thread responses
export const threadCache = new SimpleCache<string>(600000) // 10 minutes

// Periodically cleanup expired entries (every 5 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const removed = threadCache.cleanup()
    if (removed > 0) {
      console.log(`Cache cleanup: removed ${removed} expired entries`)
    }
  }, 300000)
}
