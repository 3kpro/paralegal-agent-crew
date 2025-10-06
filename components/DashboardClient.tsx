'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { DashboardSkeleton } from './SkeletonLoader'

interface Campaign {
  id: string
  name: string
  target_platforms: string[]
  status: string
  created_at: string
}

interface Profile {
  full_name: string
}

interface DashboardData {
  profile: Profile | null
  campaigns: Campaign[]
}

export default function DashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  async function loadDashboardData() {
    try {
      setLoading(true)
      const supabase = createClient()

      // Get user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Not authenticated')
      }

      // Get user profile and campaigns in parallel
      const [profileResponse, campaignResponse] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('campaigns')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5)
      ])

      setData({
        profile: profileResponse.data,
        campaigns: campaignResponse.data || []
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <DashboardSkeleton />

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          Error loading dashboard: {error}
        </div>
      </div>
    )
  }

  if (!data) return null

  const { profile, campaigns } = data

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {profile?.full_name || 'there'}! 🎉
        </h1>
        <p className="text-gray-600 mt-2">You have {campaigns.length} campaigns in progress</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="text-3xl font-bold text-gray-900">{campaigns.length}</div>
          <div className="text-sm text-gray-600 mt-1">Campaigns</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="text-3xl font-bold text-gray-900">0</div>
          <div className="text-sm text-gray-600 mt-1">Views</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="text-3xl font-bold text-gray-900">0%</div>
          <div className="text-sm text-gray-600 mt-1">Engagement</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="text-3xl font-bold text-gray-900">$0</div>
          <div className="text-sm text-gray-600 mt-1">AI Credits Saved</div>
        </div>
      </div>

      {/* Recent Campaigns */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Campaigns</h2>
          {campaigns && campaigns.length > 0 && (
            <Link
              href="/campaigns/new"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
            >
              + New Campaign
            </Link>
          )}
        </div>

        {campaigns && campaigns.length > 0 ? (
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                <div>
                  <div className="font-semibold text-gray-900">{campaign.name}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {campaign.target_platforms?.join(', ')} • {campaign.status}
                  </div>
                </div>
                <Link
                  href={`/campaigns/${campaign.id}`}
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  View →
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No campaigns yet</h3>
            <p className="text-gray-600 mb-6">Create your first campaign to get started</p>
            <Link
              href="/campaigns/new"
              className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
            >
              Create First Campaign
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}