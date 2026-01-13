# CHANGELOG - Idea 02: Azure Cost Optimizer

## [Unreleased]

### Changed
- **Development Configuration**: Updated `package.json` to run the dev server on port `3002` by default (`next dev -p 3002`) to prevent conflicts with Xelora (ports 3000/3001).

## 2026-01-07 — Project Initialization

**Scaffolded the project structure for independent development.**

- Initialized `TRUTH.md` from `PRODUCT-IDEAS.md` (Idea 3).
- Created local `TASKS.md` and `CHANGELOG.md` for Federated Agent Workflow.

## 2026-01-07 — Architecture Definition

**Defined technical architecture for MVP.**

- Created `docs/ARCHITECTURE.md`.
- Decided on Next.js + NextAuth (Azure AD) + Azure SDK.
- Selected "User Delegated Authentication" as the connection strategy for simplicity.

## 2026-01-07 — Next.js Application Initialized

**Scaffolded Next.js Application.**

- Initialized Next.js 16 (App Router) project in `azure-analyzer`.
- Stack: TypeScript, ESLint, No Tailwind (Vanilla CSS).
- Verified build success.

## 2026-01-07 — Authentication Configured

**setup NextAuth.js v5 with Microsoft Entra ID.**

- Installed `next-auth@beta`.
- Configured identity provider with `Common` (or multi-tenant compatible) endpoint structure.
- Created `src/auth.ts` and `src/app/api/auth/[...nextauth]/route.ts`.
- Validated build with new auth routes.

## 2026-01-07 — Azure SDKs Installed

**Added core Azure dependencies.**

- Installed `@azure/identity` for authentication.
- Installed `@azure/arm-*` packages for Compute, Network, Consumption, and Resources.

## 2026-01-07 — Landing Page v1

**Created high-converting landing page.**

- Designed clean, centered layout using Vanilla CSS Modules.
- Added "Start Free Audit" button triggering NextAuth authentication.
- Implemented responsive design and disclaimer.

## 2026-01-07 — Subscription Selection Dashboard

**Implemented Dashboard to list Azure Subscriptions.**

- Solved Azure SDK versioning issue by switching to `@azure/arm-resources-subscriptions`.
- Added protected `/dashboard` route.
- Created `StaticTokenCredential` adapter for NextAuth tokens.
- Styled subscription cards with Azure Blue accents.

## 2026-01-07 — Audit Logic & Results

**Implemented First Scanner and Results Interface.**

- **Scanner:** `scanUnattachedDisks` checks for Managed Disks with state `Unattached`.
- **Estimation:** Calculates rough monthly savings based on Disk Size & SKU (Premium/Standard).
- **UI:** Results page displays summary of total savings and itemized table of findings.

## 2026-01-07 — Public IP Scanner

**Added Public IP Analysis.**

- **Scanner:** `scanUnusedIps` identifies Public IPs not associated with any IP Configuration.
- **Integration:** Results page now aggregates findings from both Disks and IPs in parallel.

## 2026-01-07 — VM Rightsizing Engine

**Added CPU Metrics Analysis.**

- Installed `@azure/arm-monitor` to fetch VM metrics.
- **Algorithm:** Checks 7-day Average CPU utilization.
- **Threshold:** Flags VMs with < 5% CPU usage as candidates for rightsizing.
- **Impact:** Estimates 50% savings potential for each flagged instance.

## 2026-01-07 — CSV Report Export

**Added Client-Side CSV Export.**

- Implemented `ExportButton` component as a Client Component.
- Generates CSV Blob dynamically from audit findings.
- Downloads file as `azure_audit_{subId}_{date}.csv`.

## 2026-01-07 — Documentation & Quality

**Detailed Developer Guides.**

- Updated `README.md` with technical stack details and local setup.
- Created `docs/TESTING.md` with specific Entra ID configuration steps.

## 2026-01-07 — UI/UX Overhaul & Branding ("Vantage")

**Modernized UI and applied 3K Pro Services branding.**

-   **Rebrand:** Renamed product to "Vantage Cloud Audit" with "Total Cloud Clarity" messaging.
-   **Design System:** Implemented "Dark Glass" aesthetic (Dark Mode, Glassmorphism, Aurora Gradients).
-   **Inventory Scanner:** Added `scanInventory` to list ALL resources, not just wasteful ones.
-   **UX Improvements:** Added "Start Over" button and specific actionable recommendations (e.g., "Snapshot & Delete").
-   **Logo:** Integrated 3KPRO logo (`LogoFinal_TR.png`) on landing page.

## 2026-01-07 — Rebrand: Cloud Ledger

**Major rebrand based on new product direction.**

-   **Name Change:** Vantage -> Cloud Ledger by 3K Pro.
-   **Hero Update:** "Instant clarity for your Azure environment. See everything. Pay for nothing you don't use."
-   **Metadata:** Updated app title and description SEO.
-   **Attribution:** Added "Powered By" label to logo.
