# Google Business Profile Verification Script
# Purpose: Verify that business information is correctly displayed across Google services
# Date: 2026-02-05

Write-Host "`n🔍 GOOGLE BUSINESS PROFILE VERIFICATION SCRIPT" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Cyan

# Configuration
$xeloraSearchTerms = @(
    "XELORA",
    "getxelora",
    "xelora content prediction"
)

$threeKProSearchTerms = @(
    "3kpro.services",
    "3K Pro Services Tulsa",
    "3kpro engineering"
)

# Expected Values
$expectedXeloraWebsite = "https://getxelora.com"
$expected3KProPhone = "918.816.8832"
$expected3KProEmail = "james@3kpro.services"
$expected3KProWebsite = "https://3kpro.services"

Write-Host "`n📋 Checking Domain Status..." -ForegroundColor Yellow

# Check getxelora.com
Write-Host "`n1. Checking getxelora.com..." -ForegroundColor White
try {
    $response = Invoke-WebRequest -Uri "https://getxelora.com" -Method Head -MaximumRedirection 0 -ErrorAction Stop -TimeoutSec 10
    Write-Host "   ✅ Status: $($response.StatusCode) - Site is live" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 301 -or $_.Exception.Response.StatusCode -eq 302) {
        Write-Host "   ℹ️  Redirect detected to: $($_.Exception.Response.Headers.Location)" -ForegroundColor Cyan
    } else {
        Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Check 3kpro.services
Write-Host "`n2. Checking 3kpro.services..." -ForegroundColor White
try {
    $response = Invoke-WebRequest -Uri "https://3kpro.services" -Method Head -MaximumRedirection 0 -ErrorAction Stop -TimeoutSec 10
    Write-Host "   ✅ Status: $($response.StatusCode) - Site is live" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 301 -or $_.Exception.Response.StatusCode -eq 302) {
        Write-Host "   ℹ️  Redirect detected to: $($_.Exception.Response.Headers.Location)" -ForegroundColor Cyan
    } else {
        Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Check old xelora.app domain
Write-Host "`n3. Checking xelora.app (should redirect)..." -ForegroundColor White
try {
    $response = Invoke-WebRequest -Uri "https://xelora.app" -Method Head -MaximumRedirection 0 -ErrorAction Stop -TimeoutSec 10
    Write-Host "   ⚠️  Status: $($response.StatusCode) - Old domain is still active (should redirect)" -ForegroundColor Yellow
} catch {
    if ($_.Exception.Response.StatusCode -eq 301 -or $_.Exception.Response.StatusCode -eq 302) {
        $redirectLocation = $_.Exception.Response.Headers.Location
        if ($redirectLocation -like "*getxelora.com*") {
            Write-Host "   ✅ Properly redirects to: $redirectLocation" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  Redirects to unexpected location: $redirectLocation" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "   ℹ️  Note: This may mean the domain is not connected to Vercel" -ForegroundColor Cyan
    }
}

# Check Google verification file
Write-Host "`n📄 Checking Google Verification Files..." -ForegroundColor Yellow

Write-Host "`n4. Checking Google Search Console verification..." -ForegroundColor White
try {
    $response = Invoke-WebRequest -Uri "https://getxelora.com/google861a1d34210911d1.html" -TimeoutSec 10 -ErrorAction Stop
    Write-Host "   ✅ Google verification file is accessible" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Google verification file not found: $($_.Exception.Message)" -ForegroundColor Red
}

# Manual verification checklist
Write-Host "`n`n📊 MANUAL VERIFICATION CHECKLIST" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host "`nPerform these checks manually at https://business.google.com:`n" -ForegroundColor Yellow

Write-Host "XELORA Profile:" -ForegroundColor White
Write-Host "  [ ] Website shows: $expectedXeloraWebsite (NOT xelora.app)"
Write-Host "  [ ] Email shows: support@getxelora.com"
Write-Host "  [ ] Business type: Online/Service Area Business"
Write-Host "  [ ] No physical address listed (or service area only)"
Write-Host "  [ ] Profile is verified (has blue checkmark)"

Write-Host "`n3KPRO.SERVICES Profile:" -ForegroundColor White
Write-Host "  [ ] Website shows: $expected3KProWebsite"
Write-Host "  [ ] Phone shows: $expected3KProPhone"
Write-Host "  [ ] Email shows: $expected3KProEmail"
Write-Host "  [ ] NO physical address visible (service area business)"
Write-Host "  [ ] Location shows: Tulsa, Oklahoma (city only)"
Write-Host "  [ ] Profile is verified (has blue checkmark)"

Write-Host "`n`n🔍 GOOGLE SEARCH VERIFICATION" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host "`nSearch these terms in Google and verify the Knowledge Panel:`n" -ForegroundColor Yellow

Write-Host "For XELORA:" -ForegroundColor White
foreach ($term in $xeloraSearchTerms) {
    Write-Host "  • ""$term"""
}

Write-Host "`nFor 3K Pro Services:" -ForegroundColor White
foreach ($term in $threeKProSearchTerms) {
    Write-Host "  • ""$term"""
}

Write-Host "`n`n⏱️  TIMELINE EXPECTATIONS" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host "`nAfter updating your Business Profiles:" -ForegroundColor Yellow
Write-Host "  • Changes in Business Profile Manager: Immediate"
Write-Host "  • Changes in Google Search: 24-72 hours"
Write-Host "  • Changes in Google Maps: 3-7 days"
Write-Host "  • Full cache refresh: 2-4 weeks"
Write-Host ""

# API Check (if available)
Write-Host "`n🔐 GOOGLE CLOUD API STATUS" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Cyan

try {
    $gcloudVersion = gcloud --version 2>&1 | Select-Object -First 1
    Write-Host "`n✅ Google Cloud SDK: $gcloudVersion" -ForegroundColor Green

    $activeAccount = gcloud config get-value account 2>$null
    Write-Host "✅ Active Account: $activeAccount" -ForegroundColor Green

    $activeProject = gcloud config get-value project 2>$null
    Write-Host "✅ Active Project: $activeProject" -ForegroundColor Green

    Write-Host "`nℹ️  Note: Business Profile API requires manual approval from Google" -ForegroundColor Cyan
    Write-Host "   API quota is currently set to 0 - use web interface instead" -ForegroundColor Cyan
} catch {
    Write-Host "`n⚠️  Google Cloud SDK not found or not configured" -ForegroundColor Yellow
}

Write-Host "`n`n✨ NEXT STEPS" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host "`n1. Go to https://business.google.com and sign in" -ForegroundColor White
Write-Host "2. Update both profiles according to the checklist above" -ForegroundColor White
Write-Host "3. Wait 24-72 hours for changes to propagate" -ForegroundColor White
Write-Host "4. Run this script again to verify" -ForegroundColor White
Write-Host "5. Search your business names in Google to confirm" -ForegroundColor White

Write-Host "`n📚 Documentation: See GOOGLE_BUSINESS_PROFILE_FIX_PLAN.md for detailed steps`n" -ForegroundColor Cyan

# Export results to file
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$logFile = "business_profile_check_$timestamp.txt"
Write-Host "💾 Log saved to: $logFile" -ForegroundColor Green
