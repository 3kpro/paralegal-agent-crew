import Redis from "ioredis";

// Check if Redis is enabled (default: false for dev, true for production)
const REDIS_ENABLED =
  process.env.REDIS_ENABLED === "true" ||
  (process.env.NODE_ENV === "production" && process.env.REDIS_URL);

// Track connection state to reduce log spam
let redisAvailable = true;
let connectionAttempts = 0;
const MAX_CONNECTION_ATTEMPTS = 3;

// Error handling and retry strategy with max attempts
const retryStrategy = (times: number) => {
  connectionAttempts = times;

  // Stop retrying after max attempts
  if (times > MAX_CONNECTION_ATTEMPTS) {
    if (redisAvailable) {
      console.warn(
        `[Redis] Max retry attempts reached (${MAX_CONNECTION_ATTEMPTS}). Redis caching disabled.`,
      );
      redisAvailable = false;
    }
    return null; // Return null to stop retrying
  }

  // Exponential backoff with jitter
  const delay = Math.min(
    Math.floor(Math.random() * 100) + Math.pow(2, times) * 50,
    5000,
  );

  // Only log first few attempts
  if (times <= 2) {
    console.log(`[Redis] Connection retry attempt ${times}, delay: ${delay}ms`);
  }

  return delay;
};

// Redis client configuration (only if enabled)
export const redis = REDIS_ENABLED
  ? new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
      password: process.env.REDIS_PASSWORD,
      retryStrategy,
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      connectTimeout: 5000,
      lazyConnect: true,
      reconnectOnError: (err) => {
        // Only reconnect on specific errors
        const targetErrors = ["READONLY", "ETIMEDOUT"];
        if (targetErrors.some((e) => err.message.includes(e))) {
          return true;
        }
        // Don't reconnect on ECONNREFUSED - Redis is not running
        return false;
      },
      db: parseInt(process.env.REDIS_DB || "0"),
      keepAlive: 10000,
    })
  : (null as any);

// Handle Redis connection events with better logging (only if enabled)
if (REDIS_ENABLED && redis) {
  redis.on("error", (error) => {
    // Only log errors if we haven't already detected Redis as unavailable
    if (redisAvailable && !error.message.includes("ECONNREFUSED")) {
      console.error("[Redis] Connection error:", error);
    }
  });

  redis.on("connect", () => {
    console.log("[Redis] Connected successfully");
    redisAvailable = true;
    connectionAttempts = 0;
  });

  redis.on("ready", () => {
    console.log("[Redis] Client ready for operations");
    redisAvailable = true;
  });

  redis.on("reconnecting", () => {
    if (connectionAttempts <= 2) {
      console.log("[Redis] Attempting to reconnect...");
    }
  });

  redis.on("close", () => {
    if (redisAvailable && connectionAttempts === 0) {
      console.log("[Redis] Connection closed");
    }
  });
} else {
  console.log(
    "[Redis] Caching disabled (REDIS_ENABLED=false or not in production)",
  );
}

// Cache key namespaces with improved structure
export const cacheKeys = {
  // Content-related keys
  content: (id: string) => `content:${id}`,
  campaign: (id: string, userId?: string) =>
    userId ? `campaign:${userId}:${id}` : `campaign:${id}`,
  user: (id: string) => `user:${id}`,
  analytics: (type: string, period?: string) =>
    period ? `analytics:${type}:${period}` : `analytics:${type}`,

  // Generation endpoints with better namespacing
  generate: (
    userId: string,
    topic: string,
    formats: string[],
    provider: string,
  ) =>
    `generate:${userId}:${topic}:${formats.sort().join(",")}:${provider || "default"}`,

  // Local generation with hash for long topics
  localGenerate: (topic: string, formats: string[]) => {
    // For very long topics, use a hash to avoid key length issues
    const topicKey =
      topic.length > 50
        ? `${topic.substring(0, 30)}_${hashString(topic)}`
        : topic;
    return `generate-local:${topicKey}:${formats.sort().join(",")}`;
  },

  // Trends with better key structure
  trends: (query: string, mode?: string) =>
    `trends:v3:${mode || "default"}:${query.toLowerCase()}`,
};

// Simple hash function for long strings
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).substring(0, 8);
}

/**
 * Get data from Redis cache with improved error handling
 * @param key Cache key
 * @returns Parsed data or null if not found
 */
