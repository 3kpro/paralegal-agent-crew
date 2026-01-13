import { Control, Evidence } from '../models/types';

export interface GapReport {
  controlId: string;
  status: 'compliant' | 'gap';
  reason?: string;
  lastEvidenceAt?: Date;
}

export interface GapAnalysisResult {
  totalControls: number;
  compliantControls: number;
  gapCount: number;
  score: number; // 0-100%
  details: GapReport[];
}

/**
 * Analyzes compliance gaps by checking if controls have fresh evidence.
 * @param controls List of all required controls
 * @param evidenceStore List of all collected evidence
 * @param freshnessHours Hours before evidence is considered stale (default 24h)
 */
export const analyzeGaps = (
  controls: Control[], 
  evidenceStore: Evidence[], 
  freshnessHours: number = 24
): GapAnalysisResult => {
  
  const now = new Date();
  const freshnessThreshold = new Date(now.getTime() - (freshnessHours * 60 * 60 * 1000));

  const reports: GapReport[] = controls.map(control => {
    // 1. Find evidence mapped to this control
    const mappedEvidence = evidenceStore.filter(ev => ev.controlIds.includes(control.id));

    if (mappedEvidence.length === 0) {
      return {
        controlId: control.id,
        status: 'gap',
        reason: 'No evidence collected for this control.'
      };
    }

    // 2. Check freshness
    // Find the most recent evidence
    const mostRecent = mappedEvidence.reduce((latest, current) => {
      return latest.capturedAt > current.capturedAt ? latest : current;
    });

    if (mostRecent.capturedAt < freshnessThreshold) {
      return {
        controlId: control.id,
        status: 'gap',
        reason: `Evidence is stale. Last captured: ${mostRecent.capturedAt.toISOString()}`,
        lastEvidenceAt: mostRecent.capturedAt
      };
    }

    return {
      controlId: control.id,
      status: 'compliant',
      lastEvidenceAt: mostRecent.capturedAt
    };
  });

  // Calculate summaries
  const gapCount = reports.filter(r => r.status === 'gap').length;
  const compliantCount = reports.length - gapCount;
  const score = controls.length > 0 
    ? Math.round((compliantCount / controls.length) * 100) 
    : 0;

  return {
    totalControls: controls.length,
    compliantControls: compliantCount,
    gapCount,
    score,
    details: reports
  };
};
