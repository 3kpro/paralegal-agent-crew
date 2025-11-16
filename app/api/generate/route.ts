import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { decryptAPIKey } from "@/lib/encryption";
import { redis, withCache, cacheKeys } from "@/lib/redis";
import { rateLimit, RateLimitPresets } from "@/lib/rate-limit";
import { generateContentSchema } from "@/lib/validations";
import { ZodError } from "zod";

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
            details: error.issues.map((e: any) => ({
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

    const { topic, formats, preferredProvider, temperature, tone, length, audience, contentFocus, callToAction } = validatedData;

    // Set defaults for content controls
    const contentTemperature = temperature ?? 0.7;
    const contentTone = tone || "professional";
    const contentLength = length || "standard";
    const contentAudience = audience || "general";
    const contentContentFocus = contentFocus || "informative";
    const contentCallToAction = callToAction || "engage";

    // Generate cache key based on input parameters (include controls for unique cache)
    const cacheKey = `generate:${user.id}:${topic}:${formats.sort().join(",")}:${preferredProvider || "default"}:${contentTemperature}:${contentTone}:${contentLength}`;

    // Try to get from cache first
    const cachedResult = await withCache(cacheKey, CACHE_TTL, async () => {
      // Get user's configured AI tools
      const { data: userTools } = await supabase
        .from("user_ai_tools")
        .select(
          `
            *,
            ai_providers (
              id,
              provider_key,
              name,
              category
            )
          `,
        )
        .eq("user_id", user.id)
        .eq("is_active", true)
        .eq("test_status", "success");

      if (!userTools || userTools.length === 0) {
        throw new Error(
          "No AI tools configured. Please add an AI tool in Settings.",
        );
      }

      // Find preferred provider or use first available
      let selectedTool = userTools.find(
        (t) => (t.ai_providers as any).provider_key === preferredProvider,
      );
      if (!selectedTool) {
        selectedTool = userTools[0]; // Fallback to first available
      }

      const provider = selectedTool.ai_providers as any;
      const apiKey = selectedTool.api_key_encrypted
        ? decryptAPIKey(selectedTool.api_key_encrypted)
        : null;
      const config = selectedTool.configuration || {};

      // Generate content based on provider
      let content: any;
      let tokensUsed = 0;
      let estimatedCost = 0;

      try {
        switch (provider.provider_key) {
          case "openai": {
            const openaiResult = await generateWithOpenAI(
              apiKey!,
              topic,
              formats,
              config,
              contentTemperature,
              contentTone,
              contentLength,
            );
            content = openaiResult.content;
            tokensUsed = openaiResult.tokensUsed;
            estimatedCost = openaiResult.estimatedCost;
            break;
          }

          case "anthropic": {
            const claudeResult = await generateWithClaude(
              apiKey!,
              topic,
              formats,
              config,
              contentTemperature,
              contentTone,
              contentLength,
            );
            content = claudeResult.content;
            tokensUsed = claudeResult.tokensUsed;
            estimatedCost = claudeResult.estimatedCost;
            break;
          }

          case "google": {
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
            );
            content = geminiResult.content;
            tokensUsed = geminiResult.tokensUsed;
            estimatedCost = geminiResult.estimatedCost;
            break;
          }

          case "lmstudio": {
            const lmResult = await generateWithLMStudio(
              topic,
              formats,
              contentTemperature,
              contentTone,
              contentLength,
              contentAudience,
              contentContentFocus,
              contentCallToAction,
            );
            content = lmResult.content;
            tokensUsed = lmResult.tokensUsed;
            estimatedCost = 0; // Local is free
            break;
          }

          default:
            throw new Error(
              `Content generation not yet implemented for ${provider.name}`,
            );
        }

        // Track usage
        // 🚀 OPTIMIZATION: Fire-and-forget analytics tracking (non-blocking)
        try {
          const { error } = await supabase
            .from("ai_tool_usage")
            .insert({
              user_id: user.id,
              provider_id: provider.id,
              tokens_used: tokensUsed,
              estimated_cost: estimatedCost
            });
          
          if (error) {
            console.error("Analytics tracking error:", error);
          }
        } catch (err) {
          console.error("Analytics tracking error:", err);
        }

        // Increment usage counter
        await supabase
          .from("user_ai_tools")
          .update({ usage_count: selectedTool.usage_count + 1 })
          .eq("id", selectedTool.id);

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
      } catch (genError: any) {
        throw new Error(`Content generation failed: ${genError.message}`);
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
            provider: preferredProvider || "default",
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
  } catch (error: any) {
    console.error("Generate API error:", error);
    // Handle known error conditions with appropriate status codes
    if (error.message.includes("No AI tools configured")) {
      return NextResponse.json(
        {
          error: error.message,
          requiresSetup: true,
        },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ============================================================================
// GENERATION FUNCTIONS
// ============================================================================

async function generateWithOpenAI(
  apiKey: string,
  topic: string,
  formats: string[],
  config: any,
  temperature: number,
  tone: string,
  length: string,
) {
  const model = config.model || "gpt-4o-mini"; // 50x cheaper than gpt-4-turbo, still great quality
  const maxTokens = config.maxTokens || 2000;

  const content: any = {};
  let totalTokens = 0;

  // 🚀 OPTIMIZATION: Parallelize all format requests
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

  // Process results after all complete
  for (const result of results) {
    content[result.format] = formatContent(result.format, result.generatedText, topic);
    totalTokens += result.tokens;
  }

  const estimatedCost = (totalTokens / 1000) * 0.02;
  return { content, tokensUsed: totalTokens, estimatedCost };
}
async function generateWithClaude(
  apiKey: string,
  topic: string,
  formats: string[],
  config: any,
  temperature: number,
  tone: string,
  length: string,
) {
  const model = config.model || "claude-3-sonnet-20240229";
  const maxTokens = config.maxTokens || 2000;

  const content: any = {};
  let totalTokens = 0;

  // 🚀 OPTIMIZATION: Parallelize all format requests
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

  // Process results after all complete
  for (const result of results) {
    content[result.format] = formatContent(result.format, result.generatedText, topic);
    totalTokens += result.inputTokens + result.outputTokens;
  }

  const estimatedCost = (totalTokens / 1000000) * 9;
  return { content, tokensUsed: totalTokens, estimatedCost };
}
async function generateWithGemini(
  apiKey: string,
  topic: string,
  formats: string[],
  config: any,
  temperature: number,
  tone: string,
  length: string,
  audience: string,
  focus: string,
  cta: string,
) {
  const model = config.model || "gemini-pro";

  const content: any = {};
  let totalTokens = 0;

  // 🚀 OPTIMIZATION: Parallelize all format requests
  const results = await Promise.all(
    formats.map(async (format) => {
      const prompt = getPromptForFormat(format, topic, tone, length, audience, focus, cta);

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature,
              maxOutputTokens: 2000,
            },
          }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Gemini API error");
      }

      const data = await response.json();
      const generatedText = data.candidates[0].content.parts[0].text;

      return {
        format,
        generatedText,
        promptLength: prompt.length,
        responseLength: generatedText.length,
      };
    })
  );

  // Process results after all complete
  for (const result of results) {
    content[result.format] = formatContent(result.format, result.generatedText, topic);
    const estimatedTokens = (result.promptLength + result.responseLength) / 4;
    totalTokens += estimatedTokens;
  }

  const estimatedCost = ((totalTokens * 4) / 1000000) * 0.5;
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

  const content: any = {};
  let totalTokens = 0;

  // 🚀 OPTIMIZATION: Parallelize all format requests
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

  // Process results after all complete
  for (const result of results) {
    content[result.format] = formatContent(result.format, result.generatedText, topic);
    totalTokens += result.tokens;
  }

  return { content, tokensUsed: totalTokens, estimatedCost: 0 };
}
// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getPromptForFormat(
  format: string,
  topic: string,
  tone: string,
  length: string,
  audience: string = "general",
  focus: string = "informative", 
  cta: string = "engage",
): string {
  // Map tone to descriptive words
  const toneDescriptions: Record<string, string> = {
    professional: "professional and authoritative",
    casual: "casual and conversational",
    humorous: "humorous and entertaining",
    inspirational: "inspirational and motivational",
    educational: "educational and informative",
  };

  // Map audience to targeting
  const audienceDescriptions: Record<string, string> = {
    general: "general audience",
    professionals: "working professionals and business leaders",
    entrepreneurs: "entrepreneurs and startup founders", 
    creators: "content creators and influencers",
    students: "students and learners",
    techies: "tech enthusiasts and developers",
    gamers: "gamers and gaming enthusiasts",
    hobbyists: "hobbyists and enthusiasts",
  };

  // Map content focus to intent
  const focusDescriptions: Record<string, string> = {
    informative: "sharing valuable information about",
    discussion: "starting a meaningful discussion about", 
    opinion: "sharing your perspective on",
    news: "providing news and updates about",
    tips: "offering practical tips and advice about",
    story: "telling a compelling story about",
    walkthrough: "creating a step-by-step walkthrough or guide about",
  };

  // Map call to action types
  const ctaDescriptions: Record<string, string> = {
    engage: "encourage likes, comments, and engagement",
    share: "ask people to share and spread the word",
    comment: "ask specific questions to generate comments",
    follow: "invite people to follow for more content",
    learn: "direct people to learn more or take action",
    none: "end naturally without specific call-to-action",
  };

  // Map length to character/word counts
  const lengthLimits: Record<
    string,
    { twitter: number; other: string; words: string }
  > = {
    concise: { twitter: 150, other: "50-100", words: "50-75 words" },
    standard: { twitter: 250, other: "150-250", words: "100-150 words" },
    detailed: { twitter: 280, other: "300-500", words: "200-300 words" },
  };

  const toneDesc = toneDescriptions[tone] || toneDescriptions.professional;
  const limits = lengthLimits[length] || lengthLimits.standard;
  const audienceDesc = audienceDescriptions[audience] || audienceDescriptions.general;
  const focusDesc = focusDescriptions[focus] || focusDescriptions.informative;
  const ctaDesc = ctaDescriptions[cta] || ctaDescriptions.engage;

  const prompts: Record<string, string> = {
    twitter: `Create a ${toneDesc} Twitter/X post about "${topic}". Requirements:
- STRICT LIMIT: Maximum ${limits.twitter} characters total (including spaces and hashtags)
- Include 2-3 relevant hashtags (these count toward the ${limits.twitter} character limit)
- ${tone === "humorous" ? "Be witty and clever" : tone === "inspirational" ? "Be uplifting and motivational" : "Be engaging and compelling"}
- Include a call-to-action or thought-provoking question
- ${tone === "casual" ? "Use casual language" : tone === "professional" ? "Maintain professional language" : "Match the tone naturally"}
- This should be ready-to-post content that can be published immediately
- CRITICAL: The entire post MUST be under ${limits.twitter} characters

Return only the tweet text that can be posted directly, nothing else.`,

    linkedin: `Create a ${toneDesc} LinkedIn post about "${topic}". Requirements:
- STRICT LIMIT: Maximum 3000 characters (LinkedIn's limit)
- ${limits.words}
- Include relevant hashtags (3-5)
- Structure: Attention-grabbing hook → Valuable insight → Clear call-to-action
- Add paragraph breaks for readability
- ${tone === "professional" ? "Maintain executive-level professionalism" : tone === "casual" ? "Be approachable and relatable" : tone === "educational" ? "Provide actionable insights" : tone === "inspirational" ? "Include a powerful message" : "Be engaging"}
- This should be publishable content ready to post directly to LinkedIn

Return only the LinkedIn post text that can be posted directly, nothing else.`,

    email: `Create a ${toneDesc} email about "${topic}". Requirements:
- Subject line: Compelling and clear (50 chars max)
- Body: ${limits.words}
- Clear call-to-action at the end
- ${tone === "professional" ? "Professional greeting and sign-off" : tone === "casual" ? "Friendly greeting and warm sign-off" : tone === "humorous" ? "Light-hearted but appropriate" : "Appropriate greeting and sign-off"}

Return in format:
SUBJECT: [subject line]
BODY: [email body]`,

    facebook: `Create a ${toneDesc} Facebook post about "${topic}". Requirements:
- STRICT LIMIT: Maximum 63,206 characters (but keep it under ${limits.other} for engagement)
- ${limits.words}
- Include relevant hashtags (2-4)
- ${tone === "humorous" ? "Be entertaining and shareable" : tone === "inspirational" ? "Be uplifting and share-worthy" : tone === "casual" ? "Be conversational and relatable" : "Be engaging"}
- Start with an attention-grabbing hook
- Include a question or call-to-action
- This should be publishable content ready to post directly to Facebook

Return only the Facebook post text that can be posted directly, nothing else.`,

    instagram: `Create a ${toneDesc} Instagram caption for ${audienceDesc} about "${topic}". 

Purpose: ${focusDesc} "${topic}" 
Audience: ${audienceDesc}
Goal: ${ctaDesc}

Requirements:
- STRICT LIMIT: Maximum 2,200 characters (Instagram's limit)
- ${limits.words}
- Write ONLY about the topic "${topic}" - no product promotion or service mentions
- ${focusDesc} the topic itself, not any company or product
- Include relevant hashtags (5-10) related to "${topic}"
- First line must immediately grab attention about "${topic}"
- ${tone === "inspirational" ? "Be motivational about the topic" : tone === "humorous" ? "Be funny about the topic" : tone === "educational" ? "Teach something about the topic" : tone === "casual" ? "Be conversational about the topic" : "Be professional about the topic"}
- ${tone === "casual" || tone === "humorous" ? "Include emojis naturally" : "Use emojis sparingly if appropriate"}
- End goal: ${ctaDesc}
- FOCUS: The content should be about "${topic}" itself, not about any services, products, or companies

Return only the Instagram caption that can be posted directly, nothing else.`,

    reddit: `Create a ${toneDesc} Reddit post about "${topic}". Requirements:
- STRICT LIMIT: Maximum 40,000 characters (Reddit's limit for text posts)
- ${limits.words}
- ${tone === "casual" ? "Use authentic, conversational Reddit voice" : tone === "educational" ? "Provide detailed, well-researched information" : tone === "humorous" ? "Be clever and witty" : "Be genuine and valuable"}
- No hashtags (Reddit doesn't use them)
- Structure: Engaging title → valuable content → discussion prompt
- Be authentic and avoid corporate speak
- This should be publishable content ready to post directly to Reddit

Return only the Reddit post text that can be posted directly, nothing else.`,

    tiktok: `Create a ${toneDesc} TikTok caption/text post about "${topic}". Requirements:
- STRICT LIMIT: Maximum 2,200 characters (TikTok's caption limit)
- ${limits.words} for caption text
- ${tone === "humorous" ? "Be entertaining and trendy" : tone === "educational" ? "Make it quick and digestible" : tone === "inspirational" ? "Be energetic and motivational" : "Be attention-grabbing"}
- Start with an engaging hook
- Include relevant hashtags (4-6)
- Call-to-action at end (like, share, follow)
- This should be publishable text content, not a video script

Return only the TikTok caption text that can be posted directly, nothing else.`,
  };

  return prompts[format] || prompts.twitter;
}

function formatContent(
  format: string,
  generatedText: string,
  topic: string,
): any {
  const cleaned = generatedText.trim();

  switch (format) {
    case "twitter": {
      const hashtags = extractHashtags(cleaned);
      return {
        content: cleaned,
        characterCount: cleaned.length,
        hashtags,
        platform: "twitter",
      };
    }

    case "linkedin":
      return {
        content: cleaned,
        hashtags: extractHashtags(cleaned),
        platform: "linkedin",
      };

    case "email": {
      const subjectMatch = cleaned.match(/SUBJECT:\s*(.+?)(?:\n|$)/i);
      const bodyMatch = cleaned.match(/BODY:\s*([\s\S]+)/i);
      return {
        subject: subjectMatch ? subjectMatch[1].trim() : `About ${topic}`,
        content: bodyMatch ? bodyMatch[1].trim() : cleaned,
        platform: "email",
      };
    }

    case "facebook":
      return {
        content: cleaned,
        hashtags: extractHashtags(cleaned),
        platform: "facebook",
      };

    case "instagram":
      return {
        content: cleaned,
        hashtags: extractHashtags(cleaned),
        platform: "instagram",
      };

    case "tiktok":
      return {
        content: cleaned,
        hashtags: extractHashtags(cleaned),
        characterCount: cleaned.length,
        platform: "tiktok",
      };

    case "reddit":
      return {
        content: cleaned,
        platform: "reddit",
      };

    default:
      return {
        content: cleaned,
        hashtags: extractHashtags(cleaned),
        platform: format,
      };
  }
}

function extractHashtags(text: string): string[] {
  const hashtagRegex = /#[\w]+/g;
  const matches = text.match(hashtagRegex) || [];
  return Array.from(new Set(matches));
}










