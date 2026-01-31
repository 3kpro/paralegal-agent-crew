/**
 * Viral Score™ Algorithm (Hybrid AI + Heuristic + Benchmark)
 *
 * NOTE: This file is server-only. Do not import in client components.
 * For client-safe utilities, use @/lib/viral-score-utils.ts
 *
 * Predicts viral potential of trending topics (0-100 score)
 *
 * CALIBRATION NOTES (v2.0):
 * - Most topics should score 35-65 (average zone)
 * - Genuinely strong topics: 65-80
 * - Exceptional (rare): 80-90
 * - 90+ should be extremely rare (1 in 50 topics)
 * - 100 should essentially never happen
 *
 * Combines:
 * 1. Data Score: Volume, Multi-source validation, Freshness (Heuristic)
 * 2. Benchmark Score: Semantic match against proven viral hits (Database)
 * 3. Content Score: Hook quality, Emotional resonance, Value prop (Gemini AI)
 * 4. Penalty Score: Saturation, Generic content, Oversaturation
 */

import { getGeminiModel } from '@/lib/gemini';
import { getBenchmarkScore } from '@/lib/viral-benchmarks';

// Initialize Gemini AI (Server-side only)
// Uses API Key for simplicity and reliability
// Gemini Client is now centralized in @/lib/gemini.ts

export interface ViralDNA {
  hookType: string;
  primaryEmotion: string;
  valueProp: string;
}

export interface TrendWithViralScore {
  title: string;
  formattedTraffic: string;
  relatedQueries?: string[];

  // Viral Score fields
  viralScore: number; // 0-100
  viralPotential: 'high' | 'medium' | 'low';
  viralFactors: {
    volume: number; // 0-10 points
    multiSource: number; // 0-10 points
    freshness: number; // 0-10 points
    keywordBoost: number; // 0-10 points (Hot Topic Bonus - reduced)
    benchmark: number; // 0-15 points (Proven Viral Hit Match - reduced)
    aiAnalysis: number; // 0-55 points (Content Score)
    penalty: number; // -10 to +10 points (Quality modifier - penalties & bonuses)
  };

  // Metadata
  sources?: string[]; // ['google', 'twitter', 'reddit']
  firstSeenAt?: Date;
  aiReasoning?: string; // Why the AI gave this score
  viralDNA?: ViralDNA; // The "Psychology" behind the viral potential
}

/**
 * Calculate viral score for a trending topic
 */
