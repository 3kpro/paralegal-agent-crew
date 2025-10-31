import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET /api/contentflow/stats - Get ContentFlow statistics
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
    const period = searchParams.get("period") || "30"; // days

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get scheduled posts stats
    const { data: scheduledPosts, error: postsError } = await supabase
      .from("scheduled_posts")
      .select("status, platform, created_at, scheduled_at, published_at")
      .eq("user_id", user.id)
      .gte("created_at", startDate.toISOString());

    if (postsError) {
      console.error("Database error:", postsError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch posts data" },
        { status: 500 },
      );
    }

    // Get templates count
    const { count: templatesCount, error: templatesError } = await supabase
      .from("content_templates")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (templatesError) {
      console.error("Templates count error:", templatesError);
    }

    // Process statistics
    const posts = scheduledPosts || [];

    const stats = {
      overview: {
        total_posts: posts.length,
        scheduled: posts.filter((p) => p.status === "scheduled").length,
        published: posts.filter((p) => p.status === "published").length,
        failed: posts.filter((p) => p.status === "failed").length,
        templates: templatesCount || 0,
      },

      by_platform: posts.reduce((acc: any, post) => {
        acc[post.platform] = (acc[post.platform] || 0) + 1;
        return acc;
      }, {}),

      by_status: posts.reduce((acc: any, post) => {
        acc[post.status] = (acc[post.status] || 0) + 1;
        return acc;
      }, {}),

      upcoming: posts
        .filter(
          (p) =>
            p.status === "scheduled" && new Date(p.scheduled_at) > new Date(),
        )
        .sort(
          (a, b) =>
            new Date(a.scheduled_at).getTime() -
            new Date(b.scheduled_at).getTime(),
        )
        .slice(0, 5)
        .map((p) => ({
          id: p.scheduled_at,
          platform: p.platform,
          scheduled_at: p.scheduled_at,
        })),

      recent_activity: posts
        .filter((p) => p.published_at || p.created_at)
        .sort((a, b) => {
          const dateA = new Date(a.published_at || a.created_at).getTime();
          const dateB = new Date(b.published_at || b.created_at).getTime();
          return dateB - dateA;
        })
        .slice(0, 10)
        .map((p) => ({
          platform: p.platform,
          status: p.status,
          date: p.published_at || p.created_at,
        })),

      daily_activity: generateDailyActivity(posts, startDate, endDate),
    };

    return NextResponse.json({
      success: true,
      stats,
      period: parseInt(period),
    });
  } catch (error: any) {
    console.error("Stats API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

function generateDailyActivity(posts: any[], startDate: Date, endDate: Date) {
  const dailyData: { [key: string]: number } = {};

  // Initialize all days with 0
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dateKey = currentDate.toISOString().split("T")[0];
    dailyData[dateKey] = 0;
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Count posts by day
  posts.forEach((post) => {
    const date = post.published_at || post.created_at;
    if (date) {
      const dateKey = new Date(date).toISOString().split("T")[0];
      if (dailyData.hasOwnProperty(dateKey)) {
        dailyData[dateKey]++;
      }
    }
  });

  return Object.entries(dailyData).map(([date, count]) => ({
    date,
    posts: count,
  }));
}
