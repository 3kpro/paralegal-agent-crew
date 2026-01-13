# ContractGuard AI

AI-powered contract analysis for freelancers and small businesses. Detect risky clauses in NDAs, SoWs, and agreements in seconds.

## Features

- **Document Upload**: Support for PDF, Word (DOCX), and text files
- **AI Risk Analysis**: Powered by Claude 3.5 Sonnet to detect 20+ red flags
- **Plain-English Reports**: Get explanations you can understand, not legalese
- **Template Library**: 10 pre-reviewed contract templates
- **Instant Results**: Analysis complete in 60 seconds

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **AI**: Anthropic Claude API
- **Auth**: Supabase (coming soon: Clerk)
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe
- **File Processing**: pdf-parse (PDFs), mammoth (Word docs)
- **Hosting**: Vercel

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.local.template` to `.env.local` and fill in your API keys:

```bash
cp .env.local.template .env.local
```

Required keys:
- `ANTHROPIC_API_KEY` - Get from [Anthropic Console](https://console.anthropic.com/)
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `STRIPE_SECRET_KEY` - Stripe secret key (test mode)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key

### 3. Set Up Database

Run the Supabase schema:

```bash
# Create tables for users, analyses, and templates
# See supabase/schema.sql (coming soon)
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3010](http://localhost:3010) in your browser.

## Project Structure

```
contract-analyzer/
├── app/                  # Next.js App Router pages
│   ├── page.tsx         # Homepage
│   ├── analyze/         # Contract upload & analysis
│   ├── dashboard/       # User dashboard (analysis history)
│   ├── pricing/         # Pricing page
│   └── templates/       # Template library
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── UploadZone.tsx  # Drag-and-drop file upload
│   └── RiskReport.tsx  # Analysis results display
├── lib/                # Utilities and helpers
│   ├── anthropic.ts    # Claude API client
│   ├── parser.ts       # PDF/Word parsing
│   └── supabase.ts     # Supabase client
└── supabase/           # Database schema
```

## Pricing

- **Free**: 1 contract analysis (no credit card)
- **Monthly**: $14/mo (10 analyses/month)
- **Lifetime**: $99 (unlimited analyses forever)

## Deployment

Deploy to Vercel:

```bash
vercel
```

## License

Proprietary - Part of 3KPRO Software Factory

## Support

For issues or questions, contact: support@3kpro.services
