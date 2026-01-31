/**
 * Local heuristic scoring algorithm
 * Runs instantly in browser without API calls
 * Provides immediate feedback while user types
 */
export function calculateLocalViralScore(text: string): number {
  if (!text || text.trim().length === 0) return 30;

  let score = 30; // Base score

  // Length bonus
  if (text.length > 50) score += 15;
  if (text.length > 100) score += 10;

  // Emotional punctuation (? and !)
  const emotionalPunctuation = text.match(/[?!]/g);
  if (emotionalPunctuation) {
    score += Math.min(emotionalPunctuation.length * 5, 10);
  }

  // Direct address (you/your)
  const directAddress = text.match(/\b(you|your)\b/gi);
  if (directAddress) {
    score += Math.min(directAddress.length * 3, 10);
  }

  // Data/numbers (credibility signals)
  const dataPoints = text.match(/\d+%|\$\d+|#?\d+[KkMm]?/g);
  if (dataPoints) {
    score += Math.min(dataPoints.length * 8, 15);
  }

  // Substantial content (word count)
  const wordCount = text.split(/\s+/).length;
  if (wordCount > 20) score += 10;
  if (wordCount > 50) score += 5;

  // Add slight randomness for realism
  score += Math.random() * 5;

  return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * Get breakdown of score factors for tooltip display
 */
export function getScoreBreakdown(text: string): Array<{
  label: string;
  points: number;
  status: 'positive' | 'warning' | 'neutral';
}> {
  const breakdown = [];

  // Length check
  if (text.length > 100) {
    breakdown.push({
      label: 'Substantial content',
      points: 25,
      status: 'positive' as const,
    });
  } else if (text.length > 50) {
    breakdown.push({
      label: 'Good length',
      points: 15,
      status: 'positive' as const,
    });
  } else {
    breakdown.push({
      label: 'Content too short',
      points: 0,
      status: 'warning' as const,
    });
  }

  // Emotional hooks
  if (text.match(/[?!]/)) {
    breakdown.push({
      label: 'Emotional hooks detected',
      points: 10,
      status: 'positive' as const,
    });
  }

  // Direct address
  if (text.match(/\b(you|your)\b/gi)) {
    breakdown.push({
      label: 'Direct address (you/your)',
      points: 10,
      status: 'positive' as const,
    });
  }

  // Data points
  if (text.match(/\d+%|\$\d+|#?\d+[KkMm]?/)) {
    breakdown.push({
      label: 'Data/numbers included',
      points: 15,
      status: 'positive' as const,
    });
  } else {
    breakdown.push({
      label: 'Consider adding statistics',
      points: 0,
      status: 'warning' as const,
    });
  }

  return breakdown;
}
