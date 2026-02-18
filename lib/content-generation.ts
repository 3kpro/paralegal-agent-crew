/**
 * Shared Content Generation Logic
 *
 * Extracted from app/api/generate/route.ts to be reused by both
 * the authenticated generate API and the ungated /try free wedge.
 *
 * Contains: prompt templates, content formatting, hallucination
 * sanitization, and the core Gemini generation function.
 */

import { GeneratedContent } from "@/app/(portal)/campaigns/create/types";
import { getGeminiModel } from "@/lib/gemini";

// ============================================================================
// CONTENT TYPE INTERFACES
// ============================================================================

export interface TwitterContent {
  content: string;
  characterCount: number;
  hashtags: string[];
  platform: "twitter";
}
export interface LinkedInContent {
  content: string;
  hashtags: string[];
  platform: "linkedin";
}
export interface EmailContent {
  subject: string;
  content: string;
  platform: "email";
}
export interface FacebookContent {
  content: string;
  hashtags: string[];
  platform: "facebook";
}
export interface InstagramContent {
  content: string;
  hashtags: string[];
  platform: "instagram";
}
export interface TikTokContent {
  content: string;
  hashtags: string[];
  characterCount: number;
  platform: "tiktok";
}
export interface RedditContent {
  content: string;
  platform: "reddit";
}
export interface DefaultContent {
  content: string;
  hashtags: string[];
  platform: string;
}

export type FormattedContent =
  | TwitterContent
  | LinkedInContent
  | EmailContent
  | FacebookContent
  | InstagramContent
  | TikTokContent
  | RedditContent
  | DefaultContent;

// ============================================================================
// ANTI-HALLUCINATION
// ============================================================================

const ANTI_HALLUCINATION_RULES = `
CRITICAL CONTENT RULES (MUST FOLLOW):
- NEVER reference articles, blog posts, guides, or content that does not exist
- NEVER include placeholder text like "[Insert Link Here]", "[Your Name]", or "[Company]"
- NEVER say "Click link in bio", "Check out my latest article", or "Read the full guide"
- NEVER promise upcoming content ("Stay tuned for...", "Coming soon...")
- The post itself IS the content — deliver ALL value directly IN the post
- Only mention URLs if one is explicitly provided in the CONTEXT section below
- Content must be SELF-CONTAINED and immediately valuable to readers
- Do NOT invent product names, company names, or statistics not provided in context
`;

const HALLUCINATION_PATTERNS = [
  /\[insert link.*?\]/gi,
  /\[your (?:name|company|brand|website|url).*?\]/gi,
  /\[(?:link|url|website).*?\]/gi,
  /click (?:the )?link (?:in (?:my )?bio|below|here)/gi,
  /(?:read|check out|see) (?:my|the|our) (?:latest|full|new|recent) (?:article|guide|blog(?: post)?|post|piece)/gi,
  /stay tuned for (?:my|the|our|more)/gi,
  /link in (?:my )?bio/gi,
  /swipe up to/gi,
];

/**
 * Remove common AI hallucination patterns from generated content
 */
export function sanitizeHallucinations(text: string): string {
  let result = text;
  for (const pattern of HALLUCINATION_PATTERNS) {
    result = result.replace(pattern, "").trim();
  }
  // Clean up double spaces/newlines left after removal
  result = result.replace(/  +/g, " ").replace(/\n{3,}/g, "\n\n");
  return result;
}

// ============================================================================
// PROMPT GENERATION
// ============================================================================

const toneDescriptions: Record<string, string> = {
  professional: "professional and authoritative",
  casual: "casual and conversational",
  humorous: "humorous and entertaining",
  inspirational: "inspirational and motivational",
  educational: "educational and informative",
};

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

const focusDescriptions: Record<string, string> = {
  informative: "sharing valuable information about",
  discussion: "starting a meaningful discussion about",
  opinion: "sharing your perspective on",
  news: "providing news and updates about",
  tips: "offering practical tips and advice about",
  story: "telling a compelling story about",
  walkthrough: "creating a step-by-step walkthrough or guide about",
};

const ctaDescriptions: Record<string, string> = {
  engage: "encourage likes, comments, and engagement",
  share: "ask people to share and spread the word",
  comment: "ask specific questions to generate comments",
  follow: "invite people to follow for more content",
  learn: "direct people to learn more or take action",
  none: "end naturally without specific call-to-action",
};

const lengthLimits: Record<string, { twitter: number; other: string; words: string }> = {
  concise: { twitter: 150, other: "50-100", words: "50-75 words" },
  standard: { twitter: 250, other: "150-250", words: "100-150 words" },
  detailed: { twitter: 280, other: "300-500", words: "200-300 words" },
};

