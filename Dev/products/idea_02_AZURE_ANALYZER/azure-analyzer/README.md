# Azure Cost Optimizer (Azure Analyzer)

A Next.js application that helps small and medium-sized businesses (SMBs) identify wasted spend in their Azure subscriptions.

## Features

- **Connect via Microsoft Entra ID**: Securely log in with your Microsoft credentials.
- **Subscription Discovery**: Automatically lists all Azure subscriptions you have access to.
- **Automated Scanners**:
  - **Unattached Managed Disks**: Finds orphaned disks taking up storage costs.
  - **Unused Public IPs**: Identifies static public IPs not associated with any network interface.
  - **Underutilized VMs**: Detects VMs with < 5% Average CPU over the last 7 days and suggests rightsizing.
- **Cost Estimation**: Provides rough monthly savings estimates for identified resources.
- **Export**: Download audit reports as CSV for offline analysis.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Auth**: NextAuth.js v5 (beta) with Microsoft Entra ID Provider
- **Azure Integration**: `@azure/arm-*` SDKs
- **Styling**: Vanilla CSS Modules (Zero runtime overhead)

## Getting Started

### Prerequisites

1.  **Node.js**: v18 or higher.
2.  **Azure Account**: You need an Azure account with permissions to read resources on the target subscription.
3.  **Entra ID App Registration**: You need to register an application in Azure AD.

### Env Configuration

Create a `.env.local` file in the root directory:

```env
AUTH_SECRET= # Generated via `npx auth secret`
AUTH_AZURE_AD_ID= # Client ID from Azure AD App Registration
AUTH_AZURE_AD_SECRET= # Client Secret from Azure AD App Registration
AUTH_AZURE_AD_TENANT_ID= # Tenant ID (or 'common' for multi-tenant)
```

### Installation

```bash
npm install
```

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Permissions

The application requires the user to grant the following delegated permissions:
- `User.Read`
- Azure Resource Manager access (handled via the token passed to the SDKs). The user must have at least `Reader` role on the subscription to perform the audit.

## Architecture

See `docs/ARCHITECTURE.md` for a deeper dive into the technical decisions.
