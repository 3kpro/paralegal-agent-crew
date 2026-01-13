# Internal Testing Guide

Before packaging these workflows for sale, they must be validated in a live n8n environment.

## Test Environment Setup
1. Use a fresh n8n instance (Self-hosted or Cloud).
2. Install necessary credentials for:
   - OpenAI
   - Google/YouTube
   - HubSpot
   - Airtable
   - Buffer
   - WordPress

## Test Cases

### 1. Content Creator Pack (YouTube -> Blog)
- [ ] **Import**: Import `workflows/youtube_to_blog.json`.
- [ ] **Config**: Set a valid Channel ID (use a test channel).
- [ ] **Trigger**: Upload a test unlisted video or wait for a public video.
- [ ] **Verify**:
  - Node `YouTube Trigger` fires.
  - Node `OpenAI` receives title/description.
  - Node `WordPress` creates a draft post.
- [ ] **Cleanup**: Delete the test WordPress post.

### 2. Small Business Pack (Lead Capture)
- [ ] **Import**: Import `workflows/lead_capture.json`.
- [ ] **Config**: specific HubSpot/Gmail creds.
- [ ] **Execute**: Manually trigger or send a POST request to the Webhook URL.
  ```bash
  curl -X POST <webhook-url> -d '{"email":"test@example.com", "firstname":"Test", "lastname":"User"}'
  ```
- [ ] **Verify**:
  - Contact appears in HubSpot.
  - Welcome email arrives at `test@example.com` (or your override).

### 3. Social Media Pack (Scheduler)
- [ ] **Import**: Import `workflows/social_scheduler.json`.
- [ ] **Config**: Connect Airtable Base and Buffer.
- [ ] **Setup Data**: Create a row in Airtable with `Status = Scheduled` and `Content = Test Post`.
- [ ] **Execute**: Manually click "Execute Workflow".
- [ ] **Verify**:
  - Buffer queue shows "Test Post".
  - Airtable row updates to `Mark Posted` (or similar status).

## Reporting Bugs
If a workflow fails, document:
- n8n Version.
- Node that failed.
- Error message.
- Fix applied to the JSON file.
