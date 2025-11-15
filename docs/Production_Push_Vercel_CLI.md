Deploy to Production via Vercel CLI:
# 1. Stop dev server (Ctrl+C in terminal running npm run dev)

# 2. Add and commit changes
git add .
git commit -m "Fix: logout CSP, landing CTAs, dark theme consistency"

# 3. Push to GitHub
git push origin main

# 4. Wait for auto-deployment
# Vercel auto-deploys main branch → ~2 min
OR Manual Deploy:
# Skip git, deploy directly
vercel --prod
Verify:
https://trendpulse.3kpro.services
That's it! Vercel watches your GitHub main branch and auto-deploys on push.