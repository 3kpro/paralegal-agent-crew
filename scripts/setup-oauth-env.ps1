# PowerShell Script to Add OAuth Credentials to Vercel
# Run this AFTER you've registered OAuth apps on each platform

Write-Host "`n🔐 OAuth Credentials Setup for Vercel" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "This script will add OAuth credentials for:" -ForegroundColor Yellow
Write-Host "  • Twitter/X" -ForegroundColor White
Write-Host "  • LinkedIn" -ForegroundColor White
Write-Host "  • Facebook (also for Instagram)" -ForegroundColor White
Write-Host "  • TikTok" -ForegroundColor White
Write-Host "`n"

# Check if user wants to proceed
$proceed = Read-Host "Have you registered OAuth apps on all platforms? (y/n)"
if ($proceed -ne "y") {
    Write-Host "`n⚠️  Please register OAuth apps first:" -ForegroundColor Yellow
    Write-Host "   Twitter:  https://developer.twitter.com/en/portal/dashboard" -ForegroundColor Gray
    Write-Host "   LinkedIn: https://www.linkedin.com/developers/apps" -ForegroundColor Gray
    Write-Host "   Facebook: https://developers.facebook.com/apps" -ForegroundColor Gray
    Write-Host "   TikTok:   https://developers.tiktok.com/" -ForegroundColor Gray
    Write-Host "`n   Then run this script again.`n" -ForegroundColor Gray
    exit
}

Write-Host "`n📝 Adding environment variables to Vercel...`n" -ForegroundColor Cyan

# Function to add environment variable
function Add-VercelEnv {
    param (
        [string]$name,
        [string]$displayName
    )
    
    Write-Host "➜ Adding $displayName..." -ForegroundColor Green
    Write-Host "  Variable: $name" -ForegroundColor Gray
    
    # Run vercel env add command
    vercel env add $name production
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ $displayName added successfully`n" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Failed to add $displayName`n" -ForegroundColor Red
    }
}

# Add Twitter credentials
Write-Host "`n🐦 TWITTER/X OAuth" -ForegroundColor Cyan
Write-Host "──────────────────" -ForegroundColor Cyan
Add-VercelEnv "TWITTER_CLIENT_ID" "Twitter Client ID"
Add-VercelEnv "TWITTER_CLIENT_SECRET" "Twitter Client Secret"

# Add LinkedIn credentials
Write-Host "`n💼 LINKEDIN OAuth" -ForegroundColor Cyan
Write-Host "─────────────────" -ForegroundColor Cyan
Add-VercelEnv "LINKEDIN_CLIENT_ID" "LinkedIn Client ID"
Add-VercelEnv "LINKEDIN_CLIENT_SECRET" "LinkedIn Client Secret"

# Add Facebook credentials
Write-Host "`n👥 FACEBOOK OAuth (also for Instagram)" -ForegroundColor Cyan
Write-Host "───────────────────────────────────────" -ForegroundColor Cyan
Add-VercelEnv "FACEBOOK_APP_ID" "Facebook App ID"
Add-VercelEnv "FACEBOOK_APP_SECRET" "Facebook App Secret"

# Add TikTok credentials
Write-Host "`n🎵 TIKTOK OAuth" -ForegroundColor Cyan
Write-Host "───────────────" -ForegroundColor Cyan
Add-VercelEnv "TIKTOK_CLIENT_KEY" "TikTok Client Key"
Add-VercelEnv "TIKTOK_CLIENT_SECRET" "TikTok Client Secret"

# Summary
Write-Host "`n✅ OAuth credentials setup complete!" -ForegroundColor Green
Write-Host "───────────────────────────────────────`n" -ForegroundColor Green

Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Verify variables: vercel env ls" -ForegroundColor White
Write-Host "   2. Deploy to production: vercel --prod" -ForegroundColor White
Write-Host "   3. Test OAuth flows on your production site`n" -ForegroundColor White

Write-Host "🔍 To view current environment variables:" -ForegroundColor Cyan
Write-Host "   vercel env ls`n" -ForegroundColor Gray
