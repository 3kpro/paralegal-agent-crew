// Analytics Overview Endpoint
// GET /api/analytics/overview?days=30
// Returns aggregated analytics data for dashboard

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get("days") || "30", 10);

    // Call database function for overview stats
    const { data: overviewData, error: overviewError } = await supabase.rpc(
      "get_user_analytics_overview",
      {
        p_user_id: user.id,
        p_days: days,
      },
    );

    if (overviewError) {
      console.error("Failed to get overview:", overviewError);
      return NextResponse.json(
        {
          error: "Failed to get analytics overview",
          details: overviewError.message,
        },
        { status: 500 },
      );
    }

    // Get platform breakdown
    const { data: platformStats, error: _platformError } = await supabase
      .from("analytics_events")
      .select("event_data")
      .eq("user_id", user.id)
      .eq("event_type", "content_published")
      .gte(
        "created_at",
        new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
      );

    // Aggregate by platform
    const platformBreakdown: Record<string, number> = {};
    if (platformStats) {
      platformStats.forEach((event: any) => {
        const platform = event.event_data?.platform || "unknown";
        platformBreakdown[platform] = (platformBreakdown[platform] || 0) + 1;
      });
    }

    // Get recent activity (last 10 events)
    const { data: recentEvents, error: _eventsError } = await supabase
      .from("analytics_events")
      .select("event_type, event_category, event_data, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    // Get feature usage stats
    const { data: featureUsage, error: _featureError } = await supabase
      .from("feature_usage")
      .select("feature_name, usage_count, last_used_at")
      .eq("user_id", user.id)
      .order("usage_count", { ascending: false })
      .limit(5);

    // Get usage metrics for current month
    const { data: usageMetrics } = await supabase
      .from("usage_metrics")
      .select("*")
      .eq("user_id", user.id)
      .gte(
        "metric_date",
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      )
      .order("metric_date", { ascending: false });

    // Calculate totals from usage metrics
    let totalAiRequests = 0;
    let totalApiCalls = 0;
    if (usageMetrics) {
      usageMetrics.forEach((metric: any) => {
        totalAiRequests += metric.ai_requests_count || 0;
        totalApiCalls += metric.api_calls_count || 0;
      });
    }

    const response = {
      overview: overviewData,
      platform_breakdown: platformBreakdown,
      recent_activity: recentEvents || [],
      top_features: featureUsage || [],
      usage_summary: {
        total_ai_requests: totalAiRequests,
        total_api_calls: totalApiCalls,
        daily_metrics: usageMetrics || [],
      },
      period: {
        days,
        start_date: new Date(
          Date.now() - days * 24 * 60 * 60 * 1000,
        ).toISOString(),
        end_date: new Date().toISOString(),
      },
    };

    console.log(
      `✅ Analytics overview retrieved for user ${user.email} (${days} days)`,
    );

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Analytics overview error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}
