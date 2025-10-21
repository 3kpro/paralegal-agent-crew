import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'
import { decryptAPIKey } from '@/lib/encryption'

// API Gateway URL (ngrok tunnel) - Used in production to access local services
const API_GATEWAY_URL = process.env.API_GATEWAY_URL || ''

// PowerShell microservice URL from environment - Used in local development
const POWERSHELL_TRENDS_URL = process.env.POWERSHELL_TRENDS_URL || 'http://localhost:5003'

// Choose which URL to use: Gateway (production) or direct (local dev)
const TRENDS_API_URL = API_GATEWAY_URL
  ? `${API_GATEWAY_URL}/api/trends`
  : `${POWERSHELL_TRENDS_URL}/trends`

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

// Call PowerShell microservice or API Gateway for trends
async function getTrendsData(keyword: string): Promise<PowerShellResponse> {
  try {
    const url = API_GATEWAY_URL
      ? `${API_GATEWAY_URL}/api/trends?keyword=${encodeURIComponent(keyword)}`
      : `${POWERSHELL_TRENDS_URL}/trends?keyword=${encodeURIComponent(keyword)}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true' // Skip ngrok browser warning
      },
      signal: AbortSignal.timeout(15000) // 15 second timeout for ngrok latency
    })

    if (!response.ok) {
      throw new Error(`Trends service returned ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('[Trends API] Service error:', error)
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

// Gemini AI fallback for trend generation
async function generateTrendsWithGemini(keyword: string, userId: string) {
  try {
    const supabase = await createClient()

    // Try to get user's Google API key from database
    const { data: googleProvider } = await supabase
      .from('ai_providers')
      .select('id')
      .eq('provider_key', 'google')
      .maybeSingle()

    let apiKey = process.env.GOOGLE_API_KEY // Fallback to env var

    if (googleProvider) {
      const { data: userTool } = await supabase
        .from('user_ai_tools')
        .select('api_key_encrypted')
        .eq('user_id', userId)
        .eq('provider_id', googleProvider.id)
        .maybeSingle()

      if (userTool?.api_key_encrypted) {
        apiKey = decryptAPIKey(userTool.api_key_encrypted)
      }
    }

    if (!apiKey) {
      throw new Error('No Google API key configured')
    }
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

    const prompt = `Generate 6 trending content ideas related to "${keyword}" for content marketing and social media.

For each trend, provide:
- A catchy title (2-4 words)
- Estimated interest level (format as "XXK searches" where XX is 50-200)
- 3 related search queries

Format as JSON array:
[
  {
    "title": "Trend Name",
    "formattedTraffic": "150K searches",
    "relatedQueries": ["query 1", "query 2", "query 3"]
  }
]

Return ONLY the JSON array, no markdown formatting.`

    const result = await model.generateContent(prompt)
    const text = result.response.text()

    // Clean up markdown if present
    const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const trends = JSON.parse(jsonText)

    return {
      trending: trends,
      relatedQueries: [
        { query: `${keyword} strategy`, value: 100, formattedValue: "100%" },
        { query: `${keyword} trends 2024`, value: 85, formattedValue: "85%" },
        { query: `best ${keyword} tools`, value: 70, formattedValue: "70%" }
      ],
      relatedTopics: [
        { query: `${keyword} marketing`, value: 100, formattedValue: "100%" },
        { query: `${keyword} content ideas`, value: 90, formattedValue: "90%" },
        { query: `${keyword} automation`, value: 80, formattedValue: "80%" }
      ]
    }
  } catch (error: any) {
    console.error('[Gemini Fallback] Error generating trends:', error.message)
    throw error
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const keyword = searchParams.get('keyword') || ''
    const mode = searchParams.get('mode') || 'ideas'

    // Get user for Gemini fallback
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Mode: Daily trending topics (no keyword search)
    if (mode === 'trending') {
      try {
        // Call trends service with default keyword "content creation"
        const psResponse = await getTrendsData('content creation')
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
          // User provided a search keyword - use trends service with their keyword
          const psResponse = await getTrendsData(keyword)
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
        } catch (psError) {
          console.error('[Trends API] PowerShell service unavailable, trying Gemini AI fallback')

          // Try Gemini AI fallback
          if (user) {
            try {
              const geminiData = await generateTrendsWithGemini(keyword, user.id)
              return NextResponse.json({
                success: true,
                mode: 'ideas',
                keyword,
                source: 'gemini-ai',
                data: geminiData
              })
            } catch (geminiError: any) {
              console.error('[Trends API] Gemini fallback also failed:', geminiError.message)
            }
          }

          // Final fallback to mock data
          console.error('[Trends API] All services unavailable, using mock data')
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
