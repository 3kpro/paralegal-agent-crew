/**
 * Ungated Content Generation API
 *
 * Public endpoint — no authentication required.
 * Rate limited to 3 requests/day per IP.
 * Max 3 platforms per request.
 *
 * Content gating: Platform 1 = full, Platform 2 = 60%, Platform 3 = 30%
 */

import { NextRequest, NextResponse } from "next/server";
import { rateLimit, RateLimitPresets } from "@/lib/rate-limit";
import { generateWithGemini } from "@/lib/content-generation";
import { redis } from "@/lib/redis";

const CACHE_TTL = 900; // 15 minutes
const VALID_FORMATS = ["twitter", "linkedin", "facebook", "instagram", "tiktok", "reddit"];

/**
 * Truncate content at a percentage boundary, ending at a sentence/word break
 */
function truncateAtPercent(text: string, percent: number): string {
  const cutoff = Math.floor(text.length * (percent / 100));
  // Try to break at a sentence boundary
  const sentenceEnd = text.lastIndexOf(". ", cutoff);
  if (sentenceEnd > cutoff * 0.5) {
    return text.slice(0, sentenceEnd + 1);
  }
  // Fall back to word boundary
  const wordEnd = text.lastIndexOf(" ", cutoff);
  if (wordEnd > cutoff * 0.5) {
    return text.slice(0, wordEnd);
  }
  return text.slice(0, cutoff);
}

export async function POST(request: NextRequest) {
  try {
    // 1. Rate limit (3/day per IP)
    const limitError = await rateLimit(request, RateLimitPresets.FREE_GENERATE);
    if (limitError) {
      return NextResponse.json(
        {
          error: "Daily generation limit reached",
          message: "You've used all 3 free generations for today. Sign up for unlimited access.",
          signup_url: "/signup?ref=try-limit",
        },
        { status: 429 },
      );
    }

    // 2. Validate input
    const body = await request.json();
    const topic = body.topic?.trim();
    const rawFormats = body.formats || [];

    if (!topic || topic.length < 2 || topic.length > 500) {
      return NextResponse.json(
        { error: "Topic required (2-500 characters)" },
        { status: 400 },
      );
    }

    const formats = rawFormats
      .filter((f: string) => VALID_FORMATS.includes(f))
      .slice(0, 3);

    if (formats.length === 0) {
      return NextResponse.json(
        { error: "At least 1 valid platform required" },
        { status: 400 },
      );
    }

    // 3. Check cache
    const cacheKey = `try:generate:${topic.toLowerCase()}:${formats.sort().join(",")}`;
    if (redis) {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          const parsed = typeof cached === "string" ? JSON.parse(cached) : cached;
          return NextResponse.json({ success: true, ...parsed, meta: { cached: true } });
        }
      } catch {
        // Cache miss
      }
    }

    // 4. Generate using shared Gemini logic (same quality as authenticated)
    const GEMINI_API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "AI service temporarily unavailable" },
        { status: 503 },
      );
    }

    const result = await generateWithGemini(
      GEMINI_API_KEY,
      topic,
      formats,
      {}, // default config
      0.7, // temperature
      "professional", // tone
      "standard", // length
      "general", // audience
      "informative", // focus
      "engage", // cta
    );

    // 5. Apply content gating
    const gatedContent: Record<string, any> = {};
    const gatingMeta: Record<string, string> = {};

    formats.forEach((format: string, index: number) => {
      const original = result.content[format];
      if (!original) return;

      if (index === 0) {
        // First platform: full content, no copy
        gatedContent[format] = { ...original, gated: "full" };
        gatingMeta[format] = "full";
      } else if (index === 1) {
        // Second platform: 60% visible
        const truncated = truncateAtPercent(original.content, 60);
        gatedContent[format] = {
          ...original,
          content: truncated + "...",
          fullLength: original.content.length,
          gated: "partial",
        };
        gatingMeta[format] = "partial";
      } else {
        // Third platform: 30% visible (blurred on client)
        const truncated = truncateAtPercent(original.content, 30);
        gatedContent[format] = {
          ...original,
          content: truncated + "...",
          fullLength: original.content.length,
          gated: "blurred",
        };
        gatingMeta[format] = "blurred";
      }
    });

    const response = {
      content: gatedContent,
      gatingMeta,
      metadata: {
        provider: "Google Gemini",
        tokensUsed: result.tokensUsed,
        estimatedCost: result.estimatedCost,
      },
    };

    // 6. Cache the result
    if (redis) {
      try {
        await redis.set(cacheKey, JSON.stringify(response), { ex: CACHE_TTL });
      } catch {
        // Non-critical
      }
    }

    return NextResponse.json({ success: true, ...response });
  } catch (error: unknown) {
    console.error("[Try Generate API] Error:", error);
    const message = error instanceof Error ? error.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
