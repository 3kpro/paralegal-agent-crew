import { z } from "zod";

// Campaign validation schemas
export const campaignNameSchema = z.object({
  name: z
    .string()
    .min(3, "Campaign name must be at least 3 characters")
    .max(100, "Campaign name must be less than 100 characters")
    .regex(/^[a-zA-Z0-9\s-_]+$/, "Campaign name can only contain letters, numbers, spaces, hyphens, and underscores"),
});

export const platformSelectionSchema = z.object({
  platforms: z
    .array(z.enum(["twitter", "linkedin", "facebook", "instagram", "tiktok", "reddit"]))
    .min(1, "Select at least one platform")
    .max(6, "Maximum 6 platforms allowed"),
});

export const trendSearchSchema = z.object({
  query: z
    .string()
    .min(2, "Search query must be at least 2 characters")
    .max(200, "Search query too long"),
  source: z.enum(["mixed", "twitter", "google", "reddit"]).default("mixed"),
});

export const contentControlsSchema = z.object({
  temperature: z.number().min(0).max(1).default(0.7),
  tone: z.enum(["professional", "casual", "enthusiastic", "informative", "humorous"]).default("professional"),
  length: z.enum(["short", "medium", "long"]).default("medium"),
  includeHashtags: z.boolean().default(true),
  includeEmojis: z.boolean().default(false),
});

export const generateContentSchema = z.object({
  topic: z.string().min(1, "Topic is required").max(500, "Topic too long"),
  formats: z.array(z.enum(["twitter", "linkedin", "facebook", "instagram", "tiktok", "reddit", "email"])).min(1, "Select at least one format"),
  preferredProvider: z.enum(["openai", "anthropic", "google", "lmstudio"]).optional(),
  temperature: z.number().min(0).max(1).optional(),
  tone: z.enum(["professional", "casual", "friendly", "humorous", "inspirational", "educational"]).optional(),
  length: z.enum(["concise", "standard", "detailed"]).optional(),
  audience: z.enum(["general", "professionals", "entrepreneurs", "creators", "students", "techies", "gamers", "hobbyists"]).optional(),
  contentFocus: z.enum(["informative", "discussion", "opinion", "news", "tips", "story", "walkthrough"]).optional(),
  callToAction: z.enum(["engage", "share", "comment", "follow", "learn", "none"]).optional(),
});

export const saveCampaignSchema = z.object({
  name: campaignNameSchema.shape.name,
  targetPlatforms: platformSelectionSchema.shape.platforms,
  status: z.enum(["draft", "scheduled", "published"]),
  content: z.record(z.string(), z.string()),
  aiProvider: z.string(),
  tone: contentControlsSchema.shape.tone,
  publishNow: z.boolean().default(false),
});

// Profile validation schemas
export const profileUpdateSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  company_name: z.string().max(100).optional(),
  avatar_url: z.string().url().optional().or(z.literal("")),
  company_logo_url: z.string().url().optional().or(z.literal("")),
  bio: z.string().max(500).optional(),
  website: z.string().url().optional().or(z.literal("")),
  timezone: z.string().default("America/New_York"),
  language: z.string().default("en-US"),
  twitter_handle: z.string().max(15).optional(),
  linkedin_url: z.string().url().optional().or(z.literal("")),
  facebook_url: z.string().url().optional().or(z.literal("")),
  instagram_handle: z.string().max(30).optional(),
  tiktok_handle: z.string().max(24).optional(),
  reddit_handle: z.string().max(20).optional(),
});

// API Key validation
export const apiKeySchema = z.object({
  provider: z.enum(["openai", "anthropic", "google", "xai", "elevenlabs"]),
  apiKey: z.string().min(10, "API key is too short"),
  configuration: z.record(z.string(), z.any()).optional(),
});

// Auth validation
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Social account connection
export const connectSocialAccountSchema = z.object({
  platform: z.enum(["twitter", "linkedin", "facebook", "instagram", "tiktok", "reddit"]),
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  expiresAt: z.string().datetime().optional(),
  platformUsername: z.string(),
  metadata: z.record(z.string(), z.any()).optional(),
});

// Scheduled post validation
export const schedulePostSchema = z.object({
  campaignId: z.string().uuid(),
  platform: z.enum(["twitter", "linkedin", "facebook", "instagram", "tiktok", "reddit"]),
  content: z.string().min(1).max(5000),
  scheduledAt: z.string().datetime(),
  mediaUrls: z.array(z.string().url()).optional(),
});

// Type exports
export type CampaignNameInput = z.infer<typeof campaignNameSchema>;
export type PlatformSelection = z.infer<typeof platformSelectionSchema>;
export type TrendSearch = z.infer<typeof trendSearchSchema>;
export type ContentControls = z.infer<typeof contentControlsSchema>;
export type GenerateContentInput = z.infer<typeof generateContentSchema>;
export type SaveCampaignInput = z.infer<typeof saveCampaignSchema>;
export type ProfileUpdate = z.infer<typeof profileUpdateSchema>;
export type ApiKeyInput = z.infer<typeof apiKeySchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ConnectSocialAccount = z.infer<typeof connectSocialAccountSchema>;
export type SchedulePostInput = z.infer<typeof schedulePostSchema>;
