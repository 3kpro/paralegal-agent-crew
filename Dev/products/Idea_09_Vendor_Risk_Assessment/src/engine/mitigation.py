import os
import anthropic
from typing import List, Optional

class MitigationGenerator:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")
        self.client = anthropic.Anthropic(api_key=self.api_key) if self.api_key else None

    def suggest_mitigation(self, control_name: str, control_description: str) -> str:
        """
        Generates a concise mitigation plan for a failed security control.
        """
        if not self.client:
            return "Mitigation plan: [MOCK] Implement the required security control immediately."

        prompt = f"""You are a senior security consultant. A vendor has failed a security control during a risk assessment.
Your task is to provide a 2-3 sentence remediation plan that the vendor (or the company using the vendor) should follow to mitigate this risk.

CONTROL: {control_name}
DESCRIPTION: {control_description}

Provide only the remediation plan, professional and concise.
"""

        try:
            message = self.client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=150,
                temperature=0,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            return message.content[0].text.strip()
        except Exception as e:
            return f"Error generating mitigation: {str(e)}"
