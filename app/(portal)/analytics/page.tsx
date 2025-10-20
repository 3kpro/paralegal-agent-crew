import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Get analytics data
  const { data: analytics } = await supabase
    .from('analytics_snapshots')
    .select('*')
    .eq('user_id', user.id)
    .order('snapshot_date', { ascending: false })
    .limit(30)

  return (
    <div className="p-8 bg-tron-dark min-h-screen">
      <h1 className="text-3xl font-bold text-tron-text mb-8">Analytics</h1>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-tron-grid rounded-xl p-6 border border-tron-cyan/30">
          <div className="text-sm font-medium text-tron-text-muted mb-2">Total Campaigns</div>
          <div className="text-3xl font-bold text-tron-text">0</div>
          <div className="text-sm text-tron-green mt-2">↑ 0% from last month</div>
        </div>

        <div className="bg-tron-grid rounded-xl p-6 border border-tron-cyan/30">
          <div className="text-sm font-medium text-tron-text-muted mb-2">Total Reach</div>
          <div className="text-3xl font-bold text-tron-text">0</div>
          <div className="text-sm text-tron-text-muted mt-2">Across all platforms</div>
        </div>

        <div className="bg-tron-grid rounded-xl p-6 border border-tron-cyan/30">
          <div className="text-sm font-medium text-tron-text-muted mb-2">Engagement Rate</div>
          <div className="text-3xl font-bold text-tron-text">0%</div>
          <div className="text-sm text-tron-text-muted mt-2">Average</div>
        </div>

        <div className="bg-tron-grid rounded-xl p-6 border border-tron-cyan/30">
          <div className="text-sm font-medium text-tron-text-muted mb-2">Content Generated</div>
          <div className="text-3xl font-bold text-tron-text">0</div>
          <div className="text-sm text-tron-text-muted mt-2">Pieces of content</div>
        </div>
      </div>

      {/* Platform Performance */}
      <div className="bg-tron-grid rounded-xl border border-tron-cyan/30 mb-8">
        <div className="p-6 border-b border-tron-cyan/30">
          <h2 className="text-xl font-bold text-tron-text">Platform Performance</h2>
        </div>
        <div className="p-6">
          {analytics && analytics.length > 0 ? (
            <div className="space-y-4">
              {/* Will show real data when available */}
              <div className="text-tron-text-muted">Analytics data will appear here once you publish campaigns</div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-lg font-semibold text-tron-text mb-2">No analytics yet</h3>
              <p className="text-tron-text-muted mb-6">Create and publish campaigns to see your performance metrics</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-tron-grid rounded-xl border border-tron-cyan/30">
        <div className="p-6 border-b border-tron-cyan/30">
          <h2 className="text-xl font-bold text-tron-text">Recent Activity</h2>
        </div>
        <div className="p-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📈</div>
            <h3 className="text-lg font-semibold text-tron-text mb-2">No activity yet</h3>
            <p className="text-tron-text-muted">Your campaign activity will appear here</p>
          </div>
        </div>
      </div>
    </div>
  )
}
