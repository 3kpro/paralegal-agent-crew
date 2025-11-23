/**
 * ML Viral Score™ API Proxy
 *
 * Proxies requests to the external ML Viral Score API
 * Provides secure API key handling and error responses
 *
 * POST /api/viral-score-ml
 * Body: { title: string, traffic: number, sources: string, freshnessHours: number }
 * Response: { viralScore: number, confidence?: number }
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { applyRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }

    // Apply rate limiting (100 requests per 10 minutes)
    const rateLimitResult = await applyRateLimit(request, {
      limit: 100,
      window: "10m",
      identifier: `viral-score-ml:${user.id}`,
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          retryAfter: rateLimitResult.reset,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": rateLimitResult.limit.toString(),
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": rateLimitResult.reset.toString(),
          },
        }
      );
    }

    // Check if ML feature is enabled
    const isMLEnabled = process.env.NEXT_PUBLIC_VIRAL_SCORE_ML_ENABLED === 'true';
    if (!isMLEnabled) {
      return NextResponse.json(
        { error: "ML Viral Score feature is not enabled" },
        { status: 503 }
      );
    }

    // Get ML API configuration
    const mlApiUrl = process.env.VIRAL_SCORE_ML_API_URL;
    const mlApiKey = process.env.VIRAL_SCORE_ML_API_KEY;

    if (!mlApiUrl) {
      console.error('[ML Viral Score] VIRAL_SCORE_ML_API_URL not configured');
      return NextResponse.json(
        { error: "ML API not configured" },
        { status: 503 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { title, traffic, sources, freshnessHours } = body;

    // Validate required fields
    if (!title || traffic === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: title, traffic" },
        { status: 400 }
      );
    }

    console.log('[ML Viral Score] Request:', {
      title,
      traffic,
      sources,
      freshnessHours,
      userId: user.id,
    });

    // Call external ML API
    const mlResponse = await fetch(mlApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(mlApiKey ? { 'Authorization': `Bearer ${mlApiKey}` } : {}),
      },
      body: JSON.stringify({
        title,
        traffic,
        sources,
        freshnessHours,
      }),
    });

    if (!mlResponse.ok) {
      const errorText = await mlResponse.text();
      console.error('[ML Viral Score] API Error:', {
        status: mlResponse.status,
        statusText: mlResponse.statusText,
        error: errorText,
      });

      return NextResponse.json(
        {
          error: "ML API request failed",
          details: mlResponse.statusText,
        },
        { status: mlResponse.status }
      );
    }

    // Parse ML API response
    const mlData = await mlResponse.json();

    console.log('[ML Viral Score] Response:', {
      viralScore: mlData.viralScore,
      confidence: mlData.confidence,
    });

    // Return ML prediction
    return NextResponse.json({
      viralScore: mlData.viralScore,
      confidence: mlData.confidence,
      model: mlData.model || 'ml-v1',
      timestamp: new Date().toISOString(),
    });

  } catch (error: unknown) {
    console.error('[ML Viral Score] Error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: message || "Internal server error" },
      { status: 500 }
    );
  }
}

// GET endpoint for health check
export async function GET() {
  const isMLEnabled = process.env.NEXT_PUBLIC_VIRAL_SCORE_ML_ENABLED === 'true';
  const mlApiUrl = process.env.VIRAL_SCORE_ML_API_URL;

  return NextResponse.json({
    enabled: isMLEnabled,
    configured: !!mlApiUrl,
    status: isMLEnabled && mlApiUrl ? 'ready' : 'disabled',
  });
}
