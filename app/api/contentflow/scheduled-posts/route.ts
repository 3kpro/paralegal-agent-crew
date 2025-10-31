import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/contentflow/scheduled-posts - List user's scheduled posts
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // 'scheduled', 'published', 'failed', 'all'
    const platform = searchParams.get("platform");
    const limit = parseInt(searchParams.get("limit") || "50");

    let query = supabase
      .from("scheduled_posts")
      .select("*")
      .eq("user_id", user.id)
      .order("scheduled_at", { ascending: true })
      .limit(limit);

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    if (platform) {
      query = query.eq("platform", platform);
    }

    const { data: posts, error } = await query;

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch scheduled posts" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      posts: posts || [],
      count: posts?.length || 0,
    });
  } catch (error: any) {
    console.error("Scheduled posts API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/contentflow/scheduled-posts - Create new scheduled post
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const {
      title,
      content,
      platform,
      scheduled_at,
      timezone = "UTC",
      campaign_id,
      post_type = "text",
    } = body;

    // Validation
    if (!title || !content || !platform || !scheduled_at) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: title, content, platform, scheduled_at",
        },
        { status: 400 },
      );
    }

    // Validate platform
    const validPlatforms = [
      "twitter",
      "linkedin",
      "facebook",
      "instagram",
      "tiktok",
      "reddit",
      "youtube",
    ];
    if (!validPlatforms.includes(platform)) {
      return NextResponse.json(
        { success: false, error: "Invalid platform" },
        { status: 400 },
      );
    }

    // Validate schedule is in the future
    const scheduleDate = new Date(scheduled_at);
    if (scheduleDate <= new Date()) {
      return NextResponse.json(
        { success: false, error: "Scheduled time must be in the future" },
        { status: 400 },
      );
    }

    // Insert scheduled post
    const { data: scheduledPost, error } = await supabase
      .from("scheduled_posts")
      .insert({
        user_id: user.id,
        title,
        content,
        platform,
        scheduled_at,
        timezone,
        campaign_id,
        post_type,
        status: "scheduled",
      })
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to create scheduled post" },
        { status: 500 },
      );
    }

    // Add to posting queue
    await supabase.from("posting_queue").insert({
      scheduled_post_id: scheduledPost.id,
      priority: 0,
    });

    return NextResponse.json({
      success: true,
      message: "Post scheduled successfully",
      post: scheduledPost,
    });
  } catch (error: any) {
    console.error("Schedule post API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
