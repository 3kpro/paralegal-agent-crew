'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  Share2,
  Target,
  Calendar,
  DollarSign,
  Activity,
  Clock,
  Settings,
  Filter
} from 'lucide-react'

export default function AnalyticsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d')

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-tron-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-tron-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-tron-text-muted">Loading Analytics...</p>
        </div>
      </div>
    )
  }

  const timeRanges = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' }
  ]

  return (
    <div className="min-h-screen bg-tron-dark p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-tron-text flex items-center gap-3">
                <span className="text-2xl">📊</span>
                Analytics Hub
              </h1>
              <p className="text-tron-text-muted mt-2">
                Performance insights and campaign analytics across all platforms
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-tron-grid border border-tron-cyan/30 text-tron-text px-4 py-2 rounded-lg focus:border-tron-cyan focus:outline-none"
              >
                {timeRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-tron-cyan hover:bg-tron-cyan/80 text-tron-dark px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Configure
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Coming Soon Notice */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-tron-cyan/20 to-purple-500/20 border border-tron-cyan/30 rounded-lg p-8 text-center mb-8"
        >
          <div className="text-6xl mb-4">🚀</div>
          <h2 className="text-2xl font-bold text-tron-text mb-3">Analytics Hub Coming Soon!</h2>
          <p className="text-tron-text-muted max-w-2xl mx-auto">
            Advanced analytics and insights are being built as part of the next CCAI platform expansion. 
            You'll soon have access to comprehensive performance tracking, audience insights, and campaign optimization tools.
          </p>
        </motion.div>

        {/* Preview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { icon: TrendingUp, label: 'Campaign Performance', value: 'Coming Soon', color: 'text-green-400' },
            { icon: Users, label: 'Audience Growth', value: 'Coming Soon', color: 'text-blue-400' },
            { icon: Eye, label: 'Total Impressions', value: 'Coming Soon', color: 'text-purple-400' },
            { icon: Share2, label: 'Engagement Rate', value: 'Coming Soon', color: 'text-tron-cyan' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-tron-grid border border-tron-cyan/30 rounded-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                <span className="text-xs text-tron-text-muted">PREVIEW</span>
              </div>
              <div className="text-2xl font-bold text-tron-text mb-1">{stat.value}</div>
              <div className="text-sm text-tron-text-muted">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Feature Preview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Campaign Analytics Preview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-tron-grid border border-tron-cyan/30 rounded-lg p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-5 h-5 text-tron-cyan" />
              <h3 className="text-lg font-semibold text-tron-text">Campaign Analytics</h3>
            </div>
            <div className="space-y-4">
              <div className="h-32 bg-tron-dark/50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="w-8 h-8 text-tron-cyan/50 mx-auto mb-2" />
                  <p className="text-sm text-tron-text-muted">Interactive charts coming soon</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {['Reach', 'Clicks', 'Conversions'].map((metric) => (
                  <div key={metric} className="text-center">
                    <div className="text-sm text-tron-text-muted">{metric}</div>
                    <div className="text-lg font-bold text-tron-text">-</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Platform Performance Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-tron-grid border border-tron-cyan/30 rounded-lg p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-5 h-5 text-tron-cyan" />
              <h3 className="text-lg font-semibold text-tron-text">Platform Performance</h3>
            </div>
            <div className="space-y-4">
              {['Twitter', 'LinkedIn', 'Instagram', 'TikTok'].map((platform, index) => (
                <div key={platform} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-tron-dark/50 rounded-full flex items-center justify-center">
                      <span className="text-xs">
                        {platform === 'Twitter' ? '🐦' : 
                         platform === 'LinkedIn' ? '💼' :
                         platform === 'Instagram' ? '📸' : '🎵'}
                      </span>
                    </div>
                    <span className="text-sm text-tron-text">{platform}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-tron-text">Coming Soon</div>
                    <div className="text-xs text-tron-text-muted">Engagement data</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Planned Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-tron-grid border border-tron-cyan/30 rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold text-tron-text mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-tron-cyan" />
            Planned Analytics Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              'Real-time campaign tracking',
              'Audience demographic insights',
              'Competitor analysis tools',
              'ROI and conversion tracking',
              'Custom dashboard builder',
              'Automated reporting',
              'Performance optimization tips',
              'A/B testing framework',
              'Cross-platform analytics'
            ].map((feature, index) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="w-2 h-2 bg-tron-cyan rounded-full"></div>
                <span className="text-sm text-tron-text-muted">{feature}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
