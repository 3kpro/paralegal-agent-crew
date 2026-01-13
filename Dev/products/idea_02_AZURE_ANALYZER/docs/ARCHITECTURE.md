# Architecture - Cloud Ledger by 3K Pro

## Overview
This application is a stateless web tool designed to audit Azure subscriptions for cost-saving opportunities. It runs client-side interactions via a Next.js frontend and performs analysis via server-side API routes using the Azure SDK.

## Technology Stack
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Vanilla CSS / CSS Modules
- **Authentication**: NextAuth.js (v5) with Azure AD Provider
- **Azure Integration**: `@azure/identity` and `@azure/arm-*` SDKs

## Connectivity Strategy

### Authentication Method: Delegated User Identity (v1.0 Recommended)
For the MVP, we will use **User Delegated Authentication**.

**Why?**
The target audience is SMB Consumers or "Accidental IT Admins". Minimizing friction is critical. Asking them to create Service Principals and manage secrets is a high barrier to entry. "Sign in with Microsoft" is familiar and trusted.

**Authentication Flow**:
1.  **Login**: User logs in via "Sign in with Microsoft" (NextAuth).
    - Scope Requested: `Reader` (or specific `CostManagement` scopes).
2.  **Consent**: User consents to allow the application to read their Azure Resources.
3.  **Token Acquisition**: NextAuth handles the OAuth2 flow and retrives an Access Token.
4.  **Subscription Selection**: App lists available subscriptions associated with the account.
5.  **Audit Execution**:
    - User selects a subscription.
    - App sends the Access Token (or uses the session on the backend) to query Azure APIs.
    - **Note**: Since NextAuth executes server-side, we can forward the user's `accessToken` to Azure SDK calls made from our API Routes.

### Data Privacy & Security
- **Stateless Design**: We will not store user credentials, tokens, or resource data in a persistent database.
- **Client-Side/Session Storage**: Audit results may be temporarily stored in the browser (LocalStorage) or Session for generating reports (PDF).
- **Scope limitation**: We strictly request Read-Only permissions.

## Core Components

### 1. Frontend (Next.js)
- **Landing Page**: Value prop, "Start Audit" CTA.
- **Dashboard**: Subscription selector, Summary of potential savings.
- **Report View**: Detailed itemized list of waste (Idle VMs, Disks, IPs).
- **Export**: PDF Generation logic.

### 2. Backend (API Routes)
- `/api/auth/[...nextauth]`: Handles authentication.
- `/api/subscriptions`: Lists accessible Azure Subscriptions.
- `/api/audit`: Main logic hub.
    - Accepts `subscriptionId`.
    - Instantiates scanners (see below).
    - Returns aggregated JSON report.

### 3. Analysis Engine (Scanners)
Modular functions designed to detect specific waste patterns:
- **`DiskScanner`**: Finds Managed Disks with `DiskState == 'Unattached'`.
- **`IpScanner`**: Finds Public IP Addresses not associated with a NIC.
- **`VmScanner`**: Checks for Deallocated / Stopped VMs. *Advanced: Check metrics for low CPU usage (requires Monitor Reader permission).*

## Directory Structure Plan
```
/src
  /app
    /api
      /audit
        route.ts
    /dashboard
      page.ts
  /components
    /ui
  /lib
    /azure
      client.ts
      scanners
        disks.ts
        vms.ts
```
