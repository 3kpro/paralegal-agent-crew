import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function CampaignsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Get user's campaigns
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 bg-tron-dark min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-tron-text">My Campaigns</h1>
        <Link
          href="/campaigns/new"
          className="px-6 py-3 bg-tron-grid border-2 border-tron-cyan text-tron-cyan hover:bg-tron-cyan hover:text-tron-dark font-semibold rounded-lg transition-colors"
        >
          + New Campaign
        </Link>
      </div>

      {campaigns && campaigns.length > 0 ? (
        <div className="bg-tron-grid rounded-xl border border-tron-cyan/30">
          <table className="w-full">
            <thead className="border-b border-tron-cyan/30">
              <tr>
                <th className="text-left p-4 font-semibold text-tron-text">Campaign</th>
                <th className="text-left p-4 font-semibold text-tron-text">Status</th>
                <th className="text-left p-4 font-semibold text-tron-text">Created</th>
                <th className="text-right p-4 font-semibold text-tron-text">Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="border-b border-tron-grid last:border-0">
                  <td className="p-4">
                    <div className="font-medium text-tron-text">{campaign.name}</div>
                    <div className="text-sm text-tron-text-muted">{campaign.target_platforms?.join(', ')}</div>
                  </td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-tron-cyan/20 text-tron-text-muted rounded-full text-sm">
                      {campaign.status}
                    </span>
                  </td>
                  <td className="p-4 text-tron-text-muted">
                    {new Date(campaign.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/campaigns/${campaign.id}`}
                      className="text-tron-cyan hover:text-tron-cyan/80 font-medium"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-tron-grid rounded-xl p-12 text-center border border-tron-cyan/30">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-lg font-semibold text-tron-text mb-2">No campaigns yet</h3>
          <p className="text-tron-text-muted mb-6">Create your first campaign to get started</p>
          <Link
            href="/campaigns/new"
            className="inline-block px-6 py-3 bg-tron-grid border-2 border-tron-cyan text-tron-cyan hover:bg-tron-cyan hover:text-tron-dark font-semibold rounded-lg transition-colors"
          >
            Create First Campaign
          </Link>
        </div>
      )}
    </div>
  )
}
