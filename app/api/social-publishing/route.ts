import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      social_account_ids, 
      content, 
      media_urls = [], 
      scheduled_for, 
      campaign_id 
    } = body

    if (!social_account_ids || !Array.isArray(social_account_ids) || social_account_ids.length === 0) {
      return NextResponse.json({ error: 'No social accounts specified' }, { status: 400 })
    }

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Content cannot be empty' }, { status: 400 })
    }

    // Verify user owns all specified social accounts
    const { data: accounts, error: accountsError } = await supabase
      .from('social_accounts')
      .select('id, platform, is_active')
      .eq('user_id', user.id)
      .in('id', social_account_ids)

    if (accountsError) {
      console.error('Failed to verify social accounts:', accountsError)
      return NextResponse.json({ error: 'Failed to verify social accounts' }, { status: 500 })
    }

    if (accounts.length !== social_account_ids.length) {
      return NextResponse.json({ error: 'Some social accounts not found or not owned by user' }, { status: 403 })
    }

    // Check if all accounts are active
    const inactiveAccounts = accounts.filter(acc => !acc.is_active)
    if (inactiveAccounts.length > 0) {
      return NextResponse.json({ 
        error: 'Some social accounts are inactive', 
        inactive_accounts: inactiveAccounts 
      }, { status: 400 })
    }

    const publishingTasks = []

    // Create publishing queue entries for each account
    for (const account of accounts) {
      const isScheduled = scheduled_for && new Date(scheduled_for) > new Date()
      
      const { data: queueEntry, error: queueError } = await supabase
        .from('social_publishing_queue')
        .insert({
          user_id: user.id,
          campaign_id,
          social_account_id: account.id,
          content,
          media_urls,
          scheduled_for: scheduled_for || null,
          status: isScheduled ? 'scheduled' : 'publishing',
          metadata: {
            platform: account.platform,
            content_length: content.length,
            has_media: media_urls.length > 0
          }
        })
        .select()
        .single()

      if (queueError) {
        console.error('Failed to create queue entry:', queueError)
        continue
      }

      publishingTasks.push({
        account_id: account.id,
        platform: account.platform,
        queue_id: queueEntry.id,
        status: isScheduled ? 'scheduled' : 'publishing'
      })

      // If not scheduled, simulate immediate publishing
      if (!isScheduled) {
        // Simulate API call to social platform
        setTimeout(async () => {
          try {
            // Mock successful publishing
            const success = Math.random() > 0.1 // 90% success rate for demo

            if (success) {
              await supabase
                .from('social_publishing_queue')
                .update({
                  status: 'published',
                  published_at: new Date().toISOString(),
                  platform_post_id: `${account.platform}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
                })
                .eq('id', queueEntry.id)
            } else {
              await supabase
                .from('social_publishing_queue')
                .update({
                  status: 'failed',
                  error_message: 'Simulated API error - rate limit exceeded',
                  retry_count: 1
                })
                .eq('id', queueEntry.id)
            }
          } catch (error) {
            console.error('Failed to update publishing status:', error)
          }
        }, Math.random() * 3000 + 1000) // Random delay 1-4 seconds
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Publishing to ${publishingTasks.length} social accounts`,
      tasks: publishingTasks 
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const campaign_id = searchParams.get('campaign_id')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')

    let query = supabase
      .from('social_publishing_queue')
      .select(`
        *,
        social_accounts (
          platform,
          account_name,
          account_handle
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (campaign_id) {
      query = query.eq('campaign_id', campaign_id)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data: queue, error } = await query

    if (error) {
      console.error('Failed to fetch publishing queue:', error)
      return NextResponse.json({ error: 'Failed to fetch publishing queue' }, { status: 500 })
    }

    return NextResponse.json({ success: true, queue })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}