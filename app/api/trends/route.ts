import { NextRequest, NextResponse } from "next/server";
import { getGeminiModel } from '@/lib/gemini';
import { createClient } from "@/lib/supabase/server";
import { redis, withCache, cacheKeys, isRedisConnected } from "@/lib/redis";
import { performance } from "perf_hooks";
import { getMixedTrends, getGoogleTrends, getTwitterTrends, getRedditTrends } from "@/lib/real-trends";
import { calculateViralScore, sortByViralScore } from "@/lib/viral-score";

// Cache TTL in seconds
const CACHE_TTL = 900; // 15 minutes

// Force this route to be dynamic - never cache by Next.js
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Removed PowerShell microservice URLs - no longer needed
// Now using direct Gemini AI integration for all trend generation

// Fallback mock data (only used if PowerShell service is unavailable)
const mockTrendingTopics = [
  {
    title: "AI Content Creation",
    formattedTraffic: "150K searches",
    relatedQueries: ["AI writing tools", "Content automation", "AI marketing"],
  },
  {
    title: "Social Media Marketing",
    formattedTraffic: "200K searches",
    relatedQueries: [
      "Instagram marketing",
      "TikTok trends",
      "Social media automation",
    ],
  },
  {
    title: "Digital Marketing Trends",
    formattedTraffic: "100K searches",
    relatedQueries: ["Marketing automation", "Email marketing", "SEO trends"],
  },
  {
    title: "Content Marketing Strategy",
    formattedTraffic: "80K searches",
    relatedQueries: ["Content planning", "Editorial calendar", "Content SEO"],
  },
  {
    title: "Video Marketing",
    formattedTraffic: "120K searches",
    relatedQueries: ["YouTube marketing", "Video SEO", "Short-form video"],
  },
  {
    title: "Influencer Marketing",
    formattedTraffic: "90K searches",
    relatedQueries: [
      "Micro influencers",
      "Influencer outreach",
      "Creator economy",
    ],
  },
];

interface PowerShellTrend {
  id: number;
  topic: string;
  trend_direction: string;
  volume: string;
  engagement: number;
  score: number;
}

interface PowerShellResponse {
  generated_at: string;
  trends: PowerShellTrend[];
  topic: string;
}

interface TrendingTopic {
  title: string;
  formattedTraffic: string;
  relatedQueries: string[];
}

// Removed unused PowerShell integration functions
// - getTrendsData() - No longer needed after PowerShell microservice removal
// - convertToTrendingTopics() - No longer needed after PowerShell microservice removal

/**
 * Get real trending data from multiple sources
 * Primary function for trend discovery
 */
/**
 * 🚀 OPTIMIZATION #1 & #2: Fire-and-forget cache write
 * Consolidates cache logic and sends updates to background without blocking response
 */
function updateCacheAsync(cacheKey: string, value: any, ttl: number): void {
  if (!redis) return;
  // Fire-and-forget: Do not await, does not block response
  redis.setex(cacheKey, ttl, JSON.stringify(value)).catch((err: any) => {
    console.error(`[Trends API] Cache update failed:`, err.message);
  });
}


