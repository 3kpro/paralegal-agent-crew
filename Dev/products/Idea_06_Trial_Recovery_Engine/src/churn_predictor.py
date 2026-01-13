from datetime import datetime
from typing import List
from src.models.domain import Event, ChurnScore, Trial

class ChurnPredictor:
    """
    Predicts churn risk by analyzing behavioral decay and negative signals.
    """
    
    def predict_score(self, trial: Trial, events: List[Event]) -> ChurnScore:
        score = 0.0
        signals = []
        
        now = datetime.utcnow()
        days_in_trial = (now - trial.start_date).days
        
        # 1. Recency Decay
        if trial.last_active_at:
            days_since_active = (now - trial.last_active_at).days
            if days_since_active > 3:
                recency_risk = min(0.4, (days_since_active - 3) * 0.1)
                score += recency_risk
                signals.append(f"Inactivity decay: {days_since_active} days since last event.")
        else:
            score += 0.5
            signals.append("Zero engagement since trial start.")
            
        # 2. Frequency Drop
        if len(events) < 5 and days_in_trial > 2:
            score += 0.2
            signals.append(f"Low engagement frequency: only {len(events)} events in {days_in_trial} days.")
            
        # 3. Specific Negative Signals (e.g., visiting cancel page, low feature adoption)
        for event in events:
            if "cancel" in event.event_name.lower():
                score += 0.3
                signals.append("High-intent churn signal: visited cancellation/downgrade page.")
            if "export" in event.event_name.lower() and days_in_trial > (trial.end_date - trial.start_date).days * 0.8:
                score += 0.15
                signals.append("Data extraction signal: atypical export behavior late in trial.")

        # Normalize score
        score = min(1.0, max(0.0, score))
        
        return ChurnScore(
            trial_id=trial.id,
            org_id=trial.org_id,
            score=round(score, 2),
            signals=signals
        )
