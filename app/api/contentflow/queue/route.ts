import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/contentflow/queue - Get posting queue status
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

    // Get queue items with scheduled post details
    const { data: queueItems, error } = await supabase
      .from("posting_queue")
      .select(
        `
        *,
        scheduled_posts:scheduled_post_id (
          id,
          title,
          content,
          platform,
          scheduled_at,
          status,
          created_at
        )
      `,
      )
      .eq("scheduled_posts.user_id", user.id)
      .order("priority", { ascending: false })
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch posting queue" },
        { status: 500 },
      );
    }

    // Process queue items
    const processedQueue =
      queueItems
        ?.map((item) => ({
          ...item,
          scheduled_post: item.scheduled_posts,
        }))
        .filter((item) => item.scheduled_post) || [];

    // Get queue statistics
    const stats = {
      total: processedQueue.length,
      pending: processedQueue.filter(
        (item) => item.scheduled_post.status === "scheduled",
      ).length,
      processing: processedQueue.filter(
        (item) => item.scheduled_post.status === "publishing",
      ).length,
      failed: processedQueue.filter(
        (item) => item.scheduled_post.status === "failed",
      ).length,
      completed: processedQueue.filter(
        (item) => item.scheduled_post.status === "published",
      ).length,
    };

    return NextResponse.json({
      success: true,
      queue: processedQueue,
      stats,
    });
  } catch (error: any) {
    console.error("Queue API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/contentflow/queue/process - Manually trigger queue processing
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

    // Get posts that are ready to be published (scheduled time has passed)
    const now = new Date().toISOString();

    const { data: readyPosts, error: fetchError } = await supabase
      .from("scheduled_posts")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "scheduled")
      .lte("scheduled_at", now)
      .limit(10); // Process max 10 at a time

    if (fetchError) {
      console.error("Database error:", fetchError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch ready posts" },
        { status: 500 },
      );
    }

    if (!readyPosts || readyPosts.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No posts ready for publishing",
        processed: 0,
      });
    }

    // Mark posts as processing
    const postIds = readyPosts.map((post) => post.id);
    const { error: updateError } = await supabase
      .from("scheduled_posts")
      .update({ status: "publishing", updated_at: now })
      .in("id", postIds);

    if (updateError) {
      console.error("Update error:", updateError);
      return NextResponse.json(
        { success: false, error: "Failed to update post status" },
        { status: 500 },
      );
    }

    // In a real implementation, you would:
    // 1. Call the respective platform APIs (Twitter, LinkedIn, etc.)
    // 2. Handle success/failure for each post
    // 3. Update status accordingly

    // For now, we'll simulate success (in production, this would be a background job)
    const results = readyPosts.map((post) => ({
      id: post.id,
      platform: post.platform,
      status: "simulated_success",
      message: `Post "${post.title}" would be published to ${post.platform}`,
    }));

    // Update posts to published status (simulation)
    await supabase
      .from("scheduled_posts")
      .update({
        status: "published",
        published_at: now,
        updated_at: now,
      })
      .in("id", postIds);

    return NextResponse.json({
      success: true,
      message: `Processed ${readyPosts.length} posts`,
      processed: readyPosts.length,
      results,
    });
  } catch (error: any) {
    console.error("Queue processing API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
