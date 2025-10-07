'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Step 1: Profile
  const [companyName, setCompanyName] = useState('')
  const [industry, setIndustry] = useState('')

  // Step 2: Social accounts (placeholder)
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([])

  const handleComplete = async () => {
    setLoading(true)
    try {
      // Update onboarding progress
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        await supabase
          .from('onboarding_progress')
          .update({
            profile_completed: true,
            completed: true,
            current_step: 4
          })
          .eq('user_id', user.id)

        // Update profile
        await supabase
          .from('profiles')
          .update({ company_name: companyName })
          .eq('id', user.id)
      }

      router.push('/dashboard')
    } catch (error) {
      console.error('Onboarding error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600">Step {step} of 2</span>
            <span className="text-sm text-gray-500">Almost there!</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 2) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {step === 1 && (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
              <p className="text-gray-600 mb-6">Help us personalize your experience</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Acme Inc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry (Optional)
                  </label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select industry...</option>
                    <option value="technology">Technology</option>
                    <option value="marketing">Marketing</option>
                    <option value="ecommerce">E-commerce</option>
                    <option value="education">Education</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="finance">Finance</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Next: Connect Socials →
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Connect Social Accounts</h1>
              <p className="text-gray-600 mb-6">Connect platforms to publish your content (you can skip this for now)</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <button 
                  onClick={() => router.push('/api/auth/connect/twitter')}
                  className="h-16 border-2 border-gray-300 hover:border-indigo-500 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <span className="text-2xl">🐦</span>
                  <span className="font-medium text-gray-700">Twitter</span>
                </button>
                <button 
                  onClick={() => router.push('/api/auth/connect/linkedin')}
                  className="h-16 border-2 border-gray-300 hover:border-indigo-500 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <span className="text-2xl">💼</span>
                  <span className="font-medium text-gray-700">LinkedIn</span>
                </button>
                <button 
                  onClick={() => router.push('/api/auth/connect/facebook')}
                  className="h-16 border-2 border-gray-300 hover:border-indigo-500 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <span className="text-2xl">📘</span>
                  <span className="font-medium text-gray-700">Facebook</span>
                </button>
                <button 
                  onClick={() => router.push('/api/auth/connect/instagram')}
                  className="h-16 border-2 border-gray-300 hover:border-indigo-500 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <span className="text-2xl">📸</span>
                  <span className="font-medium text-gray-700">Instagram</span>
                </button>
                <button 
                  onClick={() => router.push('/api/auth/connect/tiktok')}
                  className="h-16 border-2 border-gray-300 hover:border-indigo-500 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <span className="text-2xl">🎵</span>
                  <span className="font-medium text-gray-700">TikTok</span>
                </button>
                <button 
                  onClick={() => router.push('/api/auth/connect/reddit')}
                  className="h-16 border-2 border-gray-300 hover:border-indigo-500 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <span className="text-2xl">🤖</span>
                  <span className="font-medium text-gray-700">Reddit</span>
                </button>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleComplete}
                  disabled={loading}
                  className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-lg transition-colors"
                >
                  {loading ? 'Completing...' : 'Complete Setup →'}
                </button>
                <button
                  onClick={handleComplete}
                  className="w-full h-12 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  Skip for now
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
