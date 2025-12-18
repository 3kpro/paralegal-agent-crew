# OAuth Credentials Setup Script for Vercel
# This script adds all social media OAuth credentials to Vercel environment variables

Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host "  XELORA OAuth Credentials Setup" -ForegroundColor Cyan
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host ""

# Check if vercel CLI is installed
if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Vercel CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "npm install -g vercel" -ForegroundColor Yellow
    exit 1
}

# Verify user is logged in
Write-Host "Checking Vercel authentication..." -ForegroundColor Yellow
$whoami = vercel whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Not logged in to Vercel. Run 'vercel login' first." -ForegroundColor Red
    exit 1
}
Write-Host "✓ Logged in as: $whoami" -ForegroundColor Green
Write-Host ""

# Twitter/X Credentials
Write-Host "=== TWITTER/X CREDENTIALS ===" -ForegroundColor Cyan
$TWITTER_CLIENT_ID = "cTd1STFLbms1RXRaSWFmQnBPaFQ6MTpjaQ"
$TWITTER_CLIENT_SECRET = "6QVXUiWzcl59bpYeWtdyzyGfFIxuLzVF_7oqJptBlMQEQ1TeOw"

Write-Host "Twitter Client ID: $TWITTER_CLIENT_ID" -ForegroundColor Gray
Write-Host "Adding TWITTER_CLIENT_ID..." -ForegroundColor Yellow
echo $TWITTER_CLIENT_ID | vercel env add TWITTER_CLIENT_ID production
Write-Host "✓ TWITTER_CLIENT_ID added" -ForegroundColor Green

Write-Host "Adding TWITTER_CLIENT_SECRET..." -ForegroundColor Yellow
echo $TWITTER_CLIENT_SECRET | vercel env add TWITTER_CLIENT_SECRET production
Write-Host "✓ TWITTER_CLIENT_SECRET added" -ForegroundColor Green
Write-Host ""

# LinkedIn Credentials
Write-Host "=== LINKEDIN CREDENTIALS ===" -ForegroundColor Cyan
$LINKEDIN_CLIENT_ID = "86n7luq8mn4aip"
$LINKEDIN_CLIENT_SECRET = "WPL_AP1.vbAD7Yo3S20D7FwQ.w6mv8w=="

Write-Host "LinkedIn Client ID: $LINKEDIN_CLIENT_ID" -ForegroundColor Gray
Write-Host "Adding LINKEDIN_CLIENT_ID..." -ForegroundColor Yellow
echo $LINKEDIN_CLIENT_ID | vercel env add LINKEDIN_CLIENT_ID production
Write-Host "✓ LINKEDIN_CLIENT_ID added" -ForegroundColor Green

Write-Host "Adding LINKEDIN_CLIENT_SECRET..." -ForegroundColor Yellow
echo $LINKEDIN_CLIENT_SECRET | vercel env add LINKEDIN_CLIENT_SECRET production
Write-Host "✓ LINKEDIN_CLIENT_SECRET added" -ForegroundColor Green
Write-Host ""

# Facebook Credentials
Write-Host "=== FACEBOOK CREDENTIALS ===" -ForegroundColor Cyan
$FACEBOOK_CLIENT_ID = "793611213492491"

Write-Host "Facebook App ID: $FACEBOOK_CLIENT_ID" -ForegroundColor Gray
Write-Host "Adding FACEBOOK_CLIENT_ID..." -ForegroundColor Yellow
echo $FACEBOOK_CLIENT_ID | vercel env add FACEBOOK_CLIENT_ID production
Write-Host "✓ FACEBOOK_CLIENT_ID added" -ForegroundColor Green

Write-Host ""
$FACEBOOK_CLIENT_SECRET = "15c77c9086976f40ac74a29db020c5ef"

Write-Host "Adding FACEBOOK_CLIENT_SECRET..." -ForegroundColor Yellow
echo $FACEBOOK_CLIENT_SECRET | vercel env add FACEBOOK_CLIENT_SECRET production
Write-Host "✓ FACEBOOK_CLIENT_SECRET added" -ForegroundColor Green
Write-Host ""

# Instagram (uses same credentials as Facebook)
Write-Host "=== INSTAGRAM CREDENTIALS ===" -ForegroundColor Cyan
Write-Host "Instagram uses the same credentials as Facebook" -ForegroundColor Gray
Write-Host "Adding INSTAGRAM_CLIENT_ID..." -ForegroundColor Yellow
echo $FACEBOOK_CLIENT_ID | vercel env add INSTAGRAM_CLIENT_ID production
Write-Host "✓ INSTAGRAM_CLIENT_ID added" -ForegroundColor Green

Write-Host "Adding INSTAGRAM_CLIENT_SECRET..." -ForegroundColor Yellow
echo $FACEBOOK_CLIENT_SECRET | vercel env add INSTAGRAM_CLIENT_SECRET production
Write-Host "✓ INSTAGRAM_CLIENT_SECRET added" -ForegroundColor Green
Write-Host ""

# Summary
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host "  ✓ SETUP COMPLETE!" -ForegroundColor Green
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Environment variables added:" -ForegroundColor Yellow
Write-Host "  ✓ TWITTER_CLIENT_ID" -ForegroundColor Green
Write-Host "  ✓ TWITTER_CLIENT_SECRET" -ForegroundColor Green
Write-Host "  ✓ LINKEDIN_CLIENT_ID" -ForegroundColor Green
Write-Host "  ✓ LINKEDIN_CLIENT_SECRET" -ForegroundColor Green
Write-Host "  ✓ FACEBOOK_CLIENT_ID" -ForegroundColor Green
Write-Host "  ✓ FACEBOOK_CLIENT_SECRET" -ForegroundColor Green
Write-Host "  ✓ INSTAGRAM_CLIENT_ID" -ForegroundColor Green
Write-Host "  ✓ INSTAGRAM_CLIENT_SECRET" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Deploy to production: vercel --prod" -ForegroundColor Yellow
Write-Host "2. Test OAuth flows on https://xelora.app" -ForegroundColor Yellow
Write-Host ""
Write-Host "View all environment variables:" -ForegroundColor Cyan
Write-Host "vercel env ls" -ForegroundColor Yellow
Write-Host ""
