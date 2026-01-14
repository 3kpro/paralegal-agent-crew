import os
import logging
import json
from typing import Tuple, Dict
import anthropic
from .models import ChangeType, Severity

logger = logging.getLogger(__name__)

class ChangeClassifier:
    def __init__(self):
        self.api_key = os.getenv("ANTHROPIC_API_KEY")
        if self.api_key:
            self.client = anthropic.Anthropic(api_key=self.api_key)
        else:
            logger.warning("ANTHROPIC_API_KEY not found. Classifier will return default values.")
            self.client = None

    def classify(self, title: str, description: str) -> Tuple[ChangeType, Severity]:
        """
        Uses Claude API to classify the changelog entry.
        Returns (ChangeType, Severity).
        """
        if not self.client:
            return ChangeType.UNKNOWN, Severity.LOW

        prompt = f"""
        You are an API Change Analyzer. Analyze the following changelog entry:
        
        Title: {title}
        Description: {description}
        
        Task 1: Determine Change Type (choose one):
        - breaking: Backward incompatible changes, removal of endpoints/fields.
        - deprecation: Features marked for future removal.
        - feature: New functionality, endpoints, or parameters.
        - bugfix: Fixes, patches, or optimizations.
        - unknown: If unclear.
        
        Task 2: Determine Severity (choose one):
        - critical: Requires immediate attention (e.g. security fix, removed major endpoint).
        - high: Breaking changes or major deprecations.
        - medium: New features or minor deprecations.
        - low: Bugfixes, documentation, or minor improvements.
        
        Output strictly valid JSON with no markdown formatting:
        {{
            "change_type": "...",
            "severity": "..."
        }}
        """

        try:
            response = self.client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=150,
                temperature=0,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            
            content = response.content[0].text
            # Basic cleanup if model adds markdown
            content = content.replace("```json", "").replace("```", "").strip()
            
            data = json.loads(content)
            
            ct_str = data.get("change_type", "unknown").lower()
            res_str = data.get("severity", "low").lower()
            
            # Map back to Enum
            try:
                change_type = ChangeType(ct_str)
            except ValueError:
                change_type = ChangeType.UNKNOWN

            try:
                severity = Severity(res_str)
            except ValueError:
                severity = Severity.LOW
                
            return change_type, severity

        except Exception as e:
            logger.error(f"Classification failed: {e}")
            return ChangeType.UNKNOWN, Severity.LOW
