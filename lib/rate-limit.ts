/**
 * Rate Limiting Utilities
 *
 * Provides rate limiting for API routes using Upstash Redis (production)
 * or in-memory fallback (development)
 */

import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { kv } from "@vercel/kv";

// In-memory fallback for development
const inMemoryLimits = new Map<string, { count: number; resetTime: number }>();

/**
 * Rate limit presets for different API endpoints
 */
export const RateLimitPresets = {
  STANDARD: {
    limit: 60,
    window: "1m" as const,
  },
  GENERATION: {
    limit: 10,
    window: "1m" as const,
  },
  PUBLISHING: {
    limit: 10,
    window: "1h" as const,
  },
  TRENDS: {
    limit: 30,
    window: "1m" as const,
  },
} as const;

export type RateLimitPreset = typeof RateLimitPresets[keyof typeof RateLimitPresets];

/**
 * Legacy rate limit function for backward compatibility
 * Returns NextResponse with 429 if rate limit exceeded, undefined otherwise
 */
export async function rateLimit(
  request: NextRequest | Request,
  preset: RateLimitPreset
): Promise<NextResponse | undefined> {
  const result = await applyRateLimit(request, {
    limit: preset.limit,
    window: preset.window,
  });

  if (!result.success) {
    return NextResponse.json(
      {
        error: "Rate limit exceeded",
        retryAfter: result.reset,
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": result.limit.toString(),
          "X-RateLimit-Remaining": result.remaining.toString(),
          "X-RateLimit-Reset": result.reset.toString(),
        },
      }
    );
  }

  return undefined;
}

/**
 * Modern rate limit function with detailed result
 */
export async function applyRateLimit(
  request: NextRequest | Request,
  options: {
    limit: number;
    window: string;
    identifier?: string;
  }
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  const { limit, window, identifier } = options;

  // Get identifier (IP address or custom identifier)
  const id = identifier || getClientIdentifier(request);

  // Check if we're in production with Redis available
  const isProduction = process.env.NODE_ENV === "production";
  const hasRedis = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;

  if (isProduction && hasRedis) {
    return applyUpstashRateLimit(id, limit, window);
  } else {
    return applyInMemoryRateLimit(id, limit, window);
  }
}

/**
 * Apply rate limiting using Upstash Redis (production)
 */
async function applyUpstashRateLimit(
  identifier: string,
  limit: number,
  window: string
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  try {
    const ratelimit = new Ratelimit({
      redis: kv,
      limiter: Ratelimit.slidingWindow(limit, window),
      analytics: true,
    });

    const result = await ratelimit.limit(identifier);

    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    console.error("[Rate Limit] Upstash error, allowing request:", error);
    // On error, allow the request (fail open)
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: Date.now() + parseWindow(window),
    };
  }
}

/**
 * Apply rate limiting using in-memory storage (development)
 */
function applyInMemoryRateLimit(
  identifier: string,
  limit: number,
  window: string
): {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
} {
  const now = Date.now();
  const windowMs = parseWindow(window);
  const key = `${identifier}:${window}`;

  // Clean up expired entries
  cleanupExpiredLimits(now);

  // Get or create limit entry
  let entry = inMemoryLimits.get(key);

  if (!entry || entry.resetTime <= now) {
    // Create new entry (first request or expired window)
    entry = {
      count: 1,
      resetTime: now + windowMs,
    };
    inMemoryLimits.set(key, entry);

    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: entry.resetTime,
    };
  }

  // Increment count
  entry.count++;

  if (entry.count > limit) {
    // Rate limit exceeded
    return {
      success: false,
      limit,
      remaining: 0,
      reset: entry.resetTime,
    };
  }

  // Within limit
  return {
    success: true,
    limit,
    remaining: limit - entry.count,
    reset: entry.resetTime,
  };
}

/**
 * Parse window string (e.g., "1m", "10m", "1h") to milliseconds
 */
function parseWindow(window: string): number {
  const match = window.match(/^(\d+)([smhd])$/);
  if (!match) {
    console.warn(`[Rate Limit] Invalid window format: ${window}, defaulting to 1 minute`);
    return 60 * 1000;
  }

  const [, num, unit] = match;
  const value = parseInt(num, 10);

  switch (unit) {
    case 's':
      return value * 1000;
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    default:
      return 60 * 1000;
  }
}

/**
 * Get client identifier from request (IP address or fallback)
 */
function getClientIdentifier(request: NextRequest | Request): string {
  // Try to get IP from various headers
  const headers = request.headers;

  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  const cfConnectingIp = headers.get("cf-connecting-ip");
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // Fallback to a constant for development
  return "anonymous";
}

/**
 * Clean up expired in-memory rate limit entries
 */
function cleanupExpiredLimits(now: number): void {
  for (const [key, entry] of inMemoryLimits.entries()) {
    if (entry.resetTime <= now) {
      inMemoryLimits.delete(key);
    }
  }
}
