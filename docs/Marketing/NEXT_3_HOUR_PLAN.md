# Next 3 Hours & ZenCoder Handoff

**Date:** 2025-01-21
**Status:** Stripe deployment fix in progress. This document outlines the immediate plan for the next 3 hours of Claude's work and the subsequent handoff to ZenCoder.

---

## 🎯 Immediate Goal: Live & Tested Production

The top priority is to get a stable, fully-featured version of the application live on **3kpro.services**.

---

## 🕒 Claude's 3-Hour Plan (My Tasks)

### **Hour 1: Deploy & Test Stripe Integration**

1.  **Monitor Deployment:**
    -   Confirm the Vercel deployment with the Stripe API fix (`commit ad269ac`) succeeds.
    -   Verify the site loads at `https://3kpro.services`.

2.  **Guide Production Testing (with you):**
    -   **Login & Settings:** Confirm you can log in at `https://3kpro.services/login` and access the Settings page.
    -   **Stripe Checkout:** Walk you through clicking "Upgrade to Premium" and verifying the redirect to the Stripe checkout page.
    -   **Webhook Verification:** Guide you on how to use a test card (`4242...`) to complete a checkout and then verify in the Supabase `profiles` table that the `subscription_tier` is updated to `premium`. This confirms the webhook is working.
    -   **Customer Portal:** Test the "Manage Subscription" button to ensure it redirects to the Stripe customer portal.

### **Hour 2: Build AI Assistant Backend (Gemini)**

Based on our discussion, I will start building the "AI Help" assistant using the Google Gemini API.

1.  **Database Schema Update:**
    -   Create a new migration `004_ai_assistant.sql`.
    -   Add a `ai_assistant_messages` table to store conversation history.
    -   Add a `monthly_assistant_queries` column to the `profiles` table to track usage.

2.  **Create API Endpoint:**
    -   Build `app/api/assistant/route.ts`.
    -   This endpoint will take a user's message, call the Gemini API, and stream back the response.
    -   It will include logic to check the user's tier and enforce the 10-question limit for the free tier.

3.  **Update Environment:**
    -   Add `GOOGLE_API_KEY` to the `.env.local` and document its addition for Vercel.

### **Hour 3: Build Basic AI Assistant UI Component**

1.  **Create Chat Component:**
    -   Build a new component `components/AIAssistantWidget.tsx`.
    -   This will be a simple, non-styled chat interface: a message list, a text input, and a send button.
    -   It will connect to the `/api/assistant` endpoint to send and receive messages.

2.  **Integrate into Portal:**
    -   Add the `AIAssistantWidget` to the main portal layout (`app/(portal)/layout.tsx`) as a floating button in the bottom-right corner.

---

## 🎨 ZenCoder Handoff (Your Tasks After My 3 Hours)

Hey Zen! After my 3 hours, the AI Assistant will be functional but unstyled. Your mission is to make it beautiful and user-friendly.

### **Task 1: Style the AI Assistant Widget**

-   **File:** `components/AIAssistantWidget.tsx`
-   **Goal:** Transform the basic chat component into a polished, modern chat widget.
-   **Requirements:**
    -   Create a floating action button (FAB) with a "✨ Help" or "🤖" icon in the bottom-right corner.
    -   When clicked, the FAB should open a chat window with a smooth animation.
    -   Style the chat window: header, message list (user vs. AI messages), input area, and send button.
    -   Ensure it is fully responsive and works on mobile.
    -   Add a "remaining questions" counter for free-tier users.

### **Task 2: Create "Upgrade for More Help" Modal**

-   **Goal:** When a free-tier user exceeds their 10-question limit, show an upgrade modal.
-   **Requirements:**
    -   Design a modal that says "You've used all your free AI Assistant questions for this month."
    -   Include a "Upgrade to Pro" button that links to the Stripe checkout.
    -   The backend API will return a specific error (`{ "error": "limit_exceeded" }`) to trigger this modal.

### **Task 3: UI Polish & Backlog**

If you have extra time, please work on these items from the backlog:

-   **Social Media OAuth Buttons:** Style the "Login with Google" button on the login/signup pages. Add placeholder buttons for Twitter/X and LinkedIn.
-   **Campaign Details Page:** Design the UI for viewing a single campaign's details and its generated content.
-   **File Upload UI:** Implement the UI for the avatar and company logo uploads on the Profile settings page (backend will handle storage later).

---

## 📦 Final Deliverables

### **From Claude (Me):**
-   A live, tested, and working Stripe integration on `3kpro.services`.
-   A functional (but unstyled) AI Assistant powered by Gemini.
-   A new database migration file (`004_ai_assistant.sql`).
-   An updated `CHANGELOG.md`.

### **From ZenCoder (You):**
-   A beautifully styled and responsive AI Assistant chat widget.
-   An "Upgrade" modal for the AI Assistant.
-   Progress on other UI backlog items.

This plan ensures we make maximum progress. I'll start on my 3-hour plan as soon as the deployment is confirmed successful.