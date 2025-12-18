$response = Invoke-RestMethod -Uri "https://xelora.app/api/trends?keyword=Immigration%20Law&mode=ideas" -UseBasicParsing
Write-Host "=== API Test Results ==="
Write-Host "Source: $($response.source)"
Write-Host "Keyword: $($response.keyword)"
Write-Host "Trends count: $($response.data.trending.Count)"
Write-Host ""
Write-Host "First 3 trends:"
for ($i = 0; $i -lt 3; $i++) {
    Write-Host "$($i+1). $($response.data.trending[$i].title)"
}
