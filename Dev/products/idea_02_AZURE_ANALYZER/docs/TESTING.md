# Internal Testing Guide

## 1. Context
Since we cannot easily spin up real Azure resources for automated testing without incurring costs, testing is primarily manual. This guide focuses on setting up the environment to validate the application against a real Azure Subscription.

## 2. Setting up Azure AD (Entra ID) App Registration

To run the application locally, you need a registered app in your Azure Tenant.

1.  **Navigate to Entra ID**: Go to [Azure Portal](https://portal.azure.com) -> Microsoft Entra ID -> App registrations.
2.  **New Registration**:
    - **Name**: `Cloud Ledger (Local)`
    - **Supported Account Types**: `Accounts in any organizational directory (Any Microsoft Entra ID tenant - Multitenant)` (Recommended for broadest testing) or `Single Tenant` if you only have one.
    - **Redirect URI**: Select `Web` and enter `http://localhost:3000/api/auth/callback/microsoft-entra-id`.
3.  **Certificates & secrets**:
    - Create a **New client secret**.
    - Copy the `Value`. You need this for `AUTH_AZURE_AD_SECRET`.
4.  **Overview**:
    - Copy `Application (client) ID`. Use this for `AUTH_AZURE_AD_ID`.
    - Copy `Directory (tenant) ID`. Use this for `AUTH_AZURE_AD_TENANT_ID`.

## 3. Local Environment Configuration

Ensure your `azure-analyzer/.env.local` is populated:

```env
AUTH_SECRET="<generate_random_string>" # Run `npx auth secret` or just mash keys
AUTH_AZURE_AD_ID="<client_id>"
AUTH_AZURE_AD_SECRET="<client_secret>"
AUTH_AZURE_AD_TENANT_ID="<tenant_id>"
```

## 4. Test Scenarios

### A. Authentication
- [ ] Click "Start Free Audit" on Home Page.
- [ ] You should be redirected to Microsoft Login.
- [ ] After login, you should land on `/dashboard`.

### B. Subscription List
- [ ] Dashboard should show cards for all subscriptions your account has access to.
- [ ] If you have no subscriptions, it should show an empty state.

### C. Audit Execution
- [ ] Click "Analyze" on a subscription.
- [ ] **Unattached Disks**:
    - Create a small Disk in Azure Portal (Standard HDD, 4GB) and leave it unattached. 
    - Verify it appears in the results table.
- [ ] **Public IPs**:
    - Create a Public IP address and do not associate it.
    - Verify it appears in the results table.
- [ ] **Rightsizing**:
    - *Hard to test instantly*: Requires 7 days of metric history.
    - *Mock Test*: Can temporarily modify `vms.ts` threshold to `100` to force a "finding" for any running VM to verify the UI.

### D. Export
- [ ] Click "Download CSV Report".
- [ ] Open the CSV in Excel/Numbers.
- [ ] Verify columns match the table data.
