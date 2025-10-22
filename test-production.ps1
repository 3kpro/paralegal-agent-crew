# Test production API directly
Write-Host "Testing trendpulse.3kpro.services..."
try {
    $response = Invoke-RestMethod -Uri "https://trendpulse.3kpro.services/api/trends?keyword=Immigration%20Law&mode=ideas" -UseBasicParsing -Headers @{
        "Cache-Control" = "no-cache"
        "Pragma" = "no-cache"
    }
    Write-Host "Source: $($response.source)" -ForegroundColor Yellow
    Write-Host "First trend: $($response.data.trending[0].title)" -ForegroundColor Cyan

    if ($response.source -eq "mock-fallback") {
        Write-Host "PROBLEM: Still showing mock data!" -ForegroundColor Red
    } else {
        Write-Host "SUCCESS: Showing real Gemini data!" -ForegroundColor Green
    }
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Testing latest deployment directly (landing-page-cm8eqmaps)..."
try {
    $response2 = Invoke-RestMethod -Uri "https://landing-page-cm8eqmaps-3kpros-projects.vercel.app/api/trends?keyword=Immigration%20Law&mode=ideas" -UseBasicParsing
    Write-Host "Source: $($response2.source)" -ForegroundColor Yellow
    Write-Host "First trend: $($response2.data.trending[0].title)" -ForegroundColor Cyan
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}
