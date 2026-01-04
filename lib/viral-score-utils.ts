/**
 * Viral Score™ Client-Safe Utilities
 *
 * Pure functions that can be used in both client and server components.
 * Does not import any server-only dependencies.
 */

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

export function getViralPotentialFromScore(score: number): 'high' | 'medium' | 'low' {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}
