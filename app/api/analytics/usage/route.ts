// Analytics Usage Endpoint
// GET /api/analytics/usage
// Returns current usage metrics and tier limits

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Tier limits configuration
const TIER_LIMITS = {
  free: {
    content_generated_per_day: 10,
    content_published_per_day: 5,
    ai_requests_per_day: 20,
    platforms_max: 1,
    ai_tools_max: 1,
  },
  pro: {
    content_generated_per_day: 100,
    content_published_per_day: 50,
    ai_requests_per_day: 200,
    platforms_max: 3,
    ai_tools_max: 3,
  },
  premium: {
    content_generated_per_day: -1, // unlimited
    content_published_per_day: -1,
    ai_requests_per_day: -1,
    platforms_max: -1,
    ai_tools_max: -1,
  },
};

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile for tier info
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("subscription_tier")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Failed to get profile:", profileError);
      return NextResponse.json(
        { error: "Failed to get user profile" },
        { status: 500 },
      );
    }

    const tier = profile?.subscription_tier || "free";
    const limits =
      TIER_LIMITS[tier as keyof typeof TIER_LIMITS] || TIER_LIMITS.free;

    // Get today's usage metrics
    const { data: todayUsage, error: usageError } = await supabase
      .from("usage_metrics")
      .select("*")
      .eq("user_id", user.id)
      .eq("metric_date", new Date().toISOString().split("T")[0])
      .single();

    const currentUsage = {
      content_generated: todayUsage?.content_generated_count || 0,
      content_published: todayUsage?.content_published_count || 0,
      ai_requests: todayUsage?.ai_requests_count || 0,
      api_calls: todayUsage?.api_calls_count || 0,
    };

    // Get connected platforms count
    const { data: platforms, error: platformsError } = await supabase
      .from("social_accounts")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_active", true);

    const platformsConnected = platforms?.length || 0;

    // Get configured AI tools count
    const { data: aiTools, error: aiToolsError } = await supabase
      .from("ai_tools")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_active", true);

    const aiToolsConfigured = aiTools?.length || 0;

    // Calculate remaining quotas
    const remaining = {
      content_generated:
        limits.content_generated_per_day === -1
          ? -1 // unlimited
          : Math.max(
              0,
              limits.content_generated_per_day - currentUsage.content_generated,
            ),
      content_published:
        limits.content_published_per_day === -1
          ? -1
          : Math.max(
              0,
              limits.content_published_per_day - currentUsage.content_published,
            ),
      ai_requests:
        limits.ai_requests_per_day === -1
          ? -1
          : Math.max(0, limits.ai_requests_per_day - currentUsage.ai_requests),
      platforms:
        limits.platforms_max === -1
          ? -1
          : Math.max(0, limits.platforms_max - platformsConnected),
      ai_tools:
        limits.ai_tools_max === -1
          ? -1
          : Math.max(0, limits.ai_tools_max - aiToolsConfigured),
    };

    // Check if any limits are reached
    const limitsReached = {
      content_generated: remaining.content_generated === 0,
      content_published: remaining.content_published === 0,
      ai_requests: remaining.ai_requests === 0,
      platforms: remaining.platforms === 0,
      ai_tools: remaining.ai_tools === 0,
    };

    const anyLimitReached = Object.values(limitsReached).some(
      (reached) => reached,
    );

    const response = {
      tier,
      limits,
      current_usage: currentUsage,
      remaining,
      limits_reached: limitsReached,
      any_limit_reached: anyLimitReached,
      platforms_connected: platformsConnected,
      ai_tools_configured: aiToolsConfigured,
      reset_at: new Date(new Date().setHours(24, 0, 0, 0)).toISOString(), // Midnight UTC
    };

    console.log(
      `✅ Usage metrics retrieved for user ${user.email} (tier: ${tier})`,
    );

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Usage metrics error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}
