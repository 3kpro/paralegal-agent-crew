import { redis } from "./redis";

/**
 * Redis performance monitoring utility
 * Provides functions to monitor Redis performance and cache statistics
 */

/**
 * Get Redis server statistics
 * @returns Object with Redis server statistics
 */
export async function getRedisStats(): Promise<{
  connected: boolean;
  keyCount: number;
  memoryUsage: string;
  hitRate?: number;
  missRate?: number;
  uptime?: string;
  version?: string;
  error?: string;
}> {
  try {
    // Check if Redis is connected
    const isConnected = (await redis.ping()) === "PONG";

    if (!isConnected) {
      return {
        connected: false,
        keyCount: 0,
        memoryUsage: "0",
        error: "Redis not connected",
      };
    }

    // Get Redis info
    const info = await redis.info();
    const infoLines = info.split("\r\n");

    // Parse Redis info
    const stats: Record<string, string> = {};
    infoLines.forEach((line) => {
      const parts = line.split(":");
      if (parts.length === 2) {
        stats[parts[0]] = parts[1];
      }
    });

    // Get key count
    const keyCount = await redis.dbsize();

    // Calculate hit rate if available
    let hitRate: number | undefined;
    let missRate: number | undefined;

    if (stats["keyspace_hits"] && stats["keyspace_misses"]) {
      const hits = parseInt(stats["keyspace_hits"]);
      const misses = parseInt(stats["keyspace_misses"]);
      const total = hits + misses;

      if (total > 0) {
        hitRate = (hits / total) * 100;
        missRate = (misses / total) * 100;
      }
    }

    // Format uptime
    let uptime: string | undefined;
    if (stats["uptime_in_seconds"]) {
      const uptimeSeconds = parseInt(stats["uptime_in_seconds"]);
      const days = Math.floor(uptimeSeconds / 86400);
      const hours = Math.floor((uptimeSeconds % 86400) / 3600);
      const minutes = Math.floor((uptimeSeconds % 3600) / 60);
      const seconds = uptimeSeconds % 60;

      uptime = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }

    return {
      connected: true,
      keyCount,
      memoryUsage: stats["used_memory_human"] || "0",
      hitRate,
      missRate,
      uptime,
      version: stats["redis_version"],
    };
  } catch (error) {
    console.error("[Redis Monitor] Failed to get Redis stats:", error);
    return {
      connected: false,
      keyCount: 0,
      memoryUsage: "0",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get cache key distribution by namespace
 * @returns Object with key count by namespace
 */
export async function getCacheDistribution(): Promise<Record<string, number>> {
  try {
    const distribution: Record<string, number> = {};

    // Check common namespaces
    const namespaces = [
      "generate:*",
      "generate-local:*",
      "trends:*",
      "campaign:*",
      "user:*",
      "content:*",
      "analytics:*",
    ];

    for (const namespace of namespaces) {
      const keys = await redis.keys(namespace);
      distribution[namespace] = keys.length;
    }

    return distribution;
  } catch (error) {
    console.error("[Redis Monitor] Failed to get cache distribution:", error);
    return {};
  }
}

/**
 * Get cache hit rate for a specific key pattern
 * @param pattern Key pattern to match
 * @param sampleSize Number of requests to simulate
 * @returns Object with hit rate statistics
 */
export async function measureCacheHitRate(
  pattern: string,
  sampleSize: number = 100,
): Promise<{
  pattern: string;
  hitRate: number;
  missRate: number;
  totalKeys: number;
  sampleSize: number;
}> {
  try {
    // Get all keys matching the pattern
    const keys = await redis.keys(pattern);
    const totalKeys = keys.length;

    if (totalKeys === 0) {
      return {
        pattern,
        hitRate: 0,
        missRate: 100,
        totalKeys: 0,
        sampleSize,
      };
    }

    // Simulate random access to these keys
    let hits = 0;

    for (let i = 0; i < sampleSize; i++) {
      // Randomly select a key
      const randomKey = keys[Math.floor(Math.random() * keys.length)];

      // Check if key exists
      const exists = await redis.exists(randomKey);
      if (exists) {
        hits++;
      }
    }

    const hitRate = (hits / sampleSize) * 100;
    const missRate = 100 - hitRate;

    return {
      pattern,
      hitRate,
      missRate,
      totalKeys,
      sampleSize,
    };
  } catch (error) {
    console.error("[Redis Monitor] Failed to measure cache hit rate:", error);
    return {
      pattern,
      hitRate: 0,
      missRate: 100,
      totalKeys: 0,
      sampleSize,
    };
  }
}

/**
 * Get the largest cache entries by size
 * @param pattern Key pattern to match
 * @param limit Maximum number of entries to return
 * @returns Array of objects with key and size
 */
export async function getLargestCacheEntries(
  pattern: string = "*",
  limit: number = 10,
): Promise<Array<{ key: string; size: number; sizeFormatted: string }>> {
  try {
    const keys = await redis.keys(pattern);
    const entries: Array<{ key: string; size: number; sizeFormatted: string }> =
      [];

    for (const key of keys) {
      const value = await redis.get(key);
      if (value) {
        const size = Buffer.byteLength(value, "utf8");
        entries.push({
          key,
          size,
          sizeFormatted: formatSize(size),
        });
      }
    }

    // Sort by size (largest first) and limit
    return entries.sort((a, b) => b.size - a.size).slice(0, limit);
  } catch (error) {
    console.error(
      "[Redis Monitor] Failed to get largest cache entries:",
      error,
    );
    return [];
  }
}

/**
 * Format byte size to human-readable string
 * @param bytes Size in bytes
 * @returns Formatted size string
 */
function formatSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
}

/**
 * Get Redis memory usage by data type
 * @returns Object with memory usage by data type
 */
export async function getMemoryUsageByType(): Promise<Record<string, string>> {
  try {
    // Use MEMORY STATS command if available (Redis 4.0+)
    const memoryStats = (await redis.call("MEMORY", "STATS")) as any[];

    if (!memoryStats || !Array.isArray(memoryStats)) {
      return { error: "Memory stats not available" };
    }

    // Parse memory stats
    const result: Record<string, string> = {};
    for (let i = 0; i < memoryStats.length; i += 2) {
      const key = memoryStats[i] as string;
      const value = memoryStats[i + 1] as number;

      if (typeof key === "string" && typeof value === "number") {
        result[key] = formatSize(value);
      }
    }

    return result;
  } catch (error) {
    console.error("[Redis Monitor] Failed to get memory usage by type:", error);
    return { error: "Failed to get memory usage by type" };
  }
}
