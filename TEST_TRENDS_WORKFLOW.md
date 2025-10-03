# Google Trends + Content Generation Workflow Test

## Test 1: Get Trending Topics

```powershell
# Get daily trending topics
Invoke-RestMethod -Uri "http://localhost:3000/api/trends?mode=trending" | ConvertTo-Json -Depth 5
```

## Test 2: Search Related Content Ideas

```powershell
# Search for related topics and queries
$keyword = "AI automation"
Invoke-RestMethod -Uri "http://localhost:3000/api/trends?keyword=$keyword&mode=ideas" | ConvertTo-Json -Depth 5
```

## Test 3: Generate Content from Trending Topic (LM Studio)

```powershell
# Generate Twitter + LinkedIn + Email content
$body = @{
    topic = "AI automation for content creators"
    formats = @("twitter", "linkedin", "email")
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/generate-local" -Method Post -Body $body -ContentType "application/json"
```

## Test 4: Complete Workflow (Manual)

1. **Open browser**: http://localhost:3000/trend-gen

2. **Click "Daily Trends"** to see trending topics

3. **Select a trending topic** (e.g., "AI automation for content creators")

4. **Click "Generate Content"** to create multi-format content

5. **View results** in Twitter/LinkedIn/Email tabs

## Expected Results

### Trends API Response:
```json
{
  "success": true,
  "mode": "trending",
  "data": [
    {
      "title": "AI automation for content creators",
      "formattedTraffic": "500K+",
      "relatedQueries": ["AI tools", "automation software", "content marketing"]
    },
    // ... more topics
  ]
}
```

### Content Generation Response:
```json
{
  "success": true,
  "topic": "AI automation for content creators",
  "results": {
    "twitter": "1/ Thread about AI automation...",
    "linkedin": "Professional post about AI automation...",
    "email": {
      "subject": "...",
      "preview": "...",
      "body": "..."
    }
  },
  "provider": "lm-studio",
  "model": "mistral-7b-instruct-v0.3"
}
```

## Notes

- **Trends API**: Uses fallback curated topics (Google Trends unofficial API is unreliable)
- **Content Generation**: Uses FREE LM Studio on IBM P51 (10.10.10.105:1234)
- **Performance**: ~60 seconds per generation
- **Cost**: $0.00 (completely free with local AI)

## Troubleshooting

If LM Studio is not available:
```powershell
# Check LM Studio health
Invoke-RestMethod -Uri "http://10.10.10.105:1234/v1/models"
```

If trends not showing:
- Fallback topics are hardcoded for content creators
- Topics are curated based on "building in public" audience
