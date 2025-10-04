import { NextRequest, NextResponse } from 'next/server'

// PowerShell microservice URL from environment
const POWERSHELL_TRENDS_URL = process.env.POWERSHELL_TRENDS_URL || 'http://localhost:5003'

// Fallback mock data (only used if PowerShell service is unavailable)
const mockTrendingTopics = [
  {
    title: "AI Content Creation",
    formattedTraffic: "150K searches",
    relatedQueries: ["AI writing tools", "Content automation", "AI marketing"]
  },
  {
    title: "Social Media Marketing",
    formattedTraffic: "200K searches",
    relatedQueries: ["Instagram marketing", "TikTok trends", "Social media automation"]
  },
  {
    title: "Digital Marketing Trends",
    formattedTraffic: "100K searches",
    relatedQueries: ["Marketing automation", "Email marketing", "SEO trends"]
  },
  {
    title: "Content Marketing Strategy",
    formattedTraffic: "80K searches",
    relatedQueries: ["Content planning", "Editorial calendar", "Content SEO"]
  },
  {
    title: "Video Marketing",
    formattedTraffic: "120K searches",
    relatedQueries: ["YouTube marketing", "Video SEO", "Short-form video"]
  },
  {
    title: "Influencer Marketing",
    formattedTraffic: "90K searches",
    relatedQueries: ["Micro influencers", "Influencer outreach", "Creator economy"]
  }
]

interface PowerShellTrend {
  id: number
  topic: string
  trend_direction: string
  volume: string
  engagement: number
  score: number
}

interface PowerShellResponse {
  generated_at: string
  trends: PowerShellTrend[]
  topic: string
}

interface TrendingTopic {
  title: string
  formattedTraffic: string
  relatedQueries: string[]
}

// Call PowerShell microservice for trends
async function getPowerShellTrends(keyword: string): Promise<PowerShellResponse> {
  try {
    console.log(`[Trends API] Calling PowerShell microservice: ${POWERSHELL_TRENDS_URL}`)
    console.log(`[Trends API] Keyword: "${keyword}"`)

    const response = await fetch(`${POWERSHELL_TRENDS_URL}/trends?keyword=${encodeURIComponent(keyword)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    })

    if (!response.ok) {
      throw new Error(`PowerShell microservice returned ${response.status}`)
    }

    const data = await response.json()
    console.log(`[Trends API] PowerShell microservice returned ${data.trends?.length || 0} topics`)
    return data
  } catch (error) {
    console.error('[Trends API] PowerShell microservice error:', error)
    throw error
  }
}

// Convert PowerShell response to frontend format
function convertToTrendingTopics(psResponse: PowerShellResponse): TrendingTopic[] {
  if (!psResponse.trends || !Array.isArray(psResponse.trends)) {
    return []
  }

  return psResponse.trends.map(trend => ({
    title: trend.topic,
    formattedTraffic: `${trend.volume} volume • ${trend.engagement}% engagement`,
    relatedQueries: []
  }))
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const keyword = searchParams.get('keyword') || ''
    const mode = searchParams.get('mode') || 'ideas'

    console.log(`[Trends API] Request - Keyword: "${keyword}", Mode: ${mode}`)

    // Mode: Daily trending topics (no keyword search)
    if (mode === 'trending') {
      try {
        // Call PowerShell with default keyword "content creation"
        const psResponse = await getPowerShellTrends('content creation')
        const trending = convertToTrendingTopics(psResponse)

        return NextResponse.json({
          success: true,
          mode: 'trending',
          source: 'powershell-microservice',
          data: trending,
          meta: {
            totalResults: trending.length,
            timestamp: new Date().toISOString()
          }
        })
      } catch (error) {
        console.error('[Trends API] PowerShell service unavailable, using mock data')
        // Fallback to mock data if PowerShell service is down
        return NextResponse.json({
          success: true,
          mode: 'trending',
          source: 'mock-fallback',
          data: mockTrendingTopics,
          meta: {
            totalResults: mockTrendingTopics.length,
            timestamp: new Date().toISOString()
          }
        })
      }
    }

    // Mode: Content ideas (uses keyword for search)
    if (mode === 'ideas') {
      if (keyword) {
        try {
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
        } catch (error) {
          console.error('[Trends API] PowerShell service unavailable, using mock data with keyword filter')
          // Fallback to filtered mock data
          const filteredTrending = mockTrendingTopics.filter(topic =>
            topic.title.toLowerCase().includes(keyword.toLowerCase()) ||
            topic.relatedQueries?.some(query =>
              query.toLowerCase().includes(keyword.toLowerCase())
            )
          )

          return NextResponse.json({
            success: true,
            mode: 'ideas',
            keyword,
            source: 'mock-fallback',
            data: {
              trending: filteredTrending.length > 0 ? filteredTrending : mockTrendingTopics,
              relatedQueries: [
                { query: `${keyword} tools`, value: 100, formattedValue: "100%" },
                { query: `${keyword} automation`, value: 85, formattedValue: "85%" },
                { query: `${keyword} strategies`, value: 70, formattedValue: "70%" }
              ],
              relatedTopics: [
                { query: `${keyword} trends`, value: 100, formattedValue: "100%" },
                { query: `${keyword} marketing`, value: 90, formattedValue: "90%" },
                { query: `${keyword} best practices`, value: 80, formattedValue: "80%" }
              ]
            }
          })
        }
      } else {
        // No keyword provided - return empty or default topics
        return NextResponse.json({
          success: true,
          mode: 'ideas',
          source: 'no-keyword',
          data: {
            trending: [],
            relatedQueries: [],
            relatedTopics: [],
          },
          meta: {
            message: 'Please provide a keyword to search for content ideas'
          }
        })
      }
    }

    // Unknown mode
    return NextResponse.json(
      {
        success: false,
        error: `Unknown mode: ${mode}`,
      },
      { status: 400 }
    )

  } catch (error) {
    console.error('[Trends API] Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch trending topics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Handle CORS for any other HTTP methods
export async function POST(request: NextRequest) {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}
