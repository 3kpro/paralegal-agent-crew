import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Rate Limiter
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 requests per minute
});

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate Limiting
    const headerStore = await headers();
    const ip = headerStore.get("x-forwarded-for") || "127.0.0.1";
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

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Generate Content for each target using Gemini
    const generatedResults = await Promise.all(targets.map(async (target) => {
      let prompt = "";
      let responseFormat = "";

      if (target.platform === 'twitter') {
        prompt = `You are a viral social media expert. Write a Twitter thread (3-5 tweets) to launch this product.
        
        Product: ${campaign.product_name}
        URL: ${campaign.product_url}
        Description: ${campaign.product_description}
        
        Target Audience: Tech early adopters, indie hackers, creators.
        Tone: Exciting, authentic, "building in public".
        
        Format: Return ONLY a JSON object with a "thread" array of strings. Do not include markdown formatting like \`\`\`json.`;
        responseFormat = "json";
      } else if (target.platform === 'reddit') {
        prompt = `You are a helpful community member. Write a Reddit post for the ${target.community_name} subreddit.
        
        Product: ${campaign.product_name}
        URL: ${campaign.product_url}
        Description: ${campaign.product_description}
        
        Context: I am the founder launching this.
        Tone: Humble, transparent, asking for feedback. NOT salesy.
        
        Format: Return ONLY a JSON object with "title" and "body" fields. Do not include markdown formatting like \`\`\`json.`;
        responseFormat = "json";
      } else if (target.platform === 'linkedin') {
        prompt = `You are a thought leader. Write a LinkedIn post to announce this launch.
        
        Product: ${campaign.product_name}
        URL: ${campaign.product_url}
        Description: ${campaign.product_description}
        
        Tone: Professional, insightful, focusing on the "why" and the problem solved.
        
        Format: Return ONLY a JSON object with a "text" field. Do not include markdown formatting like \`\`\`json.`;
        responseFormat = "json";
      } else if (target.platform === 'product_hunt') {
        prompt = `You are a Product Hunt launch expert. Write the assets for a Product Hunt launch.
        
        Product: ${campaign.product_name}
        URL: ${campaign.product_url}
        Description: ${campaign.product_description}
        
        Tone: Punchy, exciting, clear value prop.
        
        Format: Return ONLY a JSON object with "tagline" (max 60 chars), "description" (max 260 chars), and "first_comment" (intro from maker) fields. Do not include markdown formatting like \`\`\`json.`;
        responseFormat = "json";
      } else {
        prompt = `Write a social media post for ${target.platform} to launch this product.
        
        Product: ${campaign.product_name}
        URL: ${campaign.product_url}
        Description: ${campaign.product_description}
        
        Format: Return ONLY a JSON object with a "text" field. Do not include markdown formatting like \`\`\`json.`;
        responseFormat = "json";
      }

      try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        // Clean up markdown code blocks if present
        const cleanJson = responseText.replace(/```json\n?|\n?```/g, "").trim();
        const content = JSON.parse(cleanJson);

        return {
          id: target.id,
          content,
          status: 'review'
        };
      } catch (err) {
        console.error(`Error generating for target ${target.id}:`, err);
        return {
          id: target.id,
          content: { error: "Failed to generate content" },
          status: 'draft' // Keep as draft if failed
        };
      }
    }));

    // Update Targets in DB
    for (const result of generatedResults) {
      if (result.status === 'review') {
        await supabase
          .from("launch_targets")
          .update({
            content: result.content,
            status: result.status
          })
          .eq("id", result.id);
      }
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
