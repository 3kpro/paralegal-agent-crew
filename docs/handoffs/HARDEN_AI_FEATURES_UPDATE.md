Team,

The refactor to harden our AI features (Issue #2) is complete and reviewed. The new code centralizes the Gemini client and uses native JSON mode, which resolves the primary fragility points.

**Immediate Task: Finalize Refinements**

Before moving on, please apply these two minor refinements to the `gemini.ts` file:

1.  **Implement Fail-Fast:** In `gemini.ts`, change the production API key check to `throw new Error(...)` instead of `console.error(...)` to ensure the server doesn't run in a critically broken state.
2.  **Standardize Model Version:** In `viral-score.ts` and `route.ts`, change the model from `'gemini-2.0-flash'` to `'gemini-1.5-flash-latest'` to ensure we are always using the latest stable version.

**Next Priority: Issue #1 - Data Inconsistency in Campaign Saving**

Our next major task is to fix the data integrity issue in the campaign saving process.

**Objective:**
Convert the multi-step `saveCampaign` logic into a single, atomic database transaction. This will prevent data corruption if one of the database operations fails.

**High-Level Plan:**

1.  **Create a Supabase RPC Function:**
    *   You will need to write a new SQL function in the Supabase dashboard (or as a migration file). Let's name it `upsert_campaign_with_posts`.
    *   This function will accept the campaign payload and an array of posts as arguments.
    *   Inside the function, it will perform the `INSERT` or `UPDATE` on the `campaigns` table, `DELETE` old posts if it's an update, and `INSERT` the new posts into the `scheduled_posts` table. All of this happens within a single transaction.

2.  **Refactor `page.tsx` (`saveCampaign` function):**
    *   Remove the multiple `supabase.from(...).insert/update/delete` calls.
    *   Replace them with a single call to the new RPC function: `supabase.rpc('upsert_campaign_with_posts', { ...payload })`.
    *   All data for the campaign and its posts will be passed in this single API call.

This is a critical backend task that will significantly improve the stability of our core product. Let's get started.
