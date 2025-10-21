'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

interface ComingSoonModalProps {
  isOpen: boolean
  onClose: () => void
  tier?: 'pro' | 'premium'
}

export default function ComingSoonModal({ isOpen, onClose, tier = 'pro' }: ComingSoonModalProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()

      // Get current user if logged in
      const { data: { user } } = await supabase.auth.getUser()

      // Store waitlist signup
      const { error: insertError } = await supabase
        .from('waitlist')
        .insert({
          email: email || user?.email,
          tier: tier,
          user_id: user?.id || null,
          source: 'settings_upgrade_button'
        })

      if (insertError) throw insertError

      setSubmitted(true)
      setTimeout(() => {
        onClose()
        setSubmitted(false)
        setEmail('')
      }, 2500)
    } catch (err: any) {
      setError(err.message || 'Failed to join waitlist')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] z-50 overflow-hidden"
          >
            <div className="bg-gradient-to-br from-tron-grid to-tron-dark border-2 border-tron-cyan rounded-2xl shadow-2xl shadow-tron-cyan/20 overflow-hidden flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="bg-tron-dark/50 border-b border-tron-cyan/30 p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-tron-cyan animate-pulse" />
                  <h2 className="text-2xl font-bold text-tron-text">
                    {tier === 'premium' ? 'Premium' : 'Pro'} Tier - Coming Soon
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-tron-text-muted hover:text-tron-cyan transition-colors text-2xl"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="p-8 space-y-6 overflow-y-auto flex-1">
                {!submitted ? (
                  <>
                    {/* Big Picture Vision */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-tron-cyan">
                        The Big Picture: Content Cascade AI
                      </h3>
                      <p className="text-tron-text-muted leading-relaxed">
                        TrendPulse is just the beginning. We're building a complete AI-powered content ecosystem that transforms how you create, manage, and distribute content across the internet.
                      </p>
                    </div>

                    {/* Feature Preview Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-tron-dark/50 border border-tron-cyan/20 rounded-lg p-4">
                        <div className="text-2xl mb-2">🎯</div>
                        <h4 className="font-semibold text-tron-text mb-1">TrendPulse</h4>
                        <p className="text-xs text-tron-text-muted">Ride trending topics before your competition</p>
                        <span className="inline-block mt-2 text-xs bg-tron-cyan/20 text-tron-cyan px-2 py-1 rounded">
                          LIVE NOW
                        </span>
                      </div>

                      <div className="bg-tron-dark/50 border border-tron-cyan/20 rounded-lg p-4">
                        <div className="text-2xl mb-2">📅</div>
                        <h4 className="font-semibold text-tron-text mb-1">ContentFlow</h4>
                        <p className="text-xs text-tron-text-muted">Schedule & auto-publish across all platforms</p>
                        <span className="inline-block mt-2 text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                          COMING SOON
                        </span>
                      </div>

                      <div className="bg-tron-dark/50 border border-tron-cyan/20 rounded-lg p-4">
                        <div className="text-2xl mb-2">🤖</div>
                        <h4 className="font-semibold text-tron-text mb-1">AI Studio</h4>
                        <p className="text-xs text-tron-text-muted">Multi-AI orchestration for premium content</p>
                        <span className="inline-block mt-2 text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                          COMING SOON
                        </span>
                      </div>

                      <div className="bg-tron-dark/50 border border-tron-cyan/20 rounded-lg p-4">
                        <div className="text-2xl mb-2">📊</div>
                        <h4 className="font-semibold text-tron-text mb-1">Analytics Hub</h4>
                        <p className="text-xs text-tron-text-muted">Track performance & optimize engagement</p>
                        <span className="inline-block mt-2 text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                          COMING SOON
                        </span>
                      </div>

                      <div className="bg-tron-dark/50 border border-tron-cyan/20 rounded-lg p-4">
                        <div className="text-2xl mb-2">🎨</div>
                        <h4 className="font-semibold text-tron-text mb-1">Media Generator</h4>
                        <p className="text-xs text-tron-text-muted">AI images, videos, and graphics on demand</p>
                        <span className="inline-block mt-2 text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
                          Q1 2026
                        </span>
                      </div>

                      <div className="bg-tron-dark/50 border border-tron-cyan/20 rounded-lg p-4">
                        <div className="text-2xl mb-2">🔗</div>
                        <h4 className="font-semibold text-tron-text mb-1">Platform Connect</h4>
                        <p className="text-xs text-tron-text-muted">Direct posting to 20+ social platforms</p>
                        <span className="inline-block mt-2 text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
                          Q1 2026
                        </span>
                      </div>
                    </div>

                    {/* Waitlist CTA */}
                    <div className="bg-gradient-to-r from-tron-cyan/10 to-blue-500/10 border border-tron-cyan/30 rounded-lg p-6">
                      <h3 className="text-lg font-bold text-tron-text mb-2">
                        Be First in Line
                      </h3>
                      <p className="text-sm text-tron-text-muted mb-4">
                        Join the waitlist to get early access, exclusive beta pricing, and be notified the moment premium features launch.
                      </p>

                      <form onSubmit={handleSubmit} className="space-y-3">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your@email.com"
                          required
                          className="w-full px-4 py-3 bg-tron-dark border border-tron-grid rounded-lg focus:ring-2 focus:ring-tron-cyan focus:border-transparent text-tron-text"
                        />

                        {error && (
                          <p className="text-sm text-red-400">{error}</p>
                        )}

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full px-6 py-3 bg-gradient-to-r from-tron-cyan to-blue-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-tron-cyan/30 transition-all disabled:opacity-50"
                        >
                          {loading ? 'Joining...' : 'Join Waitlist'}
                        </button>
                      </form>
                    </div>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="text-6xl mb-4">✅</div>
                    <h3 className="text-2xl font-bold text-tron-cyan mb-2">
                      You're on the list!
                    </h3>
                    <p className="text-tron-text-muted">
                      We'll notify you as soon as premium features launch.
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Footer - 3KPRO Branding */}
              <div className="bg-tron-dark/30 border-t border-tron-cyan/20 px-6 py-3">
                <div className="flex items-center justify-end">
                  <a
                    href="https://3kpro.services"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-tron-text-muted hover:text-tron-cyan transition-colors flex items-center gap-1"
                  >
                    Powered by <span className="font-semibold">3KPRO</span>
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
