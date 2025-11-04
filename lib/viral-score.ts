/**
 * Viral Score™ Algorithm
 *
 * Predicts viral potential of trending topics (0-100 score)
 * Based on 4 key factors: Volume, Multi-source validation, Specificity, Freshness
 *
 * MVP Version: Heuristic algorithm (not ML)
 * Future: Replace with ML model trained on actual viral posts
 */

export interface TrendWithViralScore {
  title: string;
  formattedTraffic: string;
  relatedQueries?: string[];

  // Viral Score fields
  viralScore: number; // 0-100
  viralPotential: 'high' | 'medium' | 'low';
  viralFactors: {
    volume: number; // 0-40 points
    multiSource: number; // 0-30 points
    specificity: number; // 0-20 points
    freshness: number; // 0-10 points
  };

  // Metadata
  sources?: string[]; // ['google', 'twitter', 'reddit']
  firstSeenAt?: Date;
}

/**
 * Calculate viral score for a trending topic
 */
export function calculateViralScore(trend: {
  title: string;
  formattedTraffic: string;
  sources?: string[];
  firstSeenAt?: Date;
}): TrendWithViralScore {
  // Parse volume from formatted traffic
  const volume = parseVolume(trend.formattedTraffic);

  // Factor 1: Volume (0-40 points)
  // Higher search volume = higher viral potential
  const volumeScore = calculateVolumeScore(volume);

  // Factor 2: Multi-source validation (0-30 points)
  // Found in multiple sources = more likely to be real trend
  const multiSourceScore = calculateMultiSourceScore(trend.sources || []);

  // Factor 3: Keyword specificity (0-20 points)
  // Specific topics perform better than generic ones
  const specificityScore = calculateSpecificityScore(trend.title);

  // Factor 4: Freshness (0-10 points)
  // Newer trends have more viral potential
  const freshnessScore = calculateFreshnessScore(trend.firstSeenAt);

  // Total score (0-100)
  const totalScore = volumeScore + multiSourceScore + specificityScore + freshnessScore;
  const viralScore = Math.min(Math.round(totalScore), 100);

  // Classify viral potential
  const viralPotential = classifyViralPotential(viralScore);

  return {
    ...trend,
    viralScore,
    viralPotential,
    viralFactors: {
      volume: volumeScore,
      multiSource: multiSourceScore,
      specificity: specificityScore,
      freshness: freshnessScore
    }
  };
}

/**
 * Parse volume from formatted traffic string
 * Examples: "150K searches" -> 150000, "1.2M searches" -> 1200000
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
 * Factor 1: Volume Score (0-40 points)
 *
 * Logic:
 * - 0-50K searches: 0-10 points
 * - 50K-150K searches: 10-25 points
 * - 150K-300K searches: 25-35 points
 * - 300K+ searches: 35-40 points
 */
function calculateVolumeScore(volume: number): number {
  if (volume >= 300000) return 40;
  if (volume >= 150000) return 25 + ((volume - 150000) / 150000) * 10;
  if (volume >= 50000) return 10 + ((volume - 50000) / 100000) * 15;
  return (volume / 50000) * 10;
}

/**
 * Factor 2: Multi-Source Score (0-30 points)
 *
 * Logic:
 * - 1 source: 0 points (not validated)
 * - 2 sources: 10 points (some validation)
 * - 3 sources: 20 points (good validation)
 * - 4+ sources: 30 points (strong validation)
 */
function calculateMultiSourceScore(sources: string[]): number {
  const numSources = sources.length;

  if (numSources >= 4) return 30;
  if (numSources === 3) return 20;
  if (numSources === 2) return 10;
  return 0; // Single source or Gemini-only
}

