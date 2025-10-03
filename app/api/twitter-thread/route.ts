import { NextRequest, NextResponse } from 'next/server'
import { fetchWithRetry } from '@/lib/fetch-with-retry'
import { getErrorFromStatus, getErrorFromException } from '@/lib/error-messages'
import { twitterThreadSchema, getValidationErrorMessage } from '@/lib/validation'
import { threadCache } from '@/lib/cache'
import { apiRateLimiter } from '@/lib/rate-limiter'
import { z } from 'zod'

interface TwitterRequest {
  content: string
  contentType: 'text' | 'url'
  style?: 'professional' | 'casual' | 'educational'
  includeEmojis?: boolean
  includeHashtags?: boolean
}

interface TwitterResponse {
  success: boolean
  message: string
  trackingId: string
  estimatedTime: string
  error?: string
}

interface StatusResponse {
  status: 'processing' | 'completed' | 'failed'
  trackingId: string
  progress: number
  thread?: string
  error?: string
}

// Simple in-memory store for demo purposes
const processingStore = new Map<string, {
  status: 'processing' | 'completed' | 'failed'
  progress: number
  thread?: string
  error?: string
}>()

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Rate limiting
    const clientIp = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown'

    const rateLimitResult = apiRateLimiter.checkLimit(clientIp)

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded',
          message: `Too many requests. Please try again in ${rateLimitResult.retryAfter} seconds.`
        } satisfies Partial<TwitterResponse>,
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimitResult.resetAt).toISOString(),
            'Retry-After': rateLimitResult.retryAfter?.toString() || '60'
          }
        }
      )
    }

    const rawBody = await request.json()

    // Validate request with Zod
    const validationResult = twitterThreadSchema.safeParse(rawBody)

    if (!validationResult.success) {
      const errorMessage = getValidationErrorMessage(validationResult.error)
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          message: errorMessage
        } satisfies Partial<TwitterResponse>,
        { status: 400 }
      )
    }

    const body = validationResult.data

    // Check cache for duplicate content
    const cacheKey = `thread:${body.content}:${body.style || 'professional'}:${body.includeEmojis}:${body.includeHashtags}`
    const cachedThread = threadCache.get(cacheKey)

    if (cachedThread) {
      const trackingId = `twitter_cached_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      processingStore.set(trackingId, {
        status: 'completed',
        progress: 100,
        thread: cachedThread
      })

      return NextResponse.json({
        success: true,
        message: 'Twitter thread generated (from cache)',
        trackingId,
        estimatedTime: '0 seconds',
      } satisfies TwitterResponse)
    }

    const trackingId = `twitter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Initialize processing status
    processingStore.set(trackingId, {
      status: 'processing',
      progress: 0
    })

    // Send to real n8n workflow for processing
    processWithN8n(trackingId, { ...body, contentType: 'text' as const })
      .catch(error => {
        console.error('n8n processing failed:', error)
        processingStore.set(trackingId, {
          status: 'failed',
          progress: 100,
          error: error.message
        })
      })

    const response: TwitterResponse = {
      success: true,
      message: 'Twitter thread generation started',
      trackingId,
      estimatedTime: '30-60 seconds',
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Twitter API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: 'Failed to process request'
      } satisfies Partial<TwitterResponse>,
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const trackingId = searchParams.get('trackingId')
    
    if (!trackingId) {
      return NextResponse.json(
        { error: 'trackingId is required' },
        { status: 400 }
      )
    }

    const status = processingStore.get(trackingId)
    
    if (!status) {
      return NextResponse.json(
        { error: 'Invalid or expired tracking ID' },
        { status: 404 }
      )
    }

    const response: StatusResponse = {
      status: status.status,
      trackingId,
      progress: status.progress,
      ...(status.thread && { thread: status.thread }),
      ...(status.error && { error: status.error })
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json(
      { error: 'Failed to check status' },
      { status: 500 }
    )
  }
}

