'use client'

import { useState, useEffect } from 'react'
import TrendDiscovery from '@/components/TrendDiscovery'

export default function TrendGenPage() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [generatedContent, setGeneratedContent] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'twitter' | 'linkedin' | 'email'>('twitter')

  // Listen for topic selection from TrendDiscovery
  useEffect(() => {
    const handleGenerateContent = (event: CustomEvent) => {
      const { topic } = event.detail
      setSelectedTopic(topic)
      generateContent(topic)
    }

    window.addEventListener('generateContent', handleGenerateContent as EventListener)

    return () => {
      window.removeEventListener('generateContent', handleGenerateContent as EventListener)
    }
  }, [])

  const generateContent = async (topic: string, formats?: string[]) => {
    setIsGenerating(true)
    setError(null)
    setGeneratedContent(null)

    try {
      const response = await fetch('/api/generate-local', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          formats: formats || ['twitter', 'linkedin', 'email'],
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate content')
      }

      const result = await response.json()

      if (result.success) {
        setGeneratedContent(result.results)
      } else {
        setError(result.error || 'Generation failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Content Cascade AI
          </h1>
          <p className="text-xl text-gray-600">
            Discover Trends → Generate Content → Publish Everywhere
          </p>
        </div>

        {/* Trend Discovery Section */}
        <div className="mb-12">
          <TrendDiscovery />
        </div>

        {/* Content Generation Section */}
        {selectedTopic && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6">Generated Content</h2>

              {isGenerating && (
                <div className="text-center py-12">
                  <div className="animate-spin text-6xl mb-4">⚡</div>
                  <p className="text-xl text-gray-600">Generating content...</p>
                  <p className="text-sm text-gray-500 mt-2">Using LM Studio (FREE local AI)</p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h3 className="font-semibold text-red-800 mb-2">Error</h3>
                  <p className="text-red-700">{error}</p>
                  <button
                    onClick={() => generateContent(selectedTopic)}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {generatedContent && !isGenerating && (
                <div>
                  {/* Tabs */}
                  <div className="flex border-b mb-6">
                    <button
                      onClick={() => setActiveTab('twitter')}
                      className={`px-6 py-3 font-semibold transition-colors ${
                        activeTab === 'twitter'
                          ? 'border-b-2 border-blue-600 text-blue-600'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      🐦 Twitter
                    </button>
                    <button
                      onClick={() => setActiveTab('linkedin')}
                      className={`px-6 py-3 font-semibold transition-colors ${
                        activeTab === 'linkedin'
                          ? 'border-b-2 border-blue-600 text-blue-600'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      💼 LinkedIn
                    </button>
                    <button
                      onClick={() => setActiveTab('email')}
                      className={`px-6 py-3 font-semibold transition-colors ${
                        activeTab === 'email'
                          ? 'border-b-2 border-blue-600 text-blue-600'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      📧 Email
                    </button>
                  </div>

                  {/* Content Display */}
                  <div className="space-y-4">
                    {activeTab === 'twitter' && generatedContent.twitter && (
                      <div className="bg-gray-50 rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-semibold">Twitter Thread</h3>
                          <button
                            onClick={() => copyToClipboard(generatedContent.twitter)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                          >
                            📋 Copy
                          </button>
                        </div>
                        <div className="whitespace-pre-wrap text-gray-800">
                          {generatedContent.twitter}
                        </div>
                      </div>
                    )}

                    {activeTab === 'linkedin' && generatedContent.linkedin && (
                      <div className="bg-gray-50 rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-semibold">LinkedIn Post</h3>
                          <button
                            onClick={() => copyToClipboard(generatedContent.linkedin)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                          >
                            📋 Copy
                          </button>
                        </div>
                        <div className="whitespace-pre-wrap text-gray-800">
                          {generatedContent.linkedin}
                        </div>
                      </div>
                    )}

                    {activeTab === 'email' && generatedContent.email && (
                      <div className="space-y-4">
                        <div className="bg-gray-50 rounded-lg p-6">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-semibold">Email Subject</h3>
                            <button
                              onClick={() => copyToClipboard(generatedContent.email.subject)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                            >
                              📋 Copy
                            </button>
                          </div>
                          <div className="text-gray-800 font-medium">
                            {generatedContent.email.subject}
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-6">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-semibold">Email Preview</h3>
                            <button
                              onClick={() => copyToClipboard(generatedContent.email.preview)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                            >
                              📋 Copy
                            </button>
                          </div>
                          <div className="text-gray-800">
                            {generatedContent.email.preview}
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-6">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-semibold">Email Body</h3>
                            <button
                              onClick={() => copyToClipboard(generatedContent.email.body)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                            >
                              📋 Copy
                            </button>
                          </div>
                          <div className="whitespace-pre-wrap text-gray-800">
                            {generatedContent.email.body}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-8 flex gap-4">
                    <button
                      onClick={() => generateContent(selectedTopic)}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700"
                    >
                      🔄 Regenerate
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTopic(null)
                        setGeneratedContent(null)
                      }}
                      className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                    >
                      🆕 New Topic
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
