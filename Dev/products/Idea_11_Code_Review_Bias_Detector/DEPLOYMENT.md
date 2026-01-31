# FairMerge Deployment Guide

## Backend Deployment (Railway)

### Prerequisites
- GitHub account connected to Railway
- Repository pushed to GitHub

### Steps

1. **Go to Railway Dashboard**
   - Visit: https://railway.app/
   - Sign in with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose repository: `3kpro/content-cascade-ai-landing`
   - Set root directory: `Dev/products/Idea_11_Code_Review_Bias_Detector/backend`

3. **Configure Environment Variables**
   Add the following variables in Railway project settings:

   ```
   GEMINI_API_KEY=<your_gemini_api_key>
   GITHUB_CLIENT_ID=<your_github_oauth_client_id>
   GITHUB_CLIENT_SECRET=<your_github_oauth_client_secret>
   GITHUB_REDIRECT_URI=https://your-railway-app.railway.app/auth/github/callback
   GITLAB_CLIENT_ID=<your_gitlab_oauth_client_id>
   GITLAB_CLIENT_SECRET=<your_gitlab_oauth_client_secret>
   GITLAB_REDIRECT_URI=https://your-railway-app.railway.app/auth/gitlab/callback
   DATABASE_URL=<railway_will_provide_postgres_url>
   SUPABASE_URL=<your_supabase_project_url>
   SUPABASE_ANON_KEY=<your_supabase_anon_key>
   STRIPE_SECRET_KEY=<your_stripe_secret_key>
   STRIPE_WEBHOOK_SECRET=<your_stripe_webhook_secret>
   ```

4. **Add PostgreSQL Database**
   - In Railway project, click "New"
   - Select "Database" → "PostgreSQL"
   - Railway will auto-populate `DATABASE_URL`

5. **Configure Custom Domain (Optional)**
   - Go to Settings → Domains
   - Add custom domain: `api.fairmerge.app`
   - Configure DNS with provided CNAME record

6. **Deploy**
   - Railway will auto-deploy on push to main branch
   - Monitor logs in Railway dashboard
   - Verify health check: `https://your-app.railway.app/health`

## Frontend Deployment (Vercel)

### Prerequisites
- Vercel CLI installed: `npm i -g vercel`
- Vercel account

### Steps

1. **Navigate to Frontend Directory**
   ```bash
   cd C:\DEV\3K-Pro-Services\Dev\products\Idea_11_Code_Review_Bias_Detector\frontend
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Configure Environment Variables**
   Create `.env.production`:
   ```
   VITE_API_URL=https://your-railway-app.railway.app
   VITE_SUPABASE_URL=<your_supabase_project_url>
   VITE_SUPABASE_ANON_KEY=<your_supabase_anon_key>
   ```

4. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

5. **Configure Custom Domain**
   ```bash
   vercel domains add fairmerge.app
   ```
   - Follow Vercel's instructions to configure DNS

## Post-Deployment

### Update GitHub OAuth Callback URLs
1. Go to GitHub Developer Settings
2. Edit OAuth App
3. Update callback URL to: `https://api.fairmerge.app/auth/github/callback`

### Update GitLab OAuth Callback URLs
1. Go to GitLab Applications Settings
2. Edit OAuth App
3. Update callback URL to: `https://api.fairmerge.app/auth/gitlab/callback`

### Configure Stripe Webhooks
1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://api.fairmerge.app/webhooks/stripe`
3. Select events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Copy webhook secret and update `STRIPE_WEBHOOK_SECRET` in Railway

### Test the Application
1. Visit `https://fairmerge.app`
2. Test GitHub OAuth login
3. Test dashboard metrics display
4. Verify subscription checkout flow

## Troubleshooting

### Backend Issues
- Check Railway logs: `railway logs`
- Verify all environment variables are set
- Ensure PostgreSQL database is connected
- Test health endpoint: `curl https://your-app.railway.app/health`

### Frontend Issues
- Check Vercel deployment logs
- Verify API URL environment variable points to Railway backend
- Test CORS configuration if API calls fail
- Check browser console for errors

### Database Migration
If you need to run migrations on Railway PostgreSQL:
```bash
railway run alembic upgrade head
```

## Monitoring

- **Railway**: Built-in logs and metrics in dashboard
- **Vercel**: Analytics and logs in Vercel dashboard
- **Sentry**: Configure for error tracking (optional)
- **Stripe**: Monitor subscription events in Stripe dashboard
