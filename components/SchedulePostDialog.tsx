'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Calendar, Clock, Send, Loader2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface SchedulePostDialogProps {
  isOpen: boolean
  onClose: () => void
  onPostScheduled: () => void
  templates?: any[]
}

export function SchedulePostDialog({ isOpen, onClose, onPostScheduled, templates = [] }: SchedulePostDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    platform: '',
    scheduled_date: '',
    scheduled_time: '',
    post_type: 'text',
    campaign_id: '',
    category: ''
  })

  const platforms = [
    { value: 'twitter', label: 'Twitter', icon: '🐦' },
    { value: 'linkedin', label: 'LinkedIn', icon: '💼' },
    { value: 'facebook', label: 'Facebook', icon: '📘' },
    { value: 'instagram', label: 'Instagram', icon: '📸' },
    { value: 'tiktok', label: 'TikTok', icon: '🎵' },
    { value: 'reddit', label: 'Reddit', icon: '🤖' },
    { value: 'youtube', label: 'YouTube', icon: '📺' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.content || !formData.platform || !formData.scheduled_date || !formData.scheduled_time) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      // Combine date and time
      const scheduledAt = new Date(`${formData.scheduled_date}T${formData.scheduled_time}`)
      
      // Check if scheduled time is in the future
      if (scheduledAt <= new Date()) {
        alert('Scheduled time must be in the future')
        setLoading(false)
        return
      }

      const response = await fetch('/api/contentflow/scheduled-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          platform: formData.platform,
          scheduled_at: scheduledAt.toISOString(),
          post_type: formData.post_type,
          campaign_id: formData.campaign_id || null
        })
      })

      const result = await response.json()

      if (result.success) {
        alert('Post scheduled successfully!')
        setFormData({
          title: '',
          content: '',
          platform: '',
          scheduled_date: '',
          scheduled_time: '',
          post_type: 'text',
          campaign_id: ''
        })
        onClose()
        onPostScheduled()
      } else {
        alert(result.error || 'Failed to schedule post')
      }
    } catch (error) {
      console.error('Schedule post error:', error)
      alert('Failed to schedule post')
    } finally {
      setLoading(false)
    }
  }

  const handleTemplateSelect = (template: any) => {
    setFormData(prev => ({
      ...prev,
      title: template.name,
      content: template.content || template.template_content,
      platform: template.platforms?.[0] || prev.platform
    }))
    alert('Template applied!')
  }

  // Get current date and time for minimum values
  const now = new Date()
  const currentDate = now.toISOString().split('T')[0]

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-tron-dark border border-tron-cyan/30 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-tron-cyan" />
              <h2 className="text-xl font-bold text-tron-text">Schedule New Post</h2>
            </div>
            <Button
              onClick={onClose}
              variant="outline"
              className="text-tron-text-muted hover:text-tron-text"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" aria-label="Schedule post form">
            {/* Template Selection */}
            {templates.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-tron-text">Quick Start with Template</label>
                <div className="grid grid-cols-2 gap-2">
                  {templates.slice(0, 4).map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => handleTemplateSelect(template)}
                      className="text-left p-3 bg-tron-grid border border-tron-cyan/20 rounded-lg hover:border-tron-cyan/40 transition-colors"
                    >
                      <div className="font-medium text-sm text-tron-text">{template.name}</div>
                      <div className="text-xs text-tron-text-muted truncate">{template.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-tron-text">Post Title *</label>
              <input
                id="post-title"
                name="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter a title for your post..."
                className="w-full p-3 bg-tron-grid border border-tron-cyan/30 rounded-lg text-tron-text placeholder:text-tron-text-muted focus:border-tron-cyan focus:outline-none"
                required
                aria-label="Post title"
                aria-required="true"
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-tron-text">Content *</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Write your post content here..."
                rows={4}
                className="w-full p-3 bg-tron-grid border border-tron-cyan/30 rounded-lg text-tron-text placeholder:text-tron-text-muted focus:border-tron-cyan focus:outline-none resize-none"
                required
              />
              <div className="text-xs text-tron-text-muted">
                {formData.content.length} characters
              </div>
            </div>

            {/* Platform */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-tron-text">Platform *</label>
              <select
                id="post-platform"
                name="platform"
                value={formData.platform}
                onChange={(e) => setFormData(prev => ({ ...prev, platform: e.target.value }))}
                className="w-full p-3 bg-tron-grid border border-tron-cyan/30 rounded-lg text-tron-text focus:border-tron-cyan focus:outline-none"
                required
                aria-label="Social media platform"
                aria-required="true"
              >
                <option value="">Select platform</option>
                {platforms.map((platform) => (
                  <option key={platform.value} value={platform.value}>
                    {platform.icon} {platform.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Scheduling */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-tron-text">Date *</label>
                <input
                  type="date"
                  id="scheduled-date"
                  name="scheduled_date"
                  value={formData.scheduled_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduled_date: e.target.value }))}
                  min={currentDate}
                  className="w-full p-3 bg-tron-grid border border-tron-cyan/30 rounded-lg text-tron-text focus:border-tron-cyan focus:outline-none"
                  required
                  aria-label="Scheduled date"
                  aria-required="true"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-tron-text">Time *</label>
                <input
                  type="time"
                  id="scheduled-time"
                  name="scheduled_time"
                  value={formData.scheduled_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduled_time: e.target.value }))}
                  className="w-full p-3 bg-tron-grid border border-tron-cyan/30 rounded-lg text-tron-text focus:border-tron-cyan focus:outline-none"
                  required
                  aria-label="Scheduled time"
                  aria-required="true"
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-tron-cyan hover:bg-tron-cyan/80 text-tron-dark font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Schedule Post
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}