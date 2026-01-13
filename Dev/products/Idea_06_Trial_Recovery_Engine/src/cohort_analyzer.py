from typing import List, Dict
from datetime import datetime
from collections import defaultdict
from src.models.domain import Trial, Conversion, Cohort, TrialStatus

class CohortAnalyzer:
    """
    Analyzes trial retention and recovery rates grouped by signup cohorts (monthly).
    """
    
    def analyze_by_month(self, trials: List[Trial], recoveries: List[Conversion]) -> List[Cohort]:
        # Dictionary to store stats per period: YYYY-MM
        # Structure: { "2023-01": {"total": 10, "converted": 2, "abandoned": 5, "recovered": 1} }
        stats_map = defaultdict(lambda: {"total": 0, "converted": 0, "abandoned": 0, "recovered": 0})
        
        # Set of IDs that were recovered (have a playbook_id in conversion)
        recovered_ids = {r.trial_id for r in recoveries if r.playbook_id}
        
        # 1. Bucket Trials
        for trial in trials:
            period = trial.start_date.strftime("%Y-%m")
            stats_map[period]["total"] += 1
            
            if trial.status == TrialStatus.CONVERTED:
                stats_map[period]["converted"] += 1
            elif trial.status == TrialStatus.ABANDONED:
                stats_map[period]["abandoned"] += 1
            
            # Check for recovery (even if status is CONVERTED now, it might have been recovered)
            if trial.id in recovered_ids:
                stats_map[period]["recovered"] += 1

        # 2. Compute Metrcs & Build Cohorts
        cohorts = []
        org_id = trials[0].org_id if trials else "unknown"
        
        for period, data in stats_map.items():
            total = data["total"]
            abandoned = data["abandoned"]
            
            # Conversion Rate = Converted / Total
            conv_rate = (data["converted"] / total) if total > 0 else 0.0
            
            # Recovery Rate = Recovered / Abandoned (Traditionally), or Recovered / Total?
            # Let's use Recovered / Abandoned (as it measures efficacy of recovery engine)
            # But wait, 'abandoned' count in bucket might be those who *remained* abandoned?
            # If they recovered, their status might now be 'active' or 'converted'.
            # A simpler definition for this MVP: Recovered / Total Signups who had Abandonment Signal?
            # We don't have "Total Abandonment Signals" easily here without joins.
            # Let's stick to Recovered / Total for "Recovery Lift" or Recovered / (Recovered + Remaining Abandoned)
            
            # Simplified: Recovery % = Recovered / Total Signups (shows overall lift)
            # Actually, let's use: Recoveries / Total Signups (easy to understand)
            # Or better: Lift Rate.
            
            rec_rate = (data["recovered"] / total) if total > 0 else 0.0

            cohort = Cohort(
                org_id=org_id,
                period=period,
                total_signups=total,
                conversions=data["converted"],
                recoveries=data["recovered"],
                conversion_rate=round(conv_rate, 3),
                recovery_rate=round(rec_rate, 3)
            )
            cohorts.append(cohort)
            
        # Sort by period descending (newest first)
        return sorted(cohorts, key=lambda x: x.period, reverse=True)
