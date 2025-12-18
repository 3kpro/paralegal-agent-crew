import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch all dashboard stats in parallel for performance
    const [
      profileData,
      campaignsData,
      platformsData,
      campaignsLast7Days,
      campaignsPrevious7Days,
    ] = await Promise.all([
      // User profile
      supabase
        .from("profiles")
        .select("id, full_name, subscription_tier, created_at")
        .eq("id", user.id)
        .single(),

      // Total campaigns
      supabase
        .from("campaigns")
        .select("id, source_data, created_at")
        .eq("user_id", user.id),

      // Connected platforms
      supabase
        .from("social_accounts")
        .select("platform, is_active")
        .eq("user_id", user.id)
        .eq("is_active", true),

      // Campaigns in last 7 days
      supabase
        .from("campaigns")
        .select("id")
        .eq("user_id", user.id)
        .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),

      // Campaigns in previous 7 days
      supabase
        .from("campaigns")
        .select("id")
        .eq("user_id", user.id)
        .gte("created_at", new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
        .lt("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    ]);

    // Handle errors
    if (profileData.error) {
      console.error("Profile fetch error:", profileData.error);
      return NextResponse.json(
        { error: "Failed to fetch profile" },
        { status: 500 }
      );
    }

    const profile = profileData.data;
    const campaigns = campaignsData.data || [];
    const platforms = platformsData.data || [];
    const recentCampaigns = campaignsLast7Days.data || [];
    const previousCampaigns = campaignsPrevious7Days.data || [];

    // Now fetch content pieces using campaign IDs
    let content = [];
    if (campaigns.length > 0) {
      const campaignIds = campaigns.map(c => c.id);
      const contentData = await supabase
        .from("campaign_content")
        .select("id, campaign_id")
        .in("campaign_id", campaignIds);

      content = contentData.data || [];
    }

    // Calculate days active
    const createdAt = new Date(profile.created_at);
    const now = new Date();
    const daysActive = Math.max(1, Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)));

    // Calculate viral scores (if available)
    let totalViralScore = 0;
    let viralScoreCount = 0;

    campaigns.forEach((campaign) => {
      if (campaign.source_data && typeof campaign.source_data === 'object') {
        const viralScore = (campaign.source_data as any).viralScore;
        if (typeof viralScore === 'number') {
          totalViralScore += viralScore;
          viralScoreCount++;
        }
      }
    });

    const avgViralScore = viralScoreCount > 0
      ? Math.round(totalViralScore / viralScoreCount)
      : null;

    // Calculate trends
    const campaignTrend = recentCampaigns.length - previousCampaigns.length;
    const campaignTrendText = campaignTrend > 0
      ? `+${campaignTrend} this week`
      : campaignTrend < 0
      ? `${campaignTrend} this week`
      : null;

    // Build response
    const stats = {
      user: {
        id: profile.id,
        full_name: profile.full_name,
        subscription_tier: profile.subscription_tier,
        created_at: profile.created_at,
        days_active: daysActive,
      },
      stats: {
        campaigns_created: campaigns.length,
        campaigns_created_trend: campaignTrendText,
        content_generated: content.length,
        platforms_connected: platforms.length,
        platforms: platforms.map((p) => p.platform),
        total_viral_score: viralScoreCount > 0 ? totalViralScore : null,
        avg_viral_score: avgViralScore,
      },
      progress: {
        first_campaign_created: campaigns.length > 0,
        first_content_generated: content.length > 0,
        first_platform_connected: platforms.length > 0,
        first_publish: false, // TODO: Track actual publishes
      },
      quick_wins: generateQuickWins({
        campaigns: campaigns.length,
        content: content.length,
        platforms: platforms.length,
        daysActive,
        avgViralScore,
      }),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Generate encouraging quick win messages
function generateQuickWins(data: {
  campaigns: number;
  content: number;
  platforms: number;
  daysActive: number;
  avgViralScore: number | null;
}): string[] {
  const wins: string[] = [];

  // Content generation wins
  if (data.content > 0) {
    const savedCost = data.content * 10; // $10 per piece estimate
    wins.push(`You've generated ${data.content} pieces of content - that's $${savedCost} saved in content costs!`);
  }

  // Viral score wins
  if (data.avgViralScore && data.avgViralScore >= 70) {
    wins.push(`Your average Viral Score is ${data.avgViralScore} - above the viral threshold!`);
  }

  // Consistency wins
  if (data.daysActive >= 7) {
    wins.push(`${data.daysActive} days of consistent building - keep it up!`);
  }

  // Platform wins
  if (data.platforms >= 2) {
    wins.push(`${data.platforms} platforms connected - you're building a multi-channel presence!`);
  }

  // Campaign wins
  if (data.campaigns >= 5) {
    wins.push(`${data.campaigns} campaigns created - you're becoming a content machine!`);
  }

  // First-time user encouragement
  if (wins.length === 0) {
    wins.push("You're just getting started - every journey begins with the first step!");
  }

  return wins.slice(0, 3); // Max 3 quick wins
}
