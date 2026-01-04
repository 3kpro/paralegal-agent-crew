/**
 * Viral Score™ Algorithm (Hybrid AI + Heuristic + Benchmark)
 *
 * NOTE: This file is server-only. Do not import in client components.
 * For client-safe utilities, use @/lib/viral-score-utils.ts
 *
 * Predicts viral potential of trending topics (0-100 score)
 * Combines:
 * 1. Data Score: Volume, Multi-source validation, Freshness (Heuristic)
 * 2. Benchmark Score: Semantic match against proven viral hits (Database)
 * 3. Content Score: Hook quality, Emotional resonance, Value prop (Gemini AI)
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { getBenchmarkScore } from '@/lib/viral-benchmarks';

// Initialize Gemini AI (Server-side only)
// Uses API Key for simplicity and reliability
let model: any = null;

function getModel() {
  const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  
  if (!model && apiKey) {
    console.log("[Viral Score] Initializing Gemini model with key length:", apiKey.length);
    const genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash', // Use stable flash model
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.4,
      }
    });
  } else if (!apiKey) {
    console.error("[Viral Score] Missing API Key! Scores will be low.");
  }
  return model;
}

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
    keywordBoost: number; // 0-15 points (New "Hot Topic" Bonus)
    benchmark: number; // 0-20 points (Proven Viral Hit Match)
    aiAnalysis: number; // 0-70 points (The "Content Score")
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
  
  // 2. Calculate Keyword Boost (Heuristic) - Max 15 points
  const keywordBoost = calculateKeywordBoost(trend.title);

  // 3. Calculate Benchmark Score (Data-Driven) - Max 20 points
  // Checks our database of 10k+ viral hits for semantic matches
  let benchmarkScore = 0;
  try {
    benchmarkScore = await getBenchmarkScore(trend.title);
  } catch (err) {
    console.error(`[Viral Score] Benchmark check failed for "${trend.title}":`, err);
    benchmarkScore = 0;
  }

  const dataScore = volumeScore + multiSourceScore + freshnessScore + keywordBoost + benchmarkScore;

  // 4. Calculate Content Score (AI) - Max 70 points
  let aiScore = 0;
  let aiReasoning = "AI analysis skipped (No API Key).";
  let viralDNA: ViralDNA | undefined;

  try {
    const aiModel = getModel();
    if (aiModel) {
      const prompt = `
        Analyze the viral potential of this topic for a tech/business audience.
        Topic: "${trend.title}"
        
        Rate on scale 0-70 based on:
        1. Hook/Curiosity (Is it clicky?) - Max 30
        2. Broad Appeal (Do people care?) - Max 25
        3. Emotional Trigger (Fear, Greed, Awe?) - Max 15
        
        Also identify the Viral DNA:
        - Hook Type: Contrarian, How-to, Listicle, Secret, News, Story, or Question
        - Primary Emotion: Greed, Fear, Curiosity, Awe, Anger, Joy, or Urgency
        - Value Prop: Money, Status, Time, Effort, Knowledge, or Entertainment

        Output JSON only: 
        { 
          "score": number, 
          "reason": "short explanation",
          "dna": {
             "hookType": "string",
             "primaryEmotion": "string",
             "valueProp": "string"
          }
        }
      `;

      const result = await aiModel.generateContent(prompt);
      const response = result.response.text();
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        aiScore = Math.min(data.score, 70);
        aiReasoning = data.reason;
        viralDNA = data.dna;
      }
    } else {
      // Fallback: Boost score if it looks like a "How-to" or "Listicle" (simple heuristic)
      if (trend.title.match(/^(How to|Top \d|Why|The Future of)/i)) {
        aiScore = 40;
        aiReasoning = "Heuristic boost for high-performing format.";
        viralDNA = {
            hookType: "High Performing",
            primaryEmotion: "Curiosity",
            valueProp: "Knowledge"
        };
      } else {
        aiScore = 20;
        aiReasoning = "Baseline content score.";
        viralDNA = {
            hookType: "Standard",
            primaryEmotion: "Neutral",
            valueProp: "Information"
        };
      }
    }
  } catch (error) {
    console.error("Viral Score AI Error:", error);
    aiScore = 20; // Safe fallback
    aiReasoning = "AI analysis failed, used baseline.";
  }

  // 5. Total Score
  // We allow the total to go slightly over 100 internally before capping, to reward "Perfect Storms"
  // Example: 30 (Data) + 15 (Keywords) + 20 (Benchmark) + 70 (AI) = 135 (capped at 100)
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
 * Adjusted for AI-First Model
 */
function calculateVolumeScore(volume: number): number {
  if (volume >= 300000) return 10;
  if (volume >= 100000) return 7;
  if (volume >= 10000) return 5;
  return 2;
}

/**
 * Factor 2: Multi-Source Score (0-10 points)
 * Adjusted for AI-First Model
 */
function calculateMultiSourceScore(sources: string[]): number {
  const numSources = sources.length;
  if (numSources >= 3) return 10;
  if (numSources === 2) return 5;
  return 2;
}

/**
 * Factor 4: Keyword Boost (0-15 points)
 * Rewards high-velocity topics
 */
function calculateKeywordBoost(title: string): number {
  const hotKeywords = [
    'AI', 'GPT', 'Cursor', 'Agent', 'Crypto', 'Bitcoin', 
    'Hack', 'Secret', 'Revealed', 'Guide', 'Tutorial', 
    'Free', 'Money', 'Profit', 'Scale', 'Million'
  ];
  
  const lowerTitle = title.toLowerCase();
  let boost = 0;
  
  // +10 for primary hot keywords
  if (hotKeywords.some(k => lowerTitle.includes(k.toLowerCase()))) {
    boost += 10;
  }
  
  // +5 for "How to" or "Why" structure (Actionable)
  if (lowerTitle.match(/^(how to|why|top \d)/)) {
    boost += 5;
  }
  
  return Math.min(boost, 15);
}

/**
 * Factor 3: Freshness Score (0-10 points)
 */
function calculateFreshnessScore(firstSeenAt?: Date): number {
  if (!firstSeenAt) return 5;
  const hoursSinceFirstSeen = (Date.now() - firstSeenAt.getTime()) / (1000 * 60 * 60);
  if (hoursSinceFirstSeen < 4) return 10;
  if (hoursSinceFirstSeen < 24) return 5;
  return 0;
}

/**
 * Classify viral potential based on score
 */
function classifyViralPotential(score: number): 'high' | 'medium' | 'low' {
  if (score >= 75) return 'high';
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
