'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function NewCampaignPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Step 1: Basic Info
  const [campaignName, setCampaignName] = useState('')
  const [targetPlatforms, setTargetPlatforms] = useState<string[]>([])

  // Step 2: Trend Discovery
  const [searchQuery, setSearchQuery] = useState('')
  const [trends, setTrends] = useState<any[]>([])
  const [selectedTrend, setSelectedTrend] = useState<any>(null)
  const [loadingTrends, setLoadingTrends] = useState(false)

  // Step 3: Content Generation
  const [aiTools, setAiTools] = useState<any[]>([])
  const [aiProvider, setAiProvider] = useState('lmstudio')
  const [contentFormats, setContentFormats] = useState<string[]>(['twitter', 'linkedin', 'email'])
  const [generatedContent, setGeneratedContent] = useState<any>(null)
  const [generatingContent, setGeneratingContent] = useState(false)
  const [aiToolsLoading, setAiToolsLoading] = useState(true)

  const platforms = [
    { id: 'twitter', name: 'Twitter', icon: '🐦' },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼' },
    { id: 'facebook', name: 'Facebook', icon: '📘' },
    { id: 'instagram', name: 'Instagram', icon: '📸' },
    { id: 'tiktok', name: 'TikTok', icon: '🎵' },
    { id: 'reddit', name: 'Reddit', icon: '🤖' }
  ]

  function togglePlatform(platformId: string) {
    setTargetPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    )
  }

  async function searchTrends() {
    if (!searchQuery.trim()) return

    setLoadingTrends(true)
    try {
      const response = await fetch('/api/trends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      })

      const data = await response.json()
      if (data.success) {
        setTrends(data.trends || [])
      }
    } catch (error) {
      console.error('Failed to fetch trends:', error)
    } finally {
      setLoadingTrends(false)
    }
  }

  // Load AI tools on mount
  useEffect(() => {
    async function loadAITools() {
      setAiToolsLoading(true)
      try {
        const response = await fetch('/api/ai-tools/list')
        const data = await response.json()
        if (data.success) {
          const configuredTools = data.providers.filter((p: any) => p.isConfigured)
          setAiTools(configuredTools)
          if (configuredTools.length > 0) {
            setAiProvider(configuredTools[0].provider_key)
          }
        }
      } catch (error) {
        console.error('Failed to load AI tools:', error)
      } finally {
        setAiToolsLoading(false)
      }
    }
    loadAITools()
  }, [])

  async function generateContent() {
    if (!selectedTrend) return

    setGeneratingContent(true)
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: selectedTrend.Hashtag || selectedTrend.query || searchQuery,
          formats: contentFormats,
          preferredProvider: aiProvider
        })
      })

      const data = await response.json()
      if (data.success) {
        setGeneratedContent(data.content)
      } else if (data.requiresSetup) {
        alert('No AI tools configured. Please set up an AI tool in Settings.')
        router.push('/settings?tab=api-keys')
      } else {
        alert(`Generation failed: ${data.error}`)
      }
    } catch (error) {
      console.error('Failed to generate content:', error)
      alert('Content generation failed. Please try again.')
    } finally {
      setGeneratingContent(false)
    }
  }

  async function saveCampaign() {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Save campaign
      const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .insert({
          user_id: user.id,
          name: campaignName,
          target_platforms: targetPlatforms,
          status: 'draft',
          metadata: {
            trend: selectedTrend,
            ai_provider: aiProvider
          }
        })
        .select()
        .single()

      if (campaignError) throw campaignError

      // Save generated content
      if (generatedContent) {
        const contentRecords = Object.entries(generatedContent).map(([platform, content]: [string, any]) => ({
          campaign_id: campaign.id,
          user_id: user.id,
          platform,
          content_text: content.content || content.subject,
          metadata: content
        }))

        const { error: contentError } = await supabase
          .from('campaign_content')
          .insert(contentRecords)

        if (contentError) throw contentError
      }

      router.push(`/campaigns/${campaign.id}`)
    } catch (error: any) {
      console.error('Failed to save campaign:', error)
      alert('Failed to save campaign: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Campaign</h1>
        <p className="text-gray-600 mb-8">Follow the steps to create your multi-platform content campaign</p>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex-1">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                1
              </div>
              <div className="ml-4">
                <div className="font-semibold text-gray-900">Basic Info</div>
                <div className="text-sm text-gray-600">Name and platforms</div>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                2
              </div>
              <div className="ml-4">
                <div className="font-semibold text-gray-900">Find Trends</div>
                <div className="text-sm text-gray-600">Discover trending topics</div>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                3
              </div>
              <div className="ml-4">
                <div className="font-semibold text-gray-900">Generate Content</div>
                <div className="text-sm text-gray-600">AI-powered creation</div>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 4 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                4
              </div>
              <div className="ml-4">
                <div className="font-semibold text-gray-900">Review & Publish</div>
                <div className="text-sm text-gray-600">Final review</div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Campaign Details</h2>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Name
              </label>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="e.g., Q1 Product Launch"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Target Platforms (select at least one)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {platforms.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => togglePlatform(platform.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      targetPlatforms.includes(platform.id)
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">{platform.icon}</div>
                    <div className="font-semibold text-gray-900">{platform.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!campaignName || targetPlatforms.length === 0}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next: Find Trends →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Trend Discovery */}
        {step === 2 && (
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Discover Trending Topics</h2>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search for trends
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchTrends()}
                  placeholder="e.g., AI, fitness, tech news"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  onClick={searchTrends}
                  disabled={loadingTrends || !searchQuery.trim()}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  {loadingTrends ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>

            {trends.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Trending Topics</h3>
                <div className="space-y-3">
                  {trends.map((trend, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedTrend(trend)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedTrend === trend
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold text-gray-900">{trend.Hashtag || trend.query}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {trend.Description || 'Trending topic'}
                      </div>
                      {trend.TweetVolume && (
                        <div className="text-xs text-indigo-600 mt-2">
                          {trend.TweetVolume.toLocaleString()} posts
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!selectedTrend}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next: Generate Content →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Content Generation */}
        {step === 3 && (
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Generate AI Content</h2>

            <div className="mb-6">
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
                <div className="font-semibold text-gray-900">Selected Topic:</div>
                <div className="text-indigo-600">{selectedTrend?.Hashtag || selectedTrend?.query || searchQuery}</div>
              </div>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                AI Provider
              </label>
              {aiToolsLoading ? (
                <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 mb-6">
                  Loading AI tools...
                </div>
              ) : aiTools.length > 0 ? (
                <select
                  value={aiProvider}
                  onChange={(e) => setAiProvider(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-6"
                >
                  {aiTools.map(tool => (
                    <option key={tool.provider_key} value={tool.provider_key}>
                      {tool.name} {tool.category === 'local' ? '(Free)' : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="w-full mb-6">
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="font-semibold text-yellow-900 mb-2">No AI tools configured</div>
                    <div className="text-sm text-yellow-800 mb-3">
                      You need to configure at least one AI tool to generate content.
                    </div>
                    <button
                      onClick={() => router.push('/settings?tab=api-keys')}
                      className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition-colors"
                    >
                      Configure AI Tools →
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={generateContent}
                disabled={generatingContent || aiTools.length === 0}
                className="w-full px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 text-lg"
              >
                {generatingContent ? 'Generating Content...' : '✨ Generate Content for All Platforms'}
              </button>

              {aiTools.length > 0 && (
                <div className="mt-3 text-sm text-gray-600 text-center">
                  Using: {aiTools.find(t => t.provider_key === aiProvider)?.name || 'AI Provider'}
                </div>
              )}
            </div>

            {generatedContent && (
              <div className="space-y-4 mb-6">
                <h3 className="font-semibold text-gray-900">Generated Content:</h3>

                {generatedContent.twitter && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-gray-900">🐦 Twitter</div>
                      <div className="text-sm text-gray-600">
                        {generatedContent.twitter.characterCount}/280 chars
                      </div>
                    </div>
                    <div className="text-gray-800 whitespace-pre-wrap">
                      {generatedContent.twitter.content}
                    </div>
                  </div>
                )}

                {generatedContent.linkedin && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="font-semibold text-gray-900 mb-2">💼 LinkedIn</div>
                    <div className="text-gray-800 whitespace-pre-wrap">
                      {generatedContent.linkedin.content}
                    </div>
                  </div>
                )}

                {generatedContent.email && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="font-semibold text-gray-900 mb-2">✉️ Email</div>
                    <div className="font-semibold text-gray-900 text-sm mb-2">
                      Subject: {generatedContent.email.subject}
                    </div>
                    <div className="text-gray-800 whitespace-pre-wrap">
                      {generatedContent.email.content}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(4)}
                disabled={!generatedContent}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next: Review & Save →
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Review & Save */}
        {step === 4 && (
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Review & Save Campaign</h2>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="text-sm font-medium text-gray-600 mb-1">Campaign Name</div>
                  <div className="font-semibold text-gray-900">{campaignName}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600 mb-1">Target Platforms</div>
                  <div className="font-semibold text-gray-900">{targetPlatforms.length} platforms</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600 mb-1">Topic</div>
                  <div className="font-semibold text-gray-900">
                    {selectedTrend?.Hashtag || selectedTrend?.query || searchQuery}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600 mb-1">AI Provider</div>
                  <div className="font-semibold text-gray-900">{aiProvider}</div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-800">
                ✓ Your campaign will be saved as a draft. You can publish it to your connected social accounts from the campaign details page.
              </p>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(3)}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={saveCampaign}
                disabled={loading}
                className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 text-lg"
              >
                {loading ? 'Saving...' : '✓ Save Campaign'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
