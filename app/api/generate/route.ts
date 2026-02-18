import { GeneratedContent } from "@/app/(portal)/campaigns/create/types";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { decryptAPIKey } from "@/lib/encryption";
import { redis, withCache, cacheKeys } from "@/lib/redis";
import { rateLimit, RateLimitPresets } from "@/lib/rate-limit";
import { generateContentSchema } from "@/lib/validations";
import { ZodError, ZodIssue } from "zod";
import { getGeminiModel } from "@/lib/gemini";
import {
  generateWithGemini,
  getPromptForFormat,
  formatContent,
  sanitizeHallucinations,
  extractHashtags,
} from "@/lib/content-generation";

const CACHE_TTL = 900; // 15 minutes in seconds

export async function POST(request: Request) {
  try {
    // Apply rate limiting (10 requests per minute for content generation)
    const rateLimitResult = await rateLimit(request, RateLimitPresets.GENERATION);
    if (rateLimitResult) return rateLimitResult;

    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check daily usage limits
    const { data: canGenerate, error: limitError } = await supabase.rpc(
      "can_user_generate",
      { p_user_id: user.id }
    );

    if (limitError) {
      console.error("[Generate API] Error checking usage limits:", limitError);
    }

    if (!canGenerate) {
      // Get usage details for error message
      const { data: usageData } = await supabase.rpc("get_user_daily_usage", {
        p_user_id: user.id,
      });
      const { data: tierData } = await supabase.rpc("get_user_tier_limits", {
        p_user_id: user.id,
      });

      const usage = usageData?.[0] || { generations_count: 0 };
      const limit = tierData?.[0]?.daily_generations_limit || 3;

      return NextResponse.json(
        {
          error: "Daily generation limit reached",
          message: `You've used ${usage.generations_count} of ${limit} daily generations. Upgrade to Pro for 25 daily generations or Premium for unlimited access.`,
          limit_reached: true,
          current_usage: usage.generations_count,
          daily_limit: limit,
          upgrade_url: "/settings?tab=membership",
        },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    console.log('[Generate API] Request body:', JSON.stringify(body, null, 2));

    let validatedData;
    try {
      validatedData = generateContentSchema.parse(body);
    } catch (error) {
      if (error instanceof ZodError) {
        console.error('[Generate API] Zod validation failed:', JSON.stringify(error.issues, null, 2));
        return NextResponse.json(
          {
            error: "Validation failed",
            details: error.issues.map((e: ZodIssue) => ({
              field: e.path.join('.'),
              message: e.message
            }))
          },
          { status: 400 }
        );
      }
      console.error('[Generate API] Validation error:', error);
      return NextResponse.json(
        { error: "Invalid request data", details: String(error) },
        { status: 400 }
      );
    }

    const { topic, formats, preferredProvider, temperature, tone, length, audience, contentFocus, callToAction, promoteData, perPlatformControls } = validatedData;

    // Set defaults for content controls
    const contentTemperature = temperature ?? 0.7;
    const contentTone = tone || "professional";
    const contentLength = length || "standard";
    const contentAudience = audience || "general";
    const contentContentFocus = contentFocus || "informative";
    const contentCallToAction = callToAction || "engage";

    // Generate cache key based on input parameters (include controls for unique cache)
    const promoteHash = promoteData ? JSON.stringify(promoteData) : "";
    const cacheKey = `generate:${user.id}:${topic}:${formats.sort().join(",")}:${preferredProvider || "default"}:${contentTemperature}:${contentTone}:${contentLength}:${promoteHash}`;

    // Try to get from cache first
    const cachedResult = await withCache(cacheKey, CACHE_TTL, async () => {
      // Use global environment API keys (no user setup required)
      const GEMINI_API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

      if (!GEMINI_API_KEY) {
        throw new Error("System error: AI service not configured");
      }

      // Use Gemini as the default provider for all users
      const apiKey = GEMINI_API_KEY;
      const provider = { provider_key: "google", name: "Google Gemini" };
      const config = {};

      // Generate content using Gemini (global API key)
      let content: GeneratedContent;
      let tokensUsed = 0;
      let estimatedCost = 0;

      try {
        const geminiResult = await generateWithGemini(
          apiKey!,
          topic,
          formats,
          config,
          contentTemperature,
          contentTone,
          contentLength,
          contentAudience,
          contentContentFocus,
          contentCallToAction,
          promoteData,
          perPlatformControls,
        );
        content = geminiResult.content;
        tokensUsed = geminiResult.tokensUsed;
        estimatedCost = geminiResult.estimatedCost;

        return {
          success: true,
          content,
          metadata: {
            provider: provider.name,
            tokensUsed,
            estimatedCost,
            cached: false,
          },
        };
      } catch (genError: unknown) {
        const message = genError instanceof Error ? genError.message : String(genError);
        throw new Error(`Content generation failed: ${message}`);
      }
    });

    // Track content generation event
    // 🚀 OPTIMIZATION: Fire-and-forget analytics event (non-blocking)
    try {
      const { error: analyticsError } = await supabase
        .from("analytics_events")
        .insert({
          user_id: user.id,
          event_type: "content_generated",
          event_category: "content",
          event_data: {
            topic,
            formats,
            provider: "gemini",
            success: cachedResult.success,
            cached: cachedResult.metadata?.cached || false
          }
        });

      if (analyticsError) {
        console.error("Analytics event error:", analyticsError);
      }
    } catch (err) {
      console.error("Analytics event error:", err);
    }

    // Increment daily usage metric
    if (cachedResult.success) {
      try {
        const { error: rpcError } = await supabase.rpc("increment_usage_metric", {
          p_user_id: user.id,
          p_metric_type: "content_generated",
          p_increment: 1
        });

        if (rpcError) {
          console.error("Usage metric error:", rpcError);
        }

        // Increment daily generation count for tier limits
        const { error: dailyError } = await supabase.rpc("increment_daily_usage", {
          p_user_id: user.id,
          p_tokens: 0 // Token counting can be added later if needed
        });

        if (dailyError) {
          console.error("Daily usage increment error:", dailyError);
        }
      } catch (err) {
        console.error("Usage metric error:", err);
      }
    }

    // Add cache status to response
    return NextResponse.json({
      ...cachedResult,
      metadata: {
        ...cachedResult.metadata,
        cached: true,
      },
    });
  } catch (error: unknown) {
    console.error("[Generate API] Fatal error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    const stack = error instanceof Error ? error.stack : undefined;
    const cause = error instanceof Error ? (error as any).cause : undefined;
    const name = error instanceof Error ? error.name : typeof error;

    console.error("[Generate API] Error message:", message);
    console.error("[Generate API] Error stack:", stack);
    console.error("[Generate API] Error cause:", cause);

    // Handle known error conditions with appropriate status codes
    if (message?.includes("System error: AI service not configured")) {
      return NextResponse.json(
        {
          error: "AI service temporarily unavailable. Please try again.",
          requiresSetup: false,
        },
        { status: 503 },
      );
    }
    return NextResponse.json({
      error: message,
      errorType: name,
      details: String(error),
    }, { status: 500 });
  }
}

// ============================================================================
// LEGACY GENERATION FUNCTIONS (OpenAI, Claude, LM Studio)
// Primary generation (Gemini) is now in lib/content-generation.ts
// ============================================================================

interface OpenAIConfig {
  model?: string;
  maxTokens?: number;
}
async function generateWithOpenAI(
  apiKey: string,
  topic: string,
  formats: string[],
  config: OpenAIConfig,
  temperature: number,
  tone: string,
  length: string,
) {
  const model = config.model || "gpt-4o-mini";
  const maxTokens = config.maxTokens || 2000;

  const content: GeneratedContent = {};
  let totalTokens = 0;

  const results = await Promise.all(
    formats.map(async (format) => {
      const prompt = getPromptForFormat(format, topic, tone, length);

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }],
          temperature,
          max_tokens: maxTokens,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "OpenAI API error");
      }

      const data = await response.json();
      const generatedText = data.choices[0].message.content;

      return {
        format,
        generatedText,
        tokens: data.usage.total_tokens,
      };
    })
  );

  for (const result of results) {
    content[result.format] = formatContent(result.format, result.generatedText, topic);
    totalTokens += result.tokens;
  }

  const estimatedCost = (totalTokens / 1000) * 0.02;
  return { content, tokensUsed: totalTokens, estimatedCost };
}

