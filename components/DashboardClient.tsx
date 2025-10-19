'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { DashboardSkeleton } from './SkeletonLoader'
import { motion } from 'framer-motion'

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

  // Tron-inspired animation settings
  const transitionTiming = [0.25, 0.46, 0.45, 0.94]

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
      <motion.div 
        className="p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, ease: transitionTiming }}
      >
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          Error loading dashboard: {error}
        </div>
      </motion.div>
    )
  }

  if (!data) return null

  const { profile, campaigns } = data

  // Container animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
        when: "beforeChildren"
      }
    }
  }

  // Item animation
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3, ease: transitionTiming }
    }
  }

  return (
    <motion.div 
      className="p-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="mb-8" variants={itemVariants}>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {profile?.full_name || 'there'}! 🎉
        </h1>
        <p className="text-gray-600 mt-2">You have {campaigns.length} campaigns in progress</p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div 
          className="bg-white rounded-xl p-6 border border-gray-200"
          variants={itemVariants}
          whileHover={{
            boxShadow: '0 0 10px #00ffff',
            borderColor: '#00ffff',
            y: -5,
            transition: { duration: 0.3, ease: transitionTiming }
          }}
        >
          <div className="text-3xl font-bold text-gray-900">{campaigns.length}</div>
          <div className="text-sm text-gray-600 mt-1">Campaigns</div>
        </motion.div>
        <motion.div 
          className="bg-white rounded-xl p-6 border border-gray-200"
          variants={itemVariants}
          whileHover={{
            boxShadow: '0 0 10px #00ffff',
            borderColor: '#00ffff',
            y: -5,
            transition: { duration: 0.3, ease: transitionTiming }
          }}
        >
          <div className="text-3xl font-bold text-gray-900">0</div>
          <div className="text-sm text-gray-600 mt-1">Views</div>
        </motion.div>
        <motion.div 
          className="bg-white rounded-xl p-6 border border-gray-200"
          variants={itemVariants}
          whileHover={{
            boxShadow: '0 0 10px #00ffff',
            borderColor: '#00ffff',
            y: -5,
            transition: { duration: 0.3, ease: transitionTiming }
          }}
        >
          <div className="text-3xl font-bold text-gray-900">0%</div>
          <div className="text-sm text-gray-600 mt-1">Engagement</div>
        </motion.div>
        <motion.div 
          className="bg-white rounded-xl p-6 border border-gray-200"
          variants={itemVariants}
          whileHover={{
            boxShadow: '0 0 10px #00ffff',
            borderColor: '#00ffff',
            y: -5,
            transition: { duration: 0.3, ease: transitionTiming }
          }}
        >
          <div className="text-3xl font-bold text-gray-900">$0</div>
          <div className="text-sm text-gray-600 mt-1">AI Credits Saved</div>
        </motion.div>
      </motion.div>

      {/* Recent Campaigns */}
      <motion.div 
        className="bg-white rounded-xl p-6 border border-gray-200"
        variants={itemVariants}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Campaigns</h2>
          {campaigns && campaigns.length > 0 && (
            <motion.div
              whileHover={{
                scale: 1.05,
                transition: { duration: 0.3, ease: transitionTiming }
              }}
            >
              <Link
                href="/campaigns/new"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
              >
                + New Campaign
              </Link>
            </motion.div>
          )}
        </div>

        {campaigns && campaigns.length > 0 ? (
          <motion.div className="space-y-4">
            {campaigns.map((campaign, index) => (
              <motion.div 
                key={campaign.id} 
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-cyan-400 transition-colors"
                variants={itemVariants}
                custom={index}
                whileHover={{
                  boxShadow: '0 0 10px #00ffff',
                  borderColor: '#00ffff',
                  x: 5,
                  transition: { duration: 0.3, ease: transitionTiming }
                }}
              >
                <div>
                  <div className="font-semibold text-gray-900">{campaign.name}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {campaign.target_platforms?.join(', ')} • {campaign.status}
                  </div>
                </div>
                <motion.div
                  whileHover={{
                    x: 3,
                    color: '#00ffff',
                    transition: { duration: 0.2, ease: transitionTiming }
                  }}
                >
                  <Link
                    href={`/campaigns/${campaign.id}`}
                    className="text-indigo-600 hover:text-cyan-400 font-medium"
                  >
                    View →
                  </Link>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            className="text-center py-12"
            variants={itemVariants}
          >
            <motion.div 
              className="text-6xl mb-4"
              animate={{ 
                scale: [1, 1.1, 1],
                transition: { 
                  repeat: Infinity, 
                  duration: 2,
                  ease: transitionTiming
                }
              }}
            >
              🚀
            </motion.div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No campaigns yet</h3>
            <p className="text-gray-600 mb-6">Create your first campaign to get started</p>
            <motion.div
              whileHover={{
                scale: 1.05,
                boxShadow: '0 0 15px #00ffff',
                transition: { duration: 0.3, ease: transitionTiming }
              }}
            >
              <Link
                href="/campaigns/new"
                className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
              >
                Create First Campaign
              </Link>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}
