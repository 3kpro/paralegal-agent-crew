'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import SidebarGuide from '@/components/SidebarGuide'

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
      const response = await fetch(`/api/trends?keyword=${encodeURIComponent(searchQuery)}&mode=ideas`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        cache: 'no-store'
      })

      const data = await response.json()
      if (data.success) {
        setTrends(data.data?.trending || [])
      } else {
        console.error('Trends API error:', data.error)
        setTrends([])
      }
    } catch (error) {
      console.error('Failed to fetch trends:', error)
      setTrends([])
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
          topic: selectedTrend.title || searchQuery,
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
          platform,
          body: content.content || content.subject || content.body || '',
          title: content.subject || content.title || null,
          hashtags: content.hashtags || null,
          generated_by: aiProvider || null
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
    <div className="p-8 bg-tron-dark min-h-screen">
      {/* Sidebar Guide */}
      <SidebarGuide currentStep={step} />

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-tron-text mb-2">Create New Campaign</h1>
        <p className="text-tron-text-muted mb-8">Follow the steps to create your multi-platform content campaign</p>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex-1">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-tron-cyan text-white' : 'bg-tron-grid text-tron-text-muted'}`}>
                1
              </div>
              <div className="ml-4">
                <div className="font-semibold text-tron-text">Basic Info</div>
                <div className="text-sm text-tron-text-muted">Name and platforms</div>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-tron-cyan text-white' : 'bg-tron-grid text-tron-text-muted'}`}>
                2
              </div>
              <div className="ml-4">
                <div className="font-semibold text-tron-text">Find Trends</div>
                <div className="text-sm text-tron-text-muted">Discover trending topics</div>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-tron-cyan text-white' : 'bg-tron-grid text-tron-text-muted'}`}>
                3
              </div>
              <div className="ml-4">
                <div className="font-semibold text-tron-text">Generate Content</div>
                <div className="text-sm text-tron-text-muted">AI-powered creation</div>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 4 ? 'bg-tron-cyan text-white' : 'bg-tron-grid text-tron-text-muted'}`}>
                4
              </div>
              <div className="ml-4">
                <div className="font-semibold text-tron-text">Review & Publish</div>
                <div className="text-sm text-tron-text-muted">Final review</div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="bg-tron-grid rounded-xl border border-tron-cyan/30 p-8">
            <h2 className="text-xl font-bold text-tron-text mb-6">Campaign Details</h2>

            <div className="mb-6">
              <label className="block text-sm font-medium text-tron-text-muted mb-2">
                Campaign Name
              </label>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="e.g., Q1 Product Launch"
                className="w-full px-4 py-3 bg-tron-dark border border-tron-grid rounded-lg focus:ring-2 focus:ring-tron-cyan focus:border-transparent text-tron-text"
              />
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-tron-text-muted mb-2">
                Select Platforms for Content (select at least one)
              </label>
              <p className="text-xs text-tron-text-muted mb-4">
                Generate content for copy/paste to your accounts
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {platforms.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => togglePlatform(platform.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      targetPlatforms.includes(platform.id)
                        ? 'border-tron-cyan bg-tron-cyan/20'
                        : 'border-tron-cyan/30 hover:border-tron-grid'
                    }`}
                  >
                    <div className="text-3xl mb-2">{platform.icon}</div>
                    <div className="font-semibold text-tron-text">{platform.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!campaignName || targetPlatforms.length === 0}
                className="px-6 py-3 bg-tron-grid border-2 border-tron-cyan text-tron-cyan hover:bg-tron-cyan hover:text-tron-dark font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next: Find Trends →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Trend Discovery */}
        {step === 2 && (
          <div className="bg-tron-grid rounded-xl border border-tron-cyan/30 p-8">
            <h2 className="text-xl font-bold text-tron-text mb-6">Discover Trending Topics</h2>

            <div className="mb-6">
              <label className="block text-sm font-medium text-tron-text-muted mb-2">
                Search for trends
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchTrends()}
                  placeholder="e.g., AI, fitness, tech news"
                  className="flex-1 px-4 py-3 bg-tron-dark border border-tron-grid rounded-lg focus:ring-2 focus:ring-tron-cyan focus:border-transparent text-tron-text placeholder-tron-text-muted"
                />
                <button
                  onClick={searchTrends}
                  disabled={loadingTrends || !searchQuery.trim()}
                  className="px-6 py-3 bg-tron-grid border-2 border-tron-cyan text-tron-cyan hover:bg-tron-cyan hover:text-tron-dark font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  {loadingTrends ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>

            {trends.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-tron-text mb-4">Trending Topics</h3>
                <div className="space-y-3">
                  {trends.map((trend, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedTrend(trend)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedTrend === trend
                          ? 'border-tron-cyan bg-tron-cyan/20'
                          : 'border-tron-cyan/30 hover:border-tron-grid'
                      }`}
                    >
                      <div className="font-semibold text-tron-text">{trend.title}</div>
                      <div className="text-sm text-tron-text-muted mt-1">
                        {trend.formattedTraffic || 'Trending topic'}
                      </div>
                      {trend.relatedQueries && trend.relatedQueries.length > 0 && (
                        <div className="text-xs text-tron-cyan mt-2">
                          Related: {trend.relatedQueries.slice(0, 2).join(', ')}
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
                className="px-6 py-3 border border-tron-grid text-tron-text-muted font-semibold rounded-lg hover:bg-tron-dark transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!selectedTrend}
                className="px-6 py-3 bg-tron-grid border-2 border-tron-cyan text-tron-cyan hover:bg-tron-cyan hover:text-tron-dark font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next: Generate Content →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Content Generation */}
        {step === 3 && (
          <div className="bg-tron-grid rounded-xl border border-tron-cyan/30 p-8">
            <h2 className="text-xl font-bold text-tron-text mb-6">Generate AI Content</h2>

            <div className="mb-6">
              <div className="bg-tron-cyan/20 border border-tron-cyan/30 rounded-lg p-4 mb-6">
                <div className="font-semibold text-tron-text">Selected Topic:</div>
                <div className="text-tron-cyan">{selectedTrend?.title || searchQuery}</div>
              </div>

              <label className="block text-sm font-medium text-tron-text-muted mb-2">
                AI Provider
              </label>
              {aiToolsLoading ? (
                <div className="w-full px-4 py-3 border border-tron-grid rounded-lg bg-tron-dark mb-6">
                  Loading AI tools...
                </div>
              ) : aiTools.length > 0 ? (
                <select
                  id="ai-provider-select"
                  value={aiProvider}
                  onChange={(e) => setAiProvider(e.target.value)}
                  title="Select AI provider for content generation"
                  aria-label="AI Provider selection"
                  className="w-full px-4 py-3 bg-tron-dark border border-tron-grid rounded-lg focus:ring-2 focus:ring-tron-cyan focus:border-transparent text-tron-text mb-6"
                >
                  {aiTools.map(tool => (
                    <option key={tool.provider_key} value={tool.provider_key}>
                      {tool.name} {tool.category === 'local' ? '(Free)' : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="w-full mb-6">
                  <div className="p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
                    <div className="font-semibold text-yellow-400 mb-2">No AI tools configured</div>
                    <div className="text-sm text-yellow-300 mb-3">
                      You need to configure at least one AI tool to generate content.
                    </div>
                    <button
                      onClick={() => router.push('/settings?tab=api-keys')}
                      className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition-colors"
                    >
                      Configure AI Tools →
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={generateContent}
                disabled={generatingContent || aiTools.length === 0}
                className="w-full px-6 py-4 bg-tron-grid border-2 border-tron-cyan text-tron-cyan hover:bg-tron-cyan hover:text-tron-dark font-semibold rounded-lg transition-colors disabled:opacity-50 text-lg"
              >
                {generatingContent ? 'Generating Content...' : '✨ Generate Content for All Platforms'}
              </button>

              {aiTools.length > 0 && (
                <div className="mt-3 text-sm text-tron-text-muted text-center">
                  Using: {aiTools.find(t => t.provider_key === aiProvider)?.name || 'AI Provider'}
                </div>
              )}
            </div>

            {generatedContent && (
              <div className="mb-8">
                {/* Success indicator */}
                <div className="bg-gradient-to-r from-tron-cyan/20 to-tron-grid rounded-lg border-2 border-tron-cyan/50 p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-tron-cyan flex items-center justify-center">
                      <span className="text-white font-bold">✓</span>
                    </div>
                    <div>
                      <div className="font-bold text-tron-cyan text-lg">Content Generated Successfully!</div>
                      <div className="text-sm text-tron-text-muted">
                        Generated content for {Object.keys(generatedContent).length} platforms
                      </div>
                    </div>
                  </div>
                </div>

                {/* Platform content grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {generatedContent.twitter && (
                    <div className="bg-gradient-to-br from-blue-950/30 to-tron-grid rounded-xl border-2 border-blue-400/30 p-6 hover:border-blue-400/50 transition-all">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">🐦</span>
                          </div>
                          <div>
                            <div className="font-bold text-tron-text text-lg">Twitter</div>
                            <div className="text-xs text-blue-400">Micro-blogging platform</div>
                          </div>
                        </div>
                        <div className="bg-blue-500/20 px-3 py-1 rounded-full">
                          <div className="text-sm font-semibold text-blue-400">
                            {generatedContent.twitter.characterCount || generatedContent.twitter.content?.length || 0}/280
                          </div>
                        </div>
                      </div>
                      <div className="bg-tron-dark/50 rounded-lg p-4 border border-blue-400/20">
                        <div className="text-tron-text whitespace-pre-wrap leading-relaxed">
                          {generatedContent.twitter.content}
                        </div>
                        {generatedContent.twitter.hashtags && (
                          <div className="mt-3 pt-3 border-t border-blue-400/20">
                            <div className="text-xs text-blue-400 font-medium mb-1">Hashtags:</div>
                            <div className="text-sm text-blue-300">
                              {Array.isArray(generatedContent.twitter.hashtags) 
                                ? generatedContent.twitter.hashtags.join(' ') 
                                : generatedContent.twitter.hashtags}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {generatedContent.linkedin && (
                    <div className="bg-gradient-to-br from-blue-800/30 to-tron-grid rounded-xl border-2 border-blue-500/30 p-6 hover:border-blue-500/50 transition-all">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">💼</span>
                          </div>
                          <div>
                            <div className="font-bold text-tron-text text-lg">LinkedIn</div>
                            <div className="text-xs text-blue-300">Professional network</div>
                          </div>
                        </div>
                        <div className="bg-blue-600/20 px-3 py-1 rounded-full">
                          <div className="text-sm font-semibold text-blue-300">
                            {generatedContent.linkedin.content?.length || 0} chars
                          </div>
                        </div>
                      </div>
                      <div className="bg-tron-dark/50 rounded-lg p-4 border border-blue-500/20">
                        <div className="text-tron-text whitespace-pre-wrap leading-relaxed">
                          {generatedContent.linkedin.content}
                        </div>
                        {generatedContent.linkedin.hashtags && (
                          <div className="mt-3 pt-3 border-t border-blue-500/20">
                            <div className="text-xs text-blue-300 font-medium mb-1">Hashtags:</div>
                            <div className="text-sm text-blue-200">
                              {Array.isArray(generatedContent.linkedin.hashtags) 
                                ? generatedContent.linkedin.hashtags.join(' ') 
                                : generatedContent.linkedin.hashtags}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {generatedContent.email && (
                    <div className="bg-gradient-to-br from-green-900/30 to-tron-grid rounded-xl border-2 border-green-500/30 p-6 hover:border-green-500/50 transition-all lg:col-span-2">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">✉️</span>
                          </div>
                          <div>
                            <div className="font-bold text-tron-text text-lg">Email</div>
                            <div className="text-xs text-green-400">Newsletter format</div>
                          </div>
                        </div>
                        <div className="bg-green-600/20 px-3 py-1 rounded-full">
                          <div className="text-sm font-semibold text-green-400">
                            {(generatedContent.email.subject?.length || 0) + (generatedContent.email.content?.length || 0)} chars
                          </div>
                        </div>
                      </div>
                      <div className="bg-tron-dark/50 rounded-lg p-4 border border-green-500/20">
                        {generatedContent.email.subject && (
                          <div className="mb-4 pb-4 border-b border-green-500/20">
                            <div className="text-xs text-green-400 font-medium mb-1">Subject Line:</div>
                            <div className="font-bold text-tron-text text-lg">
                              {generatedContent.email.subject}
                            </div>
                          </div>
                        )}
                        <div className="text-tron-text whitespace-pre-wrap leading-relaxed">
                          {generatedContent.email.content}
                        </div>
                        {generatedContent.email.hashtags && (
                          <div className="mt-3 pt-3 border-t border-green-500/20">
                            <div className="text-xs text-green-400 font-medium mb-1">Keywords:</div>
                            <div className="text-sm text-green-300">
                              {Array.isArray(generatedContent.email.hashtags) 
                                ? generatedContent.email.hashtags.join(', ') 
                                : generatedContent.email.hashtags}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Support for additional platforms */}
                  {Object.entries(generatedContent).map(([platform, content]: [string, any]) => {
                    // Skip already rendered platforms
                    if (['twitter', 'linkedin', 'email'].includes(platform)) return null;
                    
                    // Get platform info
                    const platformInfo = platforms.find(p => p.id === platform) || { 
                      id: platform, 
                      name: platform.charAt(0).toUpperCase() + platform.slice(1), 
                      icon: '🌐' 
                    };
                    
                    return (
                      <div key={platform} className="bg-gradient-to-br from-purple-900/30 to-tron-grid rounded-xl border-2 border-purple-500/30 p-6 hover:border-purple-500/50 transition-all">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                              <span className="text-white font-bold text-lg">{platformInfo.icon}</span>
                            </div>
                            <div>
                              <div className="font-bold text-tron-text text-lg">{platformInfo.name}</div>
                              <div className="text-xs text-purple-400">Social platform</div>
                            </div>
                          </div>
                          <div className="bg-purple-600/20 px-3 py-1 rounded-full">
                            <div className="text-sm font-semibold text-purple-400">
                              {content?.content?.length || content?.body?.length || 0} chars
                            </div>
                          </div>
                        </div>
                        <div className="bg-tron-dark/50 rounded-lg p-4 border border-purple-500/20">
                          {content?.title && (
                            <div className="mb-3 pb-3 border-b border-purple-500/20">
                              <div className="font-bold text-tron-text">{content.title}</div>
                            </div>
                          )}
                          <div className="text-tron-text whitespace-pre-wrap leading-relaxed">
                            {content?.content || content?.body || content}
                          </div>
                          {content?.hashtags && (
                            <div className="mt-3 pt-3 border-t border-purple-500/20">
                              <div className="text-xs text-purple-400 font-medium mb-1">Tags:</div>
                              <div className="text-sm text-purple-300">
                                {Array.isArray(content.hashtags) 
                                  ? content.hashtags.join(' ') 
                                  : content.hashtags}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Generation summary */}
                <div className="mt-6 text-center">
                  <div className="inline-flex items-center gap-2 bg-tron-cyan/10 border border-tron-cyan/30 rounded-full px-4 py-2">
                    <span className="w-2 h-2 bg-tron-cyan rounded-full animate-pulse"></span>
                    <span className="text-sm text-tron-cyan font-medium">
                      Content ready for {Object.keys(generatedContent).length} platforms
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 border border-tron-grid text-tron-text-muted font-semibold rounded-lg hover:bg-tron-dark transition-colors"
              >
                ← Back
              </button>
              <div className="flex flex-col items-end gap-2">
                {!generatedContent && (
                  <p className="text-sm text-tron-text-muted">
                    ⬆️ Generate content first to continue
                  </p>
                )}
                <button
                  onClick={() => setStep(4)}
                  disabled={!generatedContent}
                  className="px-6 py-3 bg-tron-grid border-2 border-tron-cyan text-tron-cyan hover:bg-tron-cyan hover:text-tron-dark font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={!generatedContent ? "Generate content first" : "Proceed to review"}
                >
                  Next: Review & Save →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review & Save */}
        {step === 4 && (
          <div className="bg-tron-grid rounded-xl border border-tron-cyan/30 p-8">
            <h2 className="text-xl font-bold text-tron-text mb-6">Review & Save Campaign</h2>

            <div className="bg-tron-dark rounded-lg p-6 mb-6">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="text-sm font-medium text-tron-text-muted mb-1">Campaign Name</div>
                  <div className="font-semibold text-tron-text">{campaignName}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-tron-text-muted mb-1">Target Platforms</div>
                  <div className="font-semibold text-tron-text">{targetPlatforms.length} platforms</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-tron-text-muted mb-1">Topic</div>
                  <div className="font-semibold text-tron-text">
                    {selectedTrend?.title || searchQuery}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-tron-text-muted mb-1">AI Provider</div>
                  <div className="font-semibold text-tron-text">{aiProvider}</div>
                </div>
              </div>
            </div>

            <div className="bg-tron-green/20 border border-tron-green/30 rounded-lg p-4 mb-6">
              <p className="text-sm text-tron-green">
                ✓ Your campaign will be saved as a draft. You can publish it to your connected social accounts from the campaign details page.
              </p>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(3)}
                className="px-6 py-3 border border-tron-grid text-tron-text-muted font-semibold rounded-lg hover:bg-tron-dark transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={saveCampaign}
                disabled={loading}
                className="px-8 py-3 bg-tron-green hover:bg-tron-green/80 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 text-lg"
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
