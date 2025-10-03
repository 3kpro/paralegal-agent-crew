'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, CheckCircle, ArrowRight, Users } from 'lucide-react'

export default function WaitlistSection() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsSubmitting(true)
    
    // Simulate API call (replace with actual email capture service)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsSubmitted(true)
    setIsSubmitting(false)
    setEmail('')

    // Reset after 3 seconds for demo purposes
    setTimeout(() => {
      setIsSubmitted(false)
    }, 3000)
  }

  if (isSubmitted) {
    return (
      <section className="py-24 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto text-center"
          >
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">
              🎉 You're on the list!
            </h2>
            <p className="text-xl text-purple-100">
              We'll notify you when Content Cascade AI launches. 
              Get ready to revolutionize your content workflow!
            </p>
          </motion.div>
        </div>
      </section>
    )
  }

  return (
    <section id="waitlist" className="py-24 bg-gradient-to-r from-indigo-600 to-purple-600 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-white rounded-full"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white rounded-full"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm mb-8">
            <Users className="w-4 h-4 text-white" />
            <span className="text-sm font-semibold text-white">
              Join 1,200+ creators on the waitlist
            </span>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Be First to Access
            <br />
            <span className="bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
              Content Cascade AI
            </span>
          </h2>

          <p className="text-xl text-purple-100 mb-12 max-w-2xl mx-auto leading-relaxed">
            Get early access when we launch, plus exclusive bonuses:
            <strong className="text-white"> 50% off first month</strong> and
            <strong className="text-white"> free TrendPulse™ workflow</strong> ($79 value).
          </p>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-8">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-white text-gray-900 placeholder-gray-500 text-lg focus:outline-none focus:ring-4 focus:ring-white/30"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-gray-900 rounded-xl font-semibold text-lg transition-all duration-200 disabled:opacity-70 flex items-center gap-2 whitespace-nowrap"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>
                    Join Beta
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="text-3xl font-bold text-white mb-2">50%</div>
              <div className="text-purple-100">Launch Discount</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="text-3xl font-bold text-white mb-2">$79</div>
              <div className="text-purple-100">Free TrendPulse™</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="text-3xl font-bold text-white mb-2">30 days</div>
              <div className="text-purple-100">Priority Support</div>
            </div>
          </div>

          <p className="text-sm text-purple-200 mt-8">
            No spam, unsubscribe anytime. We respect your inbox.
          </p>
        </motion.div>
      </div>
    </section>
  )
}