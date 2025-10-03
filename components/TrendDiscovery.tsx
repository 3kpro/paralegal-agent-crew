'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface TrendingTopic {
  title: string
  formattedTraffic: string
  relatedQueries?: string[]
}

interface RelatedQuery {
  query: string
  value: number
  formattedValue?: string
}

interface TrendsData {
  trending: TrendingTopic[]
  relatedQueries: RelatedQuery[]
  relatedTopics: RelatedQuery[]
}

export default function TrendDiscovery() {
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(false)
  const [trends, setTrends] = useState<TrendsData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)

  const searchTrends = async () => {
    if (!keyword.trim()) {
      setError('Please enter a keyword')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/trends?keyword=${encodeURIComponent(keyword)}&mode=ideas`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch trends')
      }

      const result = await response.json()

      if (result.success) {
        setTrends(result.data)
      } else {
        setError(result.message || 'Failed to fetch trends')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getTrendingTopics = async () => {
    setLoading(true)
    setError(null)
    setKeyword('')

    try {
      const response = await fetch('/api/trends?mode=trending')

      if (!response.ok) {
        throw new Error('Failed to fetch trending topics')
      }

      const result = await response.json()

      if (result.success) {
        setTrends({
          trending: result.data,
          relatedQueries: [],
          relatedTopics: [],
        })
      } else {
        setError(result.message || 'Failed to fetch trending topics')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Discover Trending Topics
        </h2>
        <p className="text-gray-600 text-lg">
          Find what's trending → Generate viral-ready content in seconds
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-8">
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchTrends()}
            placeholder="Enter a topic (e.g., AI automation, content marketing)"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
          <div className="flex gap-3">
            <button
              onClick={searchTrends}
              disabled={loading}
              className="flex-1 md:flex-none px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
            >
              {loading ? '🔍 Searching...' : '🔍 Search'}
            </button>
            <button
              onClick={getTrendingTopics}
              disabled={loading}
              className="flex-1 md:flex-none px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
            >
              {loading ? '⏳ Loading...' : '🔥 Daily Trends'}
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Results */}
      {trends && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Trending Topics */}
          {trends.trending.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <h3 className="text-xl font-semibold mb-4 text-blue-600">
                Trending Now
              </h3>
              <div className="space-y-3">
                {trends.trending.slice(0, 5).map((trend, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedTopic(trend.title)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedTopic === trend.title
                        ? 'bg-blue-100 border-2 border-blue-500'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium">{trend.title}</div>
                    <div className="text-sm text-gray-500">
                      {trend.formattedTraffic}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Related Queries */}
          {trends.relatedQueries.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <h3 className="text-xl font-semibold mb-4 text-green-600">
                Related Queries
              </h3>
              <div className="space-y-3">
                {trends.relatedQueries.slice(0, 5).map((query, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedTopic(query.query)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedTopic === query.query
                        ? 'bg-green-100 border-2 border-green-500'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium">{query.query}</div>
                    {query.formattedValue && (
                      <div className="text-sm text-gray-500">
                        Interest: {query.formattedValue}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Related Topics */}
          {trends.relatedTopics.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <h3 className="text-xl font-semibold mb-4 text-purple-600">
                Related Topics
              </h3>
              <div className="space-y-3">
                {trends.relatedTopics.slice(0, 5).map((topic, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedTopic(topic.query)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedTopic === topic.query
                        ? 'bg-purple-100 border-2 border-purple-500'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium">{topic.query}</div>
                    {topic.formattedValue && (
                      <div className="text-sm text-gray-500">
                        Interest: {topic.formattedValue}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Selected Topic */}
      {selectedTopic && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-1">
                Selected Topic
              </h4>
              <p className="text-2xl font-bold text-blue-600">
                {selectedTopic}
              </p>
            </div>
            <button
              onClick={() => {
                // This will be connected to content generation
                window.dispatchEvent(
                  new CustomEvent('generateContent', {
                    detail: { topic: selectedTopic },
                  })
                )
              }}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md"
            >
              Generate Content
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
