# Micro-SaaS Factory: Setup Guide

**Objective**: Initialize the "Micro-SaaS Factory" on the main `3kpro.services` website.
**Goal**: Create a "Factory Floor" dashboard (similar to the TrendPulse Launchpad) to manage the development, packaging, and sales of new software products.

## 1. Environment Setup
The "Factory" lives in the parent website, NOT in the TrendPulse landing page.

*   **Target Directory**: `c:\DEV\3K-Pro-Services\3kpro-website`
*   **Source of Truth**: `c:\DEV\3K-Pro-Services\softdev` (Contains `PRODUCT-IDEAS.md` and product specs).

## 2. The "Factory Floor" Page Spec
We need a new route on `3kpro.services` (e.g., `/factory` or `/lab`) that serves as the command center.

### UI/UX Requirements
*   **Aesthetic**: Industrial/Cyberpunk "Lab" theme (Dark mode, blueprints, neon accents).
*   **Structure**:
    *   **Kanban/Grid View**: Display all 7 Product Ideas as cards.
    *   **Status Indicators**: `Concept` -> `In Dev` -> `Packaging` -> `Live`.
    *   **The "Briefcase"**: A section that pulls data from `softdev/products/` to show the "Bricks" (Specs, Assets, Code).

### Feature Checklist (The "Bricks")
For each product (starting with **n8n Templates** and **AI Wrappers**), the page should display:
1.  **The Truth**: Render the `TRUTH.md` file (Value Prop, Pricing, ICP).
2.  **Build Steps**: A dynamic checklist:
    *   [ ] Define Specs
    *   [ ] Build MVP
    *   [ ] Create Marketing Assets
    *   [ ] Setup Gumroad/Stripe
    *   [ ] Launch
3.  **Asset Locker**: Links to the actual code/files in `softdev/products/...`.

## 3. Immediate Action Items for Local Agent
1.  **Initialize Project**: Ensure `3kpro-website` is a Next.js app (if not, create it).
2.  **Scaffold the Factory**:
    *   Create `app/factory/page.tsx`.
    *   Create components for `ProductCard`, `BuildChecklist`, and `SpecViewer`.
3.  **Connect the Data**:
    *   Write a utility to read markdown files from `c:\DEV\3K-Pro-Services\softdev`.
    *   Display the content of `PRODUCT-IDEAS.md` and the `TRUTH.md` files on the frontend.

## 4. The First Products (To Be Loaded)
*   **Product 1**: n8n Workflow Templates (Ready for Dev)
    *   *Spec*: `softdev/products/n8n-workflow-templates/content-creator-pack/README.md`
*   **Product 2**: AI Prompt Templates (Ready for Content)
    *   *Spec*: `softdev/products/ai-prompt-templates/TRUTH.md`

**"Take the bricks out of the briefcase."** -> The file system (`softdev`) is the briefcase. The Website (`3kpro-website`) is the construction site where we assemble them.
