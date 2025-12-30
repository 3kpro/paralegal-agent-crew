import { GenerateContentInput } from "@/lib/validations";

// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  error?: string;
  message?: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
  requiresSetup?: boolean;
  limit_reached?: boolean;
  errorType?: string;
  data?: T;
}

// Generation Response Types
export interface GenerationMetadata {
  provider: string;
  tokensUsed: number;
  estimatedCost: number;
  cached: boolean;
}

export interface GeneratedContent {
  [platform: string]: string | {
    content: string;
    hashtags?: string[];
    characterCount?: number;
    subject?: string; // For email format
    platform: string;
  };
}

export interface GenerationResponse extends APIResponse {
  content?: GeneratedContent;
  metadata?: GenerationMetadata;
}

// Rate Limit Response
export interface RateLimitError extends APIResponse {
  limit_reached: true;
  current_usage: number;
  daily_limit: number;
  upgrade_url: string;
}

// Validation Error
export interface ValidationError extends APIResponse {
  error: string;
  details: Array<{
    field: string;
    message: string;
  }>;
}

// Setup Required Error
export interface SetupRequiredError extends APIResponse {
  error: string;
  requiresSetup: true;
}