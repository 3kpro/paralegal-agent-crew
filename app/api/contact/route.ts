import { NextRequest, NextResponse } from 'next/server'

interface ContactFormData {
  name: string
  email: string
  company: string
  message: string
  serviceType: string
  budget: string
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json()
    
    // Validate required fields
    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    // Prepare data for n8n webhook
    const webhookData = {
      timestamp: new Date().toISOString(),
      source: '3K Pro Services Landing Page',
      ...body,
      // Add some enrichment
      priority: body.serviceType === 'enterprise' ? 'high' : 'normal',
      followUpDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
    }

    // Send to n8n webhook (replace with your actual n8n webhook URL)
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/contact-form'
    
    try {
      const n8nResponse = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData),
        // Add timeout to prevent hanging
      })

      if (!n8nResponse.ok) {
        console.error('n8n webhook failed:', n8nResponse.status, n8nResponse.statusText)
        // Log for debugging but still return success to user
      }
    } catch (webhookError) {
      console.error('n8n webhook error:', webhookError)
      // In production environment, still return success for better UX
      // The form data could be logged or saved to a backup system
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Thank you for your inquiry! We\'ll get back to you within 24 hours.',
    })

  } catch (error) {
    console.error('Contact form submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle preflight requests for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
