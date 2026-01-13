# TASKS - Idea 03: OAuth Token Manager

**STATUS: PARKED** 🅿️
Blocked on Meta Business Verification (requires LLC registration).
Revisit after LLC setup complete.

---

## NOW



## COMPLETED
- [x] **Health Dashboard UI** 📊 ✅
      - **Goal:** Create a Next.js dashboard to view connection statuses.
      - **Action:** Scaffolded Next.js app, created `ConnectionCard` component, and built dashboard view with mock data.
- [x] **Project Scaffolding** ✅
      - **Goal:** Initialize folder structure.
      - **Action:** Created directories and TRUTH.md.
- [x] **Token Strategy** 🔐
      - **Goal:** Determine how to securely store and refresh tokens for multiple platforms.
      - **Action:** Research "Encryption at rest" for User Tokens in Supabase.
- [x] **Database Schema** 🗄️
      - **Goal:** Define the tables for connections and internal logging.
      - **Action:** Create `SCHEMA.md` with SQL definitions for `connections` and `refresh_logs`.
- [x] **Auth Proof of Concept** 🔑
      - **Goal:** Verify OAuth flow for one platform (e.g., LinkedIn).
      - **Action:** Choose a platform and document the OAuth discovery (Auth URL, Token URL, Scopes).
- [x] **Edge Function Scaffold** ⚡
      - **Goal:** Create the core logic for the OAuth callback and token refresh.
      - **Action:** Initialize a Supabase Edge Function `oauth-handler` with basic routing for `callback` and `refresh`.
- [x] **LinkedIn Integration (Auth)** 🔗
      - **Goal:** Implement the actual LinkedIn code-to-token exchange.
      - **Action:** Update `oauth-handler` to handle LinkedIn's POST to `/accessToken` and store the result in the database/vault.
- [x] **TikTok Integration (Auth)** 📱
      - **Goal:** Implement TikTok code-to-token exchange.
      - **Action:** Add TikTok handler to `oauth-handler` following the LinkedIn pattern.
- [x] **Instagram Integration (Auth)** 📸
      - **Goal:** Implement Instagram code-to-token exchange.
      - **Action:** Add Instagram handler to `oauth-handler`. Note the exchange for Long-Lived Tokens.
- [x] **Auto-Refresh Logic** 🔄
      - **Goal:** Implement the logic to refresh tokens for all platforms before they expire.
      - **Action:** Update the `/refresh` route in `oauth-handler` to handle multi-platform refresh logic and update the Vault.








