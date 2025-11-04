/**
 * API Endpoint: Record Content Performance
 *
 * POST /api/feedback/record
 *
 * Purpose: Record initial content performance data when content is published.
 * This creates a tracking record with predicted viral score.
 * Engagement data will be added later via the /api/feedback/update endpoint.
 *
 * Created: November 3, 2025
 */

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import type { RecordPerformanceRequest, PerformanceResponse } from '@/types/feedback';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body: RecordPerformanceRequest = await request.json();

    // Validate required fields
    if (!body.trend_title || body.viral_score_predicted === undefined || !body.viral_potential_predicted) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: trend_title, viral_score_predicted, viral_potential_predicted',
        },
        { status: 400 }
      );
    }

    // Insert performance record
    const { data, error } = await supabase
      .from('content_performance')
      .insert({
        user_id: user.id,
        campaign_id: body.campaign_id || null,
        post_id: body.post_id || null,
        trend_title: body.trend_title,
        trend_source: body.trend_source || null,
        viral_score_predicted: body.viral_score_predicted,
        viral_potential_predicted: body.viral_potential_predicted,
        predicted_factors: body.predicted_factors || null,
        content_text: body.content_text || null,
        content_type: body.content_type || null,
        platforms: body.platforms || [],
        published_at: body.published_at || new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('[Record Performance] Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to record performance data' },
        { status: 500 }
      );
    }

    console.log(`[Record Performance] ✓ Created performance record ${data.id} for user ${user.id}`);
    console.log(`[Record Performance] Trend: "${body.trend_title}" | Predicted Score: ${body.viral_score_predicted}`);

    return NextResponse.json<PerformanceResponse>({
      success: true,
      data,
    });
  } catch (error) {
    console.error('[Record Performance] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve performance records
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const campaign_id = searchParams.get('campaign_id');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build query
    let query = supabase
      .from('content_performance')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    // Filter by campaign if provided
    if (campaign_id) {
      query = query.eq('campaign_id', campaign_id);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[Get Performance] Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch performance data' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('[Get Performance] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
