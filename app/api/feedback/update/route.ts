/**
 * API Endpoint: Update Content Performance with Engagement Data
 *
 * PUT /api/feedback/update
 *
 * Purpose: Update performance record with actual engagement metrics
 * collected 24-48 hours after content was published.
 * This triggers automatic calculation of viral_score_actual and prediction accuracy.
 *
 * Created: November 3, 2025
 */

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import type { UpdateEngagementRequest, EngagementUpdateResponse } from '@/types/feedback';

export async function PUT(request: NextRequest) {
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
    const body: UpdateEngagementRequest = await request.json();

    // Validate required fields
    if (!body.performance_id) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: performance_id' },
        { status: 400 }
      );
    }

    // Verify ownership
    const { data: existing, error: fetchError } = await supabase
      .from('content_performance')
      .select('id, user_id')
      .eq('id', body.performance_id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { success: false, error: 'Performance record not found' },
        { status: 404 }
      );
    }

    if (existing.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to update this record' },
        { status: 403 }
      );
    }

    // Update engagement data
    // Database trigger will automatically calculate:
    // - total_engagement
    // - viral_score_actual
    // - was_viral
    // - prediction_error
    // - prediction_accuracy
    // - is_training_data
    // - training_data_quality
    const { data, error } = await supabase
      .from('content_performance')
      .update({
        engagement_twitter: body.twitter || null,
        engagement_linkedin: body.linkedin || null,
        engagement_facebook: body.facebook || null,
        engagement_instagram: body.instagram || null,
        engagement_tiktok: body.tiktok || null,
        engagement_collected_at: new Date().toISOString(),
      })
      .eq('id', body.performance_id)
      .select()
      .single();

    if (error) {
      console.error('[Update Engagement] Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update engagement data' },
        { status: 500 }
      );
    }

    console.log(`[Update Engagement] ✓ Updated performance record ${body.performance_id}`);
    console.log(`[Update Engagement] Total Engagement: ${data.total_engagement} | Actual Score: ${data.viral_score_actual}`);
    console.log(`[Update Engagement] Prediction Accuracy: ${data.prediction_accuracy}%`);

    return NextResponse.json<EngagementUpdateResponse>({
      success: true,
      data: {
        performance_id: data.id,
        total_engagement: data.total_engagement,
        viral_score_actual: data.viral_score_actual,
        was_viral: data.was_viral,
        prediction_accuracy: data.prediction_accuracy,
      },
    });
  } catch (error) {
    console.error('[Update Engagement] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
