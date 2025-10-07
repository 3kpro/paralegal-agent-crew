'use client'

import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const platformConfig = {
  twitter: { name: 'Twitter', icon: '🐦', color: 'bg-blue-500' },
  linkedin: { name: 'LinkedIn', icon: '💼', color: 'bg-blue-600' },
  facebook: { name: 'Facebook', icon: '📘', color: 'bg-blue-700' },
  instagram: { name: 'Instagram', icon: '📸', color: 'bg-pink-600' },
  tiktok: { name: 'TikTok', icon: '🎵', color: 'bg-black' },
  reddit: { name: 'Reddit', icon: '🤖', color: 'bg-orange-600' }
}

export default function ConnectPlatformPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [connected, setConnected] = useState(false)

  const platform = params.platform as string
  const fromOnboarding = searchParams.get('from') === 'onboarding'
  const config = platformConfig[platform as keyof typeof platformConfig]

  if (!config) {
    return <div>Platform not found</div>
  }

  const handleConnect = async () => {
    setLoading(true)
    try {
      // Simulate connection process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In a real implementation, this would:
      // 1. Redirect to OAuth provider
      // 2. Handle OAuth callback
      // 3. Store tokens in social_accounts table
      
      setConnected(true)
      
      // Auto-redirect after success
      setTimeout(() => {
        if (fromOnboarding) {
          router.push('/onboarding')
        } else {
          router.push('/settings')
        }
      }, 2000)
      
    } catch (error) {
      console.error('Connection error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = () => {
    if (fromOnboarding) {
      router.push('/onboarding')
    } else {
      router.push('/settings')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
          {!connected ? (
            <>
              <div className={`w-20 h-20 ${config.color} rounded-full flex items-center justify-center mx-auto mb-6`}>
                <span className="text-4xl">{config.icon}</span>
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Connect {config.name}
              </h1>
              <p className="text-gray-600 mb-8">
                Connect your {config.name} account to publish content directly from 3K Pro Services.
              </p>

              <div className="space-y-4">
                <button
                  onClick={handleConnect}
                  disabled={loading}
                  className={`w-full h-14 ${config.color} hover:opacity-90 disabled:opacity-50 text-white font-semibold rounded-lg transition-opacity flex items-center justify-center space-x-2`}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <span>{config.icon}</span>
                      <span>Connect {config.name}</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleSkip}
                  disabled={loading}
                  className="w-full h-12 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  Skip for now
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-6">
                Note: This is a demo connection flow. In production, this would redirect to {config.name}&apos;s OAuth authorization page.
              </p>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {config.name} Connected!
              </h1>
              <p className="text-gray-600 mb-4">
                Successfully connected your {config.name} account.
              </p>
              <p className="text-sm text-gray-500">
                Redirecting you back...
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}