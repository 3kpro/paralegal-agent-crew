/**
 * Trends API Endpoint (PowerShell Microservice Integration)
 *
 * GET /api/trends?mode=trending - Get daily trending topics
 * GET /api/trends?keyword=AI&mode=powershell - Get PowerShell trend analysis
 *
 * Integrates with DeepSeek's PowerShell microservice for trend discovery
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  getTrendingSearches,
  getPowerShellTrends,
  convertToTrendingTopics,
  checkPowerShellHealth,
} from '@/lib/powershell-trends'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams
    const keyword = searchParams.get('keyword')
    const mode = searchParams.get('mode') || 'trending'

    // Mode: Daily trending searches (uses PowerShell microservice with fallback)
    if (mode === 'trending') {
      const trending = await getTrendingSearches()
      return NextResponse.json({
        success: true,
        mode: 'trending',
        source: 'powershell-microservice',
        data: trending,
      })
    }

    // Mode: PowerShell trend analysis for specific keyword
    if (mode === 'powershell' && keyword) {
      const isHealthy = await checkPowerShellHealth()

      if (!isHealthy) {
        return NextResponse.json(
          {
            success: false,
            error: 'PowerShell microservice unavailable',
            message: 'DeepSeek PowerShell microservice is not running on port 5000',
          },
          { status: 503 }
        )
      }

      const psResponse = await getPowerShellTrends(keyword)
      const trending = convertToTrendingTopics(psResponse)

      return NextResponse.json({
        success: true,
        mode: 'powershell',
        keyword,
        source: 'powershell-microservice',
        data: trending,
        raw: psResponse, // Include raw PowerShell response for debugging
      })
    }

    // Mode: Content ideas (uses keyword for search)
    if (mode === 'ideas') {
      if (keyword) {
        // User provided a search keyword - use PowerShell microservice with their keyword
        const psResponse = await getPowerShellTrends(keyword)
        const trending = convertToTrendingTopics(psResponse)
        return NextResponse.json({
          success: true,
          mode: 'ideas',
          keyword,
          source: 'powershell-microservice',
          data: {
            trending,
            relatedQueries: [],
            relatedTopics: [],
          },
        })
      } else {
        // No keyword - return curated trending topics
        const trending = await getTrendingSearches()
        return NextResponse.json({
          success: true,
          mode: 'ideas',
          keyword: 'general',
          source: 'powershell-microservice',
          data: {
            trending,
            relatedQueries: [],
            relatedTopics: [],
          },
        })
      }
    }

    // Unknown mode
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid mode',
        message: 'Valid modes: trending, powershell, ideas',
      },
      { status: 400 }
    )
  } catch (error) {
    console.error('Trends API error:', error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch trends',
        message: errorMessage,
      },
      { status: 500 }
    )
  }
}
