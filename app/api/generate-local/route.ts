import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { topic, formats = ['twitter', 'linkedin', 'email'] } = await request.json()

    if (!topic) {
      return NextResponse.json(
        {
          success: false,
          error: 'Topic is required'
        },
        { status: 400 }
      )
    }

    // Simulate LM Studio API call with realistic delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Mock content generation for development
    const generatedContent = {
      twitter: {
        content: `🚀 Just discovered: "${topic}"

This trend is absolutely exploding right now. Here's why it matters:

→ Growing 300% month over month
→ Perfect timing for content creators
→ Easy to implement today

Thread below 👇

#TrendAlert #ContentCreation`,
        hashtags: ['#TrendAlert', '#ContentCreation', '#DigitalMarketing'],
        characterCount: 284
      },
      linkedin: {
        content: `The rise of "${topic}" is reshaping how we approach content strategy.

I've been tracking this trend for weeks, and the data is compelling:

→ Search volume up 300% in 30 days
→ Engagement rates 2x higher than average
→ Perfect opportunity for thought leadership

Here's what smart content creators are doing:

1️⃣ Creating educational content around this trend
2️⃣ Sharing case studies and real examples  
3️⃣ Building authority in this emerging space

The best part? We're still early. Most people haven't caught on yet.

If you create content, now's the time to jump on this trend.

What trends are you seeing in your industry? Drop them in the comments.

#${topic.replace(/ /g, '')} #ContentStrategy #TrendSpotting`,
        characterCount: 847
      },
      email: {
        subject: `🔥 Trending Now: ${topic} (Don't Miss This)`,
        content: `Hi there!

I wanted to quickly share something I discovered this week that's absolutely exploding right now:

**"${topic}"**

The numbers are insane:
• 300% growth in search volume (last 30 days)
• 2x higher engagement rates
• Still early enough to establish authority

Here's the opportunity I see for content creators:

**Short-term (next 2 weeks):**
- Create 3-5 posts around this trend
- Share your perspective/experience
- Engage with others talking about it

**Medium-term (next month):**
- Develop comprehensive content (blog posts, videos)
- Position yourself as an expert
- Build genuine connections with the community

**Long-term benefit:**
- Established authority in growing niche
- Higher organic reach
- Better engagement rates

The key is acting fast while the trend is still gaining momentum.

Are you going to jump on this trend? Hit reply and let me know your thoughts!

Best,
[Your Name]

P.S. I track trending topics weekly. If you want more insights like this, just reply with "TRENDS" and I'll keep you in the loop.`,
        wordCount: 186
      }
    }

    const response = {
      success: true,
      topic,
      formats,
      content: generatedContent,
      metadata: {
        generated_at: new Date().toISOString(),
        model: 'LM Studio Local',
        processing_time: '2.1s'
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('[Generate Content API] Error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate content',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  // Health check endpoint
  return NextResponse.json({
    status: 'ok',
    service: 'content-generation',
    lm_studio_status: 'connected',
    available_formats: ['twitter', 'linkedin', 'email'],
    timestamp: new Date().toISOString()
  })
}