# Contract Analyzer - Product Vision

**Last Updated:** 2026-01-11

---

## Product Overview

**Name:** ContractGuard AI
**Tagline:** "Catch contract red flags before signing"
**Target Audience:** Freelancers, small law practices, agencies, contractors

---

## The Problem

**Pain Points:**
- Legal review costs $300-$1,000+ per contract
- Freelancers can't afford lawyers for every NDA/SoW
- Miss risky clauses (payment terms, liability, IP rights)
- No way to compare contracts against industry standards
- Templates found online may have hidden risks

**Current Workarounds:**
- Sign blindly and hope for the best (risky)
- Pay lawyer every time (expensive)
- Ask ChatGPT (unreliable, no legal context)
- Use generic checklist (miss specific issues)

---

## The Solution

**ContractGuard AI** analyzes contracts in seconds and flags risks using AI trained on common legal pitfalls.

### Core Features (MVP)

1. **Upload & Parse**
   - Accept PDF, Word, or plain text contracts
   - Extract key sections (payment, liability, termination, IP)

2. **Risk Analysis**
   - Scan for 20+ common red flags
   - Highlight problematic clauses
   - Severity scoring (Critical, Medium, Low)

3. **Plain-English Report**
   - Generate downloadable PDF report
   - Explain each risk in simple terms
   - Suggest specific edits/fixes

4. **Template Library**
   - 10 pre-reviewed contract templates
   - NDAs, SoWs, Freelance Agreements
   - Download as editable Word/PDF

---

## Red Flags Detected (MVP)

### Payment Terms
- Net 90+ payment terms (industry standard is Net 30)
- Missing payment schedule
- Unclear scope/deliverable definitions
- No late payment penalties

### Liability & Indemnification
- Unlimited liability clauses
- One-sided indemnification
- Missing liability caps

### Intellectual Property
- Client owns all IP (including pre-existing work)
- No work-for-hire clarity
- Missing portfolio/case study rights

### Termination
- No termination clause
- Unreasonable notice periods
- Missing kill fee provisions

### Other Risks
- Non-compete too broad (geography/duration)
- Ambiguous success criteria
- Missing confidentiality terms
- Automatic renewal without notice

---

## Tech Stack

- **Frontend:** Next.js 14 (App Router) + React + TypeScript
- **AI:** Claude 3.5 Sonnet (Anthropic API)
- **Auth:** Clerk (free tier supports 10,000 MAU)
- **Database:** Supabase (PostgreSQL)
- **Payments:** Stripe (subscriptions + lifetime)
- **File Processing:** PDF.js (parse PDFs) + Mammoth.js (Word docs)
- **Hosting:** Vercel

---

## Pricing

- **Monthly:** $14/mo (10 contract analyses/month)
- **Lifetime:** $99 (unlimited analyses forever)
- **Free Tier:** 1 contract analysis (no credit card)

---

## Launch Strategy

### Phase 1 (Weeks 1-2): Core Analysis
- [ ] PDF/Word upload and parsing
- [ ] Claude API integration for risk detection
- [ ] Basic report generation (text)

### Phase 2 (Week 3): Report & Templates
- [ ] PDF report export with highlighted risks
- [ ] Template library (10 contracts)
- [ ] User dashboard (analysis history)

### Phase 3 (Week 4): Payments & Launch
- [ ] Stripe integration (monthly + lifetime)
- [ ] Landing page + pricing page
- [ ] Launch on ProductHunt + Gumroad

---

## Success Metrics

**Month 1 Target:**
- 50 free trial users
- 10 paying customers ($140 MRR)

**Month 3 Target:**
- 150 paying customers ($2,100 MRR)

**Month 6 Target:**
- 300 paying customers ($4,200 MRR)

---

## Competitive Landscape

**Direct Competitors:**
- LegalZoom ($39/month for unlimited legal docs - but slow, bureaucratic)
- Rocket Lawyer ($29/month + $299 lawyer consults)
- Generic AI tools (ChatGPT, Claude - no contract-specific training)

**Our Advantage:**
- AI-first (instant results, no waiting)
- Cheaper than legal services
- Contract-specific (trained on common freelance/agency issues)
- Self-service (no human review needed)

---

## Distribution Channels

1. **Direct:** contractguard.ai (dedicated site)
2. **3KPRO Factory:** Listed on 3kpro.services/factory
3. **Gumroad:** Lifetime deal marketplace
4. **ProductHunt:** Launch platform
5. **AppSumo:** LTD deal (70% margin)

---

## Feature Roadmap (Post-MVP)

### Version 1.1
- [ ] Compare 2 contracts side-by-side
- [ ] Export to Google Docs with suggested edits
- [ ] Email support for contracts (forward to analyze@contractguard.ai)

### Version 1.2
- [ ] Team workspace (law firms)
- [ ] Custom clause library (save your own standards)
- [ ] Integrations (Dropbox, Google Drive)

### Version 2.0
- [ ] Contract negotiation assistant (suggest counter-proposals)
- [ ] Live lawyer review (optional $99 upgrade)
- [ ] Industry-specific templates (tech, creative, consulting)

---

## Non-Goals (Out of Scope)

- ❌ Legal advice (we're not lawyers, just a risk scanner)
- ❌ Court-ready documents (users must review with lawyer)
- ❌ Complex enterprise contracts (focus on freelance/SMB)
- ❌ Litigation support (no case law analysis)

---

## Brand & Messaging

**Tone:** Professional but approachable, like a helpful paralegal friend

**Copy Examples:**
- "Don't sign blind. Scan in 60 seconds."
- "Legal protection without the legal bill."
- "Catch red flags before they catch you."

**Visual Style:**
- Clean, modern UI (like Invoice Generator)
- Blue/green color scheme (trust, safety)
- Clear typography (legibility is key for legal docs)

---

## Legal Disclaimers

**Required Text (Footer + Reports):**
> "ContractGuard AI is not a law firm and does not provide legal advice. This analysis is for informational purposes only. Always consult a licensed attorney before signing any contract."

---

## Next Steps

1. Create TASKS.md with detailed MVP breakdown
2. Scaffold Next.js project
3. Implement PDF/Word parsing
4. Build Claude API integration for risk analysis
5. Design report template
