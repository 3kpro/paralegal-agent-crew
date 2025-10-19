# Vercel Configuration & DNS Setup Handoff Document

**Document Type:** DevOps Implementation Plan  
**Project:** 3K Pro Services Landing Page  
**Task:** PHASE 2 TASK 6 - Vercel Configuration & DNS Setup  
**Date:** October 20, 2025  
**Author:** PipelineCrafter (DevOps Specialist)  
**Status:** Ready for Implementation

## 1. Executive Summary

This document provides a comprehensive implementation plan for configuring Vercel for production deployment and setting up the ccai.3kpro.services subdomain for the 3K Pro Services landing page. The plan includes consolidating Vercel projects, configuring DNS settings, setting up environment variables, and verifying auto-deploy functionality.

### Current State Assessment

- **Vercel Projects:** 3 active projects identified (landing-page, 3kpro-landing, content-cascade-ai-landing)
- **Primary Project:** landing-page (most recent, showing cached old build)
- **GitHub Repository:** 3kpro/content-cascade-ai-landing
- **Branch:** main
- **Build Status:** Builds successfully (verified with commit 228d6b4)
- **Deployment Target:** ccai.3kpro.services (subdomain to be configured)

### Implementation Goals

1. Consolidate to a single Vercel project (landing-page)
2. Configure ccai.3kpro.services subdomain
3. Set up proper environment variables
4. Verify auto-deploy functionality
5. Document final configuration

## 2. Technical Architecture

### 2.1 Deployment Pipeline Architecture

```
GitHub Repository (3kpro/content-cascade-ai-landing)
  |
  +--> Branch: main
        |
        +--> Vercel CI/CD Pipeline
              |
              +--> Build Process
              |     |- npm install
              |     |- npm run build
              |     |- Output: .next directory
              |
              +--> Deployment
                    |- Environment: Production
                    |- Domain: ccai.3kpro.services
                    |- Cache: Edge Network
                    |- Environment Variables: Production config
```

### 2.2 DNS Configuration

```
Domain: 3kpro.services
  |
  +--> Subdomain: ccai
        |
        +--> CNAME Record
              |- Name: ccai
              |- Value: [Vercel-provided CNAME target]
              |- TTL: 3600 seconds (1 hour)
```

### 2.3 Environment Configuration

The application requires the following environment variables in production:

```
# API Configuration
API_BASE_URL=https://api.3kproservices.com
API_KEY=[secure-api-key]

# Contact Form Integration
NEXT_PUBLIC_CONTACT_WEBHOOK_URL=[production-webhook-url]

# n8n Configuration (Production)
N8N_WEBHOOK_URL=[production-n8n-webhook-url]
N8N_BASE_URL=[production-n8n-base-url]
USE_ANTHROPIC_DIRECT=false

# Node Environment
NODE_ENV=production
```

## 3. Implementation Plan

### 3.1 Preparation Phase

1. **Verify Current State**
   - Confirm landing-page project is connected to GitHub repository
   - Verify main branch is the primary branch
   - Check that the project builds successfully

2. **Backup Current Configuration**
   - Document current Vercel project settings
   - Note any custom domains or environment variables
   - Record deployment history and settings

### 3.2 Vercel Project Consolidation

1. **Access Vercel Dashboard**
   - Login URL: https://vercel.com/dashboard
   - Team: team_0BOimWa9ky559CL5Z6rVuybN

2. **Verify landing-page Project**
   - Project ID: prj_AQl8FdSzVdBBB3ORZti2pxDZsDSP
   - Confirm GitHub connection to 3kpro/content-cascade-ai-landing
   - Verify auto-deploy from main branch is enabled
   - Check build settings match vercel.json configuration

3. **Delete Stale Projects**
   - Project: 3kpro-landing
     - Navigate to Project Settings → Advanced
     - Scroll to bottom and click "Delete Project"
     - Confirm deletion by typing project name
   
   - Project: content-cascade-ai-landing
     - Navigate to Project Settings → Advanced
     - Scroll to bottom and click "Delete Project"
     - Confirm deletion by typing project name

### 3.3 Domain Configuration

1. **Configure Subdomain in Vercel**
   - In landing-page project, go to Settings → Domains
   - Click "Add" to add new domain
   - Enter: ccai.3kpro.services
   - Click "Add" to confirm
   - Vercel will provide required DNS configuration

2. **Add DNS Records**
   - Log in to domain provider for 3kpro.services
   - Go to DNS management section
   - Add CNAME record:
     - Type: CNAME
     - Name: ccai
     - Value: [Copy value provided by Vercel]
     - TTL: 3600 seconds (1 hour)
   - Save changes

3. **Verify Domain Configuration**
   - Wait for DNS propagation (typically 15-30 minutes)
   - Check domain status in Vercel dashboard
   - Verify SSL certificate is provisioned automatically

### 3.4 Environment Configuration

