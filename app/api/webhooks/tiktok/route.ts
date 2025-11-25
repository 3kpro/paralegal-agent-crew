import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('[TikTok Webhook] Received:', JSON.stringify(body, null, 2));

    // TikTok webhook events you might receive:
    // - video.publish.complete: Video published successfully
    // - video.publish.failed: Video publish failed
    // - authorization.revoked: User revoked access
    
    // Handle different event types
    const eventType = body.event;
    
    switch (eventType) {
      case 'video.publish.complete':
        console.log('[TikTok Webhook] Video published:', body.video_id);
        // Update database with published video info
        break;
        
      case 'video.publish.failed':
        console.log('[TikTok Webhook] Video publish failed:', body.error);
        // Handle failed publish
        break;
        
      case 'authorization.revoked':
        console.log('[TikTok Webhook] Authorization revoked for user:', body.user_id);
        // Remove user's TikTok connection
        break;
        
      default:
        console.log('[TikTok Webhook] Unknown event type:', eventType);
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('[TikTok Webhook] Error:', error);
    // Still return 200 to prevent TikTok from retrying
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 200 });
  }
}

// TikTok may send GET requests to verify the webhook
export async function GET(request: NextRequest) {
  return NextResponse.json({ status: 'TikTok webhook endpoint active' });
}
