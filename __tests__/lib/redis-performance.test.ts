import { describe, expect, test, beforeEach, afterAll } from '@jest/globals';
import { redis, withCache, cacheKeys } from '@/lib/redis';
import { invalidateAllContentCache } from '@/lib/cache-invalidation';
import { performance } from 'perf_hooks';

describe('Redis Caching Performance', () => {
  // Test data
  const testTopic = 'AI Content Marketing';
  const testFormats = ['twitter', 'linkedin', 'email'];
  const testUserId = 'performance-test-user';
  const testProvider = 'openai';
  
  // Cache keys
  const generateCacheKey = cacheKeys.generate(testUserId, testTopic, testFormats, testProvider);
  const localGenerateCacheKey = cacheKeys.localGenerate(testTopic, testFormats);
  const trendsCacheKey = cacheKeys.trends(testTopic.toLowerCase());
  
  // Mock data
  const mockGenerateData = {
    success: true,
    content: {
      twitter: { content: 'Test tweet #AI', hashtags: ['#AI'] },
      linkedin: { content: 'Test LinkedIn post about AI' },
      email: { subject: 'AI Content', content: 'Test email content' }
    },
    metadata: {
      provider: 'OpenAI',
      tokensUsed: 100,
      estimatedCost: 0.002
    }
  };

  const mockTrendsData = {
    success: true,
    mode: 'ideas',
    keyword: testTopic,
    data: {
      trending: [
        { title: 'AI Content', formattedTraffic: '150K searches', relatedQueries: ['AI writing', 'Content automation'] }     
      ],
      relatedQueries: [
        { query: 'AI content tools', value: 100, formattedValue: '100%' }
      ],
      relatedTopics: [
        { query: 'AI content marketing', value: 90, formattedValue: '90%' }
      ]
    }
  };

  beforeEach(async () => {
    // Clear test cache before each test
    await invalidateAllContentCache();
    await redis.del(trendsCacheKey);
  });

  afterAll(async () => {
    // Clean up after all tests
    await invalidateAllContentCache();
    await redis.del(trendsCacheKey);
  });

  test('should improve performance for content generation', async () => {
    // Simulate slow data fetching (500ms delay)
    const slowFetchData = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockGenerateData;
    };
    
    // Measure time for first request (cache miss)
    const startMiss = performance.now();
    const resultMiss = await withCache(generateCacheKey, 60, slowFetchData);
    const durationMiss = performance.now() - startMiss;

    // Measure time for second request (cache hit)
    const startHit = performance.now();
    const resultHit = await withCache(generateCacheKey, 60, slowFetchData);
    const durationHit = performance.now() - startHit;

    // Verify results
    expect(resultMiss).toEqual(mockGenerateData);
    expect(resultHit).toEqual(mockGenerateData);

    // Verify performance improvement
    expect(durationMiss).toBeGreaterThan(450); // Should take at least 450ms
    expect(durationHit).toBeLessThan(100); // Should be much faster (< 100ms)

    // Calculate improvement percentage
    const improvementPercent = ((durationMiss - durationHit) / durationMiss) * 100;
    console.log(`Cache performance improvement: ${improvementPercent.toFixed(2)}%`);
    console.log(`Cache miss duration: ${durationMiss.toFixed(2)}ms`);
    console.log(`Cache hit duration: ${durationHit.toFixed(2)}ms`);

    // Should have at least 80% improvement
    expect(improvementPercent).toBeGreaterThan(80);
  });

  test('should improve performance for trends API', async () => {
    // Simulate slow trends API (300ms delay)
    const slowFetchTrends = async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockTrendsData;
    };

    // Measure time for first request (cache miss)
    const startMiss = performance.now();
    const resultMiss = await withCache(trendsCacheKey, 60, slowFetchTrends);
    const durationMiss = performance.now() - startMiss;

    // Measure time for second request (cache hit)
    const startHit = performance.now();
    const resultHit = await withCache(trendsCacheKey, 60, slowFetchTrends);
    const durationHit = performance.now() - startHit;

    // Verify results
    expect(resultMiss).toEqual(mockTrendsData);
    expect(resultHit).toEqual(mockTrendsData);

    // Verify performance improvement
    expect(durationMiss).toBeGreaterThan(250); // Should take at least 250ms
    expect(durationHit).toBeLessThan(50); // Should be much faster (< 50ms)

    // Calculate improvement percentage
    const improvementPercent = ((durationMiss - durationHit) / durationMiss) * 100;
    console.log(`Trends API cache performance improvement: ${improvementPercent.toFixed(2)}%`);
    console.log(`Trends API cache miss duration: ${durationMiss.toFixed(2)}ms`);
    console.log(`Trends API cache hit duration: ${durationHit.toFixed(2)}ms`);

    // Should have at least 80% improvement
    expect(improvementPercent).toBeGreaterThan(80);
  });

  test('should handle concurrent requests efficiently', async () => {
    // Simulate slow data fetching (500ms delay)
    let fetchCount = 0;
    const slowFetchData = async () => {
      fetchCount++;
      await new Promise(resolve => setTimeout(resolve, 500));
      return { ...mockGenerateData, fetchCount };
    };

    // Make 5 concurrent requests
    const startTime = performance.now();
    const results = await Promise.all([
      withCache(generateCacheKey, 60, slowFetchData),
      withCache(generateCacheKey, 60, slowFetchData),
      withCache(generateCacheKey, 60, slowFetchData),
      withCache(generateCacheKey, 60, slowFetchData),
      withCache(generateCacheKey, 60, slowFetchData)
    ]);
    const duration = performance.now() - startTime;

    // Verify all results are the same
    const firstResult = results[0];
    results.forEach(result => {
      expect(result).toEqual(firstResult);
    });

    // Verify fetch was only called once
    expect(fetchCount).toBe(1);

    // Verify total duration is close to a single fetch (500ms) plus some overhead
    expect(duration).toBeLessThan(1000); // Should take less than 1000ms total

    console.log(`Concurrent requests duration: ${duration.toFixed(2)}ms`);
    console.log(`Fetch count: ${fetchCount}`);
  });
  
  test('should handle cache bypass option correctly', async () => {
    // Simulate data fetching with tracking
    let fetchCount = 0;
    const fetchData = async () => {
      fetchCount++;
      await new Promise(resolve => setTimeout(resolve, 100));
      return { ...mockGenerateData, fetchCount };
    };
    
    // First request - cache miss
    const result1 = await withCache(generateCacheKey, 60, fetchData);
    expect(fetchCount).toBe(1);
    
    // Second request - should be cache hit
    const result2 = await withCache(generateCacheKey, 60, fetchData);
    expect(fetchCount).toBe(1); // Still 1, used cache
    expect(result2).toEqual(result1);
    
    // Third request with bypass - should fetch again
    const result3 = await withCache(generateCacheKey, 60, fetchData, { bypassCache: true });
    expect(fetchCount).toBe(2); // Incremented to 2
    expect(result3.fetchCount).toBe(2);
    
    // Fourth request - should be cache hit with updated value
    const result4 = await withCache(generateCacheKey, 60, fetchData);
    expect(fetchCount).toBe(2); // Still 2, used cache
    expect(result4.fetchCount).toBe(2); // Should have the updated value
  });
  
  test('should handle large objects efficiently', async () => {
    // Create a large object (approximately 100KB)
    const largeObject = {
      data: Array(1000).fill(0).map((_, i) => ({
        id: i,
        name: `Item ${i}`,
        description: `This is a long description for item ${i} that takes up space in the cache.`.repeat(10),
        metadata: {
          created: new Date().toISOString(),
          tags: Array(20).fill(0).map((_, j) => `tag-${j}`),
          properties: Array(20).fill(0).reduce((acc, _, j) => {
            acc[`prop-${j}`] = `value-${j}`.repeat(5);
            return acc;
          }, {})
        }
      }))
    };
    
    // Measure serialization time
    const serializeStart = performance.now();
    const serialized = JSON.stringify(largeObject);
    const serializeTime = performance.now() - serializeStart;
    
    console.log(`Large object size: ${Math.round(serialized.length / 1024)}KB`);
    console.log(`Serialization time: ${serializeTime.toFixed(2)}ms`);
    
    // Simulate fetching the large object
    const fetchLargeObject = async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
      return largeObject;
    };
    
    // Measure cache operations with large object
    const cacheKey = 'test:large-object';
    
    // First request - cache miss
    const startMiss = performance.now();
    const resultMiss = await withCache(cacheKey, 60, fetchLargeObject);
    const durationMiss = performance.now() - startMiss;
    
    // Second request - cache hit
    const startHit = performance.now();
    const resultHit = await withCache(cacheKey, 60, fetchLargeObject);
    const durationHit = performance.now() - startHit;
    
    // Clean up
    await redis.del(cacheKey);
    
    // Verify results
    expect(resultHit).toEqual(resultMiss);
    
    // Log performance metrics
    console.log(`Large object cache miss duration: ${durationMiss.toFixed(2)}ms`);
    console.log(`Large object cache hit duration: ${durationHit.toFixed(2)}ms`);
    
    // Calculate improvement percentage
    const improvementPercent = ((durationMiss - durationHit) / durationMiss) * 100;
    console.log(`Large object cache performance improvement: ${improvementPercent.toFixed(2)}%`);
    
    // Should still have significant improvement despite object size
    expect(improvementPercent).toBeGreaterThan(50);
  });
  
  test('should handle cache key with very long topic', async () => {
    // Create a very long topic (over 100 characters)
    const longTopic = 'This is an extremely long topic that would normally cause issues with cache keys because it exceeds the recommended length for Redis keys and might cause performance problems'.repeat(3);
    
    // Generate cache key for long topic
    const longTopicCacheKey = cacheKeys.localGenerate(longTopic, testFormats);
    
    // Verify key length is reasonable
    expect(longTopicCacheKey.length).toBeLessThan(200);
    
    // Test caching with long topic key
    const fetchData = async () => ({ success: true, topic: longTopic });
    
    // Cache the data
    const result1 = await withCache(longTopicCacheKey, 60, fetchData);
    
    // Retrieve from cache
    const result2 = await withCache(longTopicCacheKey, 60, fetchData);
    
    // Verify results
    expect(result2).toEqual(result1);
    
    // Clean up
    await redis.del(longTopicCacheKey);
  });
});
