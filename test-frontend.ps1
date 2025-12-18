# Test what the frontend receives
$response = Invoke-RestMethod -Uri "https://xelora.app/api/trends?keyword=Immigration%20Law&mode=ideas" -UseBasicParsing

Write-Host "========================================="
Write-Host "FULL API RESPONSE TEST"
Write-Host "========================================="
Write-Host "Source: $($response.source)"
Write-Host "Success: $($response.success)"
Write-Host "Keyword: $($response.keyword)"
Write-Host ""
Write-Host "ALL TRENDS:"
for ($i = 0; $i -lt $response.data.trending.Count; $i++) {
    Write-Host "$($i+1). $($response.data.trending[$i].title) - $($response.data.trending[$i].formattedTraffic)"
}
Write-Host ""
Write-Host "If you see 'AI Content Creation', 'Social Media Marketing' = BAD (mock data)"
Write-Host "If you see 'DACA', 'Immigration', 'Asylum' = GOOD (Gemini AI working)"
