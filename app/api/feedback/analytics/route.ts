/**
 * API Endpoint: Viral Score Analytics
 *
 * GET /api/feedback/analytics
 *
 * Purpose: Retrieve prediction accuracy analytics for the current user.
 * Shows how well the viral score predictions are performing.
 *
 * Created: November 3, 2025
 */

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import type { AnalyticsResponse } from '@/types/feedback';

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

    // Query the analytics view
    const { data, error } = await supabase
      .from('viral_score_analytics')
      .select('*')
      .single();

    if (error) {
      // If no data exists yet, return zeros
      if (error.code === 'PGRST116') {
        return NextResponse.json<AnalyticsResponse>({
          success: true,
          data: {
            total_predictions: 0,
            predictions_with_data: 0,
            avg_prediction_error: 0,
            avg_prediction_accuracy: 0,
            predicted_high: 0,
            predicted_medium: 0,
            predicted_low: 0,
            actual_viral: 0,
            high_prediction_correct: 0,
            training_data_ready: 0,
          },
        });
      }

      console.error('[Analytics] Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch analytics' },
        { status: 500 }
      );
    }

    console.log(`[Analytics] ✓ Fetched analytics for user ${user.id}`);
    console.log(`[Analytics] Avg Accuracy: ${data.avg_prediction_accuracy}% | Training Data Ready: ${data.training_data_ready}`);

    return NextResponse.json<AnalyticsResponse>({
      success: true,
      data,
    });
  } catch (error) {
    console.error('[Analytics] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
