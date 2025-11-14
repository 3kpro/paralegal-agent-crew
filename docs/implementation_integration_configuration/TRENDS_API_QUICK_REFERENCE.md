# Trends API - Quick Reference Guide

**Print-friendly single-page reference for developers**

---

## 🎯 Endpoint

```
GET /api/trends?keyword=X&source=Y&mode=Z&bypass_cache=true
```

---

## 📊 Query Parameters

| Param | Type | Required | Default | Values |
|-------|------|----------|---------|--------|
| `keyword` | string | ✓ | - | Search term |
| `source` | string | | `mixed` | mixed, google, twitter, reddit |
| `mode` | string | | `ideas` | ideas, search |
| `bypass_cache` | bool | | `false` | true, false |

---

## 💾 Response Format

### Success (200)
```json
{
  "success": true,
  "keyword": "marketing",
  "source": "Google Trends",
  "mode": "ideas",
  "data": {
    "trending": [
      {
        "title": "Social Media Marketing",
        "formattedTraffic": "200K searches",
        "relatedQueries": ["Instagram marketing", "TikTok trends"]
      }
    ],
    "relatedQueries": [{"query": "...", "value": 100, "formattedValue": "100%"}],
    "relatedTopics": [...]
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:45Z",
    "cached": false,
    "response_time_ms": 1250
  }
}
```

### Error (400/500)
```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional info",
  "response_time_ms": 45
}
```

---

## 📍 HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad request |
| 429 | Rate limit |
| 500 | Server error |

---

## 🔄 Data Sources Comparison

| Source | Best For | Data Type | Updates |
|--------|----------|-----------|---------|
| **Google** | Popular searches | Search volume | 5-15 min |
| **Twitter** | Viral topics | Hashtags & tweets | Real-time |
| **Reddit** | Discussions | Posts & upvotes | Real-time |
| **Mixed** | Comprehensive | All combined | Varies |

---

## 🚀 Quick Examples

### JavaScript/TypeScript
```javascript
// Basic search
const res = await fetch('/api/trends?keyword=AI&source=google');
const data = await res.json();
console.log(data.data.trending);

// With error handling
try {
  const res = await fetch(
    `/api/trends?keyword=marketing&source=twitter&mode=ideas`
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data.trending;
} catch (err) {
  console.error('Error:', err.message);
}
```

### React Hook
```typescript
import { useState } from 'react';

function useTrends() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const search = async (keyword, source = 'mixed') => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/trends?keyword=${keyword}&source=${source}`
      );
      const result = await res.json();
      if (result.success) setData(result.data);
    } finally {
      setLoading(false);
    }
  };
  
  return { data, loading, search };
}
```

### cURL
```bash
# Basic
curl "http://localhost:3000/api/trends?keyword=marketing"

# Google Trends
curl "http://localhost:3000/api/trends?keyword=AI&source=google"

# Twitter with cache bypass
curl "http://localhost:3000/api/trends?keyword=viral&source=twitter&bypass_cache=true"

# Pretty print
curl "http://localhost:3000/api/trends?keyword=test" | json_pp
```

---

## ⚡ Performance

| Operation | Time | Notes |
|-----------|------|-------|
| Cache hit | ~50ms | Served from Redis |
| API call | ~1.2s | Real data fetch |
| Gemini fallback | ~2.5s | AI-generated |
| Mock data | ~75ms | Last resort |

---

## 🛡️ Error Handling

### Common Errors
```
Bad request: Missing or invalid keyword
Invalid source parameter: Use mixed, google, twitter, or reddit
Rate limited: Too many requests - wait before retrying
Server error: All services unavailable
```

### Retry Pattern
```javascript
async function fetchWithRetry(keyword, maxAttempts = 3) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch(`/api/trends?keyword=${keyword}`);
      const data = await res.json();
      if (data.success) return data;
    } catch (err) {
      if (i === maxAttempts - 1) throw err;
      await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
    }
  }
}
```

---

## 🔗 Frontend Integration

### TrendSourceSelector Component
```typescript
import { TrendSourceSelector } from '@/components/ui';

<TrendSourceSelector 
  value={source}           // 'mixed', 'google', 'twitter', 'reddit'
  onChange={setSource}     // Update handler
  disabled={loading}       // Optional disable state
/>
```

### Usage in campaigns/new
```typescript
const [trendSource, setTrendSource] = useState('mixed');

async function searchTrends() {
  const res = await fetch(
    `/api/trends?keyword=${query}&mode=ideas&source=${trendSource}`
  );
  // ... handle response
}
```

---

## 🚨 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| 400 Bad Request | Check keyword parameter exists and is valid |
| Invalid source | Use: mixed, google, twitter, or reddit |
| Rate limited (429) | Implement exponential backoff retry |
| Slow response | Check if result is from cache; use bypass_cache=true |
| Empty results | Try different source or keyword |

---

## 🧪 Testing Checklist

- [ ] Test all 4 sources (mixed, google, twitter, reddit)
- [ ] Test with different keywords
- [ ] Test cache hit (same keyword twice)
- [ ] Test bypass cache
- [ ] Test error handling (invalid params)
- [ ] Test rate limiting
- [ ] Test fallback chain
- [ ] Verify response format
- [ ] Check performance metrics

---

## 📋 Response Field Reference

| Field | Type | Description |
|-------|------|-------------|
| `success` | bool | Operation success |
| `keyword` | string | Searched keyword |
| `source` | string | Actual source used |
| `mode` | string | Request mode |
| `data.trending` | array | Trending topics |
| `data.relatedQueries` | array | Related searches |
| `data.relatedTopics` | array | Related topics |
| `meta.timestamp` | string | ISO 8601 timestamp |
| `meta.cached` | bool | From cache? |
| `meta.response_time_ms` | number | Response time |

---

## 🔐 Security Notes

- ✅ No authentication required (public API)
- ✅ Input validation on keyword
- ✅ No PII in responses
- ✅ API keys encrypted if stored
- 📋 Rate limiting recommended
- 📋 User authentication planned

---

## 📚 Full Documentation

- **API Design:** `API_DESIGN_TRENDS.md`
- **Integration:** `TRENDS_API_INTEGRATION_GUIDE.md`
- **OpenAPI:** `openapi.trends.yaml`
- **README:** `README_TRENDS_API.md`

---

## 💡 Pro Tips

1. **Cache results locally** in React component to reduce API calls
2. **Use debouncing** for search input to avoid rate limits
3. **Bypass cache** when you need latest data
4. **Monitor response_time_ms** to track performance
5. **Implement retry** for production reliability
6. **Test fallbacks** by mocking API failures

---

## 🎨 Component Props

```typescript
interface TrendSourceSelectorProps {
  value: string;                    // Current selection
  onChange: (source: string) => void;  // Selection change handler
  disabled?: boolean;               // Optional disable state
}
```

---

## 📞 Quick Support

- **GitHub Issues:** Report bugs
- **Email:** api-support@company.com
- **Docs:** See documentation folder
- **Status:** https://status.company.com

---

**Version:** 1.0.0 | Print-friendly | Keep handy! 📌
