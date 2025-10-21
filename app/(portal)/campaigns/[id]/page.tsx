import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

export default async function CampaignDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Get campaign details
  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (campaignError || !campaign) {
    notFound()
  }

  // Get generated content for this campaign
  const { data: content } = await supabase
    .from('campaign_content')
    .select('*')
    .eq('campaign_id', id)
    .order('platform', { ascending: true })

  return (
    <div className="p-8 bg-tron-dark min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/campaigns"
          className="inline-flex items-center text-tron-cyan hover:text-tron-cyan/80 mb-4"
        >
          ← Back to Campaigns
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-tron-text mb-2">{campaign.name}</h1>
            <div className="flex items-center gap-4 text-tron-text-muted">
              <span>Status: <span className="text-tron-cyan">{campaign.status}</span></span>
              <span>•</span>
              <span>Created: {new Date(campaign.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              className="px-4 py-2 bg-tron-grid border border-tron-cyan/30 text-tron-text hover:border-tron-cyan rounded-lg transition-colors"
              disabled
            >
              Edit (Coming Soon)
            </button>
            <button
              className="px-4 py-2 bg-tron-grid border border-red-500/30 text-red-400 hover:border-red-500 rounded-lg transition-colors"
              disabled
            >
              Delete (Coming Soon)
            </button>
          </div>
        </div>
      </div>

      {/* Campaign Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-tron-grid rounded-xl p-6 border border-tron-cyan/30">
          <h3 className="text-sm font-semibold text-tron-text-muted mb-2">Target Platforms</h3>
          <div className="flex flex-wrap gap-2">
            {campaign.target_platforms?.map((platform: string) => (
              <span
                key={platform}
                className="px-3 py-1 bg-tron-cyan/20 text-tron-cyan rounded-full text-sm"
              >
                {platform}
              </span>
            )) || <span className="text-tron-text-muted">No platforms selected</span>}
          </div>
        </div>

        <div className="bg-tron-grid rounded-xl p-6 border border-tron-cyan/30">
          <h3 className="text-sm font-semibold text-tron-text-muted mb-2">Trend Topic</h3>
          <p className="text-tron-text">
            {campaign.metadata?.trend?.title || 'No trend selected'}
          </p>
        </div>

        <div className="bg-tron-grid rounded-xl p-6 border border-tron-cyan/30">
          <h3 className="text-sm font-semibold text-tron-text-muted mb-2">AI Provider</h3>
          <p className="text-tron-text">
            {campaign.metadata?.ai_provider || 'Not specified'}
          </p>
        </div>
      </div>

      {/* Generated Content */}
      <div className="bg-tron-grid rounded-xl border border-tron-cyan/30 p-6">
        <h2 className="text-xl font-bold text-tron-text mb-6">Generated Content</h2>

        {content && content.length > 0 ? (
          <div className="space-y-6">
            {content.map((item) => (
              <div
                key={item.id}
                className="bg-tron-dark rounded-lg p-6 border border-tron-grid"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-tron-cyan">
                    {item.platform}
                  </h3>
                  <span className="text-sm text-tron-text-muted">
                    {new Date(item.created_at).toLocaleString()}
                  </span>
                </div>

                {/* Content Display */}
                <div className="space-y-3">
                  {/* Body/Content */}
                  {item.body && (
                    <div>
                      <p className="text-sm text-tron-text-muted mb-1">Content:</p>
                      <p className="text-tron-text whitespace-pre-wrap">{item.body}</p>
                    </div>
                  )}

                  {/* Subject (for Email) */}
                  {item.metadata?.subject && (
                    <div>
                      <p className="text-sm text-tron-text-muted mb-1">Subject:</p>
                      <p className="text-tron-text">{item.metadata.subject}</p>
                    </div>
                  )}

                  {/* Hashtags */}
                  {item.metadata?.hashtags && item.metadata.hashtags.length > 0 && (
                    <div>
                      <p className="text-sm text-tron-text-muted mb-1">Hashtags:</p>
                      <div className="flex flex-wrap gap-2">
                        {item.metadata.hashtags.map((tag: string, idx: number) => (
                          <span
                            key={idx}
                            className="text-tron-cyan text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Character Count */}
                  {item.metadata?.characterCount && (
                    <p className="text-xs text-tron-text-muted">
                      Character count: {item.metadata.characterCount}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-4 pt-4 border-t border-tron-grid flex gap-3">
                  <button
                    className="px-4 py-2 bg-tron-grid border border-tron-cyan/30 text-tron-cyan hover:border-tron-cyan rounded-lg transition-colors text-sm"
                    disabled
                  >
                    Copy Content
                  </button>
                  <button
                    className="px-4 py-2 bg-tron-grid border border-tron-cyan/30 text-tron-text hover:border-tron-cyan rounded-lg transition-colors text-sm"
                    disabled
                  >
                    Publish (Coming Soon)
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📝</div>
            <p className="text-tron-text-muted">No content generated yet</p>
            <p className="text-sm text-tron-text-muted mt-2">
              Content will appear here after generation
            </p>
          </div>
        )}
      </div>

      {/* Metadata Debug (Optional - Remove for production) */}
      {process.env.NODE_ENV === 'development' && campaign.metadata && (
        <div className="mt-8 bg-tron-grid rounded-xl border border-tron-cyan/30 p-6">
          <h3 className="text-sm font-semibold text-tron-text-muted mb-2">
            Campaign Metadata (Debug)
          </h3>
          <pre className="text-xs text-tron-text-muted overflow-auto">
            {JSON.stringify(campaign.metadata, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