1. **Configure Production Environment Variables**
   - In landing-page project, go to Settings → Environment Variables
   - Add the following variables:
     ```
     NODE_ENV=production
     NEXT_PUBLIC_CONTACT_WEBHOOK_URL=[production-webhook-url]
     API_BASE_URL=https://api.3kproservices.com
     API_KEY=[secure-api-key]
     N8N_WEBHOOK_URL=[production-n8n-webhook-url]
     N8N_BASE_URL=[production-n8n-base-url]
     USE_ANTHROPIC_DIRECT=false
     ```
   - Click "Save" to apply changes

2. **Configure Preview Environment Variables (Optional)**
   - Add the same variables for Preview environments if needed
   - Adjust values for staging/preview environments

### 3.5 Deployment Verification

1. **Trigger Test Deployment**
   - Make a small change to README.md
   - Commit and push to main branch
   ```bash
   git checkout main
   echo "# Deployment test $(date)" >> README.md
   git add README.md
   git commit -m "test: verify Vercel auto-deployment"
   git push origin main
   ```

2. **Monitor Deployment**
   - Go to Vercel dashboard → landing-page → Deployments
   - Watch for new deployment triggered by commit
   - Verify build completes successfully
   - Check deployment logs for any issues

3. **Verify Live Site**
   - Navigate to https://ccai.3kpro.services
   - Verify site loads correctly
   - Check that all pages and functionality work
   - Verify HTTPS is working properly

## 4. Rollback Plan

In case of deployment issues, follow these rollback procedures:

### 4.1 Domain Configuration Rollback

If the domain configuration causes issues:
1. In Vercel dashboard, go to landing-page → Settings → Domains
2. Remove the problematic domain (ccai.3kpro.services)
3. Use the default Vercel domain (landing-page-one-eosin-50.vercel.app) temporarily
4. Troubleshoot DNS configuration issues
5. Re-add the domain once issues are resolved

### 4.2 Deployment Rollback

If a deployment introduces issues:
1. In Vercel dashboard, go to landing-page → Deployments
2. Find the last known good deployment
3. Click the three dots (⋮) next to that deployment
4. Select "Promote to Production"
5. Verify the rollback fixed the issues

### 4.3 Environment Variable Rollback

If environment variable changes cause issues:
1. In Vercel dashboard, go to landing-page → Settings → Environment Variables
2. Restore previous values from backup documentation
3. Click "Save" to apply changes
4. Redeploy the application

## 5. Monitoring & Verification

### 5.1 Deployment Health Checks

After deployment, verify the following:

1. **Accessibility Check**
   - Site loads at https://ccai.3kpro.services
   - No SSL/TLS certificate warnings
   - Pages load without errors

2. **Functionality Check**
   - Test all critical user flows
   - Verify API integrations work
   - Check form submissions
   - Test authentication if applicable

3. **Performance Check**
   - Page load times are acceptable
   - No console errors
   - Responsive on mobile devices

### 5.2 Ongoing Monitoring

Set up the following monitoring:

1. **Vercel Analytics**
   - Enable Vercel Analytics in project settings
   - Monitor Web Vitals and performance metrics

2. **Status Checks**
   - Configure status checks for the domain
   - Set up alerts for downtime

3. **Error Tracking**
   - Monitor deployment logs for errors
   - Set up error notifications

## 6. Documentation & Handoff

### 6.1 Final Configuration Documentation

Create a document with the following information:

```markdown
# Vercel Configuration Documentation

## Project Information
- **Project Name:** landing-page
- **Project ID:** prj_AQl8FdSzVdBBB3ORZti2pxDZsDSP
- **Organization ID:** team_0BOimWa9ky559CL5Z6rVuybN
- **GitHub Repository:** 3kpro/content-cascade-ai-landing
- **Branch:** main
- **Auto-Deploy:** Enabled

## Domain Configuration
- **Primary Domain:** ccai.3kpro.services
- **DNS Provider:** [Your DNS Provider]
- **DNS Records:**
  - Type: CNAME
  - Name: ccai
  - Value: [Vercel-provided value]
  - TTL: 3600 seconds

## Environment Variables
- NODE_ENV=production
- NEXT_PUBLIC_CONTACT_WEBHOOK_URL=[configured value]
- API_BASE_URL=[configured value]
- API_KEY=[configured value]
- N8N_WEBHOOK_URL=[configured value]
- N8N_BASE_URL=[configured value]
- USE_ANTHROPIC_DIRECT=false

## Build Configuration
- **Framework:** Next.js
- **Build Command:** npm run build
- **Output Directory:** .next
- **Install Command:** npm install
- **Development Command:** npm run dev

## Deployment Information
- **Last Deployment:** [Date and Time]
- **Deployment Status:** Success
- **Build Time:** [Build Time]

## Verification Results
- **URL Access:** ✅ Successful
- **HTTPS/TLS:** ✅ Valid Certificate
- **Responsiveness:** ✅ All Breakpoints Working
- **Functionality:** ✅ All Features Working
```

