import os
import json
from typing import List
from datetime import datetime
from .models.domain import Event, Classification, AbandonmentCategory, Trial
# Note: In a real app, we'd use an LLM client like Anthropic or OpenAI.
# For this logic, I will structure the prompt and the classification logic.

class ClassificationEngine:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")

    def analyze_behavior(self, trial: Trial, events: List[Event]) -> Classification:
        """
        Analyzes the sequence of events to classify abandonment.
        In a production environment, this would call Claude.
        """
        
        # 1. Prepare data for the prompt
        event_summary = self._summarize_events(events)
        trial_duration = (trial.end_date - trial.start_date).days
        
        prompt = f"""
        Analyze the following SaaS trial behavior and classify the reason for abandonment.
        
        Trial Info:
        - Product: {trial.product_id}
        - Total Duration: {trial_duration} days
        - Status: {trial.status}
        
        Usage Summary:
        {event_summary}
        
        Classify into one of these categories:
        - confused: Started but didn't finish onboarding or core setup.
        - wrong_fit: Used features but not the 'aha' moment ones; usage pattern suggests looking for something else.
        - more_time: High usage early, then a gap, or high usage until the very end.
        - competitor: Spiky usage, visited export/integration pages heavily, then stopped.
        - ghosted: Signed up, maybe logged in once, no meaningful events.
        - price: Active usage, visited pricing page > 2 times.
        
        Return JSON format:
        {{
            "category": "category_name",
            "confidence": 0.0-1.0,
            "reasoning": "multi-sentence explanation based on the event sequence"
        }}
        """
        
        # Mocking the AI response for the logic demonstration
        # In implementation, we'd use: response = anthropic.completions.create(...)
        mock_response = self._get_mock_classification(events)
        
        return Classification(
            trial_id=trial.id,
            category=mock_response["category"],
            confidence=mock_response["confidence"],
            reasoning=mock_response["reasoning"],
            classified_at=datetime.utcnow()
        )

    def _summarize_events(self, events: List[Event]) -> str:
        if not events:
            return "No events recorded."
        
        summary = []
        for e in sorted(events, key=lambda x: x.timestamp):
            summary.append(f"{e.timestamp.isoformat()}: {e.event_name} {json.dumps(e.properties)}")
        
        return "\n".join(summary)

    def _get_mock_classification(self, events: List[Event]) -> dict:
        """
        Heuristic-based mock for testing the engine logic without live API calls.
        """
        event_names = [e.event_name.lower() for e in events]
        
        if not events:
            return {
                "category": AbandonmentCategory.GHOSTED,
                "confidence": 0.9,
                "reasoning": "The user signed up but never triggered a single event."
            }
        
        if "pricing_viewed" in event_names and event_names.count("pricing_viewed") > 2:
            return {
                "category": AbandonmentCategory.PRICE_SENSITIVE,
                "confidence": 0.85,
                "reasoning": "User was active but visited the pricing page 3+ times without converting."
            }
            
        if "onboarding_completed" not in event_names:
            return {
                "category": AbandonmentCategory.CONFUSED,
                "confidence": 0.7,
                "reasoning": "User started the onboarding process but dropped off before completion."
            }
            
        return {
            "category": AbandonmentCategory.WRONG_FIT,
            "confidence": 0.5,
            "reasoning": "General usage pattern detected but no clear signs of conversion intent or specific blockers. Likely not the right solution for their needs."
        }