async function getRealTrendingData(keyword: string, userId: string, source: string = 'mixed') {
  const startTime = performance.now();
  
  try {
    let trendsData;
    
    switch (source) {
      case 'google': {
        const googleTrends = await getGoogleTrends(keyword);
        trendsData = {
          trending: googleTrends,
          relatedQueries: [
            { query: `${keyword} trends`, value: 100, formattedValue: "100%" },
            { query: `${keyword} 2024`, value: 85, formattedValue: "85%" },
            { query: `popular ${keyword}`, value: 70, formattedValue: "70%" },
          ],
          relatedTopics: [
            { query: `${keyword} content`, value: 100, formattedValue: "100%" },
            { query: `trending ${keyword}`, value: 90, formattedValue: "90%" },
            { query: `viral ${keyword}`, value: 80, formattedValue: "80%" },
          ],
          source: 'Google Trends',
        };
        break;
      }
        
      case 'twitter': {
        const twitterTrends = await getTwitterTrends();
        trendsData = {
          trending: twitterTrends,
          relatedQueries: [
            { query: `${keyword} twitter`, value: 100, formattedValue: "100%" },
            { query: `#${keyword.replace(/\s+/g, '')}`, value: 85, formattedValue: "85%" },
            { query: `${keyword} hashtag`, value: 70, formattedValue: "70%" },
          ],
          relatedTopics: [
            { query: `${keyword} viral`, value: 100, formattedValue: "100%" },
            { query: `${keyword} trending`, value: 90, formattedValue: "90%" },
            { query: `social ${keyword}`, value: 80, formattedValue: "80%" },
          ],
          source: 'Twitter Trends',
        };
        break;
      }
        
      case 'reddit': {
        const redditTrends = await getRedditTrends();
        trendsData = {
          trending: redditTrends,
          relatedQueries: [
            { query: `${keyword} reddit`, value: 100, formattedValue: "100%" },
            { query: `${keyword} discussion`, value: 85, formattedValue: "85%" },
            { query: `r/${keyword.replace(/\s+/g, '')}`, value: 70, formattedValue: "70%" },
          ],
          relatedTopics: [
            { query: `${keyword} community`, value: 100, formattedValue: "100%" },
            { query: `hot ${keyword}`, value: 90, formattedValue: "90%" },
            { query: `${keyword} upvotes`, value: 80, formattedValue: "80%" },
          ],
          source: 'Reddit Hot Topics',
        };
        break;
      }
        
      case 'mixed':
      default: {
        // For keyword searches, use Gemini AI to generate relevant trends
        // Real trend APIs (Google/Twitter/Reddit) are better for discovering trending topics
        // but Gemini is better for generating content ideas around a specific keyword
        try {
          console.log(`[Trends] Attempting Gemini AI for keyword: "${keyword}"`);
          const geminiResult = await generateTrendsWithGemini(keyword, userId);
          trendsData = {
            ...geminiResult,
            source: 'Gemini AI (Keyword-Optimized)',
          };
          console.log('[Trends] ✓ Successfully using Gemini AI results');
        } catch (geminiError: any) {
          console.error('[Trends] ❌ Gemini AI FAILED:', {
            error: geminiError.message,
            stack: geminiError.stack,
            name: geminiError.name
          });
          console.warn('[Trends] Falling back to mixed real trends (Twitter/Reddit mock data)');
          // Fallback to real trends if Gemini fails
          
          // News API implementation
          const newsApiKey = process.env.NEWS_API_KEY;
          
          if (userId !== "anonymous") {
            // Implementation for user's custom news API key would go here
          }
          
          trendsData = await getMixedTrends(keyword, {
            includeGoogle: true,
            includeTwitter: true,
            includeReddit: true,
            includeNews: !!newsApiKey,
            newsApiKey,
          });
        }
        break;
      }
    }
    
    const duration = performance.now() - startTime;
    const sourceInfo = (trendsData as any).source || source;
    console.log(`[Real Trends] ✓ Fetched ${sourceInfo} in ${Math.round(duration)}ms`);

    // Calculate viral scores for all trends
    if (trendsData.trending && Array.isArray(trendsData.trending)) {
      const scoredTrends = [];
      // Process sequentially to avoid AI Rate Limits (429)
      for (const trend of trendsData.trending) {
        const scoredTrend = await calculateViralScore({
          title: trend.title,
          formattedTraffic: trend.formattedTraffic || '0K searches',
          sources: [source], // Single source for now
          firstSeenAt: new Date() // Current time as first seen
        });
        scoredTrends.push(scoredTrend);
        // Add delay to respect API rate limits (avoid 429)
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      trendsData.trending = scoredTrends;

      // Sort by viral score (highest first)
      trendsData.trending = sortByViralScore(trendsData.trending);

      console.log(`[Viral Score] ✓ Calculated viral scores for ${trendsData.trending.length} trends`);
    }

    return trendsData;
    
  } catch (error: any) {
    const duration = performance.now() - startTime;
    console.error(`[Real Trends] Error fetching trends after ${Math.round(duration)}ms:`, error.message);
    
    // Fallback to Gemini AI if real trends fail
    console.log('[Real Trends] Falling back to AI-generated trends...');
    return await generateTrendsWithGemini(keyword, userId);
  }
}

/**
 * Generate trending topics using Google Gemini AI
 * Fallback function when real trends are unavailable
 */
async function generateTrendsWithGemini(keyword: string, _userId: string) {
  const startTime = performance.now();

  // Get the model with JSON mode enabled
  // using gemini-2.0-flash for stability and availability
  const model = getGeminiModel('gemini-1.5-flash-latest', true);

  if (!model) {
     // This will be caught by the calling function and trigger the next fallback.
     throw new Error("Gemini client is not initialized (likely missing API key).");
  }

  try {
    const prompt = `You are a content marketing expert. Generate 6 highly engaging, specific content ideas related to "${keyword}".

These should be:
- Unique angles or perspectives
- Actionable content topics that would perform well on social media
- Relevant to current trends

For each idea, provide a title, estimated traffic, and related queries.

Your response MUST be a valid JSON array of objects with the following structure. Do not include any other text or markdown.
[
  {
    "title": "A Specific and Compelling Content Angle",
    "formattedTraffic": "XXK searches",
    "relatedQueries": ["specific query 1", "specific query 2", "specific query 3"]
  }
]`;

    const result = await model.generateContent(prompt);
    // Directly parse the response, now guaranteed to be JSON
    const trends = JSON.parse(result.response.text());

    const duration = performance.now() - startTime;
    console.log(`[Gemini] ✓ Generated ${trends.length} keyword-optimized trends in ${Math.round(duration)}ms`);

    // Return trends directly - scoring is handled sequentially in the main handler
    const rawTrends = trends.map((trend: any) => ({
      title: trend.title,
      formattedTraffic: trend.formattedTraffic || '0K searches',
      source: 'gemini-ai',
      url: '#', // Placeholder
      publishedAt: new Date().toISOString()
    }));

    console.log(`[Gemini] ✓ Generated ${rawTrends.length} trends (scoring deferred to main handler)`);

    return {
      trending: rawTrends,
       relatedQueries: [
        { query: `${keyword} ideas 2025`, value: 100, formattedValue: "100%" },
        { query: `how to ${keyword}`, value: 85, formattedValue: "85%" },
        { query: `best ${keyword} tips`, value: 70, formattedValue: "70%" },
        { query: `${keyword} for beginners`, value: 60, formattedValue: "60%" },
      ],
      relatedTopics: [
        { query: `${keyword} strategies`, value: 100, formattedValue: "100%" },
        { query: `${keyword} content creation`, value: 90, formattedValue: "90%" },
        { query: `viral ${keyword} ideas`, value: 80, formattedValue: "80%" },
        { query: `${keyword} social media`, value: 75, formattedValue: "75%" },
      ],
    };
  } catch (error: any) {
    const duration = performance.now() - startTime;
    console.error(`[Gemini Trends Error] Failed to generate trends after ${Math.round(duration)}ms`, {
        keyword,
        errorMessage: error.message,
    });
    // Re-throw the error to allow the calling function's fallback logic to engage
    throw error;
  }
}

export async function GET(request: NextRequest) {
  const startTime = performance.now();

  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get("keyword") || "";
    const mode = searchParams.get("mode") || "ideas";
    const bypassCache = searchParams.get("bypass_cache") === "true";

    // Headers for response
    const headers = {
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      Pragma: "no-cache",
    };

    // 🚀 OPTIMIZATION #3: Parallelize init operations
    // Supabase client creation + Redis check run in parallel (independent ops)
    const [supabaseClient, redisStatus] = await Promise.all([
      createClient(),
      isRedisConnected(500).catch(() => false),
    ]);
    
    const supabase = supabaseClient;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const userId = user?.id || "anonymous";
    
    // Redis check result from parallel operation
    const redisAvailable = redisStatus === true;
    if (!redisAvailable) {
      console.warn("[Trends API] Redis unavailable, proceeding without caching");
    }

    // Mode: Daily trending topics (no keyword search)
    if (mode === "trending") {
      // Generate cache key for trending mode
      const cacheKey = cacheKeys.trends("trending:daily", "trending");

      // If Redis is unavailable or bypass is requested, generate content directly
      if (!redisAvailable || bypassCache) {
        try {
          // Use real trending data instead of AI-generated
          const realTrendsResult = await getRealTrendingData("trending topics", userId, "mixed");

          const result = {
            success: true,
            mode: "trending",
            source: "real-trends-mixed",
            data: realTrendsResult,
            meta: {
              totalResults: realTrendsResult.trending?.length || 0,
              timestamp: new Date().toISOString(),
              cached: false,
              response_time_ms: Math.round(performance.now() - startTime),
            },
          };

          // If Redis is available, update the cache for future requests
          if (redisAvailable && !bypassCache) {
            updateCacheAsync(cacheKey, result, CACHE_TTL); // 🚀 OPTIMIZATION: Fire-and-forget cache write
          }

          return NextResponse.json(result, { headers });
        } catch (error) {
          console.error(
            "[Trends API] PowerShell service unavailable, using mock data",
          );
          // Fallback to mock data if PowerShell service is down
          const result = {
            success: true,
            mode: "trending",
            source: "mock-fallback",
            data: mockTrendingTopics,
            meta: {
              totalResults: mockTrendingTopics.length,
              timestamp: new Date().toISOString(),
              cached: false,
              response_time_ms: Math.round(performance.now() - startTime),
            },
          };

          // If Redis is available, update the cache for future requests
          if (redisAvailable && !bypassCache) {
            updateCacheAsync(cacheKey, result, CACHE_TTL); // 🚀 OPTIMIZATION: Fire-and-forget cache write
          }

          return NextResponse.json(result, { headers });
        }
      }

      // Use cache or fetch fresh data
      const result = await withCache(
        cacheKey,
        CACHE_TTL,
        async () => {
          try {
            // Skip PowerShell microservice, go directly to Gemini
            const geminiResult = await generateTrendsWithGemini("content creation", userId);

            return {
              success: true,
              mode: "trending",
              source: "gemini-ai-fallback",
              data: geminiResult,
              meta: {
                totalResults: geminiResult.trending?.length || 0,
                timestamp: new Date().toISOString(),
                cached: false,
              },
            };
          } catch (error) {
            console.error(
              "[Trends API] Gemini service unavailable, using mock data",
            );
            // Fallback to mock data if Gemini service is down
            return {
              success: true,
              mode: "trending",
              source: "mock-fallback",
              data: mockTrendingTopics,
              meta: {
                totalResults: mockTrendingTopics.length,
                timestamp: new Date().toISOString(),
                cached: false,
              },
            };
          }
        },
        {
          logLevel: "verbose",
          bypassCache,
          addCacheMetadata: true,
        },
      );

      const duration = performance.now() - startTime;

      // Return cached or fresh data with performance metrics
      return NextResponse.json(
        {
          ...result,
          meta: {
            ...result.meta,
            response_time_ms: Math.round(duration),
          },
        },
        { headers },
      );
    }

    // Mode: Content ideas (uses keyword for search)
    if (mode === "ideas") {
      if (keyword) {
        // Get source parameter (google, twitter, reddit, mixed)
        const source = searchParams.get("source") || "mixed";
        
        // Generate cache key for ideas mode with keyword and source
        const cacheKey = cacheKeys.trends(`${keyword.toLowerCase()}:${source}`, "ideas");

        // If Redis is unavailable or bypass is requested, generate content directly
        if (!redisAvailable || bypassCache) {
          try {
            // Use real trending data first (Google, Twitter, Reddit, News)
            const realTrendsData = await getRealTrendingData(keyword, userId, source);

            const result = {
              success: true,
              mode: "ideas",
              keyword,
              source: (realTrendsData as any).source || `real-trends-${source}`,
              data: realTrendsData,
              meta: {
                timestamp: new Date().toISOString(),
                cached: false,
                response_time_ms: Math.round(performance.now() - startTime),
              },
            };

            // If Redis is available, update the cache for future requests
            if (redisAvailable && !bypassCache) {
              updateCacheAsync(cacheKey, result, CACHE_TTL); // 🚀 OPTIMIZATION: Fire-and-forget cache write
            }

            return NextResponse.json(result, { headers });
          } catch (realTrendsError: any) {
            console.error(
              "[Trends API] Real trends service failed:",
              realTrendsError.message,
            );

            // Final fallback to mock data
            console.error(
              "[Trends API] All services unavailable, using mock data",
            );
            const filteredTrending = mockTrendingTopics.filter(
              (topic) =>
                topic.title.toLowerCase().includes(keyword.toLowerCase()) ||
                topic.relatedQueries?.some((query) =>
                  query.toLowerCase().includes(keyword.toLowerCase()),
                ),
            );

            const result = {
              success: true,
              mode: "ideas",
              keyword,
              source: "mock-fallback",
              data: {
                trending:
                  filteredTrending.length > 0
                    ? filteredTrending
                    : mockTrendingTopics,
                relatedQueries: [
                  {
                    query: `${keyword} tools`,
                    value: 100,
                    formattedValue: "100%",
                  },
                  {
                    query: `${keyword} automation`,
                    value: 85,
                    formattedValue: "85%",
                  },
                  {
                    query: `${keyword} strategies`,
                    value: 70,
                    formattedValue: "70%",
                  },
                ],
                relatedTopics: [
                  {
                    query: `${keyword} trends`,
                    value: 100,
                    formattedValue: "100%",
                  },
                  {
                    query: `${keyword} marketing`,
                    value: 90,
                    formattedValue: "90%",
                  },
                  {
                    query: `${keyword} best practices`,
                    value: 80,
                    formattedValue: "80%",
                  },
                ],
              },
              meta: {
                timestamp: new Date().toISOString(),
                cached: false,
                response_time_ms: Math.round(performance.now() - startTime),
              },
            };

            // If Redis is available, update the cache for future requests
            if (redisAvailable && !bypassCache) {
              updateCacheAsync(cacheKey, result, CACHE_TTL); // 🚀 OPTIMIZATION: Fire-and-forget cache write
            }

            return NextResponse.json(result, { headers });
          }
        }

        // Use cache or fetch fresh data
        const result = await withCache(
          cacheKey,
          CACHE_TTL,
          async () => {
            // Try real trends first (Google, Twitter, Reddit, News)
            try {
              const realTrendsData = await getRealTrendingData(keyword, userId, source);
              return {
                success: true,
                mode: "ideas",
                keyword,
                source: (realTrendsData as any).source || `real-trends-${source}`,
                data: realTrendsData,
                meta: {
                  timestamp: new Date().toISOString(),
                  cached: false,
                },
              };
            } catch (realTrendsError: any) {
              console.error(
                "[Trends API] Real trends failed, trying Gemini AI fallback:",
                realTrendsError.message,
              );

              // Fallback to Gemini AI if real trends fail
              try {
                const geminiData = await generateTrendsWithGemini(keyword, userId);
                return {
                  success: true,
                  mode: "ideas",
                  keyword,
                  source: "gemini-ai-fallback",
                  data: geminiData,
                  meta: {
                    timestamp: new Date().toISOString(),
                    cached: false,
                  },
                };
              } catch (geminiError: any) {
                console.error(
                  "[Trends API] Gemini AI also failed:",
                  geminiError.message,
                );
              }

              // Final fallback to mock data
              console.error(
                "[Trends API] All services unavailable, using mock data",
              );
              const filteredTrending = mockTrendingTopics.filter(
                (topic) =>
                  topic.title.toLowerCase().includes(keyword.toLowerCase()) ||
                  topic.relatedQueries?.some((query) =>
                    query.toLowerCase().includes(keyword.toLowerCase()),
                  ),
              );

              return {
                success: true,
                mode: "ideas",
                keyword,
                source: "mock-fallback",
                data: {
                  trending:
                    filteredTrending.length > 0
                      ? filteredTrending
                      : mockTrendingTopics,
                  relatedQueries: [
                    {
                      query: `${keyword} tools`,
                      value: 100,
                      formattedValue: "100%",
                    },
                    {
                      query: `${keyword} automation`,
                      value: 85,
                      formattedValue: "85%",
                    },
                    {
                      query: `${keyword} strategies`,
                      value: 70,
                      formattedValue: "70%",
                    },
                  ],
                  relatedTopics: [
                    {
                      query: `${keyword} trends`,
                      value: 100,
                      formattedValue: "100%",
                    },
                    {
                      query: `${keyword} marketing`,
                      value: 90,
                      formattedValue: "90%",
                    },
                    {
                      query: `${keyword} best practices`,
                      value: 80,
                      formattedValue: "80%",
                    },
                  ],
                },
                meta: {
                  timestamp: new Date().toISOString(),
                  cached: false,
                },
              };
            }
          },
          {
            logLevel: "verbose",
            bypassCache,
            addCacheMetadata: true,
          },
        );

        const duration = performance.now() - startTime;

        // Return cached or fresh data with performance metrics
        return NextResponse.json(
          {
            ...result,
            meta: {
              ...result.meta,
              response_time_ms: Math.round(duration),
            },
          },
          { headers },
        );
      } else {
        // No keyword provided - return empty or default topics
        return NextResponse.json(
          {
            success: true,
            mode: "ideas",
            source: "no-keyword",
            data: {
              trending: [],
              relatedQueries: [],
              relatedTopics: [],
            },
            meta: {
              message: "Please provide a keyword to search for content ideas",
              timestamp: new Date().toISOString(),
              response_time_ms: Math.round(performance.now() - startTime),
            },
          },
          { headers },
        );
      }
    }

    // Unknown mode
    return NextResponse.json(
      {
        success: false,
        error: `Unknown mode: ${mode}`,
        response_time_ms: Math.round(performance.now() - startTime),
      },
      { status: 400 },
    );
  } catch (error) {
    const duration = performance.now() - startTime;
    console.error(`[Trends API] Error after ${Math.round(duration)}ms: - route.ts:590`, error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch trending topics",
        details: error instanceof Error ? error.message : "Unknown error",
        response_time_ms: Math.round(duration),
      },
      { status: 500 },
    );
  }
}

// Handle CORS for any other HTTP methods
export async function POST(_request: NextRequest) {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}



