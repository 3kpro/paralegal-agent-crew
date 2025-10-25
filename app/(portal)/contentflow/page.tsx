'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { SchedulePostDialog } from '@/components/SchedulePostDialog'

export default function ContentFlowPage() {
  const router = useRouter()
  const supabase = createClient()
  const [view, setView] = useState<'calendar' | 'queue' | 'templates'>('calendar')
  const [scheduledPosts, setScheduledPosts] = useState<any[]>([])
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Load scheduled posts
      const { data: posts } = await supabase
        .from('scheduled_posts')
        .select('*')
        .eq('user_id', user.id)
        .order('scheduled_at', { ascending: true })

      setScheduledPosts(posts || [])

      // Load templates
      const { data: userTemplates } = await supabase
        .from('content_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setTemplates(userTemplates || [])
    } catch (error) {
      console.error('Failed to load ContentFlow data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-tron-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-tron-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-tron-text-muted">Loading ContentFlow...</p>
        </div>
      </div>
    )
  }

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
                <span className="text-2xl">📅</span>
                ContentFlow
              </h1>
              <p className="text-tron-text-muted mt-2">
                Schedule and auto-publish your content across all platforms
              </p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowScheduleDialog(true)}
              className="bg-tron-cyan hover:bg-tron-cyan/80 text-tron-dark px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              + Schedule New Post
            </motion.button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 bg-tron-grid rounded-lg p-1">
            {[
              { key: 'calendar', label: 'Calendar View', icon: '📅' },
              { key: 'queue', label: 'Publishing Queue', icon: '⏰' },
              { key: 'templates', label: 'Templates', icon: '📝' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setView(tab.key as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                  view === tab.key
                    ? 'bg-tron-cyan text-tron-dark font-semibold'
                    : 'text-tron-text-muted hover:text-tron-text hover:bg-tron-dark/50'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          key={view}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {view === 'calendar' && <CalendarView posts={scheduledPosts} onScheduleClick={() => setShowScheduleDialog(true)} />}
          {view === 'queue' && <QueueView posts={scheduledPosts} />}
          {view === 'templates' && <TemplatesView templates={templates} onTemplateUpdate={loadData} />}
        </motion.div>

        {/* Schedule Post Dialog */}
        <SchedulePostDialog
          isOpen={showScheduleDialog}
          onClose={() => setShowScheduleDialog(false)}
          onPostScheduled={loadData}
          templates={templates}
        />
      </div>
    </div>
  )
}

function CalendarView({ posts, onScheduleClick }: { posts: any[], onScheduleClick: () => void }) {
  const today = new Date()
  const upcomingPosts = posts.filter(post => 
    new Date(post.scheduled_at) > today && post.status === 'scheduled'
  )

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-tron-grid border border-tron-cyan/30 rounded-lg p-4">
          <div className="text-2xl text-tron-cyan mb-2">📅</div>
          <div className="text-2xl font-bold text-tron-text">{upcomingPosts.length}</div>
          <div className="text-sm text-tron-text-muted">Scheduled Posts</div>
        </div>
        
        <div className="bg-tron-grid border border-tron-cyan/30 rounded-lg p-4">
          <div className="text-2xl text-tron-cyan mb-2">📊</div>
          <div className="text-2xl font-bold text-tron-text">
            {posts.filter(p => p.status === 'published').length}
          </div>
          <div className="text-sm text-tron-text-muted">Published</div>
        </div>

        <div className="bg-tron-grid border border-tron-cyan/30 rounded-lg p-4">
          <div className="text-2xl text-tron-cyan mb-2">🎯</div>
          <div className="text-2xl font-bold text-tron-text">
            {[...new Set(upcomingPosts.map(p => p.platform))].length}
          </div>
          <div className="text-sm text-tron-text-muted">Platforms</div>
        </div>

        <div className="bg-tron-grid border border-tron-cyan/30 rounded-lg p-4">
          <div className="text-2xl text-tron-cyan mb-2">⚡</div>
          <div className="text-2xl font-bold text-tron-text">
            {posts.filter(p => p.status === 'failed').length}
          </div>
          <div className="text-sm text-tron-text-muted">Failed Posts</div>
        </div>
      </div>

      {/* Upcoming Posts Timeline */}
      <div className="bg-tron-grid border border-tron-cyan/30 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-tron-text mb-4">Upcoming Posts</h3>
        
        {upcomingPosts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📅</div>
            <h4 className="text-lg font-semibold text-tron-text mb-2">No scheduled posts</h4>
            <p className="text-tron-text-muted mb-4">
              Start scheduling your content to see it here
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onScheduleClick}
              className="bg-tron-cyan hover:bg-tron-cyan/80 text-tron-dark px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Schedule Your First Post
            </motion.button>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingPosts.slice(0, 5).map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-tron-dark/50 rounded-lg p-4 border border-tron-cyan/20"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg">{getPlatformIcon(post.platform)}</span>
                      <span className="text-sm font-medium text-tron-cyan capitalize">
                        {post.platform}
                      </span>
                      <span className="text-xs text-tron-text-muted">
                        {new Date(post.scheduled_at).toLocaleString()}
                      </span>
                    </div>
                    <h4 className="font-semibold text-tron-text mb-1">{post.title}</h4>
                    <p className="text-sm text-tron-text-muted line-clamp-2">
                      {post.content}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      post.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' :
                      post.status === 'published' ? 'bg-green-500/20 text-green-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {post.status}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function QueueView({ posts }: { posts: any[] }) {
  const queuedPosts = posts.filter(post => post.status === 'scheduled')
  const publishedPosts = posts.filter(post => post.status === 'published')
  const failedPosts = posts.filter(post => post.status === 'failed')

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Queued Posts */}
        <div className="bg-tron-grid border border-tron-cyan/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-tron-text mb-4">
            Queued ({queuedPosts.length})
          </h3>
          <div className="space-y-3">
            {queuedPosts.slice(0, 3).map((post) => (
              <div key={post.id} className="bg-tron-dark/50 rounded p-3 border border-blue-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <span>{getPlatformIcon(post.platform)}</span>
                  <span className="text-sm font-medium text-blue-400">{post.platform}</span>
                </div>
                <div className="text-xs text-tron-text-muted truncate">{post.title}</div>
                <div className="text-xs text-tron-text-muted mt-1">
                  {new Date(post.scheduled_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Published Posts */}
        <div className="bg-tron-grid border border-tron-cyan/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-tron-text mb-4">
            Published ({publishedPosts.length})
          </h3>
          <div className="space-y-3">
            {publishedPosts.slice(0, 3).map((post) => (
              <div key={post.id} className="bg-tron-dark/50 rounded p-3 border border-green-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <span>{getPlatformIcon(post.platform)}</span>
                  <span className="text-sm font-medium text-green-400">{post.platform}</span>
                </div>
                <div className="text-xs text-tron-text-muted truncate">{post.title}</div>
                <div className="text-xs text-tron-text-muted mt-1">
                  {post.published_at ? new Date(post.published_at).toLocaleString() : 'Published'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Failed Posts */}
        <div className="bg-tron-grid border border-tron-cyan/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-tron-text mb-4">
            Failed ({failedPosts.length})
          </h3>
          <div className="space-y-3">
            {failedPosts.slice(0, 3).map((post) => (
              <div key={post.id} className="bg-tron-dark/50 rounded p-3 border border-red-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <span>{getPlatformIcon(post.platform)}</span>
                  <span className="text-sm font-medium text-red-400">{post.platform}</span>
                </div>
                <div className="text-xs text-tron-text-muted truncate">{post.title}</div>
                <div className="text-xs text-red-400 mt-1">
                  {post.failed_reason || 'Publishing failed'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function TemplatesView({ templates, onTemplateUpdate }: { templates: any[], onTemplateUpdate: () => void }) {
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-tron-text">Content Templates</h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowScheduleDialog(true)}
          className="bg-tron-cyan hover:bg-tron-cyan/80 text-tron-dark px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          + New Template
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-tron-grid border border-tron-cyan/30 rounded-lg p-6 hover:border-tron-cyan/50 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <h4 className="font-semibold text-tron-text">{template.name}</h4>
              <span className="text-xs bg-tron-cyan/20 text-tron-cyan px-2 py-1 rounded">
                {template.category}
              </span>
            </div>
            
            <p className="text-sm text-tron-text-muted mb-4">
              {template.description}
            </p>
            
            <div className="bg-tron-dark/50 rounded p-3 mb-4">
              <p className="text-xs text-tron-text-muted line-clamp-3">
                {template.template_content}
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                {template.platforms?.map((platform: string) => (
                  <span key={platform} className="text-sm">
                    {getPlatformIcon(platform)}
                  </span>
                ))}
              </div>
              <span className="text-xs text-tron-text-muted">
                Used {template.usage_count || 0} times
              </span>
            </div>
          </motion.div>
        ))}
      </div>
      
      {templates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h4 className="text-lg font-semibold text-tron-text mb-2">No templates yet</h4>
          <p className="text-tron-text-muted mb-4">
            Create reusable templates to speed up your content creation
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowScheduleDialog(true)}
            className="bg-tron-cyan hover:bg-tron-cyan/80 text-tron-dark px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Create Your First Template
          </motion.button>
        </div>
      )}

      {/* Template Creation Dialog */}
      <SchedulePostDialog
        isOpen={showScheduleDialog}
        onClose={() => setShowScheduleDialog(false)}
        onPostScheduled={onTemplateUpdate}
        templates={[]}
      />
    </div>
  )
}

function getPlatformIcon(platform: string): string {
  const icons: Record<string, string> = {
    twitter: '🐦',
    linkedin: '💼',
    facebook: '📘',
    instagram: '📸',
    tiktok: '🎵',
    reddit: '🤖',
    youtube: '📺'
  }
  return icons[platform] || '📱'
}