# Cloud Ledger by 3K Pro

**Professional Azure Asset & Waste Audit**

Cloud Ledger gives you a complete, read-only view of your Azure subscription in seconds. No agents. No guesswork. Just the truth about what you’re running — and what’s wasting money.

## Features

-   **🔎 Full Inventory**: unified view of every resource.
-   **💰 Waste Detection**: Identifies idle VMs, unattached disks, and unused IPs.
-   **🔒 Read-Only by Design**: Uses ephemeral tokens with strict Reader access.

## Quick Start

1.  **Install Dependencies**: `npm install`
2.  **Configure Environment**:
    -   Copy `.env.local.example` to `.env.local`
    -   Set `AUTH_AZURE_AD_ID`, `AUTH_AZURE_AD_SECRET`, `AUTH_AZURE_AD_TENANT_ID`.
3.  **Run Development Server**: `npm run dev`
4.  **Open**: `http://localhost:3000`

## Documentation

-   [Architecture](./docs/ARCHITECTURE.md)
-   [Testing Guide](./docs/TESTING.md)