async function processWithN8n(trackingId: string, request: TwitterRequest): Promise<void> {
  // Generate cache key
  const cacheKey = `thread:${request.content}:${request.style || 'professional'}:${request.includeEmojis}:${request.includeHashtags}`

  try {
    // Update progress to indicate processing
    processingStore.set(trackingId, {
      status: 'processing',
      progress: 10
    })

    // Check if we should use direct Anthropic API
    if (process.env.USE_ANTHROPIC_DIRECT === 'true') {
      await processWithAnthropic(trackingId, request)
      return
    }

    // Prepare data for n8n workflow
    const n8nPayload = {
      trackingId,
      content: request.content,
      contentType: request.contentType,
      style: request.style || 'professional',
      includeEmojis: request.includeEmojis ?? true,
      includeHashtags: request.includeHashtags ?? true,
      timestamp: new Date().toISOString(),
      source: 'Content Cascade AI Demo'
    }

    // Get n8n webhook URL from environment variable
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/twitter-demo'

    // Send to n8n workflow with retry logic
    const n8nResponse = await fetchWithRetry(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(n8nPayload),
      retries: 3,
      retryDelay: 1000,
      onRetry: (attempt, error) => {
        console.log(`Retry attempt ${attempt} for n8n webhook:`, error.message)
        // Update progress to show retry
        processingStore.set(trackingId, {
          status: 'processing',
          progress: 10 + (attempt * 10)
        })
      }
    })

    if (!n8nResponse.ok) {
      // Get user-friendly error message based on status
      const errorInfo = getErrorFromStatus(n8nResponse.status)
      console.error('n8n workflow error:', errorInfo.message)

      throw new Error(errorInfo.userMessage)
    }

    // Parse n8n response
    const n8nData = await n8nResponse.json()

    // Extract thread data from n8n response
    const thread = n8nData.thread || 'No thread generated'
    const status = n8nData.status || 'completed'

    // Update processing status to completed since we have the result
    processingStore.set(trackingId, {
      status: 'completed',
      progress: 100,
      thread: thread
    })

    // Cache the generated thread
    threadCache.set(cacheKey, thread)
  } catch (error) {
    console.error('Twitter API error:', error)

    // Get user-friendly error message
    const errorInfo = getErrorFromException(error)

    processingStore.set(trackingId, {
      status: 'failed',
      progress: 100,
      error: errorInfo.userMessage
    })
  }
}

async function processWithAnthropic(trackingId: string, request: TwitterRequest): Promise<void> {
  // Generate cache key
  const cacheKey = `thread:${request.content}:${request.style || 'professional'}:${request.includeEmojis}:${request.includeHashtags}`

  try {
    const apiKey = process.env.ANTHROPIC_API_KEY

    if (!apiKey) {
      processingStore.set(trackingId, {
        status: 'failed',
        progress: 100,
        error: 'Service configuration error. Please contact support.'
      })
      return
    }

    // Update progress
    processingStore.set(trackingId, {
      status: 'processing',
      progress: 30
    })

    // Build the prompt based on style
    const styleInstructions = {
      professional: 'Create a professional, business-focused Twitter thread with clear value propositions and actionable insights.',
      casual: 'Create a friendly, conversational Twitter thread that feels authentic and relatable.',
      educational: 'Create an educational, informative Twitter thread that teaches concepts step-by-step with data and examples.'
    }

    const style = request.style || 'professional'
    const prompt = `You are an expert Twitter content creator. ${styleInstructions[style]}

Content to transform into a Twitter thread:
${request.content}

Requirements:
- Create an engaging Twitter thread (5-7 tweets)
- Each tweet should be under 280 characters
- Use thread numbering (🧵 1/X format)
- ${request.includeEmojis ? 'Include relevant emojis' : 'No emojis'}
- ${request.includeHashtags ? 'Include relevant hashtags at the end' : 'No hashtags'}
- Make it engaging and shareable
- Maintain ${style} tone throughout

Format each tweet on a new line, separated by blank lines.`

    // Call Anthropic API with retry logic
    const response = await fetchWithRetry('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-opus-4-20250514',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      }),
      retries: 3,
      retryDelay: 1000,
      onRetry: (attempt, error) => {
        console.log(`Retry attempt ${attempt} for Anthropic API:`, error.message)
        processingStore.set(trackingId, {
          status: 'processing',
          progress: 30 + (attempt * 10)
        })
      }
    })

    if (!response.ok) {
      const errorInfo = getErrorFromStatus(response.status)
      console.error('Anthropic API error:', errorInfo.message)
      throw new Error(errorInfo.userMessage)
    }

    const data = await response.json()
    const thread = data.content[0].text

    // Update to completed
    processingStore.set(trackingId, {
      status: 'completed',
      progress: 100,
      thread: thread
    })

    // Cache the generated thread
    threadCache.set(cacheKey, thread)
  } catch (error) {
    console.error('Anthropic API error:', error)
    const errorInfo = getErrorFromException(error)
    processingStore.set(trackingId, {
      status: 'failed',
      progress: 100,
      error: errorInfo.userMessage
    })
  }
}

