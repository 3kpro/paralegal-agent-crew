// Analytics Event Tracking Endpoint
// POST /api/analytics/track
// Tracks user events for analytics

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json();
    const { event_type, event_category, event_data = {}, session_id } = body;

    if (!event_type) {
      return NextResponse.json(
        { error: "event_type is required" },
        { status: 400 },
      );
    }

    // Get user agent and IP
    const user_agent = request.headers.get("user-agent") || "unknown";
    const ip_address =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // Insert analytics event
    const { data, error } = await supabase
      .from("analytics_events")
      .insert({
        user_id: user.id,
        event_type,
        event_category,
        event_data,
        session_id,
        user_agent,
        ip_address,
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to track event:", error);
      return NextResponse.json(
        { error: "Failed to track event", details: error.message },
        { status: 500 },
      );
    }

    // Update feature usage if applicable
    if (event_data.feature_name) {
      await supabase.rpc("track_feature_usage", {
        p_user_id: user.id,
        p_feature_name: event_data.feature_name,
      });
    }

    // Update daily usage metrics
    if (
      event_type === "content_generated" ||
      event_type === "content_published"
    ) {
      await supabase.rpc("increment_usage_metric", {
        p_user_id: user.id,
        p_metric_type: event_type,
        p_increment: 1,
      });
    }

    console.log(`✅ Analytics tracked: ${event_type} for user ${user.email}`);

    return NextResponse.json({
      success: true,
      event_id: data.id,
    });
  } catch (error: any) {
    console.error("Analytics tracking error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}
