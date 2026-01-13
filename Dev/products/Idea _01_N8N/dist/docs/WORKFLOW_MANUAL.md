# n8n Workflow Marketplace - User Manual

Welcome to the n8n Workflow Marketplace! This guide will help you import, configure, and run our premium automation workflows.

## Table of Contents
1. [General Setup](#general-setup)
2. [Content Creator Pack: YouTube to Blog](#content-creator-pack-youtube-to-blog)
3. [Small Business Pack: Lead Capture](#small-business-pack-lead-capture)
4. [Social Media Pack: Scheduler](#social-media-pack-scheduler)

---

## General Setup

### Prerequisites
- An active n8n instance (Cloud or Self-Hosted).
- Accounts for the services used in the workflows (e.g., OpenAI, HubSpot, Airtable).

### How to Import
1. Open your n8n dashboard.
2. Click **Add Workflow** > **Import from File**.
3. Select the `.json` file for the workflow you want to use.
4. Save the workflow.

---

## Content Creator Pack: YouTube to Blog

**File:** `workflows/youtube_to_blog.json`

### Description
Automatically monitors a YouTube channel for new videos, transcribes the content (via title/description context), uses AI to write a blog post, and drafts it in WordPress.

### Configuration Steps
1. **YouTube Trigger Node**:
   - create a "Google API" credential in n8n.
   - Enter your **Channel ID**.
2. **OpenAI Node**:
   - Create an "OpenAI API" credential.
   - (Optional) Adjust the `model` (default: `gpt-4`) or the system prompt for different writing styles.
3. **WordPress Node**:
   - Create a "WordPress API" credential.
   - Ensure the URL points to your WordPress instance.

---

## Small Business Pack: Lead Capture

**File:** `workflows/lead_capture.json`

### Description
Captures leads from a web form via Webhook, adds them to HubSpot CRM, and sends a personalized welcome email via Gmail.

### Configuration Steps
1. **Webhook Node**:
   - Copy the **Production URL** after activating the workflow.
   - Point your website's contact form to this URL.
   - access method: `POST`.
2. **HubSpot Node**:
   - Create a "HubSpot Developer API" credential.
   - Verify the field mapping (Standard: `email`, `firstname`, `lastname`).
3. **Gmail Node**:
   - Create a "Gmail OAuth2" credential.
   - Customize the email body in the `Message` field.

---

## Social Media Pack: Scheduler

**File:** `workflows/social_scheduler.json`

### Description
Polls an Airtable base for posts marked "Scheduled", publishes them to social channels via Buffer, and updates the Airtable record to "Posted".

### Configuration Steps
1. **Airtable Node (Get Scheduled)**:
   - Create an "Airtable API" credential.
   - **Base ID**: Enter your Base ID.
   - **Table Name**: Ensure you have a table named `Posts`.
   - **View**: Create a view or filter for `{Status} = 'Scheduled'`.
2. **Buffer Node**:
   - Create a "Buffer API" credential.
   - Select the target social channel profile.
3. **Airtable Node (Mark Posted)**:
   - Uses the same credentials.
   - Updates the record status to prevent double-posting.

---

## Support
For technical issues, please consult the n8n community forums or contact support.
