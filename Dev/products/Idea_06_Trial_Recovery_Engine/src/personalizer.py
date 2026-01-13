import os
import json
from typing import Dict, Any, List
from .models.domain import User, Classification, Event

class AIPersonalizer:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")

    def personalize_template(self, user: User, classification: Classification, events: List[Event], template: Dict[str, str]) -> Dict[str, str]:
        """
        Uses an LLM to rewrite an email template to be highly personalized based on user behavior.
        """
        behavior_facts = self._extract_behavior_facts(events)
        
        prompt = f"""
        You are a growth marketing expert specializing in SaaS trial recovery.
        Rewrite the following email template to feel 1:1 and highly personalized for this specific user.

        USER CONTEXT:
        - Name: {user.name or "User"}
        - Email: {user.email}
        - Abandonment Category: {classification.category.value}
        - AI Diagnosis: {classification.reasoning}

        SPECIFIC BEHAVIORAL DATA:
        {behavior_facts}

        ORIGINAL TEMPLATE:
        Subject: {template['subject']}
        Body: {template['body']}

        GUIDELINES:
        1. Keep the same core offer/call-to-action as the original template.
        2. Reference specific actions they took (or didn't take) from the behavioral data.
        3. Match the tone of a helpful founder/customer success lead.
        4. Do NOT sound like a bot. Avoid "Our records show".
        5. Output ONLY the new subject and body in JSON format.

        OUTPUT FORMAT:
        {{
            "subject": "New Subject",
            "body": "New Body"
        }}
        """

        # Mock logic for demonstration
        # In production: response = client.messages.create(prompt=prompt, ...)
        # return json.loads(response.content)
        
        return self._get_mock_personalization(user, classification, template)

    def _extract_behavior_facts(self, events: List[Event]) -> str:
        if not events:
            return "- User signed up but no other actions recorded."
        
        # Simple extraction for the prompt
        facts = []
        event_counts = {}
        for e in events:
            event_counts[e.event_name] = event_counts.get(e.event_name, 0) + 1
            
        for name, count in event_counts.items():
            facts.append(f"- Triggered '{name}' {count} times.")
            
        return "\n".join(facts)

    def _get_mock_personalization(self, user: User, classification: Classification, template: Dict[str, str]) -> Dict[str, str]:
        """
        Returns a slightly modified version of the template to simulate AI personalization.
        """
        name = user.name or "there"
        
        if classification.category == "price":
            return {
                "subject": f"Quick question about your {name} trial",
                "body": f"Hi {name}, I saw you were checking out our pricing page a few times recently. I'd love to make sure the value is clear before you make a decision. {template['body']}"
            }
        
        if classification.category == "confused":
            return {
                "subject": f"Can I help you set up, {name}?",
                "body": f"Hi {name}, I noticed you hit a bit of a wall during setup. Most people find that a quick 10-minute chat clears things up. {template['body']}"
            }

        return {
            "subject": f"Personalized: {template['subject']}",
            "body": f"Hi {name}, {template['body']} (Tailored based on {classification.category.value})"
        }
