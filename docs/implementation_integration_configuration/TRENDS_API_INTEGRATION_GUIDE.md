# Trends API Integration Guide

## Complete Implementation Reference

This guide provides step-by-step instructions for integrating the Trends API into your application, with complete code examples and best practices.

---

## Table of Contents

1. [Setup & Configuration](#setup--configuration)
2. [Basic Integration](#basic-integration)
3. [Advanced Usage](#advanced-usage)
4. [Error Handling](#error-handling)
5. [Performance Optimization](#performance-optimization)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

---

## Setup & Configuration

### Environment Variables

Create a `.env.local` file with required API keys:

```bash
# API Keys for different sources
GOOGLE_API_KEY=your_google_api_key
TWITTER_API_KEY=your_twitter_api_v2_key
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
NEWS_API_KEY=your_news_api_key  # Optional

# Cache Configuration
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_password  # If password protected

# API Configuration
API_BASE_URL=http://localhost:3000/api
API_TIMEOUT=30000  # 30 seconds
```

### Installation

No additional packages needed - the API is built into the Next.js application.

---

## Basic Integration

### Simple Trend Search

```typescript
// pages/example.tsx
import { useState } from 'react';

export default function TrendSearchPage() {
  const [keyword, setKeyword] = useState('');
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function searchTrends() {
    if (!keyword.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `/api/trends?keyword=${encodeURIComponent(keyword)}&mode=ideas`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setTrends(data.data.trending);
      } else {
        setError(data.error || 'Failed to fetch trends');
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6">
      <h1>Trend Discovery</h1>

      <div className="flex gap-2 my-4">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Enter trend keyword..."
          className="flex-1 px-3 py-2 border rounded"
          onKeyPress={(e) => e.key === 'Enter' && searchTrends()}
        />
        <button
          onClick={searchTrends}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && <div className="text-red-600">{error}</div>}

      <ul className="space-y-2">
        {trends.map((trend, idx) => (
          <li key={idx} className="p-3 bg-gray-100 rounded">
            <h3 className="font-bold">{trend.title}</h3>
            <p className="text-sm text-gray-600">{trend.formattedTraffic}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## Advanced Usage

### Using TrendSourceSelector Component

```typescript
import { TrendSourceSelector } from '@/components/ui';
import { useState } from 'react';

export default function AdvancedTrendSearch() {
  const [keyword, setKeyword] = useState('');
  const [source, setSource] = useState('mixed');
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(false);

  async function searchTrends() {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/trends?keyword=${encodeURIComponent(keyword)}&mode=ideas&source=${source}`
      );
      const data = await response.json();
      if (data.success) {
        setTrends(data.data.trending);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <TrendSourceSelector value={source} onChange={setSource} />

      <input
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="Enter keyword..."
      />

      <button onClick={searchTrends} disabled={loading}>
        {loading ? 'Searching...' : 'Search'}
      </button>

      {/* Display trends */}
    </div>
  );
}
```

### Custom Hook for Trend Fetching

```typescript
// hooks/useTrends.ts
import { useState, useCallback } from 'react';

interface UseTrendsOptions {
  source?: 'mixed' | 'google' | 'twitter' | 'reddit';
  bypassCache?: boolean;
}

interface TrendsResult {
  trending: any[];
  relatedQueries: any[];
  relatedTopics: any[];
  source: string;
}

export function useTrends() {
  const [data, setData] = useState<TrendsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(
    async (keyword: string, options: UseTrendsOptions = {}) => {
      if (!keyword.trim()) return;

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          keyword,
          mode: 'ideas',
          source: options.source || 'mixed',
          ...(options.bypassCache && { bypass_cache: 'true' }),
        });

        const response = await fetch(`/api/trends?${params}`);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          setData(result.data);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { data, loading, error, search };
}

// Usage in component:
export function MyComponent() {
  const { data, loading, error, search } = useTrends();

  return (
    <button onClick={() => search('marketing', { source: 'google' })}>
      Search
    </button>
  );
}
```

---

## Error Handling

### Comprehensive Error Handling

```typescript
async function fetchTrendsWithErrorHandling(keyword: string) {
  try {
    const response = await fetch(
      `/api/trends?keyword=${encodeURIComponent(keyword)}&mode=ideas`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(30000), // 30 second timeout
      }
    );

    // Check for HTTP errors
    if (!response.ok) {
      if (response.status === 400) {
        throw new Error('Bad request - invalid keyword');
      } else if (response.status === 429) {
        throw new Error('Rate limited - please wait before retrying');
      } else if (response.status === 500) {
        throw new Error('Server error - please try again later');
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    }

    const data = await response.json();

    // Check API response status
    if (!data.success) {
      throw new Error(data.error || 'Unknown API error');
    }

    return data.data;
  } catch (err) {
    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        console.error('Request timeout');
      } else {
        console.error('Trends API error:', err.message);
      }
    }
    throw err;
  }
}
```

### Retry Logic with Exponential Backoff

```typescript
async function fetchTrendsWithRetry(
  keyword: string,
  maxRetries = 3
): Promise<any> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(
        `/api/trends?keyword=${encodeURIComponent(keyword)}&mode=ideas`
      );
      const data = await response.json();

      if (data.success) {
        return data.data;
      } else if (data.error && attempt < maxRetries - 1) {
        // Retry on API error (except rate limit)
        if (!data.error.includes('Rate limit')) {
          lastError = new Error(data.error);
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
      }

      throw new Error(data.error || 'API error');
    } catch (err) {
      lastError = err as Error;

      if (attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Failed after retries');
}
```

---

## Performance Optimization

### Caching Results Locally

```typescript
// utils/trendCache.ts
class TrendCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private TTL = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: any) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get(key: string) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    // Check if expired
    if (Date.now() - cached.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  clear() {
    this.cache.clear();
  }
}

export const trendCache = new TrendCache();

// Usage:
export async function getCachedTrends(keyword: string) {
  // Check local cache first
  const cached = trendCache.get(keyword);
  if (cached) {
    console.log('Using local cache');
    return cached;
  }

  // Fetch from API
  const response = await fetch(`/api/trends?keyword=${keyword}`);
  const data = await response.json();

  // Store in cache
  if (data.success) {
    trendCache.set(keyword, data.data);
  }

  return data.data;
}
```

### Debounced Search

```typescript
import { useCallback, useRef, useState } from 'react';

export function useDebouncedTrendSearch(delay = 500) {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const search = useCallback((keyword: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setLoading(true);

    timeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/trends?keyword=${encodeURIComponent(keyword)}`
        );
        const data = await response.json();
        if (data.success) {
          setResults(data.data);
        }
      } finally {
        setLoading(false);
      }
    }, delay);
  }, [delay]);

  return { results, loading, search };
}
```

---

## Testing

### Unit Tests

```typescript
// __tests__/api/trends.test.ts
import { GET } from '@/app/api/trends/route';
import { NextRequest } from 'next/server';

