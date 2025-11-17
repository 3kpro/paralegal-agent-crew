import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateConnection, incrementUsage } from "@/lib/social/token-manager";
import { publishToInstagram } from "@/lib/publishers/instagram.publisher";

/**
 * Publishing API - Handles both immediate and scheduled publishing
 * POST /api/publish
 *
 * For scheduled post: { post_id: string }
 * For immediate publish: { connectionId: string, platform: string, content: object, campaignId?: string }
 * For scheduling: { connectionId: string, platform: string, content: object, scheduledAt: string, campaignId?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { post_id, connectionId, platform, content, scheduledAt, campaignId } = body;

    // Route 1: Publishing an existing scheduled post
    if (post_id) {
      return await publishScheduledPost(supabase, user.id, post_id);
    }

    // Route 2: Immediate publishing or scheduling
    if (!connectionId || !platform || !content) {
      return NextResponse.json(
        { error: "Missing required fields: connectionId, platform, content" },
        { status: 400 }
      );
    }

    // Validate connection
    try {
      await validateConnection(connectionId);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // If scheduledAt is provided, save to scheduled_posts
    if (scheduledAt) {
      const scheduledDate = new Date(scheduledAt);
      const now = new Date();

      if (scheduledDate <= now) {
        return NextResponse.json(
          { error: "Scheduled time must be in the future" },
          { status: 400 }
        );
      }

      const { data: scheduledPost, error: scheduleError } = await supabase
        .from("scheduled_posts")
        .insert({
          user_id: user.id,
          connection_id: connectionId,
          campaign_id: campaignId,
          platform,
          post_type: content.type,
          content,
          scheduled_at: scheduledAt,
          status: "scheduled",
        })
        .select()
        .single();

      if (scheduleError) {
        console.error("[Publish] Failed to schedule post:", scheduleError);
        return NextResponse.json(
          { error: "Failed to schedule post" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        scheduled: true,
        scheduledPostId: scheduledPost.id,
        scheduledAt,
        message: "Post scheduled successfully",
      });
    }

    // Publish immediately
    return await publishImmediately(supabase, user.id, connectionId, platform, content, campaignId);
  } catch (error: any) {
    console.error("Publish API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * Publishes a scheduled post
 */
async function publishScheduledPost(supabase: any, userId: string, post_id: string) {
  // Get the scheduled post
  const { data: post, error: postError } = await supabase
    .from("scheduled_posts")
    .select("*")
    .eq("id", post_id)
    .eq("user_id", userId)
    .single();

  if (postError || !post) {
    return NextResponse.json(
      { error: "Post not found or access denied" },
      { status: 404 },
    );
  }

  // Check if post can be published
  if (post.status === "published") {
    return NextResponse.json(
      { error: "Post already published" },
      { status: 400 },
    );
  }

  // Update status to publishing
  await supabase
    .from("scheduled_posts")
    .update({ status: "publishing" })
    .eq("id", post_id);

  // Publish using new connection system
  try {
    const result = await publishContentToPlatform(
      post.connection_id,
      post.platform,
      post.content
    );

    // Update post with success status
    await supabase
      .from("scheduled_posts")
      .update({
        status: "published",
        published_at: new Date().toISOString(),
        platform_post_id: result.platformPostId,
        platform_url: result.platformUrl,
      })
      .eq("id", post_id);

    // Increment usage counter
    await incrementUsage(post.connection_id);

    // Log success to publishing_activity
    await supabase.from("publishing_activity").insert({
      user_id: userId,
      connection_id: post.connection_id,
      scheduled_post_id: post_id,
      action: "publish",
      platform: post.platform,
      status: "success",
      details: {
        platformPostId: result.platformPostId,
        platformUrl: result.platformUrl,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Post published successfully",
      platform_post_id: result.platformPostId,
      platform_url: result.platformUrl,
    });
  } catch (error: any) {
    // Update post with failure status
    await supabase
      .from("scheduled_posts")
      .update({
        status: "failed",
        error_message: error.message,
      })
      .eq("id", post_id);

    // Log failure
    await supabase.from("publishing_activity").insert({
      user_id: userId,
      connection_id: post.connection_id,
      scheduled_post_id: post_id,
      action: "publish",
      platform: post.platform,
      status: "failed",
      details: { error: error.message },
    });

    return NextResponse.json(
      { error: `Failed to publish: ${error.message}` },
      { status: 500 },
    );
  }
}

/**
 * Publishes content immediately
 */
async function publishImmediately(
  supabase: any,
  userId: string,
  connectionId: string,
  platform: string,
  content: any,
  campaignId?: string
) {
  try {
    const result = await publishContentToPlatform(connectionId, platform, content);

    // Increment usage counter
    await incrementUsage(connectionId);

    // Log success
    await supabase.from("publishing_activity").insert({
      user_id: userId,
      connection_id: connectionId,
      action: "publish",
      platform,
      status: "success",
      details: {
        platformPostId: result.platformPostId,
        platformUrl: result.platformUrl,
        contentType: content.type,
      },
    });

    return NextResponse.json({
      success: true,
      platformPostId: result.platformPostId,
      platformUrl: result.platformUrl,
      message: "Published successfully",
    });
  } catch (error: any) {
    // Log failure
    await supabase.from("publishing_activity").insert({
      user_id: userId,
      connection_id: connectionId,
      action: "publish",
      platform,
      status: "failed",
      details: { error: error.message, content },
    });

    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}

/**
 * Routes content to platform-specific publisher
 */
async function publishContentToPlatform(
  connectionId: string,
  platform: string,
  content: any
): Promise<{ success: boolean; platformPostId?: string; platformUrl?: string; error?: string }> {
  switch (platform) {
    case "instagram":
      return await publishToInstagram(connectionId, content);

    case "tiktok":
    case "youtube":
    case "facebook":
    case "linkedin":
    case "twitter":
      throw new Error(`${platform} publishing not yet implemented`);

    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

