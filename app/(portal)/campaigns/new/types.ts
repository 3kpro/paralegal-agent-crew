/**
 * TypeScript types and interfaces for the campaign creation flow
 */

import { LucideIcon } from "lucide-react";

/**
 * Platform configuration
 */
export interface Platform {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
}

/**
 * Control option for select/radio buttons (Tone, Length, Audience, Focus, CTA)
 */
export interface ControlOption {
  id: string;
  label: string;
}

/**
 * Step configuration for progress indicator
 */
export interface StepConfig {
  number: number;
  icon: LucideIcon;
}

/**
 * Toast notification state
 */
export interface ToastState {
  show: boolean;
  message: string;
  type: "success" | "error";
}

/**
 * Trend from API
 */
export interface Trend {
  id?: string;
  title: string;
}

/**
 * Generated content for a single platform
 */
export interface GeneratedPlatformContent {
  content: string;
  hashtags?: string[];
  characterCount?: number;
}

/**
 * Generated content response (multi-platform)
 */
export interface GeneratedContent {
  [platform: string]: string | GeneratedPlatformContent;
  hashtags?: string[];
}

/**
 * Content control parameters for generation
 */
export interface ContentControls {
  temperature: number;
  tone: string;
  length: string;
  targetAudience: string;
  contentFocus: string;
  callToAction: string;
}

/**
 * Campaign save payload
 */
export interface CampaignPayload {
  user_id: string;
  name: string;
  target_platforms: string[];
  status: "draft" | "scheduled" | "published";
  campaign_type: "trending" | "custom";
  source_type: "trending" | "custom";
  source_data: {
    trend: Trend;
    query: string;
    controls: Partial<ContentControls>;
  };
  ai_provider: string;
  tone: string;
}

/**
 * Scheduled post payload
 */
export interface ScheduledPost {
  user_id: string;
  campaign_id: string;
  title: string;
  content: string;
  platform: string;
  post_type: "text" | "image" | "video";
  scheduled_at: string;
  status: "draft" | "scheduled" | "published";
}