function generateMockTwitterThread(content: string, style: string = 'professional'): string {
  const contentWords = content.split(' ')
  const mainTopic = contentWords.slice(0, 10).join(' ')
  
  const threads = {
    professional: `🚀 Transform Your Content Marketing with AI

${mainTopic}... This is exactly why Content Cascade AI is revolutionizing how businesses create content.

🧵 Thread 1/6

🎯 The Problem:
Most businesses spend hours creating individual posts for each platform. Different formats, different audiences, inconsistent messaging.

Sound familiar?

🧵 2/6

💡 The Solution:
Content Cascade AI takes your single piece of content and transforms it into:

• Twitter threads
• LinkedIn posts  
• Email campaigns
• UGC video scripts
• Blog posts
• Social media graphics
• Campaign analytics

🧵 3/6

⚡ How It Works:
1. Upload your content (text, URL, video, audio)
2. AI analyzes and understands your brand voice
3. Generates platform-optimized content
4. Maintains consistency across all channels

🧵 4/6

📈 Real Results:
• 10x faster content creation
• 95% time savings
• Consistent brand messaging
• Multi-platform reach
• Professional UGC videos

🧵 5/6

🎉 Ready to transform your content marketing?

Try Content Cascade AI today:
✅ 14-day free trial
✅ No credit card required
✅ Setup in minutes

Transform any content into complete campaigns.

🧵 6/6

#ContentMarketing #AI #MarketingAutomation #ContentCreation`,

    casual: `Hey! 👋 Just discovered something amazing for content creators...

${mainTopic}

This is EXACTLY why I'm obsessed with Content Cascade AI right now! 

🧵 1/5

Okay so picture this...

You write ONE blog post. 

Then BOOM! 💥

You get:
- Twitter threads
- LinkedIn posts
- Email sequences  
- Video scripts
- Social graphics

All automatically. All on-brand. All optimized for each platform.

🧵 2/5

I used to spend HOURS adapting content for different platforms. 

Now? 

Upload once → Get everything → Post everywhere → Watch the engagement roll in 📈

It's honestly a game-changer.

🧵 3/5

The crazy part? 

The AI actually learns your voice and keeps everything consistent. No more generic robot content.

It sounds like YOU across every platform.

🧵 4/5

If you create content (and who doesn't these days?), you NEED to check this out.

Free trial, no strings attached.

Your future self will thank you! ✨

Drop a 🔥 if you want the link!

🧵 5/5`,

    educational: `📚 MASTERCLASS: How AI is Revolutionizing Content Marketing

${mainTopic}

Let's break down the Content Cascade methodology that's changing everything.

🧵 THREAD 1/7

📖 Chapter 1: The Traditional Problem

Content creators face a universal challenge:
• Creating content takes 4-6 hours per piece
• Adapting for platforms adds 2-3 hours each
• Maintaining brand voice is inconsistent
• ROI decreases with fragmented efforts

🧵 2/7

🔬 Chapter 2: The Science Behind Content Cascade

Content Cascade AI uses advanced NLP to:
1. Analyze your content's core message
2. Understand platform-specific requirements
3. Generate contextually appropriate variations
4. Maintain semantic consistency across formats

🧵 3/7

⚙️ Chapter 3: The Technical Architecture

Input → Analysis Engine → Multi-Modal Generation → Quality Control → Output

Each stage uses specialized AI models:
• GPT-4 for text generation
• Computer vision for graphics
• Voice synthesis for audio content

🧵 4/7

📊 Chapter 4: Performance Metrics

Real data from 500+ campaigns:
• Content creation time: 85% reduction
• Cross-platform engagement: 340% increase
• Brand consistency score: 94% vs 67% manual
• Cost per acquisition: 52% decrease

🧵 5/7

🎯 Chapter 5: Implementation Strategy

Best practices for Content Cascade adoption:
1. Start with your top-performing content
2. Set brand voice parameters carefully
3. Review and adjust AI outputs initially
4. Scale gradually across platforms

🧵 6/7

🔮 Chapter 6: The Future of Content

Content Cascade represents a fundamental shift:
• From creation to curation
• From manual to automated
• From fragmented to unified
• From time-intensive to strategic

🧵 7/7

📝 Your Assignment:
Try Content Cascade AI for your next campaign. Document the results. Share your findings.

The future of content marketing starts now.

#ContentStrategy #MarketingEducation #AITools #MarketingAutomation`
  }

  return threads[style as keyof typeof threads] || threads.professional
}
