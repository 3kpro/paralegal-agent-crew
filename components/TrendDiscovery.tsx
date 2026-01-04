"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Fire as Flame, Lightning as Zap, ChartBar as BarChart3, TrendUp as TrendingUp, MagnifyingGlass as Search } from "@phosphor-icons/react";
import { BouncingDots } from "@/components/ui/bouncing-dots";
import { LoadingState } from "@/components/LoadingStates";

interface TrendingTopic {
  title: string;
  formattedTraffic: string;
  relatedQueries?: string[];
  viralScore?: number;
  viralPotential?: 'high' | 'medium' | 'low';
  viralFactors?: {
    volume: number;
    multiSource: number;
    freshness: number;
    keywordBoost: number;
    benchmark: number;
    aiAnalysis: number;
  };
  sources?: string[];
  viralDNA?: {
    hookType: string;
    primaryEmotion: string;
    valueProp: string;
  };
}

interface RelatedQuery {
  query: string;
  value: number;
  formattedValue?: string;
}

interface TrendsData {
  trending: TrendingTopic[];
  relatedQueries: RelatedQuery[];
  relatedTopics: RelatedQuery[];
}

export default function TrendDiscovery() {
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [trends, setTrends] = useState<TrendsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [generating, setGenerating] = useState(false);

  const searchTrends = async () => {
    if (!keyword.trim()) {
      setError("Please enter a keyword");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/trends?keyword=${encodeURIComponent(keyword)}&mode=ideas`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch trends");
      }

      const result = await response.json();
      
      // Debug logging
      console.log('[TrendDiscovery] API Response:', {
        success: result.success,
        source: result.source,
        dataSource: result.data?.source,
        trendCount: result.data?.trending?.length,
        firstTrend: result.data?.trending?.[0]?.title
      });

      if (result.success) {
        setTrends(result.data);
        
        // Show warning if using fallback data
        if (result.source === 'Mixed Trends (Fallback)' || result.data?.source?.includes('Fallback')) {
          console.warn('[TrendDiscovery] ⚠️ Using fallback data - Gemini AI may have failed');
        }
      } else {
        setError(result.message || "Failed to fetch trends");
      }
    } catch (err) {
      console.error('[TrendDiscovery] Error:', err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getTrendingTopics = async () => {
    setLoading(true);
    setError(null);
    setKeyword("");

    try {
      const response = await fetch("/api/trends?mode=trending");

      if (!response.ok) {
        throw new Error("Failed to fetch trending topics");
      }

      const result = await response.json();

      if (result.success) {
        setTrends({
          trending: Array.isArray(result.data)
            ? result.data
            : result.data.trending || [],
          relatedQueries: [],
          relatedTopics: [],
        });
      } else {
        setError(result.message || "Failed to fetch trending topics");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const generateContent = async () => {
    if (!selectedTopic) return;

    setGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-local", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: selectedTopic,
          formats: ["twitter", "linkedin", "email"],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate content");
      }

      const result = await response.json();

      if (result.success) {
        setGeneratedContent(result);
      } else {
        setError(result.error || "Failed to generate content");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate content",
      );
    } finally {
      setGenerating(false);
    }
  };

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
            onKeyDown={(e) => e.key === "Enter" && searchTrends()}
            placeholder="Enter a topic (e.g., AI automation, content marketing)"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
          <div className="flex gap-3">
            <button
              onClick={searchTrends}
              disabled={loading}
              className="flex-1 md:flex-none px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <BouncingDots className="bg-white w-1.5 h-1.5" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" weight="duotone" />
                  Search
                </>
              )}
            </button>
            <button
              onClick={getTrendingTopics}
              disabled={loading}
              className="flex-1 md:flex-none px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <BouncingDots className="bg-white w-1.5 h-1.5" />
                  Loading...
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4" weight="duotone" />
                  Daily Trends
                </>
              )}
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

      {/* AI Loading State */}
      {loading && (
        <div className="min-h-[50vh] flex items-center justify-center">
          <LoadingState variant="luma" message="Analyzing global signals..." />
        </div>
      )}

      {/* Results */}
      {!loading && trends && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Trending Topics */}
          {trends.trending.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <h3 className="text-xl font-semibold mb-4 text-blue-600">
                Discover Viral
              </h3>
              <div className="space-y-3">
                {trends.trending.slice(0, 5).map((trend, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedTopic(trend.title)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedTopic === trend.title
                        ? "bg-blue-100 border-2 border-blue-500"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-medium">{trend.title}</div>
                      {trend.viralScore !== undefined && (
                        <div
                          className={`px-2 py-0.5 rounded text-xs font-semibold inline-flex items-center gap-1 ${
                            trend.viralPotential === 'high'
                              ? 'bg-green-100 text-green-700 border border-green-300'
                              : trend.viralPotential === 'medium'
                              ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                              : 'bg-gray-100 text-gray-600 border border-gray-300'
                          }`}
                        >
                          {trend.viralPotential === 'high' ? (
                            <Flame className="w-3 h-3" weight="duotone" />
                          ) : trend.viralPotential === 'medium' ? (
                            <Zap className="w-3 h-3" weight="duotone" />
                          ) : (
                            <BarChart3 className="w-3 h-3" weight="duotone" />
                          )}
                          {trend.viralScore}
                        </div>
                      )}
                    </div>
                    {trend.viralDNA && (
                        <div className="flex gap-2 mb-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-blue-100 text-blue-700 border border-blue-200">
                                🪝 {trend.viralDNA.hookType}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-purple-100 text-purple-700 border border-purple-200">
                                ❤️ {trend.viralDNA.primaryEmotion}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-amber-100 text-amber-700 border border-amber-200">
                                💎 {trend.viralDNA.valueProp}
                            </span>
                        </div>
                    )}
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
                        ? "bg-green-100 border-2 border-green-500"
                        : "bg-gray-50 hover:bg-gray-100"
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
                        ? "bg-purple-100 border-2 border-purple-500"
                        : "bg-gray-50 hover:bg-gray-100"
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
              onClick={generateContent}
              disabled={generating}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-md"
            >
              {generating ? "🔄 Generating..." : "✨ Generate Content"}
            </button>
          </div>
        </motion.div>
      )}

      {/* Generated Content */}
      {generatedContent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border-b">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                🎉 Content Generated Successfully!
              </h3>
              <p className="text-gray-600">
                Topic:{" "}
                <span className="font-semibold">{generatedContent.topic}</span>
              </p>
            </div>

            {/* Content Tabs */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Twitter Content */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                    🐦 Twitter Post
                  </h4>
                  <div className="bg-white p-3 rounded text-sm border">
                    <pre className="whitespace-pre-wrap font-sans">
                      {generatedContent.content.twitter.content}
                    </pre>
                  </div>
                  <div className="mt-2 text-xs text-blue-600">
                    Characters:{" "}
                    {generatedContent.content.twitter.characterCount}/280
                  </div>
                </div>

                {/* LinkedIn Content */}
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
                    💼 LinkedIn Post
                  </h4>
                  <div className="bg-white p-3 rounded text-sm border max-h-60 overflow-y-auto">
                    <pre className="whitespace-pre-wrap font-sans">
                      {generatedContent.content.linkedin.content}
                    </pre>
                  </div>
                  <div className="mt-2 text-xs text-purple-600">
                    Characters:{" "}
                    {generatedContent.content.linkedin.characterCount}
                  </div>
                </div>

                {/* Email Content */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                    📧 Email Newsletter
                  </h4>
                  <div className="bg-white p-3 rounded text-sm border">
                    <div className="font-semibold text-gray-800 mb-2">
                      Subject: {generatedContent.content.email.subject}
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      <pre className="whitespace-pre-wrap font-sans">
                        {generatedContent.content.email.content}
                      </pre>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-green-600">
                    Words: {generatedContent.content.email.wordCount}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap gap-3 justify-center">
                <button
                  onClick={() => {
                    setGeneratedContent(null);
                    setSelectedTopic(null);
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  ✨ New Topic
                </button>
                <button
                  onClick={generateContent}
                  disabled={generating}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                  {generating ? "🔄 Regenerating..." : "🔄 Regenerate"}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