### 6.2 Update Task Status

Update the TASK_QUEUE.md file with the following:

```markdown
## PHASE 2 TASK 6: Vercel Configuration & DNS Setup

**Status:** COMPLETED ✅

**Deliverables:**
- [x] Consolidated to single Vercel project (landing-page)
- [x] Deleted stale projects (3kpro-landing, content-cascade-ai-landing)
- [x] Configured ccai.3kpro.services subdomain
- [x] Set up production environment variables
- [x] Verified auto-deploy functionality
- [x] Documented final configuration

**Verification:**
- [x] Site accessible at https://ccai.3kpro.services
- [x] HTTPS working properly
- [x] Auto-deploy from main branch confirmed
- [x] All functionality working as expected

**Documentation:**
- [x] Created VERCEL_CONFIGURATION.md with complete setup details
- [x] Updated BASELINE_RESTORED.md with completed Vercel tasks
```

## 7. CI/CD Pipeline Optimization

### 7.1 Build Performance Optimization

To optimize the Vercel build and deployment process:

1. **Caching Strategy**
   - Enable Vercel's built-in caching
   - Configure proper cache headers for static assets
   - Use Next.js ISR (Incremental Static Regeneration) where appropriate

2. **Build Time Optimization**
   - Optimize npm dependencies
   - Consider using pnpm for faster installations
   - Implement proper code splitting

3. **Deployment Frequency**
   - Implement proper branch protection rules
   - Consider using preview deployments for feature branches
   - Set up deployment protection rules for production

### 7.2 Advanced CI/CD Features (Future Consideration)

For future pipeline improvements:

1. **Automated Testing**
   - Integrate Jest tests into the CI pipeline
   - Add end-to-end tests with Cypress
   - Implement visual regression testing

2. **Quality Gates**
   - Add code quality checks (ESLint, Prettier)
   - Implement bundle size limits
   - Set up performance budgets

3. **Deployment Approval Workflow**
   - Implement approval gates for production deployments
   - Set up staging environment for pre-production testing
   - Configure deployment protection rules

## 8. Security Considerations

### 8.1 Environment Variable Security

1. **Secret Management**
   - Use Vercel's environment variable encryption
   - Never expose sensitive values in client-side code
   - Rotate API keys periodically

2. **Access Control**
   - Limit access to Vercel dashboard
   - Implement proper team permissions
   - Use 2FA for all team members

### 8.2 Domain Security

1. **DNS Security**
   - Enable DNSSEC if supported by provider
   - Use proper TTL values
   - Implement CAA records

2. **TLS/SSL Security**
   - Verify TLS 1.3 support
   - Implement proper HSTS headers
   - Configure secure cookie policies

## 9. Conclusion

This implementation plan provides a comprehensive approach to configuring Vercel for production deployment and setting up the ccai.3kpro.services subdomain for the 3K Pro Services landing page. By following this plan, you will consolidate Vercel projects, configure DNS settings, set up environment variables, and verify auto-deploy functionality.

The plan includes detailed steps for implementation, rollback procedures, monitoring guidelines, and documentation templates. It also provides recommendations for future CI/CD pipeline optimizations and security considerations.

Upon completion of this plan, the 3K Pro Services landing page will be properly configured for production deployment with a clean, professional setup that follows DevOps best practices.

## 10. Appendix

### 10.1 Vercel.json Configuration

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "devCommand": "npm run dev"
}
```

### 10.2 Required Environment Variables

```
# API Configuration
API_BASE_URL=https://api.3kproservices.com
API_KEY=[secure-api-key]

# Contact Form Integration
NEXT_PUBLIC_CONTACT_WEBHOOK_URL=[production-webhook-url]

# n8n Configuration (Production)
N8N_WEBHOOK_URL=[production-n8n-webhook-url]
N8N_BASE_URL=[production-n8n-base-url]
USE_ANTHROPIC_DIRECT=false

# Node Environment
NODE_ENV=production
```

### 10.3 Useful Vercel CLI Commands

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link project
vercel link

# Deploy to production
vercel --prod

# List deployments
vercel list

# Inspect environment variables
vercel env list

# Add environment variable
vercel env add [name]
```

### 10.4 DNS Propagation Check Tools

- https://www.whatsmydns.net/
- https://dnschecker.org/
- https://www.digwebinterface.com/

### 10.5 Troubleshooting Common Issues

1. **DNS Not Resolving**
   - Verify CNAME record is correctly configured
   - Check for conflicting DNS records
   - Wait for DNS propagation (up to 48 hours)

2. **Build Failures**
   - Check build logs for specific errors
   - Verify environment variables are correctly set
   - Test build locally before pushing

3. **Deployment Not Triggering**
   - Verify GitHub connection is working
   - Check branch configuration
   - Try manual deployment from Vercel dashboard