export async function getCache<T>(key: string): Promise<T | null> {
  // Return null immediately if Redis is disabled or unavailable
  if (!REDIS_ENABLED || !redis || !redisAvailable) {
    return null;
  }

  try {
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch (error) {
    // Silently fail - caching is optional
    redisAvailable = false;
    return null;
  }
}

/**
 * Set data in Redis cache with optional TTL and compression for large objects
 * @param key Cache key
 * @param data Data to cache
 * @param ttl Time to live in seconds (optional)
 */
export async function setCache(
  key: string,
  data: any,
  ttl?: number,
): Promise<void> {
  // Skip if Redis is disabled or unavailable
  if (!REDIS_ENABLED || !redis || !redisAvailable) {
    return;
  }

  try {
    // For large objects, consider compression or chunking
    const serialized = JSON.stringify(data);

    // If data is very large, log a warning as it might impact performance
    if (serialized.length > 1024 * 50) {
      // 50KB
      console.warn(
        `[Redis] Large cache object (${Math.round(serialized.length / 1024)}KB) for key: ${key}`,
      );
    }

    if (ttl) {
      await redis.setex(key, ttl, serialized);
    } else {
      await redis.set(key, serialized);
    }
  } catch (error) {
    // Silently fail - caching is optional
    redisAvailable = false;
  }
}

/**
 * Invalidate cache by pattern with improved performance
 * @param pattern Key pattern to match
 */
export async function invalidateCache(pattern: string): Promise<void> {
  // Skip if Redis is disabled or unavailable
  if (!REDIS_ENABLED || !redis || !redisAvailable) {
    return;
  }

  try {
    // Use SCAN instead of KEYS for production environments with large datasets
    // This implementation uses KEYS for simplicity but is optimized for smaller datasets
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      // Use pipeline for bulk operations
      const pipeline = redis.pipeline();
      keys.forEach((key) => pipeline.del(key));
      await pipeline.exec();
      console.log(
        `[Redis] Invalidated ${keys.length} cache keys matching pattern: ${pattern}`,
      );
    }
  } catch (error) {
    // Silently fail - caching is optional
    redisAvailable = false;
  }
}

/**
 * Cache middleware for API routes with performance optimizations
 * @param key Cache key
 * @param ttl Time to live in seconds
 * @param fetchData Function to fetch data if not in cache
 * @param options Additional options
 * @returns Cached data or freshly fetched data
 */
export async function withCache<T>(
  key: string,
  ttl: number,
  fetchData: () => Promise<T>,
  options: {
    logLevel?: "none" | "minimal" | "verbose";
    bypassCache?: boolean;
    addCacheMetadata?: boolean;
  } = {},
): Promise<T> {
  const {
    logLevel = "minimal",
    bypassCache = false,
    addCacheMetadata = false,
  } = options;

  try {
    // Skip cache lookup if bypass is requested
    if (bypassCache) {
      if (logLevel !== "none")
        console.log(`[Redis] Cache bypass requested for key: ${key}`);
      const data = await fetchData();

      // Still update the cache for future requests
      await setCache(key, data, ttl);

      return addCacheMetadata ? addMetadata(data, false) : data;
    }

    // Try to get from cache first
    const cached = await getCache<T>(key);
    if (cached) {
      if (logLevel === "verbose")
        console.log(`[Redis] Cache hit for key: ${key}`);
      return addCacheMetadata ? addMetadata(cached, true) : cached;
    }

    if (logLevel !== "none") console.log(`[Redis] Cache miss for key: ${key}`);

    // If not in cache, fetch data
    const data = await fetchData();

    // Store in cache with TTL
    await setCache(key, data, ttl);

    return addCacheMetadata ? addMetadata(data, false) : data;
  } catch (error) {
    console.error("[Redis] Cache middleware error:", error);
    // On cache error, fallback to fetching data directly
    const data = await fetchData();
    return addCacheMetadata ? addMetadata(data, false) : data;
  }
}

// Helper to add cache metadata to response
function addMetadata<T>(data: T, fromCache: boolean): T {
  if (typeof data === "object" && data !== null) {
    return {
      ...data,
      metadata: {
        ...((data as any).metadata || {}),
        cached: fromCache,
        cache_timestamp: new Date().toISOString(),
      },
    } as T;
  }
  return data;
}

/**
 * Check if Redis is connected with timeout
 * @param timeoutMs Timeout in milliseconds
 * @returns Boolean indicating if Redis is connected
 */
export async function isRedisConnected(
  timeoutMs: number = 1000,
): Promise<boolean> {
  // Return false immediately if Redis is disabled
  if (!REDIS_ENABLED || !redis) {
    return false;
  }

  // Use cached availability status if we already know it's unavailable
  if (!redisAvailable) {
    return false;
  }

  try {
    // Use Promise.race to implement timeout
    const pingPromise = redis.ping();
    const timeoutPromise = new Promise<string>((_, reject) => {
      setTimeout(() => reject(new Error("Redis ping timeout")), timeoutMs);
    });

    const pong = await Promise.race([pingPromise, timeoutPromise]);
    const connected = pong === "PONG";

    if (!connected) {
      redisAvailable = false;
    }

    return connected;
  } catch (error) {
    redisAvailable = false;
    return false;
  }
}

/**
 * Get Redis server info (useful for diagnostics)
 * @returns Redis server information
 */
export async function getRedisInfo(): Promise<any> {
  // Return null immediately if Redis is disabled or unavailable
  if (!REDIS_ENABLED || !redis || !redisAvailable) {
    return null;
  }

  try {
    const info = await redis.info();
    return info;
  } catch (error) {
    redisAvailable = false;
    return null;
  }
}
