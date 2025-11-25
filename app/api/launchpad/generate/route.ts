import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

// Initialize Rate Limiter
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 requests per minute
});

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate Limiting
    const ip = headers().get("x-forwarded-for") || "127.0.0.1";
    const { success } = await ratelimit.limit(ip);
    if (!success) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const { campaignId, targetIds } = await request.json();

    // Fetch Campaign Details
    const { data: campaign } = await supabase
      .from("launch_campaigns")
      .select("*")
      .eq("id", campaignId)
      .single();

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // Fetch Targets
    const { data: targets } = await supabase
      .from("launch_targets")
      .select("*")
      .in("id", targetIds);

    if (!targets || targets.length === 0) {
      return NextResponse.json({ error: "No targets found" }, { status: 404 });
    }

    // Generate Content for each target (Mocking AI for now)
    // TODO: Integrate with actual AI provider (Gemini/OpenAI)
    const generatedResults = targets.map((target) => {
      let content = {};
      
      if (target.platform === 'twitter') {
        content = {
          thread: [
            `🚀 Just launched ${campaign.product_name}!`,
            `${campaign.product_description.substring(0, 100)}...`,
            `Check it out: ${campaign.product_url}`
          ]
        };
      } else if (target.platform === 'reddit') {
        content = {
          title: `I built ${campaign.product_name} - ${campaign.product_description.substring(0, 50)}...`,
          body: `Hey ${target.community_name},\n\nI wanted to share what I've been working on...\n\n${campaign.product_description}\n\nWould love your feedback!`
        };
      } else {
        content = {
          text: `Excited to announce ${campaign.product_name}! ${campaign.product_description} #launch`
        };
      }

      return {
        id: target.id,
        content,
        status: 'review'
      };
    });

    // Update Targets in DB
    for (const result of generatedResults) {
      await supabase
        .from("launch_targets")
        .update({
          content: result.content,
          status: result.status
        })
        .eq("id", result.id);
    }

    return NextResponse.json({ success: true, results: generatedResults });

  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
