/**
 * PowerShell Trends Microservice Integration
 *
 * Connects to DeepSeek's PowerShell HTTP microservice for trend discovery
 * Endpoint: http://localhost:5000/trends?topic=YOUR_TOPIC
 */

export interface PowerShellTrend {
  id: number
  topic: string
  score: number
  volume: 'High' | 'Medium' | 'Low'
  engagement: number
  trend_direction: 'rising' | 'stable' | 'breaking' | 'declining'
}

export interface PowerShellTrendsResponse {
  topic: string
  generated_at: string
  trends: PowerShellTrend[]
}

export interface TrendingTopic {
  title: string
  formattedTraffic: string
  relatedQueries?: string[]
}

const POWERSHELL_MICROSERVICE_URL = process.env.POWERSHELL_TRENDS_URL || 'http://localhost:5000'

/**
 * Check if PowerShell microservice is available
 */
export async function checkPowerShellHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${POWERSHELL_MICROSERVICE_URL}/trends?topic=test`, {
      signal: AbortSignal.timeout(3000),
    })
    return response.ok
  } catch (error) {
    console.error('PowerShell microservice health check failed:', error)
    return false
  }
}

/**
 * Get trends from PowerShell microservice
 */
export async function getPowerShellTrends(topic: string = 'technology'): Promise<PowerShellTrendsResponse> {
  try {
    const response = await fetch(
      `${POWERSHELL_MICROSERVICE_URL}/trends?topic=${encodeURIComponent(topic)}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`PowerShell microservice returned ${response.status}`)
    }

    const data: PowerShellTrendsResponse = await response.json()
    return data
  } catch (error) {
    console.error('Failed to fetch PowerShell trends:', error)
    throw error
  }
}

/**
 * Convert PowerShell trends to TrendingTopic format for UI compatibility
 */
export function convertToTrendingTopics(psResponse: PowerShellTrendsResponse): TrendingTopic[] {
  return psResponse.trends.map((trend) => ({
    title: trend.topic,
    formattedTraffic: formatTraffic(trend.volume, trend.engagement),
    relatedQueries: [], // PowerShell can add this in future
  }))
}

/**
 * Format traffic display based on volume and engagement
 */
function formatTraffic(volume: string, engagement: number): string {
  const volumeMap: Record<string, string> = {
    'High': '500K+',
    'Medium': '200K+',
    'Low': '50K+',
  }

  const base = volumeMap[volume] || '100K+'
  const trend = engagement > 85 ? '🔥' : engagement > 70 ? '📈' : '📊'

  return `${trend} ${base}`
}

/**
 * Get trending topics with fallback to curated list
 */
export async function getTrendingSearches(): Promise<TrendingTopic[]> {
  try {
    // Try PowerShell microservice first
    const isHealthy = await checkPowerShellHealth()

    if (isHealthy) {
      const psResponse = await getPowerShellTrends('content creation')
      return convertToTrendingTopics(psResponse)
    } else {
      console.warn('PowerShell microservice not available, using fallback')
      return getFallbackTrends()
    }
  } catch (error) {
    console.error('Error fetching PowerShell trends, using fallback:', error)
    return getFallbackTrends()
  }
}

/**
 * Fallback curated trends (used when PowerShell microservice is unavailable)
 */
function getFallbackTrends(): TrendingTopic[] {
  return [
    { title: 'AI automation for content creators', formattedTraffic: '🔥 500K+', relatedQueries: ['AI tools', 'ChatGPT for content', 'automation workflows'] },
    { title: 'Building in public', formattedTraffic: '📈 200K+', relatedQueries: ['startup journey', 'transparency', 'indie hackers'] },
    { title: 'Social media marketing trends 2025', formattedTraffic: '🔥 300K+', relatedQueries: ['Instagram reels', 'TikTok algorithm', 'LinkedIn growth'] },
    { title: 'Content repurposing strategies', formattedTraffic: '📊 150K+', relatedQueries: ['multi-platform content', 'content recycling', 'efficiency hacks'] },
    { title: 'Personal branding for entrepreneurs', formattedTraffic: '📈 250K+', relatedQueries: ['thought leadership', 'online presence', 'authority building'] },
    { title: 'Creator economy monetization', formattedTraffic: '📈 180K+', relatedQueries: ['newsletter monetization', 'course creation', 'digital products'] },
    { title: 'Video content strategy', formattedTraffic: '📈 220K+', relatedQueries: ['short-form video', 'YouTube shorts', 'video editing tips'] },
    { title: 'Email list building', formattedTraffic: '📊 140K+', relatedQueries: ['lead magnets', 'email marketing', 'subscriber growth'] },
    { title: 'Productivity hacks for creators', formattedTraffic: '📈 190K+', relatedQueries: ['time management', 'batching content', 'workflow optimization'] },
    { title: 'LinkedIn organic growth', formattedTraffic: '📊 160K+', relatedQueries: ['LinkedIn algorithm', 'B2B content', 'engagement tactics'] },
  ]
}
