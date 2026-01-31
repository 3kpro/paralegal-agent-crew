# HARDEN AI FEATURES - Implementation Handoff

**Task:** Harden AI-Powered Features (Viral Score & Trend Generation)
**Reference:** `docs/GE_SUGGESTIONS.md` Issue #2
**GE Analysis Date:** 2026-01-16
**Status:** Ready for Implementation
**Assigned:** Gemini (Local)

---

## GE MASTER IMPLEMENTATION PLAN

Of course. This is a great task. Implementing these changes will significantly improve the reliability and maintainability of your AI-powered features. Here is a detailed implementation plan to address Issue #2: Fragile AI Features.

The core of this plan is to:

Stop parsing unstructured text from the AI and use Gemini's native JSON Mode. This eliminates the most fragile part of the process.

Centralize the Gemini AI client to avoid code duplication and simplify API key management.

Improve error handling to make debugging easier when the AI service fails.

Step 1: Centralize Gemini Client Initialization
First, let's create a single, reusable utility for initializing the Gemini model. This ensures consistency and makes future updates easier.

Create a new file: lib/gemini.ts

TypeScript
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

let genAIInstance: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI | null {
  // Return existing instance if it's already created
  if (genAIInstance) {
    return genAIInstance;
  }

  const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("[Gemini Client] API Key is missing. The application will not be able to connect to the Gemini service.");
    // In a production environment, failing loudly is often better than failing silently.
    if (process.env.NODE_ENV === 'production') {
      throw new Error("CRITICAL: Gemini API Key is not configured on the server.");
    }
    return null;
  }

  console.log("[Gemini Client] Initializing GoogleGenerativeAI client.");
  genAIInstance = new GoogleGenerativeAI(apiKey);
  return genAIInstance;
}

/**
 * Gets a configured Gemini model instance.
 * @param modelName The name of the model to use (e.g., 'gemini-1.5-flash-latest').
 * @param useJsonMode Enables JSON output mode for reliable, structured data.
 * @returns A GenerativeModel instance or null if the client could not be initialized.
 */
export function getGeminiModel(modelName: string = 'gemini-1.5-flash-latest', useJsonMode: boolean = false): GenerativeModel | null {
  const client = getClient();
  if (!client) {
    return null;
  }

  return client.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.4,
      // Use JSON response type for predictable, parsable output
      ...(useJsonMode && { responseMimeType: "application/json" }),
    },
  });
}
Step 2: Refactor viral-score.ts
Now, let's update your viral-score.ts file to use the new centralized client and native JSON mode. This will make the AI analysis much more robust.

File: viral-score.ts

TypeScript
/* ... other imports ... */
// REMOVE the direct import of GoogleGenerativeAI
// import { GoogleGenerativeAI } from '@google/generative-ai';
import { getBenchmarkScore } from '@/lib/viral-benchmarks';
// ADD the new centralized model getter
import { getGeminiModel } from '@/lib/gemini'; // Adjust path if needed

// REMOVE the old, local getModel() function entirely
/*
let model: any = null;
function getModel() { ... }
*/

/* ... ViralDNA and TrendWithViralScore interfaces remain the same ... */

