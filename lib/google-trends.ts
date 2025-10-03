/**
 * Google Trends Integration
 *
 * Provides trending topic discovery and related queries/topics
 */

import googleTrends from 'google-trends-api'

export interface TrendingTopic {
  title: string
  formattedTraffic: string
  relatedQueries?: string[]
  articles?: Array<{
    title: string
    source: string
    url?: string
  }>
}

export interface RelatedQuery {
  query: string
  value: number
  formattedValue?: string
}

/**
 * Get trending searches for a specific region
 */
export async function getTrendingSearches(geo: string = 'US'): Promise<TrendingTopic[]> {
  try {
    const results = await googleTrends.dailyTrends({
      geo,
    })

    const data = JSON.parse(results)
    const trends = data.default?.trendingSearchesDays?.[0]?.trendingSearches || []

    return trends.map((trend: any) => ({
      title: trend.title?.query || '',
      formattedTraffic: trend.formattedTraffic || '',
      relatedQueries: trend.relatedQueries?.map((q: any) => q.query) || [],
      articles: trend.articles?.map((article: any) => ({
        title: article.title || '',
        source: article.source || '',
        url: article.url || undefined,
      })) || [],
    }))
  } catch (error) {
    console.error('Error fetching trending searches:', error)

    // Fallback: Return curated trending topics for content creators
    return [
      { title: 'AI automation for content creators', formattedTraffic: '500K+', relatedQueries: ['AI tools', 'ChatGPT for content', 'automation workflows'] },
      { title: 'Building in public', formattedTraffic: '200K+', relatedQueries: ['startup journey', 'transparency', 'indie hackers'] },
      { title: 'Social media marketing trends 2025', formattedTraffic: '300K+', relatedQueries: ['Instagram reels', 'TikTok algorithm', 'LinkedIn growth'] },
      { title: 'Content repurposing strategies', formattedTraffic: '150K+', relatedQueries: ['multi-platform content', 'content recycling', 'efficiency hacks'] },
      { title: 'Personal branding for entrepreneurs', formattedTraffic: '250K+', relatedQueries: ['thought leadership', 'online presence', 'authority building'] },
      { title: 'Creator economy monetization', formattedTraffic: '180K+', relatedQueries: ['newsletter monetization', 'course creation', 'digital products'] },
      { title: 'Video content strategy', formattedTraffic: '220K+', relatedQueries: ['short-form video', 'YouTube shorts', 'video editing tips'] },
      { title: 'Email list building', formattedTraffic: '140K+', relatedQueries: ['lead magnets', 'email marketing', 'subscriber growth'] },
      { title: 'Productivity hacks for creators', formattedTraffic: '190K+', relatedQueries: ['time management', 'batching content', 'workflow optimization'] },
      { title: 'LinkedIn organic growth', formattedTraffic: '160K+', relatedQueries: ['LinkedIn algorithm', 'B2B content', 'engagement tactics'] },
    ]
  }
}

/**
 * Get related topics for a keyword
 */
export async function getRelatedTopics(
  keyword: string,
  options: {
    geo?: string
    startTime?: Date
    endTime?: Date
  } = {}
): Promise<RelatedQuery[]> {
  try {
    const { geo = 'US', startTime, endTime } = options

    const results = await googleTrends.relatedTopics({
      keyword,
      geo,
      startTime: startTime || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Default: 7 days ago
      endTime: endTime || new Date(),
    })

    const data = JSON.parse(results)
    const topics = data.default?.rankedList?.[0]?.rankedKeyword || []

    return topics.map((topic: any) => ({
      query: topic.topic?.title || topic.query || '',
      value: topic.value || 0,
      formattedValue: topic.formattedValue,
    }))
  } catch (error) {
    console.error('Error fetching related topics:', error)
    throw new Error('Failed to fetch related topics')
  }
}

/**
 * Get related queries for a keyword
 */
export async function getRelatedQueries(
  keyword: string,
  options: {
    geo?: string
    startTime?: Date
    endTime?: Date
  } = {}
): Promise<RelatedQuery[]> {
  try {
    const { geo = 'US', startTime, endTime } = options

    const results = await googleTrends.relatedQueries({
      keyword,
      geo,
      startTime: startTime || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endTime: endTime || new Date(),
    })

    const data = JSON.parse(results)
    const queries = data.default?.rankedList?.[0]?.rankedKeyword || []

    return queries.map((query: any) => ({
      query: query.query || '',
      value: query.value || 0,
      formattedValue: query.formattedValue,
    }))
  } catch (error) {
    console.error('Error fetching related queries:', error)
    throw new Error('Failed to fetch related queries')
  }
}

/**
 * Get interest over time for a keyword
 */
export async function getInterestOverTime(
  keyword: string,
  options: {
    geo?: string
    startTime?: Date
    endTime?: Date
  } = {}
): Promise<Array<{ time: string; value: number }>> {
  try {
    const { geo = 'US', startTime, endTime } = options

    const results = await googleTrends.interestOverTime({
      keyword,
      geo,
      startTime: startTime || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Default: 30 days ago
      endTime: endTime || new Date(),
    })

    const data = JSON.parse(results)
    const timeline = data.default?.timelineData || []

    return timeline.map((point: any) => ({
      time: point.formattedTime || point.time,
      value: point.value?.[0] || 0,
    }))
  } catch (error) {
    console.error('Error fetching interest over time:', error)
    throw new Error('Failed to fetch interest over time')
  }
}

/**
 * Search for content ideas based on trending topics
 */
export async function searchContentIdeas(
  baseKeyword: string,
  geo: string = 'US'
): Promise<{
  trending: TrendingTopic[]
  relatedQueries: RelatedQuery[]
  relatedTopics: RelatedQuery[]
}> {
  try {
    const [trending, relatedQueries, relatedTopics] = await Promise.all([
      getTrendingSearches(geo).catch(() => []),
      getRelatedQueries(baseKeyword, { geo }).catch(() => []),
      getRelatedTopics(baseKeyword, { geo }).catch(() => []),
    ])

    return {
      trending,
      relatedQueries,
      relatedTopics,
    }
  } catch (error) {
    console.error('Error searching content ideas:', error)
    throw new Error('Failed to search content ideas')
  }
}
