import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get profile with limits
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_tier, ai_tools_limit")
      .eq("id", user.id)
      .single();

    // Calculate start of current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Get campaign usage this month
    const { count: campaignsThisMonth } = await supabase
      .from("campaigns")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", startOfMonth.toISOString());

    // Get AI tools count
    const { count: aiToolsCount } = await supabase
      .from("user_ai_tools")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_active", true);

    // Get API usage and costs this month
    const { data: apiUsage } = await supabase
      .from("ai_tool_usage")
      .select("tokens_used, estimated_cost")
      .eq("user_id", user.id)
      .gte("created_at", startOfMonth.toISOString());

    const totalTokens =
      apiUsage?.reduce((sum, u) => sum + (u.tokens_used || 0), 0) || 0;
    const totalCost =
      apiUsage?.reduce((sum, u) => sum + Number(u.estimated_cost || 0), 0) || 0;
    const apiCallsCount = apiUsage?.length || 0;

    // Campaign limits based on tier
    const tierLimits: Record<string, number> = {
      free: 5,
      pro: 999999,
      premium: 999999,
    };

    const currentTier = profile?.subscription_tier || "free";
    const campaignLimit = tierLimits[currentTier] || 5;

    // Calculate storage usage (placeholder - implement when file uploads are added)
    const storageUsedMB = 0;
    const storageLimits: Record<string, number> = {
      free: 100, // 100MB
      pro: 10240, // 10GB
      premium: 102400, // 100GB
    };

    // Platform limits
    const platformLimits: Record<string, number> = {
      free: 3,
      pro: 999,
      premium: 999,
    };

    // Get connected social accounts
    const { count: connectedPlatforms } = await supabase
      .from("social_accounts")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_active", true);

    // Calculate estimated savings (if using LM Studio vs paid APIs)
    // Rough estimate: GPT-4 costs ~$0.03 per 1K tokens input, $0.06 per 1K tokens output
    // Average: ~$0.045 per 1K tokens
    const estimatedSaved = (totalTokens / 1000) * 0.045;

    return NextResponse.json({
      success: true,
      usage: {
        // Campaigns
        campaignsUsed: campaignsThisMonth || 0,
        campaignsLimit: campaignLimit,
        campaignsPercentage: Math.round(
          ((campaignsThisMonth || 0) / campaignLimit) * 100,
        ),

        // AI Tools
        aiToolsUsed: aiToolsCount || 0,
        aiToolsLimit: profile?.ai_tools_limit || 1,
        aiToolsPercentage: Math.round(
          ((aiToolsCount || 0) / (profile?.ai_tools_limit || 1)) * 100,
        ),

        // Social Platforms
        platformsConnected: connectedPlatforms || 0,
        platformsLimit: platformLimits[currentTier] || 3,

        // Storage
        storageUsedMB,
        storageLimitMB: storageLimits[currentTier] || 100,
        storagePercentage: Math.round(
          (storageUsedMB / (storageLimits[currentTier] || 100)) * 100,
        ),

        // API Usage
        apiCallsThisMonth: apiCallsCount,
        tokensUsed: totalTokens,
        estimatedCost: totalCost,
        estimatedCostSaved: estimatedSaved,

        // Current Plan
        currentTier,
        billingCycle: "monthly", // Will be dynamic with Stripe
        nextBillingDate: null, // Will be from Stripe subscription
      },
      limits: {
        campaigns: campaignLimit,
        aiTools: profile?.ai_tools_limit || 1,
        platforms: platformLimits[currentTier] || 3,
        storageMB: storageLimits[currentTier] || 100,
      },
    });
  } catch (error: any) {
    console.error("Usage stats error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