export async function calculateViralScore(trend: {
  title: string;
  formattedTraffic: string;
  sources?: string[];
  firstSeenAt?: Date;
}): Promise<TrendWithViralScore> {
  
  // ... (Heuristic score calculations remain the same)
  const volume = parseVolume(trend.formattedTraffic);
  const volumeScore = calculateVolumeScore(volume);
  const multiSourceScore = calculateMultiSourceScore(trend.sources || []);
  const freshnessScore = calculateFreshnessScore(trend.firstSeenAt);
  const keywordBoost = calculateKeywordBoost(trend.title);
  let benchmarkScore = 0;
  try {
    benchmarkScore = await getBenchmarkScore(trend.title);
  } catch (err) {
    console.error(`[Viral Score] Benchmark check failed for "${trend.title}":`, err);
    benchmarkScore = 0;
  }
  const dataScore = volumeScore + multiSourceScore + freshnessScore + keywordBoost + benchmarkScore;

  // --- REFACTOR STARTS HERE ---

  // 4. Calculate Content Score (AI) - Max 70 points
  let aiScore = 0;
  let aiReasoning = "AI analysis skipped.";
  let viralDNA: ViralDNA | undefined;

  // Get the model with JSON mode enabled
  const aiModel = getGeminiModel('gemini-1.5-flash-latest', true);

  if (aiModel) {
    try {
      const prompt = `
        Analyze the viral potential of this topic for a tech/business audience.
        Topic: "${trend.title}"
        
        Rate on a scale of 0-70 based on:
        1. Hook/Curiosity (Is it clicky?)
        2. Broad Appeal (Do many people care?)
        3. Emotional Trigger (Fear, Greed, Awe?)
        
        Also identify the Viral DNA.

        Your response MUST be a valid JSON object with the following structure. Do not include any other text or markdown.
        { 
          "score": number, 
          "reason": "A short explanation for the score.",
          "dna": {
             "hookType": "Contrarian, How-to, Listicle, Secret, News, Story, or Question",
             "primaryEmotion": "Greed, Fear, Curiosity, Awe, Anger, Joy, or Urgency",
             "valueProp": "Money, Status, Time, Effort, Knowledge, or Entertainment"
          }
        }
      `;

      const result = await aiModel.generateContent(prompt);
      // Directly parse the response text, now guaranteed to be JSON
      const data = JSON.parse(result.response.text());

      aiScore = Math.min(data.score || 0, 70); // Add default value for safety
      aiReasoning = data.reason || "AI analysis completed without reasoning.";
      viralDNA = data.dna;

    } catch (error: any) {
      console.error("[Viral Score AI Error] Failed to generate or parse AI score.", {
        title: trend.title,
        errorMessage: error.message,
      });
      aiReasoning = `AI analysis failed: ${error.message}. Using heuristic fallback.`;
      // Keep the simple fallback logic as a final safety net
      if (trend.title.match(/^(How to|Top \d|Why|The Future of)/i)) {
        aiScore = 35; // Slightly lower heuristic score
        viralDNA = {
          hookType: "Heuristic Match",
          primaryEmotion: "Curiosity",
          valueProp: "Knowledge"
        };
      } else {
        aiScore = 15; // Slightly lower heuristic score
        viralDNA = { hookType: "Standard", primaryEmotion: "Neutral", valueProp: "Information" };
      }
    }
  } else {
    // This case now primarily means the API key is missing
    aiReasoning = "AI analysis skipped (Gemini client not initialized).";
    aiScore = 0;
  }
  
  // --- REFACTOR ENDS HERE ---

  // 5. Total Score
  const totalScore = Math.min(Math.round(dataScore + aiScore), 100);
  const viralPotential = classifyViralPotential(totalScore);

  return {
    ...trend,
    viralScore: totalScore,
    viralPotential,
    aiReasoning,
    viralDNA,
    viralFactors: {
      volume: volumeScore,
      multiSource: multiSourceScore,
      freshness: freshnessScore,
      keywordBoost,
      benchmark: benchmarkScore,
      aiAnalysis: aiScore
    }
  };
}

/* ... rest of the file (parseVolume, helper functions) remains the same ... */
Step 3: Refactor app/api/trends/route.ts
Finally, let's apply the same principles to the trends API endpoint.

File: app/api/trends/route.ts

TypeScript
/* ... other imports ... */
// REMOVE the direct import of GoogleGenerativeAI
// import { GoogleGenerativeAI } from "@google/generative-ai";
/* ... other imports ... */
// ADD the new centralized model getter
import { getGeminiModel } from '@/lib/gemini'; // Adjust path if needed

/* ... (mock data, interfaces, etc. remain the same) ... */


/* ... (getRealTrendingData remains mostly the same, as its internal call to generateTrendsWithGemini will be updated) ... */

async function generateTrendsWithGemini(keyword: string, _userId: string) {
  const startTime = performance.now();

  // Get the model with JSON mode enabled
  const model = getGeminiModel('gemini-1.5-flash-latest', true);

  if (!model) {
    // This will be caught by the calling function and trigger the next fallback.
    throw new Error("Gemini client is not initialized (likely missing API key).");
  }

  try {
    const prompt = `You are a content marketing expert. Generate 6 highly engaging, specific content ideas related to "${keyword}".

These should be:
- Unique angles or perspectives
- Actionable content topics that would perform well on social media
- Relevant to current trends

For each idea, provide a title, estimated traffic, and related queries.

Your response MUST be a valid JSON array of objects with the following structure. Do not include any other text or markdown.
[
  {
    "title": "A Specific and Compelling Content Angle",
    "formattedTraffic": "XXK searches",
    "relatedQueries": ["specific query 1", "specific query 2", "specific query 3"]
  }
]`;

    const result = await model.generateContent(prompt);
    // Directly parse the response, now guaranteed to be JSON
    const trends = JSON.parse(result.response.text());

    const duration = performance.now() - startTime;
    console.log(`[Gemini] ✓ Generated ${trends.length} keyword-optimized trends in ${Math.round(duration)}ms`);

    // Calculate viral scores for the generated trends
    const trendsWithScores = await Promise.all(trends.map(async (trend: any) =>
      await calculateViralScore({
        title: trend.title,
        formattedTraffic: trend.formattedTraffic || '0K searches',
        sources: ['gemini-ai'],
        firstSeenAt: new Date()
      })
    ));

    const sortedTrends = sortByViralScore(trendsWithScores);

    console.log(`[Viral Score] ✓ Scored ${sortedTrends.length} Gemini trends (top score: ${sortedTrends[0]?.viralScore || 'N/A'})`);

    return {
      trending: sortedTrends,
      // ... (relatedQueries and relatedTopics remain the same)
    };
  } catch (error: any) {
    const duration = performance.now() - startTime;
    console.error(`[Gemini Trends Error] Failed to generate trends after ${Math.round(duration)}ms`, {
        keyword,
        errorMessage: error.message,
    });
    // Re-throw the error to allow the calling function's fallback logic to engage
    throw error;
  }
}

