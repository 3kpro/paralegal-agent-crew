# Statement of Truth - Azure Cost Optimizer for SMBs

## Core Purpose
Provide a self-service audit tool for small businesses to identify and fix Azure overspending without expensive consultants.

## Target User
SMB Owners or "Accidental IT Admins" spending $1k-$10k/mo on Azure who feel they are wasting money but don't know where.

## Value Proposition
Save 20-40% on Azure bills instantly with a $49 one-time audit, bypassing the need for $200/hr consultants.

## MVP Features (v1.0 ONLY)
- [ ] **Azure Connection**: Secure Read-Only connection via Service Principal or User Auth.
- [ ] **Waste Detection**: Identify idle VMs, unattached disks, and unused public IPs.
- [ ] **Rightsizing**: Simple CPU/RAM logic to suggest smaller instances.
- [ ] **Report Generation**: PDF/HTML export of savings opportunities.

## Anti-Scope (DO NOT BUILD)
- Automated cleanup actions (User must do it themselves in v1).
- Multi-cloud (AWS/GCP).
- Kubernetes detailed analysis.
- Reserved Instance committment planner (Complex).

## Tech Stack
- Frontend: Next.js (Lightweight)
- Backend: Azure Functions or Next.js API Routes
- Auth: NextAuth (MSAL)
- Database: None (Stateless analysis) or Local Storage for report history

## Monetization
- Model: One-time purchase
- Price Point: $49/audit
- Sales Channel: AppSumo, Direct

## Timeline
- MVP Complete: 2026-03-01
- Beta Users: 2026-03-15
- Public Launch: 2026-04-01

## Current Phase
- [ ] Research & Validation
- [x] MVP Build (Scaffolding)
- [ ] Internal Testing
- [ ] Beta Testing
- [ ] Package & Deploy
- [ ] Launch & Market
