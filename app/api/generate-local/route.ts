import { NextRequest, NextResponse } from 'next/server'
import {
  generateTwitterThread,
  generateLinkedInPost,
  generateEmailNewsletter,
  checkLMStudioHealth,
} from '@/lib/lm-studio'

export async function POST(request: NextRequest) {
  try {
    const { topic, formats } = await request.json()

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      )
    }

    // Check if LM Studio is available
    const isHealthy = await checkLMStudioHealth()
    if (!isHealthy) {
      return NextResponse.json(
        { 
          error: 'LM Studio is not available',
          message: 'Please ensure LM Studio is running at http://10.10.10.105:1234'
        },
        { status: 503 }
      )
    }

    // Generate content in parallel
    const results: any = {}

    const promises = []

    if (!formats || formats.includes('twitter')) {
      promises.push(
        generateTwitterThread(topic).then(content => {
          results.twitter = content
        })
      )
    }

    if (!formats || formats.includes('linkedin')) {
      promises.push(
        generateLinkedInPost(topic).then(content => {
          results.linkedin = content
        })
      )
    }

    if (!formats || formats.includes('email')) {
      promises.push(
        generateEmailNewsletter(topic).then(content => {
          results.email = content
        })
      )
    }

    await Promise.all(promises)

    return NextResponse.json({
      success: true,
      topic,
      results,
      provider: 'lm-studio',
      model: process.env.LM_STUDIO_MODEL || 'mistral-7b-instruct-v0.3',
    })
  } catch (error) {
    console.error('Local AI generation error:', error)
    return NextResponse.json(
      {
        error: 'Generation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const isHealthy = await checkLMStudioHealth()

    return NextResponse.json({
      healthy: isHealthy,
      provider: 'lm-studio',
      url: process.env.LM_STUDIO_URL || 'http://10.10.10.105:1234',
      model: process.env.LM_STUDIO_MODEL || 'mistral-7b-instruct-v0.3',
    })
  } catch (error) {
    return NextResponse.json(
      { healthy: false, error: 'Health check failed' },
      { status: 503 }
    )
  }
}
