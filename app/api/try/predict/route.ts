/**
 * Ungated Viral Prediction API
 *
 * Public endpoint — no authentication required.
 * Rate limited to 5 requests/day per IP.
 *
 * Takes a keyword, generates a focused trend angle via Gemini,
 * scores it with the full Viral Score™ engine, returns the result.
 */

import { NextRequest, NextResponse } from "next/server";
import { rateLimit, RateLimitPresets } from "@/lib/rate-limit";
import { calculateViralScore } from "@/lib/viral-score";
import { getGeminiModel } from "@/lib/gemini";
import { redis } from "@/lib/redis";

const CACHE_TTL = 1800; // 30 minutes

export async function GET(request: NextRequest) {
  try {
    // 1. Rate limit (5/day per IP)
    const limitError = await rateLimit(request, RateLimitPresets.FREE_PREDICT);
    if (limitError) {
      return NextResponse.json(
        {
          error: "Daily prediction limit reached",
          message: "You've used all 5 free predictions for today. Sign up for unlimited access.",
          signup_url: "/signup?ref=try-limit",
        },
        { status: 429 },
      );
    }

    // 2. Validate keyword
    const keyword = new URL(request.url).searchParams.get("keyword")?.trim();
    if (!keyword || keyword.length < 2 || keyword.length > 200) {
      return NextResponse.json(
        { error: "Keyword required (2-200 characters)" },
        { status: 400 },
      );
    }

    // 3. Check cache
    const cacheKey = `try:predict:${keyword.toLowerCase()}`;
    if (redis) {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          const parsed = typeof cached === "string" ? JSON.parse(cached) : cached;
          return NextResponse.json({ success: true, ...parsed, meta: { cached: true } });
        }
      } catch {
        // Cache miss — continue to generate
      }
    }

    const startTime = Date.now();

    // 4. Generate a focused trend angle via Gemini
    const geminiModel = getGeminiModel("gemini-2.0-flash", true);
    if (!geminiModel) {
      return NextResponse.json(
        { error: "AI service temporarily unavailable" },
        { status: 503 },
      );
    }

    const anglePrompt = `Given the topic "${keyword}", generate ONE specific, compelling content angle that would perform well on social media.

Respond in JSON only:
{
  "title": "A specific, attention-grabbing angle for this topic (15-80 characters)",
  "formattedTraffic": "estimated relative interest level like '50K+' or '100K+' or '10K+'",
  "relatedTopics": ["3-4 related angles or sub-topics as strings"]
}

Make the title specific and opinionated — NOT generic. For example:
- Bad: "AI in Business"
- Good: "Why 73% of CEOs Are Wrong About AI Replacing Jobs"
- Bad: "Marketing Tips"
- Good: "The $0 Marketing Hack That Outperforms $10K Ad Spend"`;

    let trendTitle = keyword;
    let formattedTraffic = "10K+";
    let relatedTopics: string[] = [];

    try {
      const result = await geminiModel.generateContent(anglePrompt);
      const text = result.response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        const parsed = JSON.parse(text);
        trendTitle = parsed.title || keyword;
        formattedTraffic = parsed.formattedTraffic || "10K+";
        relatedTopics = parsed.relatedTopics || [];
      }
    } catch {
      // Fall back to the raw keyword — still score it
      trendTitle = keyword;
    }

    // 5. Score with the full Viral Score™ engine
    const scored = await calculateViralScore({
      title: trendTitle,
      formattedTraffic,
      sources: ["google"],
      firstSeenAt: new Date(),
    });

    const response = {
      topic: {
        title: scored.title,
        viralScore: scored.viralScore,
        viralPotential: scored.viralPotential,
        viralDNA: scored.viralDNA,
        viralFactors: scored.viralFactors,
        aiReasoning: scored.aiReasoning,
        relatedTopics,
      },
      meta: {
        cached: false,
        response_time_ms: Date.now() - startTime,
      },
    };

    // 6. Cache the result
    if (redis) {
      try {
        await redis.set(cacheKey, JSON.stringify({ topic: response.topic }), {
          ex: CACHE_TTL,
        });
      } catch {
        // Cache write failed — non-critical
      }
    }

    return NextResponse.json({ success: true, ...response });
  } catch (error: unknown) {
    console.error("[Try Predict API] Error:", error);
    const message = error instanceof Error ? error.message : "Prediction failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
