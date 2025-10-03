import { NextRequest, NextResponse } from 'next/server'

// Mock trending topics data for development
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
    formattedTrafficFormat: "90K searches",
    relatedQueries: ["Micro influencers", "Influencer outreach", "Creator economy"]
  }
]

const mockRelatedQueries = [
  { query: "AI content tools", value: 100, formattedValue: "100%" },
  { query: "Content automation", value: 85, formattedValue: "85%" },
  { query: "Marketing AI", value: 70, formattedValue: "70%" },
  { query: "Social media AI", value: 60, formattedValue: "60%" }
]

const mockRelatedTopics = [
  { query: "Content Creation", value: 100, formattedValue: "100%" },
  { query: "Digital Marketing", value: 90, formattedValue: "90%" },
  { query: "Social Media", value: 80, formattedValue: "80%" },
  { query: "AI Tools", value: 75, formattedValue: "75%" }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const keyword = searchParams.get('keyword') || ''
    const mode = searchParams.get('mode') || 'ideas'

    console.log(`[Trends API] Keyword: ${keyword}, Mode: ${mode}`)

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Filter trending topics based on keyword if provided
    let filteredTrending = mockTrendingTopics
    if (keyword.trim()) {
      filteredTrending = mockTrendingTopics.filter(topic =>
        topic.title.toLowerCase().includes(keyword.toLowerCase()) ||
        topic.relatedQueries?.some(query => 
          query.toLowerCase().includes(keyword.toLowerCase())
        )
      )
    }

    const response = {
      success: true,
      data: {
        trending: filteredTrending,
        relatedQueries: mockRelatedQueries,
        relatedTopics: mockRelatedTopics
      },
      meta: {
        keyword,
        mode,
        totalResults: filteredTrending.length,
        timestamp: new Date().toISOString()
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('[Trends API] Error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch trending topics',
        data: null
      },
      { status: 500 }
    )
  }
}

// Handle CORS for any other HTTP methods
export async function POST(request: NextRequest) {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}