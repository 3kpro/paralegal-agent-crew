# API Documentation

## Overview

The Content Cascade AI API provides endpoints for generating Twitter threads and monitoring system health.

**Base URL**: `http://localhost:3000` (development)  
**Production URL**: `https://your-domain.com` (when deployed)

---

## Authentication

Currently, no authentication is required. Rate limiting is applied per IP address.

---

## Rate Limiting

- **API Endpoints**: 10 requests per second per IP
- **Health Check**: 60 requests per second per IP

Rate limit headers are included in responses:
- `X-RateLimit-Remaining`: Number of requests remaining
- `X-RateLimit-Reset`: Timestamp when the limit resets
- `Retry-After`: Seconds to wait before retrying (when rate limited)

---

## Endpoints

### POST /api/twitter-thread

Generate a Twitter thread from provided content.

#### Request

```http
POST /api/twitter-thread
Content-Type: application/json
```

**Body Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `content` | string | ✅ | The content to transform into a Twitter thread (10-5000 characters) |
| `style` | string | ❌ | Thread style: `professional`, `casual`, or `educational` (default: `professional`) |
| `includeEmojis` | boolean | ❌ | Include emojis in the thread (default: `false`) |
| `includeHashtags` | boolean | ❌ | Include hashtags in the thread (default: `true`) |

**Example Request:**

```json
{
  "content": "Artificial intelligence is transforming how we approach software development. Modern AI tools can help developers write better code faster, but they require understanding and proper integration.",
  "style": "professional",
  "includeEmojis": false,
  "includeHashtags": true
}
```

#### Response

**Success (200 OK):**

```json
{
  "success": true,
  "message": "Twitter thread generation started",
  "trackingId": "twitter_1759379077997_abc123",
  "estimatedTime": "30-60 seconds"
}
```

**Cached Response (200 OK):**

```json
{
  "success": true,
  "message": "Twitter thread generated (from cache)",
  "trackingId": "twitter_cached_1759379077997_xyz789",
  "estimatedTime": "0 seconds"
}
```

**Validation Error (400 Bad Request):**

```json
{
  "success": false,
  "error": "Validation error",
  "message": "Content must be at least 10 characters"
}
```

**Rate Limit Exceeded (429 Too Many Requests):**

```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please try again in 60 seconds."
}
```

---

### GET /api/twitter-thread

Check the status of a Twitter thread generation request.

#### Request

```http
GET /api/twitter-thread?trackingId=twitter_1759379077997_abc123
```

**Query Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `trackingId` | string | ✅ | The tracking ID returned from the POST request |

#### Response

**Processing (200 OK):**

```json
{
  "status": "processing",
  "trackingId": "twitter_1759379077997_abc123",
  "progress": 30
}
```

**Completed (200 OK):**

```json
{
  "status": "completed",
  "trackingId": "twitter_1759379077997_abc123",
  "progress": 100,
  "thread": "🧵 1/5: Artificial intelligence is transforming software development...\n\n🧵 2/5: Modern AI tools help developers write better code faster..."
}
```

**Failed (200 OK):**

```json
{
  "status": "failed",
  "trackingId": "twitter_1759379077997_abc123",
  "progress": 100,
  "error": "Service temporarily unavailable. Please try again later."
}
```

**Invalid/Expired Tracking ID (404 Not Found):**

```json
{
  "error": "Invalid or expired tracking ID"
}
```

---

### GET /api/health

Check the health status of the API and its dependencies.

#### Request

```http
GET /api/health
```

#### Response

**Healthy (200 OK):**

```json
{
  "status": "healthy",
  "timestamp": "2025-10-01T12:00:00.000Z",
  "version": "1.0.0",
  "services": {
    "n8n": {
      "status": "connected",
      "responseTime": 18,
      "lastChecked": "2025-10-01T12:00:00.000Z"
    }
  },
  "uptime": 3600000,
  "memory": {
    "used": 217.67,
    "total": 287.65,
    "percentage": 76
  }
}
```

**Degraded (200 OK):**

```json
{
  "status": "degraded",
  "timestamp": "2025-10-01T12:00:00.000Z",
  "services": {
    "n8n": {
      "status": "disconnected",
      "lastChecked": "2025-10-01T12:00:00.000Z"
    }
  }
}
```

**Unhealthy (503 Service Unavailable):**

```json
{
  "status": "unhealthy",
  "timestamp": "2025-10-01T12:00:00.000Z",
  "services": {
    "n8n": {
      "status": "error",
      "lastChecked": "2025-10-01T12:00:00.000Z"
    }
  }
}
```

---

## Error Handling

All endpoints follow a consistent error response format:

```json
{
  "success": false,
  "error": "Error category",
  "message": "User-friendly error message"
}
```

### Common HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 400 | Bad Request | Invalid request parameters |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error occurred |
| 503 | Service Unavailable | Service is temporarily unavailable |

---

## Caching

The API implements intelligent caching:

- **Cache Duration**: 10 minutes
- **Cache Key**: Based on content + style + emoji/hashtag preferences
- Duplicate requests return cached results instantly (0 seconds)
- Cache is automatically cleaned up every 5 minutes

---

## Retry Logic

The API implements automatic retry for failed requests:

- **Retries**: 3 attempts with exponential backoff
- **Delays**: 1s, 2s, 4s
- **4xx errors**: No retry (client error)
- **5xx errors**: Automatic retry (server error)
- **Network failures**: Automatic retry

---

## Examples

### cURL Examples

**Generate Twitter Thread:**

```bash
curl -X POST http://localhost:3000/api/twitter-thread \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Your content here - make sure it's at least 10 characters long",
    "style": "professional",
    "includeEmojis": false,
    "includeHashtags": true
  }'
```

**Check Status:**

```bash
curl "http://localhost:3000/api/twitter-thread?trackingId=twitter_123_abc"
```

**Health Check:**

```bash
curl http://localhost:3000/api/health
```

### JavaScript Examples

**Using Fetch:**

```javascript
// Generate Twitter thread
const response = await fetch('http://localhost:3000/api/twitter-thread', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    content: 'Your content here',
    style: 'professional',
  }),
})

const { trackingId } = await response.json()

// Poll for status
const checkStatus = async () => {
  const statusResponse = await fetch(
    `http://localhost:3000/api/twitter-thread?trackingId=${trackingId}`
  )
  const status = await statusResponse.json()
  
  if (status.status === 'completed') {
    console.log('Thread:', status.thread)
  } else if (status.status === 'failed') {
    console.error('Error:', status.error)
  } else {
    // Still processing, check again in 2 seconds
    setTimeout(checkStatus, 2000)
  }
}

checkStatus()
```

---

## Best Practices

1. **Rate Limiting**: Implement exponential backoff when rate limited
2. **Polling**: Check status every 2-3 seconds (not more frequently)
3. **Error Handling**: Always handle 4xx and 5xx responses gracefully
4. **Timeouts**: Set appropriate request timeouts (60+ seconds for POST)
5. **Caching**: Cache results on your end when appropriate

---

## Support

For issues or questions, please open an issue on GitHub.
