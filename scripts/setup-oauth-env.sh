# Add OAuth Environment Variables to Vercel
# Run these commands AFTER you've registered your OAuth apps

# NOTE: Replace the placeholder values with your actual credentials

# ===== STEP 1: Get your production URL =====
# Run: vercel ls
# Copy your production URL (the one with "● Ready" status)

# ===== STEP 2: Add environment variables =====
# Syntax: vercel env add <NAME> production

# Twitter/X
echo "Adding Twitter OAuth credentials..."
vercel env add TWITTER_CLIENT_ID production
# Paste your Twitter Client ID when prompted

vercel env add TWITTER_CLIENT_SECRET production
# Paste your Twitter Client Secret when prompted

# LinkedIn
echo "Adding LinkedIn OAuth credentials..."
vercel env add LINKEDIN_CLIENT_ID production
vercel env add LINKEDIN_CLIENT_SECRET production

# Facebook (also used for Instagram)
echo "Adding Facebook OAuth credentials..."
vercel env add FACEBOOK_APP_ID production
vercel env add FACEBOOK_APP_SECRET production

# TikTok
echo "Adding TikTok OAuth credentials..."
vercel env add TIKTOK_CLIENT_KEY production
vercel env add TIKTOK_CLIENT_SECRET production

# App URL (for OAuth callbacks)
echo "Adding app URL..."
vercel env add NEXT_PUBLIC_APP_URL production
# Enter: https://your-production-domain.vercel.app

# ===== STEP 3: Redeploy =====
# After adding all variables, redeploy:
# vercel --prod

# ===== VERIFICATION =====
# Check all environment variables:
# vercel env ls

echo "✅ All OAuth credentials added!"
echo "📝 Next step: Register OAuth apps on each platform"
echo "🚀 Then run: vercel --prod"
