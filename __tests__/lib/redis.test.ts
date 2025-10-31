import { describe, expect, test, beforeEach, afterAll } from '@jest/globals';
import { redis, withCache, cacheKeys, getCache, setCache, invalidateCache } from '@/lib/redis';

describe('Redis Caching System', () => {
  const testKey = 'test:key';
  const testData = { message: 'Hello Redis', timestamp: Date.now() };
  const testTtl = 10; // 10 seconds

  beforeEach(async () => {
    // Clear test keys before each test
    await redis.del(testKey);
  });

  afterAll(async () => {
    // Clean up after all tests
    await redis.del(testKey);
    await redis.quit();
  });

  test('should connect to Redis successfully', async () => {
    const pong = await redis.ping();
    expect(pong).toBe('PONG');
  });

  test('should set and get cache data', async () => {
    // Set data in cache
    await setCache(testKey, testData, testTtl);
    
    // Get data from cache
    const cachedData = await getCache(testKey);
    
    // Verify data matches
    expect(cachedData).toEqual(testData);
  });

  test('should respect TTL for cached data', async () => {
    // Set data with 1 second TTL
    await setCache(testKey, testData, 1);
    
    // Verify data exists immediately
    let cachedData = await getCache(testKey);
    expect(cachedData).toEqual(testData);
    
    // Wait for TTL to expire
    await new Promise(resolve => setTimeout(resolve, 1100));
    
    // Verify data is gone after TTL
    cachedData = await getCache(testKey);
    expect(cachedData).toBeNull();
  });

  test('should invalidate cache by pattern', async () => {
    // Set multiple test keys
    await setCache('test:key1', { id: 1 });
    await setCache('test:key2', { id: 2 });
    await setCache('other:key', { id: 3 });
    
    // Invalidate only test:* keys
    await invalidateCache('test:*');
    
    // Verify test:* keys are gone
    const key1Data = await getCache('test:key1');
    const key2Data = await getCache('test:key2');
    expect(key1Data).toBeNull();
    expect(key2Data).toBeNull();
    
    // Verify other:key still exists
    const otherData = await getCache('other:key');
    expect(otherData).toEqual({ id: 3 });
    
    // Clean up
    await redis.del('other:key');
  });

  test('withCache should fetch and cache data', async () => {
    // Mock data fetcher
    const fetchData = jest.fn().mockResolvedValue(testData);
    
    // First call should fetch data
    const result1 = await withCache(testKey, testTtl, fetchData);
    expect(result1).toEqual(testData);
    expect(fetchData).toHaveBeenCalledTimes(1);
    
    // Second call should use cache
    const result2 = await withCache(testKey, testTtl, fetchData);
    expect(result2).toEqual(testData);
    expect(fetchData).toHaveBeenCalledTimes(1); // Still called only once
  });

  test('withCache should handle fetch errors', async () => {
    // Mock data fetcher that throws error
    const fetchError = new Error('Fetch failed');
    const fetchData = jest.fn().mockRejectedValue(fetchError);
    
    // Should propagate the error
    await expect(withCache(testKey, testTtl, fetchData)).rejects.toThrow(fetchError);
  });

  test('cacheKeys should generate consistent keys', () => {
    // Test content key
    expect(cacheKeys.content('123')).toBe('content:123');
    
    // Test campaign key
    expect(cacheKeys.campaign('abc')).toBe('campaign:abc');
    
    // Test user key
    expect(cacheKeys.user('user1')).toBe('user:user1');
    
    // Test analytics key
    expect(cacheKeys.analytics('monthly')).toBe('analytics:monthly');
    
    // Test generate key
    expect(cacheKeys.generate('user1', 'AI', ['twitter', 'linkedin'], 'openai'))
      .toBe('generate:user1:AI:linkedin,twitter:openai');
    
    // Test trends key
    expect(cacheKeys.trends('marketing')).toBe('trends:marketing');
    
    // Test localGenerate key
    expect(cacheKeys.localGenerate('AI', ['twitter', 'email']))
      .toBe('generate-local:AI:email,twitter');
  });
});