/**
 * Factor 3: Specificity Score (0-20 points)
 *
 * Logic:
 * - Generic (1-2 words): 5 points
 * - Somewhat specific (3 words): 12 points
 * - Specific (4-6 words): 20 points
 * - Too specific (7+ words): 15 points
 *
 * Examples:
 * - "AI Tools" (2 words) -> 5 points
 * - "AI Content Creation" (3 words) -> 12 points
 * - "Morning Routines for Busy Parents" (5 words) -> 20 points
 * - "How to Create AI-Powered Content for Social Media Marketing" (9 words) -> 15 points
 */
function calculateSpecificityScore(title: string): number {
  const words = title.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;

  if (wordCount >= 4 && wordCount <= 6) return 20; // Sweet spot
  if (wordCount === 3) return 12; // Somewhat specific
  if (wordCount >= 7) return 15; // Too wordy
  return 5; // Too generic
}

/**
 * Factor 4: Freshness Score (0-10 points)
 *
 * Logic:
 * - <2 hours old: 10 points (very fresh)
 * - 2-12 hours old: 5 points (still fresh)
 * - 12-24 hours old: 2 points (getting old)
 * - 24+ hours old: 0 points (stale)
 */
function calculateFreshnessScore(firstSeenAt?: Date): number {
  if (!firstSeenAt) return 5; // Unknown, assume moderately fresh

  const hoursSinceFirstSeen = (Date.now() - firstSeenAt.getTime()) / (1000 * 60 * 60);

  if (hoursSinceFirstSeen < 2) return 10;
  if (hoursSinceFirstSeen < 12) return 5;
  if (hoursSinceFirstSeen < 24) return 2;
  return 0;
}

/**
 * Classify viral potential based on score
 */
function classifyViralPotential(score: number): 'high' | 'medium' | 'low' {
  if (score >= 70) return 'high';
  if (score >= 50) return 'medium';
  return 'low';
}

/**
 * Get badge color based on viral potential
 */
export function getViralScoreBadgeColor(viralPotential: 'high' | 'medium' | 'low'): {
  bg: string;
  text: string;
  border: string;
} {
  switch (viralPotential) {
    case 'high':
      return {
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-300'
      };
    case 'medium':
      return {
        bg: 'bg-yellow-50',
        text: 'text-yellow-700',
        border: 'border-yellow-300'
      };
    case 'low':
      return {
        bg: 'bg-gray-50',
        text: 'text-gray-600',
        border: 'border-gray-300'
      };
  }
}

/**
 * Get emoji for viral potential
 */
export function getViralScoreEmoji(viralPotential: 'high' | 'medium' | 'low'): string {
  switch (viralPotential) {
    case 'high':
      return '🔥';
    case 'medium':
      return '⚡';
    case 'low':
      return '📊';
  }
}

/**
 * Sort trends by viral score (highest first)
 */
export function sortByViralScore<T extends { viralScore: number }>(trends: T[]): T[] {
  return [...trends].sort((a, b) => b.viralScore - a.viralScore);
}

/**
 * Format viral score for display
 */
export function formatViralScore(score: number): string {
  return `${score}/100`;
}

/**
 * Get viral potential label
 */
export function getViralPotentialLabel(viralPotential: 'high' | 'medium' | 'low'): string {
  switch (viralPotential) {
    case 'high':
      return 'High Viral Potential';
    case 'medium':
      return 'Medium Viral Potential';
    case 'low':
      return 'Low Viral Potential';
  }
}

// ML Model Integration (Future - Phase 3)
// When you have training data, replace calculateViralScore with this:

/**
 * FUTURE: ML-powered viral prediction
 * Requires training data from actual viral posts
 *
 * @example
 * const mlScore = await predictViralScoreML(trend);
 */
export async function predictViralScoreML(trend: {
  title: string;
  formattedTraffic: string;
  sources?: string[];
  firstSeenAt?: Date;
}): Promise<TrendWithViralScore> {
  // TODO: Implement when ML model is trained
  // 1. Call Python Flask API with trend features
  // 2. Get prediction from trained RandomForest model
  // 3. Return score + confidence interval

  throw new Error('ML model not yet trained. Use calculateViralScore() for now.');
}
