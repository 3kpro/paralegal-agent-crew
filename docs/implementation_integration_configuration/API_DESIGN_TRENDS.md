# Trends API Design Documentation

**Version:** 1.0.0  
**Status:** Production Ready  
**Last Updated:** 2024

---

## 1. Executive Summary

The **Trends API** is a core component of the Content Cascade AI (TrendPulse) platform that provides trending topic discovery from multiple data sources. It enables users to search for trending content ideas across Google Trends, Twitter, Reddit, and combined sources.

### Key Features
- **Multi-source trend discovery** (Google, Twitter, Reddit, Mixed)
- **Intelligent fallback system** (Real API → Gemini AI → Mock Data)
- **Redis caching** for performance optimization
- **Performance metrics** with response time tracking

---

## 2. Core Endpoint: GET /api/trends

### Request Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `keyword` | string | Yes | - | Search keyword (1-100 chars) |
| `mode` | string | No | `ideas` | Request mode: `ideas` or `search` |
| `source` | string | No | `mixed` | Data source: `mixed`, `google`, `twitter`, or `reddit` |
| `bypass_cache` | boolean | No | `false` | Skip cache and fetch fresh data |

### Example Requests

```
GET /api/trends?keyword=marketing&mode=ideas
GET /api/trends?keyword=AI+trends&source=google&mode=ideas
GET /api/trends?keyword=viral&source=twitter&bypass_cache=true
GET /api/trends?keyword=JavaScript&source=reddit
```

---

## 3. Response Format

### Success Response (200 OK)

```json
{
  "success": true,
  "mode": "ideas",
  "keyword": "marketing",
  "source": "mixed",
  "data": {
    "trending": [
      {
        "title": "Social Media Marketing",
        "formattedTraffic": "200K searches",
        "relatedQueries": [
          "Instagram marketing",
          "TikTok trends",
          "Social media automation"
        ]
      }
    ],
    "relatedQueries": [
      {
        "query": "marketing tools",
        "value": 100,
        "formattedValue": "100%"
      }
    ],
    "relatedTopics": [
      {
        "query": "marketing trends",
        "value": 100,
        "formattedValue": "100%"
      }
    ]
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:45.123Z",
    "cached": false,
    "response_time_ms": 1250
  }
}
```

### Error Response (400/500)

```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional context",
  "response_time_ms": 125
}
```

---

## 4. HTTP Status Codes

| Status | Meaning |
|--------|---------|
| 200 | Success - trends returned |
| 400 | Bad request - invalid parameters |
| 429 | Rate limit exceeded |
| 500 | Server error |
| 503 | Service unavailable |

---

## 5. Data Sources

### Google Trends
- Popular search queries and topics
- Search volume trends
- Best for discovering popular keywords

### Twitter Trends
- Trending topics and hashtags
- Real-time viral content
- Best for trending conversations

### Reddit Hot Topics
- Popular discussions
- Upvoted and commented content
- Best for community-driven trends

### Mixed (Default)
- Combines all three sources
- Deduplicates similar topics
- Comprehensive trend overview

---

## 6. Fallback Architecture

The API uses intelligent fallback chain:

1. **Check Redis Cache** (5-minute TTL)
2. **Try Real APIs** (Google/Twitter/Reddit)
3. **Fall back to Gemini AI** (synthetic generation)
4. **Use Mock Data** (guaranteed response)

This ensures the API **always returns valid data**.

---

## 7. Caching Strategy

- **TTL:** 5 minutes
- **Key Format:** trends:{keyword}:{source}
- **Backend:** Redis
- **Update Method:** Async (non-blocking)
- **Bypass:** Use bypass_cache=true parameter

### Performance Targets

| Scenario | Time | Source |
|----------|------|--------|
| Cache hit | ~50ms | Redis |
| Real API | ~1.2s | Google/Twitter/Reddit |
| Gemini fallback | ~2.5s | Generative AI |
| Mock data | ~75ms | In-memory |

---

## 8. Security & Validation

- Keyword: 1-100 alphanumeric characters + spaces
- SQL injection prevention with parameterized queries
- API key encryption for user-provided keys
- Recommended rate limit: 100 requests per 5 minutes per IP

---

## 9. Frontend Integration

The component is integrated in campaigns/new page:

```typescript
import { TrendSourceSelector } from "@/components/ui";

const [trendSource, setTrendSource] = useState("mixed");

async function searchTrends() {
  const response = await fetch(
    `/api/trends?keyword=${keyword}&mode=ideas&source=${trendSource}`
  );
  const data = await response.json();
  // Use data.data.trending for display
}
```

---

## 10. Component Features

- **Dropdown selector** with 4 source options
- **Visual indicators** for selected source
- **Loading states** during API calls
- **Mobile responsive** design
- **Accessibility** support (ARIA labels)

---

## 11. Performance Metrics

All responses include performance metadata:

```json
{
  "meta": {
    "timestamp": "2024-01-15T10:30:45.123Z",
    "cached": false,
    "response_time_ms": 1250
  }
}
```

---

## 12. Implementation Status

✅ **Completed:**
- Multi-source support
- Redis caching
- Fallback mechanisms
- TrendSourceSelector component
- API integration

📋 **Recommended Enhancements:**
- Rate limiting per IP
- User authentication
- Advanced filtering
- Sentiment analysis
- Webhook notifications

---

## 13. Testing Examples

### Basic Test
```javascript
const response = await fetch(
  '/api/trends?keyword=marketing&source=google'
);
const data = await response.json();
console.log(data.data.trending);
```

### Test with Bypass Cache
```javascript
const response = await fetch(
  '/api/trends?keyword=test&source=reddit&bypass_cache=true'
);
```

---

## 14. Error Handling

The API handles errors gracefully:
- Missing parameters return 400
- Invalid sources return 400  
- Rate limit exceeded returns 429
- Service failures use fallback chain

---

## 15. API Versioning

Current: **v1.0.0**

Future versions maintain backward compatibility with additive-only changes.

---

## Support

- **GitHub Issues:** Report bugs and feature requests
- **Email:** api-support@company.com
- **Status:** https://status.company.com

---

**This API is production-ready and actively maintained.**