describe('GET /api/trends', () => {
  it('returns trends for valid keyword', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/trends?keyword=marketing&mode=ideas'
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.trending).toBeInstanceOf(Array);
  });

  it('returns error for missing keyword', async () => {
    const request = new NextRequest('http://localhost:3000/api/trends');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true); // Fallback to mock data
  });

  it('handles different sources', async () => {
    const sources = ['google', 'twitter', 'reddit', 'mixed'];

    for (const source of sources) {
      const request = new NextRequest(
        `http://localhost:3000/api/trends?keyword=test&source=${source}`
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    }
  });
});
```

### Integration Tests

```typescript
// __tests__/integration/trends.integration.test.ts
describe('Trends API Integration', () => {
  it('complete search flow', async () => {
    // 1. Search with default source
    let response = await fetch('/api/trends?keyword=marketing&mode=ideas');
    let data = await response.json();
    expect(data.success).toBe(true);
    expect(data.source).toBeDefined();

    // 2. Search with specific source
    response = await fetch(
      '/api/trends?keyword=marketing&source=google&mode=ideas'
    );
    data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.trending.length).toBeGreaterThan(0);

    // 3. Verify response format
    const trend = data.data.trending[0];
    expect(trend).toHaveProperty('title');
    expect(trend).toHaveProperty('formattedTraffic');
    expect(trend).toHaveProperty('relatedQueries');
  });
});
```

### End-to-End Tests

```typescript
// e2e/trends.spec.ts
test('user can search for trends and select one', async ({ page }) => {
  // Navigate to page
  await page.goto('/campaigns/new');

  // Fill in campaign name
  await page.fill('input[placeholder*="campaign"]', 'My Campaign');

  // Select trend source
  await page.click('button:has-text("Mixed Sources")');
  await page.click('text=Google Trends');

  // Search for trends
  await page.fill('input[placeholder*="trend"]', 'marketing');
  await page.click('button:has-text("Search")');

  // Wait for results
  await page.waitForSelector('li:has-text("Social Media Marketing")');

  // Select a trend
  await page.click('li:has-text("Social Media Marketing")');

  // Verify selection
  await expect(page.locator('text=Social Media Marketing')).toBeVisible();
});
```

---

## Troubleshooting

### Common Issues

#### Issue: "Missing required parameter: keyword"

**Solution:** Ensure the keyword parameter is provided in the query string:

```javascript
// Wrong
fetch('/api/trends')

// Correct
fetch('/api/trends?keyword=marketing')
```

#### Issue: "Invalid source parameter"

**Solution:** Use only valid source values:

```javascript
// Valid sources
const sources = ['mixed', 'google', 'twitter', 'reddit'];

// Wrong
fetch('/api/trends?keyword=test&source=facebook')

// Correct
fetch('/api/trends?keyword=test&source=twitter')
```

#### Issue: Rate limit exceeded (429)

**Solution:** Implement retry logic with exponential backoff:

```javascript
// Implement retry with delay
async function searchWithRetry(keyword) {
  try {
    return await fetchTrends(keyword);
  } catch (err) {
    if (err.status === 429) {
      await sleep(5000); // Wait 5 seconds
      return await fetchTrends(keyword);
    }
    throw err;
  }
}
```

#### Issue: Slow response times

**Solution:** Check if results are coming from cache, consider bypassing:

```javascript
// First attempt - may be cached
const response1 = await fetch('/api/trends?keyword=test');

// Force fresh data if needed
const response2 = await fetch('/api/trends?keyword=test&bypass_cache=true');
```

### Debug Mode

Enable debug logging:

```typescript
// In your fetch wrapper
const response = await fetch(
  `/api/trends?keyword=${keyword}&debug=true`
);
const data = await response.json();

console.log('Response time:', data.meta.response_time_ms, 'ms');
console.log('Cached:', data.meta.cached);
console.log('Source:', data.source);
```

---

## Production Checklist

- [ ] Environment variables configured
- [ ] API keys secured and rotated
- [ ] Error handling implemented
- [ ] Rate limiting configured
- [ ] Logging and monitoring setup
- [ ] Tests passing (unit, integration, E2E)
- [ ] Response time acceptable (< 2s typical)
- [ ] Fallback mechanisms verified
- [ ] Documentation updated
- [ ] Team training completed

---

## Support

For issues or questions:
- Check the [API Design Documentation](./API_DESIGN_TRENDS.md)
- Review [OpenAPI Specification](./openapi.trends.yaml)
- File an issue on GitHub
- Contact api-support@company.com

