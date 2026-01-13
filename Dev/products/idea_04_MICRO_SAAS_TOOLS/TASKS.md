# TASKS.md - Invoice Generator (Tool 1)
Last Updated: 2026-01-09

## NOW (One at a time only)



## NOW (One at a time only)

## NOW (One at a time only)


---

## BACKLOG (MVP Features)











---

## COMPLETED

- [x] **Project Scaffolding**
      - Created Next.js project
      - Added `.env.local` template (User must add actual keys)

- [x] **Database Schema Design**
      - Created `supabase/schema.sql` with Profiles, Invoices, and Items tables
      - Defined Enums and RLS policies

- [x] **Invoice Creation Form**
      - Implemented dynamic form with `useState`
      - Auto-calculations for totals
      - Reusable UI components (`Card`, `Button`, `Input`)

- [x] **PDF Export**
      - Integrated `html2canvas` and `jspdf`
      - Created hidden `InvoicePreview` for clean capture
      - Implemented client-side PDF generation

- [x] **Template System**
      - Built 5 professional CSS-in-JS templates
      - Added logo upload and color picker state
      - Built visual template selector UI

- [x] **Email Delivery**
      - Integrated Resend API
      - Added email compose modal with PDF attachment handling
      - Added toast notifications for success/error

- [x] **Invoice History**
      - Added `handleSave` to `InvoiceForm` to persist data to Supabase
      - Created `/invoices` page with table view, search, and filtering
      - Added `/login` page for authentication
      - Added Global Header for navigation

- [x] **Stripe Integration**
      - Implemented Stripe Checkout for Monthly ($9) and Lifetime ($79) plans
      - Created `/pricing` page with plan comparison
      - Added `subscription` SQL migration logic






---

## NOTES

**Priority:** Get MVP working end-to-end first (form → PDF → email).
**Focus:** Simple, fast, professional. Don't over-engineer.
**Launch Goal:** 50 customers by 2026-04-01
