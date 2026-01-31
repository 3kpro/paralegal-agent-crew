import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic' // Ensure validation checks run every time

export async function GET(request: Request) {
  // Validate authorization header for security (best practice for Vercel Cron)
  // Vercel sends `Authorization: Bearer <CRON_SECRET>` if configured in env
  const authHeader = request.headers.get('authorization')
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const supabase = createAdminClient()

    // 1. Fetch scheduled posts that are due
    const { data: posts, error: fetchError } = await supabase
      .from('scheduled_posts')
      .select('id, status, scheduled_at, campaign_id')
      .eq('status', 'scheduled')
      .lte('scheduled_at', new Date().toISOString())
      .limit(50) // Batch processing to avoid timeouts

    if (fetchError) {
      console.error('Error fetching scheduled posts:', fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (!posts || posts.length === 0) {
      return NextResponse.json({
        message: 'No posts to process',
        processed: 0,
      })
    }

    // 2. Process them (Simulate publishing for V1)
    const results = []
    let successCount = 0

    for (const post of posts) {
      // In a real publishing scenario, we would:
      // a) Update status to 'processing'
      // b) Call external APIs (Twitter, LinkedIn, etc.)
      
      // For V1 (Discovery + Validate), we simulate success to complete the user flow.
      const { error: updateError } = await supabase
        .from('scheduled_posts')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', post.id)

      if (updateError) {
        console.error(`Failed to update post ${post.id}:`, updateError)
        results.push({ id: post.id, status: 'error', error: updateError.message })
      } else {
        successCount++
        results.push({ id: post.id, status: 'success' })
      }
    }

    return NextResponse.json({
      success: true,
      processed: successCount,
      total_found: posts.length,
      results,
    })

  } catch (error) {
    console.error('Cron job failed:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
