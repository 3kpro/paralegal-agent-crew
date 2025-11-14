# Vercel Deployment Guide

This document provides step-by-step instructions for deploying the 3K Pro Services landing page to Vercel.

## Prerequisites

- GitHub repository with the project code
- Vercel account with appropriate permissions
- Domain name registered and accessible
- Node.js and npm installed locally for testing

## Initial Setup

### 1. Create Vercel Project

1. Log in to your Vercel account
2. Click "Add New" > "Project"
3. Import your GitHub repository
4. Configure the project settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: npm run build
   - **Output Directory**: .next
   - **Install Command**: npm ci

### 2. Configure Environment Variables

Add the following environment variables in the Vercel project settings:

| Name | Value | Environment |
|------|-------|-------------|
| NEXT_PUBLIC_APP_URL | https://ccai.3kpro.services | Production |
| NEXT_PUBLIC_BASE_URL | https://ccai.3kpro.services | Production |
| NEXT_PUBLIC_SITE_URL | https://ccai.3kpro.services | Production |
| NEXT_PUBLIC_SUPABASE_URL | [Your Supabase URL] | All |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | [Your Supabase Anon Key] | All |
| NEXT_PUBLIC_TWITTER_CLIENT_ID | [Your Twitter Client ID] | All |
| NEXT_PUBLIC_TIKTOK_CLIENT_ID | [Your TikTok Client ID] | All |

For staging/preview environments, use the preview URL provided by Vercel.

### 3. Configure Project Settings

1. Go to the "Settings" tab of your Vercel project
2. Configure the following settings:

#### Build & Development Settings
- **Framework Preset**: Next.js
- **Build Command**: npm run build
- **Output Directory**: .next
- **Install Command**: npm ci
- **Development Command**: npm run dev

#### Environment Variables
- Add all required environment variables as listed above

#### Domains
- Add your custom domain: ccai.3kpro.services
- Follow the DNS configuration instructions

## Deployment Process

### Manual Deployment

1. Push your code to the GitHub repository
2. Vercel will automatically detect the push and start the deployment
3. Monitor the deployment in the Vercel dashboard
4. Once complete, verify the deployment at the provided URL

### CI/CD Deployment

The project is configured with GitHub Actions for CI/CD:

1. Push your code to the appropriate branch:
   - develop branch for staging deployment
   - main branch for production deployment
2. GitHub Actions will run tests and deploy to Vercel
3. Monitor the GitHub Actions workflow
4. Verify the deployment once complete

## Vercel Configuration File

The project includes a ercel.json file with the following configuration:

\\\json
{
  "version": 2,
  "regions": ["sfo1", "iad1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://analytics.3kpro.services; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.3kpro.services https://*.supabase.co;"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/home",
      "destination": "/",
      "permanent": true
    }
  ],
  "github": {
    "enabled": true,
    "silent": false
  }
}
\\\

## Post-Deployment Verification

After deployment, verify the following:

1. **Website Accessibility**:
   - Verify the website is accessible at https://ccai.3kpro.services
   - Check that all pages load correctly

2. **Functionality**:
   - Test all interactive features
   - Verify API integrations are working
   - Test authentication flows

3. **Performance**:
   - Run Lighthouse audit
   - Check page load times
   - Verify mobile responsiveness

4. **Security**:
   - Verify SSL certificate is valid
   - Check security headers are correctly set
   - Test for any security vulnerabilities

## Rollback Procedure

If issues are detected after deployment:

1. Go to the Vercel dashboard
2. Navigate to your project
3. Go to the "Deployments" tab
4. Find the last working deployment
5. Click the three dots menu and select "Promote to Production"
6. Verify the rollback fixed the issue

## Monitoring and Logging

1. **Vercel Analytics**:
   - Enable Vercel Analytics in project settings
   - Monitor page performance and user experience

2. **Error Tracking**:
   - Check Vercel logs for any errors
   - Use external error tracking services if configured

3. **Uptime Monitoring**:
   - Set up uptime monitoring using a service like UptimeRobot or Pingdom
   - Configure alerts for downtime

## Troubleshooting Common Issues

### Build Failures

- Check build logs in Vercel dashboard
- Verify all dependencies are correctly installed
- Check for environment variable issues

### Runtime Errors

- Check browser console for JavaScript errors
- Verify API endpoints are accessible
- Check Vercel logs for server-side errors

### Performance Issues

- Run Lighthouse audit to identify performance bottlenecks
- Check for large assets that need optimization
- Verify caching is correctly configured

## Contact Information

For deployment-related issues, contact:

- **DevOps Team**: [devops@3kpro.services](mailto:devops@3kpro.services)
- **Vercel Support**: [support@vercel.com](mailto:support@vercel.com)