export async function calculateViralScore(trend: {
  title: string;
  formattedTraffic: string;
  sources?: string[];
  firstSeenAt?: Date;
}): Promise<TrendWithViralScore> {

  // 1. Calculate Data Score (Heuristic) - Max 30 points
  const volume = parseVolume(trend.formattedTraffic);
  const volumeScore = calculateVolumeScore(volume); // Max 10
  const multiSourceScore = calculateMultiSourceScore(trend.sources || []); // Max 10
  const freshnessScore = calculateFreshnessScore(trend.firstSeenAt); // Max 10

  // 2. Calculate Keyword Boost (Heuristic) - Max 10 points (reduced from 15)
  const keywordBoost = calculateKeywordBoost(trend.title);

  // 3. Calculate Benchmark Score (Data-Driven) - Max 15 points (reduced from 20)
  // Checks our database of 10k+ viral hits for semantic matches
  let benchmarkScore = 0;
  try {
    const rawBenchmark = await getBenchmarkScore(trend.title);
    benchmarkScore = Math.min(Math.round(rawBenchmark * 0.75), 15); // Scale down
  } catch (err) {
    console.error(`[Viral Score] Benchmark check failed for "${trend.title}":`, err);
    benchmarkScore = 0;
  }

  // 4. Calculate Penalty Score (NEW) - -20 to 0 points
  const penaltyScore = calculatePenaltyScore(trend.title);

  const dataScore = volumeScore + multiSourceScore + freshnessScore + keywordBoost + benchmarkScore + penaltyScore;

  // 5. Calculate Content Score (AI) - Max 55 points

  let aiScore = 0;
  let aiReasoning = "AI analysis skipped.";
  let viralDNA: ViralDNA | undefined;

  // Get the model with JSON mode enabled
  // using gemini-2.0-flash for stability and availability
  const aiModel = getGeminiModel('gemini-2.0-flash', true);

  if (aiModel) {
    try {
      const prompt = `
        Score this topic's VIRAL potential (0-55). Be CONSERVATIVE - most content is NOT viral.
        Topic: "${trend.title}"

        CRITICAL: "Beginner's guides", "tips lists", and evergreen content score LOW (15-25).
        Only breaking news, controversy, or exclusive content scores HIGH (40+).

        SCORING ANCHORS (use these as reference):
        - "10 Productivity Tips for Remote Workers" = 18 (generic listicle)
        - "A Beginner's Guide to AI Art" = 22 (broad, not urgent)
        - "Inflation-Proof Your Finances" = 25 (evergreen, low buzz)
        - "Gen Z's Guide to Thrifting" = 28 (trendy but niche)
        - "Quiet Quitting: Problem or Solution?" = 35 (debatable, emotional)
        - "Why Apple Just Fired 500 Engineers" = 45 (news + controversy)
        - "LEAKED: Tesla's Secret $15K Car" = 52 (exclusive + urgent)

        The MEDIAN score should be 25-30. Scores above 40 are RARE.

        Respond in JSON only:
        {
          "score": number,
          "reason": "1 sentence - what limits or boosts this topic",
          "dna": {
             "hookType": "Contrarian, How-to, Listicle, Secret, News, Story, or Question",
             "primaryEmotion": "Greed, Fear, Curiosity, Awe, Anger, Joy, or Urgency",
             "valueProp": "Money, Status, Time, Effort, Knowledge, or Entertainment"
          }
        }
      `;

      const result = await aiModel.generateContent(prompt);

      const candidates = result.response.candidates;
      const responseText = candidates?.[0]?.content?.parts?.[0]?.text;

      if (!responseText) {
        throw new Error("No text content in Vertex AI response");
      }

      // Directly parse the response text, now guaranteed to be JSON
      // Clean possible markdown blocks if any
      const cleanedText = responseText.replace(/```json\n|\n```/g, '').replace(/```/g, '');
      const data = JSON.parse(cleanedText);

      aiScore = Math.min(data.score || 0, 55); // Max 55
      aiReasoning = data.reason || "AI analysis completed without reasoning.";
      viralDNA = data.dna;

    } catch (error: any) {
      if (error.message.includes('429') || error.message.includes('Resource exhausted')) {
        console.warn(`[Viral Score] Rate limit hit for "${trend.title}". Using heuristic fallback.`);
      } else {
        console.error(`[Viral Score AI Error] Failed to generate usage: ${error.message}`);
      }
      aiReasoning = `AI analysis limited: ${error.message}. Using heuristic fallback.`;

      // Fallback scores (conservative per Gemini's calibration)
      if (trend.title.match(/^(How to|Top \d|Guide|Tips|\d+ ways)/i)) {
        aiScore = 18; // Generic patterns score low
        viralDNA = {
          hookType: "How-to",
          primaryEmotion: "Curiosity",
          valueProp: "Knowledge"
        };
      } else {
        aiScore = 25; // Default median
        viralDNA = { hookType: "Standard", primaryEmotion: "Curiosity", valueProp: "Knowledge" };
      }
    }
  } else {
    // This case now primarily means the API key is missing
    aiReasoning = "AI analysis skipped (Gemini client not initialized).";
    aiScore = 22; // Conservative default
  }

  // 6. Total Score
  // Base score of 15 (lowered per Gemini's calibration advice)
  // Good topics should hit 65-80, exceptional 80-90
  const BASE_SCORE = 15;
  const rawScore = BASE_SCORE + dataScore + aiScore;
  const totalScore = Math.min(Math.max(Math.round(rawScore), 0), 100);
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
      aiAnalysis: aiScore,
      penalty: penaltyScore
    }
  };
}

/**
 * Parse volume from formatted traffic string
 */
function parseVolume(formattedTraffic: string): number {
  const match = formattedTraffic.match(/([\d.]+)([KM]?)/i);
  if (!match) return 0;

  const [, num, suffix] = match;
  const value = parseFloat(num);

  if (suffix.toUpperCase() === 'K') return value * 1000;
  if (suffix.toUpperCase() === 'M') return value * 1000000;
  return value;
}

/**
 * Factor 1: Volume Score (0-10 points)
 * Stricter thresholds - no free points
 */
function calculateVolumeScore(volume: number): number {
  if (volume >= 500000) return 10;
  if (volume >= 200000) return 8;
  if (volume >= 100000) return 6;
  if (volume >= 50000) return 4;
  if (volume >= 10000) return 2;
  return 0; // No free points for low volume
}

/**
 * Factor 2: Multi-Source Score (0-10 points)
 * Stricter - single source gets nothing
 */
function calculateMultiSourceScore(sources: string[]): number {
  const numSources = sources.length;
  if (numSources >= 4) return 10;
  if (numSources >= 3) return 7;
  if (numSources === 2) return 4;
  return 0; // Single source = 0 points
}

/**
 * Factor 3: Freshness Score (0-10 points)
 * No date = no freshness bonus
 */
function calculateFreshnessScore(firstSeenAt?: Date): number {
  if (!firstSeenAt) return 0; // Changed from 5 - no free points
  const hoursSinceFirstSeen = (Date.now() - firstSeenAt.getTime()) / (1000 * 60 * 60);
  if (hoursSinceFirstSeen < 2) return 10; // Breaking news
  if (hoursSinceFirstSeen < 6) return 7;
  if (hoursSinceFirstSeen < 24) return 4;
  if (hoursSinceFirstSeen < 48) return 2;
  return 0; // Old news
}

/**
 * Factor 4: Keyword Boost (0-10 points) - Reduced from 15
 * More selective about what gets boosted
 */
function calculateKeywordBoost(title: string): number {
  // Truly viral keywords (not just popular)
  const viralKeywords = [
    'Breaking', 'Leaked', 'Exposed', 'Banned', 'Shocking',
    'Exclusive', 'First Look', 'Behind the Scenes'
  ];

  // Trending but not guaranteed viral
  const trendingKeywords = [
    'AI', 'GPT', 'Crypto', 'Bitcoin', 'Hack', 'Secret'
  ];

  const lowerTitle = title.toLowerCase();
  let boost = 0;

  // +8 for truly viral keywords
  if (viralKeywords.some(k => lowerTitle.includes(k.toLowerCase()))) {
    boost += 8;
  }

  // +4 for trending keywords (reduced from 10)
  if (trendingKeywords.some(k => lowerTitle.includes(k.toLowerCase()))) {
    boost += 4;
  }

  // NO boost for generic patterns like "How to" - these are oversaturated
  // Removed the +5 for "how to|why|top \d"

  return Math.min(boost, 10);
}

/**
 * Factor 5: Modifier Score (-10 to +10 points)
 * Adjusts based on content quality signals
 */
function calculatePenaltyScore(title: string): number {
  const lowerTitle = title.toLowerCase();
  let modifier = 0;

  // === NEGATIVE MODIFIERS (penalties) ===

  // Generic patterns penalty (reduced from -5)
  const genericPatterns = [
    /^how to /i,
    /^why you should/i,
    /^the (ultimate|complete|definitive) guide/i,
    /^\d+ (ways|tips|tricks|things)/i,
  ];

  for (const pattern of genericPatterns) {
    if (pattern.test(lowerTitle)) {
      modifier -= 3;
      break;
    }
  }

  // Oversaturated topics penalty (reduced from -8)
  const oversaturatedTopics = [
    'productivity', 'morning routine', 'work-life balance',
    'self-improvement', 'mindfulness', 'passive income'
  ];

  if (oversaturatedTopics.some(topic => lowerTitle.includes(topic))) {
    modifier -= 5;
  }

  // === POSITIVE MODIFIERS (bonuses) ===

  // Specificity bonus - mentions specific names/numbers/dates
  if (title.match(/\b(20\d{2}|january|february|march|april|may|june|july|august|september|october|november|december)\b/i)) {
    modifier += 3; // Timely/dated content
  }

  // Controversy/Opinion bonus
  const opinionSignals = ['why', 'problem with', 'wrong about', 'truth about', 'actually', 'unpopular'];
  if (opinionSignals.some(s => lowerTitle.includes(s))) {
    modifier += 4; // Has a stance
  }

  // Narrative/Story bonus
  if (lowerTitle.match(/\b(story|journey|learned|discovered|built|grew|failed)\b/)) {
    modifier += 3; // Personal narrative
  }

  // Exclusivity bonus
  if (lowerTitle.match(/\b(exclusive|first|inside|behind|leaked|revealed)\b/)) {
    modifier += 5; // Exclusive angle
  }

  return Math.max(Math.min(modifier, 10), -10); // Cap at -10 to +10
}

/**
 * Classify viral potential based on score
 * Adjusted thresholds for realistic distribution
 */
function classifyViralPotential(score: number): 'high' | 'medium' | 'low' {
  if (score >= 70) return 'high';    // Changed from 75 - but harder to reach now
  if (score >= 50) return 'medium';
  return 'low';
}

// ... (Keep existing helpers for badges/colors)
export function getViralScoreBadgeColor(viralPotential: 'high' | 'medium' | 'low') {
  switch (viralPotential) {
    case 'high': return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-300' };
    case 'medium': return { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-300' };
    case 'low': return { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-300' };
  }
}

export function getViralScoreEmoji(viralPotential: 'high' | 'medium' | 'low'): string {
  switch (viralPotential) {
    case 'high': return '🔥';
    case 'medium': return '⚡';
    case 'low': return '📊';
  }
}

export function sortByViralScore<T extends { viralScore: number }>(trends: T[]): T[] {
  return [...trends].sort((a, b) => b.viralScore - a.viralScore);
}

export function formatViralScore(score: number): string {
  return `${score}/100`;
}

export function getViralPotentialLabel(viralPotential: 'high' | 'medium' | 'low'): string {
  switch (viralPotential) {
    case 'high': return 'High Viral Potential';
    case 'medium': return 'Medium Viral Potential';
    case 'low': return 'Low Viral Potential';
  }
}
