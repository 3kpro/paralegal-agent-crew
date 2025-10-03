# 3KPro Services – Launch Skeleton   (v0.1 – 2025-07-28)

## Goal
Rapid-launch consultancy that builds AI + workflow automations for SMBs.
Phase 1: Bare-bones online presence, proof-of-concept n8n/Make flows, first paid pilot.

## Deliverables
1. **Website**
   - Netlify-hosted one-pager (`index.html`) – already in repo.
   - DNS (A + CNAME) pointed from Namecheap → Netlify.

2. **Email / Identity**
   - Microsoft 365 Business Basic – `info@3kpro.services`, alias added.
   - Signature & DMARC/SPF records verified.

3. **Social Footprint**
   - LinkedIn Page `3KPro Services`
   - GitHub Org `3kpro` (public demo workflows)
   - X / Twitter handle `@3KPro_AI`

4. **Automation Tool-Stack Tiers**
   | Tier | Stack | Cost target | Pitch use-case |
   |------|-------|-------------|----------------|
   | 0 | n8n OSS / ActivePieces | $0 + VPS | Solo / PoC |
   | 1 | Make.com Core \| n8n Cloud Starter | $9–$25 | Small offices |
   | 2 | Zapier Pro \| Pipedream Team | $70–$150 | Growing SMB |
   | 3 | UiPath / Workato / PowerAutomate | $150+ | Compliance / scale |

5. **Discovery Questionnaire** (7 questions) – stored in `docs/client_questionnaire.md`.

6. **Engagement Models**
   - One-time install + training ($500–$1.5 k)
   - Subscription care-plan ($150–$500 mo)
   - Road-map retainer ($2 k+ milestone)

7. **30-Day Roadmap**
   - Days 1-3: publish site, verify SSL, business cards
   - Days 3-7: LinkedIn + contact form live
   - Days 7-14: record 2-min n8n demo, post on socials
   - Days 10-20: outreach 5 SMB leads, run questionnaire
   - Days 20-30: package first client flow → GitHub template

## Tech debt / TODO
- Add Netlify Forms handler
- Enable DKIM keys in M365
- Budget alert in Azure
- Script: nightly `az vm deallocate` for lab VMs