export function getPromptForFormat(
  format: string,
  topic: string,
  tone: string,
  length: string,
  audience: string = "general",
  focus: string = "informative",
  cta: string = "engage",
  promoteData?: any,
): string {
  const toneDesc = toneDescriptions[tone] || toneDescriptions.professional;
  const limits = lengthLimits[length] || lengthLimits.standard;
  const audienceDesc = audienceDescriptions[audience] || audienceDescriptions.general;
  const focusDesc = focusDescriptions[focus] || focusDescriptions.informative;
  const ctaDesc = ctaDescriptions[cta] || ctaDescriptions.engage;

  const promoteContext = promoteData
    ? `
CONTEXT - USE ONLY THIS INFORMATION (do not invent additional details):
Name: ${promoteData.productName}
Type: ${promoteData.productType}
Description: ${promoteData.description}
Key Features: ${promoteData.keyFeatures?.join(", ") || "Not provided"}
Unique Selling Points: ${promoteData.uniqueSellingPoints?.join(", ") || "Not provided"}
Target Audience: ${promoteData.targetAudience}
${promoteData.websiteUrl ? `Website: ${promoteData.websiteUrl}` : "NO URL PROVIDED — DO NOT MENTION ANY LINKS OR WEBSITES"}
${promoteData.driveLink ? `Drive Link: ${promoteData.driveLink}` : ""}
`
    : "";

  const promptSubject = promoteData ? `"${promoteData.productName}"` : `"${topic}"`;
  const actionVerb = promoteData ? "promoting" : "about";

  const prompts: Record<string, string> = {
    twitter: `Create a ${toneDesc} Twitter/X post ${actionVerb} ${promptSubject}.
${promoteContext}${ANTI_HALLUCINATION_RULES}
Requirements:
- STRICT LIMIT: Maximum ${limits.twitter} characters total (including spaces and hashtags)
- Include 2-3 relevant hashtags (these count toward the ${limits.twitter} character limit)
- ${tone === "humorous" ? "Be witty and clever" : tone === "inspirational" ? "Be uplifting and motivational" : "Be engaging and compelling"}
- Include a call-to-action or thought-provoking question
- ${tone === "casual" ? "Use casual language" : tone === "professional" ? "Maintain professional language" : "Match the tone naturally"}
- This should be ready-to-post content that can be published immediately
- CRITICAL: The entire post MUST be under ${limits.twitter} characters

Return only the tweet text that can be posted directly, nothing else.`,

    linkedin: `Create a ${toneDesc} LinkedIn post ${actionVerb} ${promptSubject}.
${promoteContext}${ANTI_HALLUCINATION_RULES}
Requirements:
- STRICT LIMIT: Maximum 3000 characters (LinkedIn's limit)
- ${limits.words}
- Include relevant hashtags (3-5)
- Structure: Attention-grabbing hook → Valuable insight/Problem → Solution (${promoteData?.productName || "Topic"}) → Clear call-to-action
- Add paragraph breaks for readability
- ${tone === "professional" ? "Maintain executive-level professionalism" : tone === "casual" ? "Be approachable and relatable" : tone === "educational" ? "Provide actionable insights" : tone === "inspirational" ? "Include a powerful message" : "Be engaging"}
- This should be publishable content ready to post directly to LinkedIn

Return only the LinkedIn post text that can be posted directly, nothing else.`,

    email: `Create a ${toneDesc} promotional email ${actionVerb} ${promptSubject}.
${promoteContext}${ANTI_HALLUCINATION_RULES}
Requirements:
- Subject line: Compelling and clear (50 chars max)
- Body: ${limits.words}
- Clear call-to-action at the end (Link to: ${promoteData?.websiteUrl || "website"})
- ${tone === "professional" ? "Professional greeting and sign-off" : tone === "casual" ? "Friendly greeting and warm sign-off" : tone === "humorous" ? "Light-hearted but appropriate" : "Appropriate greeting and sign-off"}

Return in format:
SUBJECT: [subject line]
BODY: [email body]`,

    facebook: `Create a ${toneDesc} Facebook post ${actionVerb} ${promptSubject}.
${promoteContext}${ANTI_HALLUCINATION_RULES}
Requirements:
- STRICT LIMIT: Maximum 63,206 characters (but keep it under ${limits.other} for engagement)
- ${limits.words}
- Include relevant hashtags (2-4)
- ${tone === "humorous" ? "Be entertaining and shareable" : tone === "inspirational" ? "Be uplifting and share-worthy" : tone === "casual" ? "Be conversational and relatable" : "Be engaging"}
- Start with an attention-grabbing hook
- Include a question or call-to-action
- This should be publishable content ready to post directly to Facebook

Return only the Facebook post text that can be posted directly, nothing else.`,

    instagram: `Create a ${toneDesc} Instagram caption for ${audienceDesc} ${actionVerb} ${promptSubject}.
${promoteContext}${ANTI_HALLUCINATION_RULES}
Purpose: ${focusDesc} "${topic}"
Audience: ${audienceDesc}
Goal: ${ctaDesc}

Requirements:
- STRICT LIMIT: Maximum 2,200 characters (Instagram's limit)
- ${limits.words}
- ${focusDesc} the topic itself
- Include relevant hashtags (5-10)
- First line must immediately grab attention
- ${tone === "inspirational" ? "Be motivational" : tone === "humorous" ? "Be funny" : tone === "educational" ? "Teach something" : tone === "casual" ? "Be conversational" : "Be professional"}
- ${tone === "casual" || tone === "humorous" ? "Include emojis naturally" : "Use emojis sparingly if appropriate"}
- End goal: ${ctaDesc}

Return only the Instagram caption that can be posted directly, nothing else.`,

    reddit: `Create a ${toneDesc} Reddit post ${actionVerb} ${promptSubject}.
${promoteContext}${ANTI_HALLUCINATION_RULES}
Requirements:
- STRICT LIMIT: Maximum 40,000 characters (Reddit's limit for text posts)
- ${limits.words}
- ${tone === "casual" ? "Use authentic, conversational Reddit voice" : tone === "educational" ? "Provide detailed, well-researched information" : tone === "humorous" ? "Be clever and witty" : "Be genuine and valuable"}
- No hashtags (Reddit doesn't use them)
- Structure: Engaging title → valuable content → discussion prompt
- Be authentic and avoid corporate speak (Avoid "Please buy", "Check this out" unless native to subreddit style)
- This should be publishable content ready to post directly to Reddit

Return only the Reddit post text that can be posted directly, nothing else.`,

    tiktok: `Create a ${toneDesc} TikTok caption/text post ${actionVerb} ${promptSubject}.
${promoteContext}${ANTI_HALLUCINATION_RULES}
Requirements:
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

// ============================================================================
// CONTENT FORMATTING
// ============================================================================

export function extractHashtags(text: string): string[] {
  const hashtagRegex = /#[\w]+/g;
  const matches = text.match(hashtagRegex) || [];
  return Array.from(new Set(matches));
}

export function formatContent(
  format: string,
  generatedText: string,
  topic: string,
): FormattedContent {
  const cleaned = sanitizeHallucinations(generatedText.trim());

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

// ============================================================================
// GEMINI GENERATION
// ============================================================================

interface GeminiConfig {
  model?: string;
}

export async function generateWithGemini(
  apiKey: string,
  topic: string,
  formats: string[],
  config: GeminiConfig,
  temperature: number,
  tone: string,
  length: string,
  audience: string,
  focus: string,
  cta: string,
  promoteData?: any,
  perPlatformControls?: Record<string, any>,
) {
  const modelName = config.model || "gemini-2.0-flash";
  const geminiModel = getGeminiModel(modelName);

  if (!geminiModel) {
    throw new Error("Failed to initialize Gemini model via Vertex AI");
  }

  const content: GeneratedContent = {};
  let totalTokens = 0;

  const results = await Promise.all(
    formats.map(async (format) => {
      const overrides = perPlatformControls?.[format] || {};
      const formatTone = overrides.tone || tone;
      const formatLength = overrides.length || length;
      const formatAudience = overrides.audience || audience;
      const formatFocus = overrides.contentFocus || focus;
      const formatCta = overrides.callToAction || cta;

      const prompt = getPromptForFormat(
        format, topic, formatTone, formatLength,
        formatAudience, formatFocus, formatCta, promoteData,
      );

      try {
        const result = await geminiModel.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature,
            maxOutputTokens: 2000,
          },
        });

        const candidates = result.response.candidates;
        const generatedText = candidates?.[0]?.content?.parts?.[0]?.text;

        if (!generatedText) {
          throw new Error("No text content in Vertex AI response");
        }

        return {
          format,
          generatedText,
          promptLength: prompt.length,
          responseLength: generatedText.length,
        };
      } catch (error: any) {
        throw new Error(error.message || "Gemini Vertex AI error");
      }
    }),
  );

  for (const result of results) {
    content[result.format] = formatContent(result.format, result.generatedText, topic);
    const estimatedTokens = (result.promptLength + result.responseLength) / 4;
    totalTokens += estimatedTokens;
  }

  const estimatedCost = ((totalTokens * 4) / 1000000) * 0.5;
  return { content, tokensUsed: totalTokens, estimatedCost };
}
