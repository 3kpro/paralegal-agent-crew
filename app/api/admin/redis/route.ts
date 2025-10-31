import { NextRequest, NextResponse } from "next/server";
import {
  getRedisStats,
  getCacheDistribution,
  getLargestCacheEntries,
} from "@/lib/redis-monitor";
import { redis, isRedisConnected } from "@/lib/redis";
import { createClient } from "@/lib/supabase/server";
import {
  invalidateAllContentCache,
  invalidateAllTrendCache,
} from "@/lib/cache-invalidation";

// Admin-only API endpoint for Redis monitoring and management
export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: userProfile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!userProfile || userProfile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get action from query params
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "stats";

    // Handle different actions
    switch (action) {
      case "stats":
        const stats = await getRedisStats();
        return NextResponse.json(stats);

      case "distribution":
        const distribution = await getCacheDistribution();
        return NextResponse.json(distribution);

      case "largest":
        const pattern = searchParams.get("pattern") || "*";
        const limit = parseInt(searchParams.get("limit") || "10");
        const largest = await getLargestCacheEntries(pattern, limit);
        return NextResponse.json(largest);

      case "ping":
        const connected = await isRedisConnected();
        return NextResponse.json({ connected });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("[Redis Admin API] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to execute Redis admin action",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// Admin-only API endpoint for Redis cache management
export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: userProfile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!userProfile || userProfile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get action and parameters from request body
    const { action, pattern } = await request.json();

    if (!action) {
      return NextResponse.json(
        { error: "Action is required" },
        { status: 400 },
      );
    }

    // Handle different actions
    switch (action) {
      case "flush":
        // Flush all keys matching pattern
        if (!pattern) {
          return NextResponse.json(
            { error: "Pattern is required for flush action" },
            { status: 400 },
          );
        }

        const keys = await redis.keys(pattern);

        if (keys.length > 0) {
          const pipeline = redis.pipeline();
          keys.forEach((key: string) => pipeline.del(key));
          await pipeline.exec();
        }

        return NextResponse.json({
          success: true,
          message: `Flushed ${keys.length} keys matching pattern: ${pattern}`,
        });

      case "flushContent":
        // Flush all content cache
        await invalidateAllContentCache();
        return NextResponse.json({
          success: true,
          message: "Flushed all content generation cache",
        });

      case "flushTrends":
        // Flush all trends cache
        await invalidateAllTrendCache();
        return NextResponse.json({
          success: true,
          message: "Flushed all trends cache",
        });

      case "flushAll":
        // Flush all cache (dangerous!)
        await redis.flushdb();
        return NextResponse.json({
          success: true,
          message: "Flushed all cache",
        });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("[Redis Admin API] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to execute Redis admin action",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
