import { NextRequest, NextResponse } from "next/server";

interface RateLimitStore {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, RateLimitStore>();

export interface RateLimitOptions {
  /**
   * Maximum number of requests allowed within the window
   */
  maxRequests: number;
  /**
   * Time window in milliseconds
   */
  windowMs: number;
  /**
   * Message to return when rate limit is exceeded
   */
  message?: string;
  /**
   * Function to generate rate limit key (defaults to IP address)
   */
  keyGenerator?: (req: NextRequest) => string;
}

/**
 * Rate limiting middleware for API routes
 * 
 * @example
 * ```ts
 * export async function POST(request: NextRequest) {
 *   const rateLimitResult = await rateLimit(request, {
 *     maxRequests: 10,
 *     windowMs: 60 * 1000, // 1 minute
 *   });
 *   
 *   if (rateLimitResult) {
 *     return rateLimitResult; // Returns 429 response
 *   }
 *   
 *   // Continue with normal request handling
 * }
 * ```
 */
export async function rateLimit(
  request: NextRequest,
  options: RateLimitOptions
): Promise<NextResponse | null> {
  const {
    maxRequests,
    windowMs,
    message = "Too many requests. Please try again later.",
    keyGenerator = (req) => getClientIdentifier(req),
  } = options;

  const key = keyGenerator(request);
  const now = Date.now();

  // Get or create rate limit entry
  let limitData = rateLimitStore.get(key);

  if (!limitData || now > limitData.resetTime) {
    // Initialize or reset the limit
    limitData = {
      count: 1,
      resetTime: now + windowMs,
    };
    rateLimitStore.set(key, limitData);
    
    // Clean up old entries periodically
    if (Math.random() < 0.01) { // 1% chance
      cleanupOldEntries();
    }
    
    return null;
  }

  // Increment request count
  limitData.count++;

  // Check if limit exceeded
  if (limitData.count > maxRequests) {
    const retryAfter = Math.ceil((limitData.resetTime - now) / 1000);
    
    return NextResponse.json(
      {
        success: false,
        error: message,
        retryAfter,
      },
      {
        status: 429,
        headers: {
          "Retry-After": retryAfter.toString(),
          "X-RateLimit-Limit": maxRequests.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": limitData.resetTime.toString(),
        },
      }
    );
  }

  return null;
}

/**
 * Get client identifier for rate limiting
 */
function getClientIdentifier(request: NextRequest): string {
  // Try to get IP address
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : 
             request.headers.get("x-real-ip") ||
             "unknown";
  
  // Combine with user agent for better uniqueness
  const userAgent = request.headers.get("user-agent") || "unknown";
  
  return `${ip}:${userAgent}`;
}

/**
 * Clean up expired rate limit entries
 */
function cleanupOldEntries() {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Predefined rate limit configurations
 */
export const RateLimitPresets = {
  /**
   * Strict rate limit for expensive operations
   * 5 requests per minute
   */
  STRICT: {
    maxRequests: 5,
    windowMs: 60 * 1000,
    message: "Rate limit exceeded for this operation. Please wait before trying again.",
  },
  
  /**
   * Standard rate limit for API endpoints
   * 30 requests per minute
   */
  STANDARD: {
    maxRequests: 30,
    windowMs: 60 * 1000,
    message: "Too many requests. Please slow down.",
  },
  
  /**
   * Generous rate limit for general endpoints
   * 100 requests per minute
   */
  GENEROUS: {
    maxRequests: 100,
    windowMs: 60 * 1000,
  },
  
  /**
   * Auth endpoints (login, signup)
   * 5 attempts per 15 minutes
   */
  AUTH: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000,
    message: "Too many authentication attempts. Please try again later.",
  },
  
  /**
   * Content generation endpoints
   * 10 requests per minute
   */
  GENERATION: {
    maxRequests: 10,
    windowMs: 60 * 1000,
    message: "Content generation rate limit exceeded. Please wait a moment.",
  },
};

/**
 * User-specific rate limiting (requires authentication)
 */
export async function userRateLimit(
  userId: string,
  options: RateLimitOptions
): Promise<boolean> {
  const now = Date.now();
  let limitData = rateLimitStore.get(userId);

  if (!limitData || now > limitData.resetTime) {
    limitData = {
      count: 1,
      resetTime: now + options.windowMs,
    };
    rateLimitStore.set(userId, limitData);
    return true;
  }

  limitData.count++;
  return limitData.count <= options.maxRequests;
}
