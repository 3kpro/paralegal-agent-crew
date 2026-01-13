import logging
import json
from typing import List, Optional
from pydantic import BaseModel
from anthropic import AsyncAnthropic

from ..config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

class ExtractedCommitment(BaseModel):
    description: str
    assignee: Optional[str] = None
    due_date_text: Optional[str] = None
    confidence_score: float

class ExtractionService:
    def __init__(self):
        try:
            self.client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
        except Exception as e:
            logger.error(f"Failed to initialize Anthropic client: {e}")
            self.client = None

    async def extract_commitments(self, transcript_text: str) -> List[ExtractedCommitment]:
        if not self.client:
            logger.error("Anthropic client is not initialized")
            return []

        if not transcript_text:
            return []

        prompt = f"""
You are an expert AI assistant designed to analyze meeting transcripts and extract actionable commitments, promises, and tasks.

Here is the meeting transcript:
<transcript>
{transcript_text}
</transcript>

Your task is to identify specific commitments made by participants. A commitment is a clear promise to do something, usually containing an action verb.

For each commitment found, extract the following:
1. Description: What is the task? (Be concise but specific)
2. Assignee: Who promised to do it? (If clear from context)
3. Due Date: Is there a mentioned timebox or deadline? (e.g., "by Friday", "next week")
4. Confidence Score: How confident are you that this is a firm commitment? (0.0 to 1.0)

Return the result STRICTLY as a JSON array of objects. Do not include any other text, markdown formatting, or explanations. 

Example Output format:
[
    {{
        "description": "Send the Q3 report to the finance team",
        "assignee": "John",
        "due_date_text": "by EOD Friday",
        "confidence_score": 0.95
    }}
]

If no commitments are found, return an empty array: [].
"""

        try:
            response = await self.client.messages.create(
                model="claude-3-opus-20240229",
                max_tokens=2000,
                temperature=0,
                system="You are a precise data extraction engine. Output valid JSON only.",
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            
            content = response.content[0].text.strip()
            
            # Basic cleanup if the model adds markdown code blocks despite instructions
            if content.startswith("```json"):
                content = content[7:]
            if content.endswith("```"):
                content = content[:-3]
            content = content.strip()

            data = json.loads(content)
            
            commitments = []
            for item in data:
                try:
                    commitments.append(ExtractedCommitment(**item))
                except Exception as e:
                    logger.warning(f"Failed to parse commitment item: {item}, error: {e}")
            
            return commitments

        except Exception as e:
            logger.error(f"Commitment extraction failed: {e}")
            # returning empty list on failure to avoid crashing the pipeline
            return []
