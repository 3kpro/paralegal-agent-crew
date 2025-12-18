import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's tier limits
    const { data: tierLimits, error: tierError } = await supabase.rpc(
      "get_user_tier_limits",
      { p_user_id: user.id }
    );

    if (tierError) {
      console.error("Error fetching tier limits:", tierError);
      return NextResponse.json(
        { error: "Failed to fetch tier limits" },
        { status: 500 }
      );
    }

    // Get user's daily usage
    const { data: dailyUsage, error: usageError } = await supabase.rpc(
      "get_user_daily_usage",
      { p_user_id: user.id }
    );

    if (usageError) {
      console.error("Error fetching daily usage:", usageError);
      return NextResponse.json(
        { error: "Failed to fetch daily usage" },
        { status: 500 }
      );
    }

    // Get user profile for tier info
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_tier")
      .eq("id", user.id)
      .single();

    const limits = tierLimits?.[0] || {
      tier: "free",
      daily_generations_limit: 3,
      daily_tokens_limit: 10000,
      monthly_campaigns_limit: 5,
      ai_tools_limit: 1,
      can_schedule: false,
      can_publish: false,
      can_use_ai_studio: false,
      features: ["xelora", "copy_content"],
    };

    const usage = dailyUsage?.[0] || {
      generations_count: 0,
      tokens_used: 0,
      campaigns_created: 0,
      usage_date: new Date().toISOString().split("T")[0],
    };

    // Check if user can generate
    const { data: canGenerate } = await supabase.rpc("can_user_generate", {
      p_user_id: user.id,
    });

    // Calculate remaining generations
    const remainingGenerations =
      limits.daily_generations_limit === -1
        ? -1 // Unlimited
        : Math.max(
            0,
            limits.daily_generations_limit - usage.generations_count
          );

    // Calculate percentage used
    const percentageUsed =
      limits.daily_generations_limit === -1
        ? 0
        : (usage.generations_count / limits.daily_generations_limit) * 100;

    return NextResponse.json({
      success: true,
      tier: profile?.subscription_tier || "free",
      limits: {
        daily_generations: limits.daily_generations_limit,
        daily_tokens: limits.daily_tokens_limit,
        monthly_campaigns: limits.monthly_campaigns_limit,
        ai_tools: limits.ai_tools_limit,
        can_schedule: limits.can_schedule,
        can_publish: limits.can_publish,
        can_use_ai_studio: limits.can_use_ai_studio,
        features: limits.features,
      },
      usage: {
        generations: usage.generations_count,
        tokens: usage.tokens_used,
        campaigns: usage.campaigns_created,
        date: usage.usage_date,
      },
      remaining: {
        generations: remainingGenerations,
        percentage_used: Math.round(percentageUsed),
      },
      can_generate: canGenerate || false,
    });
  } catch (error: any) {
    console.error("Usage API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
