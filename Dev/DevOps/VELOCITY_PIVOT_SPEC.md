ReviewLens Pivot: Engineering Velocity Spec
Version: 2.0 (Velocity Pivot)
Date: 2026-01-28
Strategic Goal: Reposition ReviewLens from a "Bias Detector" to an "Engineering Velocity & Health Engine."

1. Core Logic Changes (The "Why")
We are moving away from flagging "Sexist/Racist" language (too rare, too HR-focused) to flagging "Velocity Killers" (common, engineering-focused).

The 3 Metrics that matter:

The Nitpick Ratio: % of comments that are about style/formatting vs. logic/architecture.

Review Load Imbalance: Identifying which 20% of devs are doing 80% of the reviews.

Staleness: PRs waiting >24h for a first pass.

2. Backend Tasks (Python/FastAPI)
A. Update the Classification Engine
Refactor the analyze_comment function. Replace the current "Bias" prompt with the "Velocity" prompt below.

Input: comment_body, diff_hunk (context)
Output Schema (JSON):

JSON
{
  "category": "nitpick" | "critical" | "compliment" | "question",
  "constructive_score": 1-10,
  "tone": "neutral" | "toxic" | "encouraging",
  "reasoning": "User is arguing about indentation which should be handled by a linter."
}
B. The "Golden" System Prompt
Use this prompt for the Claude API call:

You are a Senior Engineering Manager analyzing code review comments to optimize team velocity.

Your Goal: Classify the following code review comment into one of these buckets:

Nitpick: Comments about indentation, variable naming (camelCase vs snake_case), line breaks, or code style. These should be automated by linters.

Critical: Comments about logic errors, security vulnerabilities, performance issues, architectural flaws, or bugs. These are high value.

Process: Comments about ticket numbers, merging strategies, or git hygiene.

Toxic: Sarcasm, rhetorical questions ("Why did you do this?"), or personal attacks.

Analyze this comment:
"{comment_body}"

Return ONLY the JSON object.

C. Aggregation Endpoint
Create a new endpoint GET /reports/health-check/{repo_id} that returns:

nitpick_percentage: (Count of Nitpicks / Total Comments) * 100

top_reviewers: List of users sorted by comment count (descending).

average_pickup_time: Avg time between pr_created and first_comment.

3. Frontend Tasks (React)
A. New "Health Check" Dashboard
Create a new high-level view (Exec Summary) that sits above the detailed lists.

Components:

The "Velocity Killer" Gauge: A big donut chart showing the "Nitpick Ratio".

Green: < 10%

Yellow: 10-25%

Red: > 25% (Text: "Your team is wasting time on style arguments. Install a Linter.")

The "Hero vs. Zero" Chart: A bar chart showing Review Volume per developer.

Highlight developers who are 2 standard deviations above the mean (Burnout Risk).

The "Bottleneck" List: A simple table of PRs currently open for > 48 hours.

4. Security & Permissions (Critical)
Ensure the GitHub OAuth scope is strictly:

repo (or specific read:user, read:org)

Explicitly Verify: We are NOT requesting write:repo_hook or workflow permissions.

Add a "Nuke Data" button in Settings that triggers a cascade delete of all comments and prs for that tenant.

Why this works for your AI Coder:
Context: It gives the AI the "schema" (JSON structure) so it knows exactly how to shape the data objects.

Prompt: It provides the literal text to send to Claude, saving the AI from trying to "guess" how to detect nitpicks.

Scope: It clearly defines the new endpoints needed, keeping the AI focused on the pivot.

