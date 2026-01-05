# HANDOFF — Reddit Benchmark Dataset via Apify (Safe + Durable)

## Context (what changed)
We are NOT doing “stealth scraping” or anything “under the radar.”
We ARE using Apify as a paid vendor to collect *public benchmark signals* so Xelora’s Viral Score can improve immediately (before we have enough first-party user outcome data).

Important: Apify being paid does NOT automatically make us compliant or immune from disruption. It just reduces engineering friction. We still need:
- a kill switch
- minimal data retention
- derived-feature storage (not becoming a Reddit mirror)
- graceful fallback to existing heuristic scoring

## Goal
Create/maintain a **Benchmark Dataset** used to:
1) Calibrate Viral Score™ (structure patterns that age slowly)
2) Produce “OMG” outputs: rewrite suggestions + evidence-based patterns
3) Reduce dependence on waiting for user feedback loops (short term)
4) Transition later to mostly **first-party performance data** (quietly, without breaking UI)

## Non-Goals
- No “secret sauce” / “classified algorithm” marketing copy
- No evasion language: “under radar”, “not noticed”, “acting like paid player”
- No storing usernames, comment bodies, or anything that looks like user profiling

## Data Strategy (two brains)
### A) Structural Brain (long shelf life)
- Pull top/high-performing posts periodically (weekly/monthly refresh is fine)
- Primary value: hook patterns, structure tags, wording traits

### B) Topical Brain (short shelf life)
- Pull recent winners daily (or every 6–12 hours if needed later)
- Primary value: trending topics + fresh formats

## Implementation Plan (what to build)
### 1) Vendor job + kill switch
- Add env flag: `BENCHMARK_REDDIT_ENABLED=false|true`
- If false: system must function normally (no hard dependency)
- Add `BENCHMARK_PROVIDER=apify` and provider config block

### 2) Apify integration
- Store the Actor ID + input schema params in config (not hard-coded in logic)
- Run job on schedule:
  - MVP: daily
  - Later: structural weekly + topical daily
- Capture run metadata:
  - run_id, started_at, finished_at, status, items_count, cost_estimate (if available)

### 3) Storage (Supabase)
We should prefer **derived features** over raw content.

Option A (recommended):
- `benchmark_posts_raw` (optional, short retention)
  - post_id, source, title, created_utc, score, num_comments, subreddit, url
  - retention: 7–14 days max, then purge
- `benchmark_post_features` (persistent)
  - post_id, embedding (optional), structural_tags, length, punctuation_features,
    emotion_features, curiosity_gap_score, specificity_score, imperative_count,
    numbers_present, etc.
  - Store *only what we need* to power scoring + suggestions

No usernames. No author fields. No comment text. No user IDs.

### 4) Feature extraction pipeline (the “OMG” maker)
From title (and maybe short snippet if available/allowed):
- classify hook type (question, list, confession, warning, contrarian, how-to, etc.)
- extract structure tags (e.g., “Number + Pain + Promise”)
- compute similarity search index (embeddings optional)
- keep a small set of “reference exemplars” per topic cluster

### 5) Product output changes (keep UI same, increase value)
When user enters a hook/topic:
- show Viral Score
- show “Why” (top 3 factors)
- show 2–4 rewrites (with *structure reasoning*)
- show “Pattern evidence” phrased safely:
  - “This structure appears frequently in high-performing benchmark content”
  - Avoid exact claims like “420% better” unless we can compute it accurately

### 6) Observability
Add lightweight metrics:
- last successful run timestamp
- items ingested today
- feature extraction success rate
- cost per day (approx)
- error log + alert if runs fail 2 days in a row

### 7) Graceful fallback
If Apify fails / rate limits / blocks / goes down:
- skip ingestion
- keep product fully operational using existing heuristic model
- display nothing alarming to users (no “data source failure” banners)

## Messaging / Copy (safe + strong)
Use:
- “Benchmarked against high-performing public content patterns”
- “Continuously calibrated as new performance signals emerge”
Do NOT use:
- “secret algorithm”, “classified”, “under the radar”, “not noticed”

## Acceptance Criteria
- [ ] Toggle works: setting `BENCHMARK_REDDIT_ENABLED=false` disables collection safely
- [ ] Daily job runs and stores run metadata + derived features
- [ ] No PII stored (no usernames/authors/comments)
- [ ] Raw retention (if used) auto-purges after 7–14 days
- [ ] Viral Score + rewrite suggestions improve without breaking existing UI
- [ ] App still works perfectly when benchmark dataset is unavailable

## Transition Plan (later)
Once first-party outcomes exist (user posts -> performance metrics):
- Gradually weight first-party data higher
- Keep benchmark dataset as backstop + cold start helper
- Mention shift in a low-drama changelog note (“model calibration updated”)

## Request back to Gemini (what I need you to answer)
1) Confirm exactly which fields Apify returns + what we plan to store
2) Propose Supabase schema + retention policy
3) Where in the codebase to plug this into scoring + rewrite suggestions
4) Confirm kill switch + fallback behavior is implemented
5) Provide a short changelog entry (project changelog, NOT SYSTEM authority files unless explicitly requested)