/* ... (The main GET handler remains the same, as its error handling and fallback logic will now correctly catch errors from the refactored functions) ... */
Summary of Benefits
By implementing these changes, you will have:

Increased Reliability: Gemini's JSON mode is far more reliable than manual string parsing, virtually eliminating a major source of runtime errors.

Improved Maintainability: The centralized getGeminiModel function means you only have one place to update your model name, API key logic, or default configurations.

Better Debugging: The enhanced error logging will give you clearer insights when an AI call fails, telling you exactly which step of the process broke.

Fail-Fast in Production: Throwing an error on a missing API key in production prevents the application from running in a degraded state without the developers' knowledge.

Would you like me to elaborate on any of these steps or review another part of the codebase?

---

## IMPLEMENTATION CHECKLIST (For Local Gemini)

**BEFORE YOU START:**
- [ ] Read `docs/SYSTEM/AGENT_CONTRACT.md`
- [ ] Read `docs/SYSTEM/TASKS.md` NOW section
- [ ] Read this entire handoff file
- [ ] Read current implementation: `lib/viral-score.ts`
- [ ] Read current implementation: `app/api/trends/route.ts`

**IMPLEMENTATION STEPS (Follow GE's plan above):**

**Step 1: Create Centralized Gemini Client**
- [ ] Create `lib/gemini.ts` with `getGeminiModel()` function
- [ ] Implement singleton pattern for GoogleGenerativeAI instance
- [ ] Add JSON mode support via `responseMimeType: "application/json"`
- [ ] Add production fail-fast behavior for missing API keys

**Step 2: Refactor `lib/viral-score.ts`**
- [ ] Remove local `getModel()` function
- [ ] Import centralized `getGeminiModel` from `lib/gemini.ts`
- [ ] Update prompt to require JSON response format
- [ ] Replace regex JSON parsing with direct `JSON.parse()`
- [ ] Improve fallback score degradation (35/15 instead of 70/20)
- [ ] Add structured error logging with context
- [ ] Preserve existing heuristic calculations (volume, sources, freshness, keyword, benchmark)

**Step 3: Refactor `app/api/trends/route.ts`**
- [ ] Remove local GoogleGenerativeAI import
- [ ] Import centralized `getGeminiModel` from `lib/gemini.ts`
- [ ] Update `generateTrendsWithGemini()` prompt for JSON response
- [ ] Replace regex JSON parsing with direct `JSON.parse()`
- [ ] Improve error logging with timing metrics
- [ ] Preserve existing fallback chain (Real-time → Gemini → Mock)

**TESTING:**
- [ ] **Test 1:** Remove/invalidate `GOOGLE_API_KEY` → verify graceful fallback
- [ ] **Test 2:** Simulate malformed AI response → verify JSON.parse error handling
- [ ] **Test 3:** Create campaign with valid API key → verify viral scores work
- [ ] **Test 4:** Check viral scores show smooth degradation (not 20 vs 70 cliff)
- [ ] **Test 5:** Verify error logs are descriptive (title, error message, timing)

**POST-IMPLEMENTATION:**
- [ ] Update `docs/SYSTEM/CHANGELOG.md` with changes
- [ ] Mark task as completed in `docs/SYSTEM/TASKS.md`
- [ ] Move task to COMPLETED section with completion date

---

## GEMINI PROMPT (For Agent Manager or CLI)

```
You are Gemini, the implementation agent for Xelora.

Read the following files in order:
1. docs/SYSTEM/AGENT_CONTRACT.md (your operating rules)
2. docs/SYSTEM/TASKS.md (current task is in NOW section)
3. docs/handoffs/HARDEN_AI_FEATURES.md (detailed implementation plan)

Then execute the task following GE's master plan exactly as specified.

After completion:
- Update docs/SYSTEM/CHANGELOG.md
- Move the task from NOW to COMPLETED in docs/SYSTEM/TASKS.md
- Report completion status

Begin implementation.
```

---

## POST-IMPLEMENTATION VALIDATION (For User)

After Gemini completes, validate by:

1. **Upload modified files to GE** (same chat where you got this plan):
   - `lib/gemini.ts` (new file)
   - `lib/viral-score.ts` (refactored)
   - `app/api/trends/route.ts` (refactored)

2. **Ask GE:**
   ```
   I've implemented your Issue #2 plan (Fragile AI Features).

   Review these files:
   - lib/gemini.ts
   - lib/viral-score.ts
   - app/api/trends/route.ts

   Questions:
   1. Did I address all concerns from Issue #2?
   2. Any edge cases missed?
   3. Any new issues introduced?
   4. Can we mark Issue #2 as RESOLVED?
   5. What should be the next priority from your original 5 issues?
   ```

3. **Next Task:** Based on GE's validation, scaffold the next issue from `docs/GE_SUGGESTIONS.md`