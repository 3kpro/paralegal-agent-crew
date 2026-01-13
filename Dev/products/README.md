# 3KPRO.SERVICES - Product Development Hub

## Structure
```
3kpro-services/
├── landing-page/      # TrendPulse SaaS
├── products/          # Sellable products
├── templates/         # TRUTH.md template
└── PRODUCT-IDEAS.md   # Vetted ideas backlog
```

## Workflow
1. Select idea from PRODUCT-IDEAS.md
2. `mkdir products/{project-name}`
3. `cp templates/TRUTH-TEMPLATE.md products/{project-name}/TRUTH.md`
4. Fill TRUTH.md completely before writing code
5. Build MVP only - no extras
6. Test → Package → Deploy → Sell

## Agent Instructions
All agents must:
- Read TRUTH.md before any action
- Refuse work outside MVP scope
- Log actions in Session Log table
- Ask for clarification vs. assuming

## Sales Stack
- Payments: LemonSqueezy or Stripe
- Delivery: Gumroad or direct download
- Marketing: 3kpro.services/products page
