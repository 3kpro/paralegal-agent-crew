/**
 * API Endpoint: Export ML Training Data
 *
 * GET /api/feedback/export-ml
 *
 * Purpose: Export high-quality training data for Phase 2 ML model training.
 * Returns filtered data suitable for machine learning.
 *
 * Query Parameters:
 * - format: 'json' | 'csv' (default: 'json')
 * - quality: 'high' | 'medium' | 'all' (default: 'high')
 * - limit: number (default: 1000)
 *
 * Created: November 3, 2025
 */

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { convertToCSV } from '@/lib/feedback-tracking';
import type { ExportMLDataResponse, MLTrainingRecord } from '@/types/feedback';

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
    const format = searchParams.get('format') || 'json';
    const quality = searchParams.get('quality') || 'high';
    const limit = parseInt(searchParams.get('limit') || '1000');

    // Build query from ml_training_data view
    let query = supabase
      .from('ml_training_data')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(limit);

    // Filter by quality if not 'all'
    if (quality !== 'all') {
      query = query.eq('training_data_quality', quality);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[Export ML] Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to export training data' },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No training data available yet. Publish content and collect engagement data first.' },
        { status: 404 }
      );
    }

    // Calculate metadata
    const highQuality = data.filter((r: any) => r.training_data_quality === 'high').length;
    const mediumQuality = data.filter((r: any) => r.training_data_quality === 'medium').length;
    const avgAccuracy =
      data.reduce((sum: number, r: any) => sum + (r.prediction_accuracy || 0), 0) / data.length;

    const metadata = {
      total_records: data.length,
      high_quality: highQuality,
      medium_quality: mediumQuality,
      date_range: {
        start: data[data.length - 1]?.published_at || '',
        end: data[0]?.published_at || '',
      },
      avg_prediction_accuracy: parseFloat(avgAccuracy.toFixed(2)),
    };

    console.log(`[Export ML] ✓ Exporting ${data.length} training records for user ${user.id}`);
    console.log(`[Export ML] Quality: ${quality} | Format: ${format}`);

    // Return CSV format
    if (format === 'csv') {
      const csv = convertToCSV(data);

      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="ml_training_data_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    // Return JSON format
    return NextResponse.json<ExportMLDataResponse>({
      success: true,
      data: {
        records: data as MLTrainingRecord[],
        metadata,
      },
    });
  } catch (error) {
    console.error('[Export ML] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
