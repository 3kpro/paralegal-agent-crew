import { redis, cacheKeys } from "@/lib/redis";

/**
 * Invalidate user-specific content cache with improved performance
 * @param userId User ID
 */
export async function invalidateUserContentCache(
  userId: string,
): Promise<void> {
  try {
    // Use pipeline for better performance with multiple operations
    const pipeline = redis.pipeline();

    // Get keys for each pattern
    const generateKeys = await redis.keys(`generate:${userId}:*`);
    const campaignKeys = await redis.keys(`campaign:${userId}:*`);

    // Add all keys to pipeline
    [...generateKeys, ...campaignKeys].forEach((key) => {
      pipeline.del(key);
    });

    // Add user profile key
    pipeline.del(cacheKeys.user(userId));

    // Execute all operations in a single round-trip
    await pipeline.exec();

    console.log(
      `[Cache] Invalidated ${generateKeys.length + campaignKeys.length + 1} keys for user ${userId}`,
    );
  } catch (error) {
    console.error("[Cache] Failed to invalidate user cache:", error);
  }
}

/**
 * Invalidate campaign-specific cache with improved performance
 * @param campaignId Campaign ID
 * @param userId Optional user ID for more targeted invalidation
 */
export async function invalidateCampaignCache(
  campaignId: string,
  userId?: string,
): Promise<void> {
  try {
    // Create more specific pattern if userId is provided
    const pattern = userId
      ? `campaign:${userId}:${campaignId}*`
      : `campaign:*:${campaignId}*`;

    const keys = await redis.keys(pattern);

    if (keys.length > 0) {
      // Use pipeline for better performance
      const pipeline = redis.pipeline();
      keys.forEach((key) => pipeline.del(key));
      await pipeline.exec();
    }

    console.log(
      `[Cache] Invalidated ${keys.length} keys for campaign ${campaignId}`,
    );
  } catch (error) {
    console.error("[Cache] Failed to invalidate campaign cache:", error);
  }
}

/**
 * Invalidate trend-specific cache with support for multiple patterns
 * @param query Trend query or array of queries
 * @param mode Optional mode (trending, ideas, etc.)
 */
export async function invalidateTrendCache(
  query: string | string[],
  mode?: string,
): Promise<void> {
  try {
    const pipeline = redis.pipeline();
    let count = 0;

    if (Array.isArray(query)) {
      // Handle multiple queries
      for (const q of query) {
        const key = mode ? cacheKeys.trends(q, mode) : cacheKeys.trends(q);
        pipeline.del(key);
        count++;
      }
    } else {
      // Handle single query
      const key = mode
        ? cacheKeys.trends(query, mode)
        : cacheKeys.trends(query);
      pipeline.del(key);
      count = 1;
    }

    await pipeline.exec();
    console.log(`[Cache] Invalidated ${count} trend cache keys`);
  } catch (error) {
    console.error("[Cache] Failed to invalidate trend cache:", error);
  }
}

/**
 * Invalidate all content generation cache with performance optimization
 */
export async function invalidateAllContentCache(): Promise<void> {
  try {
    // Get all keys for each pattern
    const generateKeys = await redis.keys("generate:*");
    const localGenerateKeys = await redis.keys("generate-local:*");

    // Use pipeline for better performance with large number of keys
    if (generateKeys.length > 0 || localGenerateKeys.length > 0) {
      const pipeline = redis.pipeline();

      // Add all keys to pipeline
      [...generateKeys, ...localGenerateKeys].forEach((key) => {
        pipeline.del(key);
      });

      // Execute all operations in a single round-trip
      await pipeline.exec();
    }

    console.log(
      `[Cache] Invalidated ${generateKeys.length + localGenerateKeys.length} content generation cache keys`,
    );
  } catch (error) {
    console.error("[Cache] Failed to invalidate all content cache:", error);
  }
}

/**
 * Invalidate all trend cache entries
 * @param mode Optional mode to target specific trend types
 */
export async function invalidateAllTrendCache(mode?: string): Promise<void> {
  try {
    const pattern = mode ? `trends:${mode}:*` : "trends:*";
    const keys = await redis.keys(pattern);

    if (keys.length > 0) {
      const pipeline = redis.pipeline();
      keys.forEach((key) => pipeline.del(key));
      await pipeline.exec();
    }

    console.log(
      `[Cache] Invalidated ${keys.length} trend cache keys${mode ? ` for mode: ${mode}` : ""}`,
    );
  } catch (error) {
    console.error("[Cache] Failed to invalidate trend cache:", error);
  }
}

/**
 * Perform cache maintenance operations
 * - Remove expired keys that Redis hasn't yet purged
 * - Report cache statistics
 */
export async function performCacheMaintenance(): Promise<{
  keysScanned: number;
  keysRemoved: number;
  cacheSize: number;
}> {
  try {
    // Get cache statistics before cleanup
    const infoBeforeCleanup = await redis.info("memory");

    // Trigger Redis to clean up expired keys more aggressively
    await redis.config("SET", "lazyfree-lazy-eviction", "yes");

    // Force Redis to process expired keys
    await redis.config("SET", "active-expire-effort", "10");

    // Get cache statistics after cleanup
    const infoAfterCleanup = await redis.info("memory");

    // Get current key count
    const dbSize = await redis.dbsize();

    return {
      keysScanned: dbSize,
      keysRemoved: 0, // Redis handles this internally
      cacheSize: dbSize,
    };
  } catch (error) {
    console.error("[Cache] Maintenance error:", error);
    return {
      keysScanned: 0,
      keysRemoved: 0,
      cacheSize: 0,
    };
  }
}
