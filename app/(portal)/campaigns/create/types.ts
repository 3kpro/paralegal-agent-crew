/**
 * TypeScript types and interfaces for the campaign creation flow
 */

import { ElementType } from "react";

/**
 * Platform configuration
 */
export interface Platform {
  id: string;
  name: string;
  icon: ElementType;
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
  icon: ElementType;
}

/**
 * Toast notification state
 */
export interface ToastState {
  show: boolean;
  message: string | React.ReactNode;
  type: "success" | "error";
}

/**
 * Trend from API
 */
export interface Trend {
  id?: string;
  title: string;
  formattedTraffic?: string;
  relatedQueries?: string[];
  viralScore?: number;
  viralPotential?: 'high' | 'medium' | 'low';
  viralFactors?: {
    volume: number;
    multiSource: number;
    freshness: number;
    keywordBoost: number;
    aiAnalysis: number;
  };
  viralDNA?: {
    hookType?: string;
    primaryEmotion?: string;
    valueProp?: string;
  };
  aiReasoning?: string;
  sources?: string[];
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
export interface GeneratedContent extends Record<string, any> {
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
  campaign_type: "trending" | "promote";
  source_type: "trending" | "promote";
  source_data: {
    trends?: Trend[];
    trend?: Trend;
    promoteData?: PromoteData;
    query: string;
    controls: Partial<ContentControls>;
    selectedAudiences?: string[];
    generatedContent?: GeneratedContent;
  };
  ai_provider: string;
  tone: string;
}

/**
 * Scheduled post payload
 */
export interface ScheduledPost {
  id?: string;
  user_id: string;
  campaign_id: string;
  title: string;
  content: string;
  platform: string;
  post_type: "text" | "image" | "video";
  scheduled_at: string;
  published_at?: string;
  status: "draft" | "scheduled" | "published" | "failed";
  failed_reason?: string;
}

/**
 * Product details for campaign marketing
 */
export interface CampaignImage {
  url: string;
  alt: string;
  platform: string;
  style: string;
}

export interface ProductDetails {
  name: string;
  url?: string;
  presentationStyle: "benefits" | "features" | "story" | "technical";
  focusPoints: ("quality" | "value" | "innovation" | "reliability" | "sustainability")[];
  highlightPrice: boolean;
  includeTestimonials: boolean;
  customDescription?: string;
  generatedDescription?: string;
  campaignImages?: CampaignImage[];
}

/**
 * Promote Campaign Data
 */
export interface DriveFile {
  id: string;
  name: string;
  embedUrl: string;
  mimeType: string;
  iconUrl: string;
  url: string;
}

/**
 * Promote Campaign Data
 */
export interface PromoteData {
  productName: string;
  productType: "product" | "service" | "content" | "saas" | "other";
  description: string;
  keyFeatures: string[];
  targetAudience: string;
  uniqueSellingPoints: string[];
  websiteUrl?: string;
  driveLink?: string;
  contentFocus?: string;
  uploadedFiles?: File[]; // For UI state only
  driveFiles?: DriveFile[];
  accessToken?: string;
}


/**
 * Content Template for reusable content
 */
export interface ContentTemplate {
  id: string;
  user_id: string;
  name: string;
  category: string;
  description?: string;
  template_content: string;
  platforms: string[];
  usage_count: number;
  created_at: string;
}
