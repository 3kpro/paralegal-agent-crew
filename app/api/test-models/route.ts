import { NextRequest, NextResponse } from 'next/server'

const LM_STUDIO_URL = 'http://10.10.10.105:1234'

export async function GET() {
  try {
    const response = await fetch(`${LM_STUDIO_URL}/v1/models`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000) // 5 second timeout
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({
        status: 'error',
        message: `LM Studio models endpoint error: ${response.status}`,
        error: errorText
      })
    }

    const data = await response.json()
    return NextResponse.json({
      status: 'success',
      message: 'LM Studio models endpoint working',
      models: data
    })

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Failed to connect to LM Studio models endpoint',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}