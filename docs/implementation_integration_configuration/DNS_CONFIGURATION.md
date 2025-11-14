# DNS Configuration Guide

This document provides detailed instructions for configuring DNS settings for the 3K Pro Services landing page deployed on Vercel.

## Domain Overview

- **Primary Domain**: ccai.3kpro.services
- **Hosting Provider**: Vercel
- **DNS Provider**: Varies (instructions for common providers included)

## Required DNS Records

### A Records

| Name | Value | TTL |
|------|-------|-----|
| ccai | 76.76.21.21 | 3600 |

### CNAME Records

| Name | Value | TTL |
|------|-------|-----|
| www.ccai | cname.vercel-dns.com. | 3600 |

### TXT Records

| Name | Value | TTL |
|------|-------|-----|
| _vercel | vc-domain-verify=ccai.3kpro.services,<verification-code> | 3600 |

## Domain Verification

1. Log in to your Vercel account
2. Navigate to your project settings
3. Go to the Domains section
4. Add your domain (ccai.3kpro.services)
5. Follow the verification instructions
6. Add the provided TXT record to your DNS configuration
7. Wait for verification to complete (can take up to 24 hours)

## DNS Configuration Instructions

### Cloudflare

1. Log in to your Cloudflare account
2. Select your domain
3. Go to the DNS tab
4. Add the required A, CNAME, and TXT records
5. Ensure Proxy status is set to "DNS only" (gray cloud) for Vercel domains
6. Save changes

### GoDaddy

1. Log in to your GoDaddy account
2. Go to the Domain Manager
3. Select your domain
4. Click "Manage DNS"
5. Add the required A, CNAME, and TXT records
6. Save changes

### Namecheap

1. Log in to your Namecheap account
2. Go to the Domain List
3. Click "Manage" next to your domain
4. Select the "Advanced DNS" tab
5. Add the required A, CNAME, and TXT records
6. Save changes

### Google Domains

1. Log in to your Google Domains account
2. Select your domain
3. Go to the DNS tab
4. Scroll to "Custom resource records"
5. Add the required A, CNAME, and TXT records
6. Save changes

## SSL Configuration

Vercel automatically provisions SSL certificates for your domain. No additional configuration is required.

## Troubleshooting

### Domain Not Resolving

1. Verify DNS records are correctly configured
2. Check if DNS propagation is complete (can take up to 48 hours)
3. Use a tool like [dnschecker.org](https://dnschecker.org) to verify DNS propagation
4. Ensure Vercel domain verification is complete

### SSL Certificate Issues

1. Verify domain ownership in Vercel
2. Check if DNS records are correctly configured
3. Ensure there are no CAA records blocking certificate issuance
4. Contact Vercel support if issues persist

### Subdomain Not Working

1. Verify CNAME record is correctly configured
2. Check if the subdomain is added in Vercel project settings
3. Ensure DNS propagation is complete
4. Test with different browsers and networks

## Monitoring DNS Health

1. Set up regular DNS monitoring using a service like UptimeRobot or Pingdom
2. Configure alerts for DNS resolution failures
3. Periodically verify DNS configuration is correct
4. Document any changes made to DNS configuration

## Contact Information

For DNS-related issues, contact:

- **DNS Provider Support**: Varies by provider
- **Vercel Support**: [support@vercel.com](mailto:support@vercel.com)
- **Internal DevOps Team**: [devops@3kpro.services](mailto:devops@3kpro.services)
