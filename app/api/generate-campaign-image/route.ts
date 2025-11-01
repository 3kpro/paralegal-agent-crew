import { NextResponse } from 'next/server'
import { aiConfig } from '../config/ai'

export async function POST(req: Request) {
  try {
    const {
      productDetails,
      platform,
      style = 'Modern and professional'
    } = await req.json()

    const { name, description } = productDetails

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Product name is required' },
        { status: 400 }
      )
    }

    // Generate the campaign image
    const imagePrompt = `${name}
    ${description ? `Description: ${description}\n` : ''}
    Platform: ${platform}
    Style: ${style}`

    const imageData = await aiConfig.generateImage(imagePrompt, style)

    return NextResponse.json({
      success: true,
      imageData,
      platform,
    })

  } catch (error: any) {
    console.error('Error generating campaign image:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate image',
      },
      { status: 500 }
    )
  }
}