interface ClaudeConfig {
  model?: string;
  maxTokens?: number;
}
async function generateWithClaude(
  apiKey: string,
  topic: string,
  formats: string[],
  config: ClaudeConfig,
  temperature: number,
  tone: string,
  length: string,
) {
  const model = config.model || "claude-3-sonnet-20240229";
  const maxTokens = config.maxTokens || 2000;

  const content: GeneratedContent = {};
  let totalTokens = 0;

  const results = await Promise.all(
    formats.map(async (format) => {
      const prompt = getPromptForFormat(format, topic, tone, length);

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }],
          temperature,
          max_tokens: maxTokens,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Claude API error");
      }

      const data = await response.json();
      const generatedText = data.content[0].text;

      return {
        format,
        generatedText,
        inputTokens: data.usage.input_tokens,
        outputTokens: data.usage.output_tokens,
      };
    })
  );

  for (const result of results) {
    content[result.format] = formatContent(result.format, result.generatedText, topic);
    totalTokens += result.inputTokens + result.outputTokens;
  }

  const estimatedCost = (totalTokens / 1000000) * 9;
  return { content, tokensUsed: totalTokens, estimatedCost };
}

async function generateWithLMStudio(
  topic: string,
  formats: string[],
  temperature: number,
  tone: string,
  length: string,
  audience: string,
  focus: string,
  cta: string,
) {
  const endpoint = process.env.API_GATEWAY_URL
    ? `${process.env.API_GATEWAY_URL}/generate`
    : "http://10.10.10.105:1234/v1/chat/completions";

  const content: GeneratedContent = {};
  let totalTokens = 0;

  const results = await Promise.all(
    formats.map(async (format) => {
      const prompt = getPromptForFormat(format, topic, tone, length, audience, focus, cta);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(process.env.API_GATEWAY_URL
            ? { "ngrok-skip-browser-warning": "true" }
            : {}),
        },
        body: JSON.stringify({
          model: "local-model",
          messages: [{ role: "user", content: prompt }],
          temperature,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error(`LM Studio error: ${response.statusText}`);
      }

      const data = await response.json();
      const generatedText = data.choices[0].message.content;

      return {
        format,
        generatedText,
        tokens: data.usage?.total_tokens || 0,
      };
    })
  );

  for (const result of results) {
    content[result.format] = formatContent(result.format, result.generatedText, topic);
    totalTokens += result.tokens;
  }

  return { content, tokensUsed: totalTokens, estimatedCost: 0 };
}








