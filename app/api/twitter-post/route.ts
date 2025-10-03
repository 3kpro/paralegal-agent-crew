import { NextRequest, NextResponse } from 'next/server'

interface TwitterPostRequest {
  content: string
  contentType: 'text' | 'url'
  style?: 'professional' | 'casual' | 'educational'
  includeEmojis?: boolean
  includeHashtags?: boolean
  includeTrends?: boolean
  twitterAccount?: string
  postingPreferences?: {
    scheduleTime?: string
    priority?: 'low' | 'medium' | 'high'
    targetAudience?: string
  }
}

interface TwitterPostResponse {
  success: boolean
  message: string
  trackingId: string
  estimatedTime: string
  error?: string
  metadata?: {
    contentLength: number
    estimatedThreadLength: number
    includesTrends: boolean
    postingAccount: string
  }
}

interface StatusResponse {
  status: 'processing' | 'completed' | 'failed'
  trackingId: string
  progress: number
  result?: {
    tweetId: string
    threadContent: string[]
    postedAt: string
    engagement?: {
      likes: number
      retweets: number
      replies: number
    }
  }
  error?: string
}

// Enhanced in-memory store for production-ready tracking
const processingStore = new Map<string, {
  status: 'processing' | 'completed' | 'failed'
  progress: number
  result?: any
  error?: string
  createdAt: Date
  updatedAt: Date
}>()

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: TwitterPostRequest = await request.json()

    // Enhanced input validation
    if (!body.content) {
      return NextResponse.json(
        {
          success: false,
          error: 'Content is required',
          message: 'Please provide content to transform into Twitter posts'
        } satisfies Partial<TwitterPostResponse>,
        { status: 400 }
      )
    }

    if (body.content.length > 5000) {
      return NextResponse.json(
        {
          success: false,
          error: 'Content too long',
          message: 'Content must be less than 5000 characters'
        } satisfies Partial<TwitterPostResponse>,
        { status: 400 }
      )
    }

    // Validate content type
    if (!['text', 'url'].includes(body.contentType)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid content type',
          message: 'Content type must be either "text" or "url"'
        } satisfies Partial<TwitterPostResponse>,
        { status: 400 }
      )
    }

    const trackingId = `twitter_post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Initialize processing status with enhanced metadata
    processingStore.set(trackingId, {
      status: 'processing',
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    // Send to enhanced n8n workflow for processing
    processWithN8n(trackingId, body)
      .catch(error => {
        console.error('Enhanced n8n processing failed:', error)
        processingStore.set(trackingId, {
          status: 'failed',
          progress: 100,
          error: error.message,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      })

    // Calculate estimated thread length based on content
    const estimatedThreadLength = Math.ceil(body.content.length / 200) + 1

    const response: TwitterPostResponse = {
      success: true,
      message: 'Twitter posting workflow initiated',
      trackingId,
      estimatedTime: '30-90 seconds',
      metadata: {
        contentLength: body.content.length,
        estimatedThreadLength,
        includesTrends: body.includeTrends || false,
        postingAccount: body.twitterAccount || 'default'
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Enhanced Twitter API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Failed to process Twitter posting request'
      } satisfies Partial<TwitterPostResponse>,
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
      ...(status.result && { result: status.result }),
      ...(status.error && { error: status.error })
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json(
      { error: 'Failed to check posting status' },
      { status: 500 }
    )
  }
}

async function processWithN8n(trackingId: string, request: TwitterPostRequest): Promise<void> {
  try {
    // Update progress to indicate enhanced processing
    processingStore.set(trackingId, {
      status: 'processing',
      progress: 10,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    // Enhanced payload for new Twitter integration workflow
    const n8nPayload = {
      trackingId,
      content: request.content,
      contentType: request.contentType,
      style: request.style || 'professional',
      includeEmojis: request.includeEmojis ?? true,
      includeHashtags: request.includeHashtags ?? true,
      includeTrends: request.includeTrends ?? false,
      twitterAccount: request.twitterAccount || 'default',
      postingPreferences: request.postingPreferences || {},
      metadata: {
        source: 'Content Cascade AI Enhanced',
        version: '2.0',
        timestamp: new Date().toISOString(),
        userAgent: 'ContentCascadeAI-TwitterIntegration/2.0'
      }
    }

    // Get n8n webhook URL from environment - updated for enhanced integration
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/twitter-post'

    // Send to enhanced n8n workflow with timeout and retry logic
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    try {
      const n8nResponse = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'ContentCascadeAI-TwitterIntegration/2.0'
        },
        body: JSON.stringify(n8nPayload),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!n8nResponse.ok) {
        const errorText = await n8nResponse.text()
        throw new Error(`n8n workflow failed: ${n8nResponse.status} ${n8nResponse.statusText} - ${errorText}`)
      }

      const responseData = await n8nResponse.json()

      // Update progress after n8n submission
      processingStore.set(trackingId, {
        status: 'processing',
        progress: 50,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      // Enhanced polling for completion with better error handling
      let pollCount = 0
      const maxPolls = 30 // Maximum 60 seconds of polling

      const pollInterval = setInterval(async () => {
        pollCount++

        try {
          const statusResponse = await fetch(`http://localhost:3000/api/twitter-post?trackingId=${trackingId}`)
          const statusData = await statusResponse.json()

          if (statusResponse.ok && statusData.status === 'completed') {
            clearInterval(pollInterval)
            processingStore.set(trackingId, {
              status: 'completed',
              progress: 100,
              result: statusData.result,
              createdAt: new Date(),
              updatedAt: new Date()
            })
          } else if (statusData.status === 'failed') {
            clearInterval(pollInterval)
            processingStore.set(trackingId, {
              status: 'failed',
              progress: 100,
              error: statusData.error || 'Enhanced n8n processing failed',
              createdAt: new Date(),
              updatedAt: new Date()
            })
          } else if (pollCount >= maxPolls) {
            // Timeout after 60 seconds
            clearInterval(pollInterval)
            processingStore.set(trackingId, {
              status: 'failed',
              progress: 100,
              error: 'Processing timeout - Enhanced n8n workflow may still be running',
              createdAt: new Date(),
              updatedAt: new Date()
            })
          }
        } catch (pollError) {
          console.error('Enhanced polling error:', pollError)
          if (pollCount >= maxPolls) {
            clearInterval(pollInterval)
            processingStore.set(trackingId, {
              status: 'failed',
              progress: 100,
              error: 'Polling failed - Unable to check processing status',
              createdAt: new Date(),
              updatedAt: new Date()
            })
          }
        }
      }, 2000) // Poll every 2 seconds

    } catch (fetchError) {
      clearTimeout(timeoutId)

      if (fetchError.name === 'AbortError') {
        throw new Error('Request timeout - n8n workflow took too long to respond')
      } else {
        throw fetchError
      }
    }

  } catch (error) {
    processingStore.set(trackingId, {
      status: 'failed',
      progress: 100,
      error: error instanceof Error ? error.message : 'Unknown enhanced n8n error',
      createdAt: new Date(),
      updatedAt: new Date()
    })
    throw error
  }
}

