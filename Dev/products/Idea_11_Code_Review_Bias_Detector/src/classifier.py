import os
import anthropic
from sqlalchemy.orm import Session
from . import models
import json
import asyncio

class CommentClassifier:
    def __init__(self, db: Session):
        self.db = db
        self.client = anthropic.Anthropic(
            api_key=os.getenv("ANTHROPIC_API_KEY")
        )

    async def classify_batch(self, batch_size: int = 20):
        """
        Fetch unclassified comments and classify them using Claude.
        """
        # 1. Fetch unclassified comments
        comments = self.db.query(models.Comment)\
            .filter(models.Comment.classification == None)\
            .limit(batch_size)\
            .all()

        if not comments:
            return 0

        # 2. Prepare prompt
        comments_text = "\n".join([
            f"<comment id='{c.id}'>{c.body}</comment>" 
            for c in comments if len(c.body) > 10 # Skip very short comments
        ])

        if not comments_text:
            return 0

        system_prompt = """
        You are an expert engineering manager analyzing code review comments.
        Classify each comment into one of these categories:
        - nitpick: Formatting, naming, minor style issues.
        - logic: Bugs, race conditions, edge cases, implementation logic.
        - architecture: Design patterns, module boundaries, scalability.
        - praise: Positive feedback, 'good job', 'nice catch'.
        - process: CI/CD, release notes, ticket updates.
        - question: Asking for clarification.

        Also assess the tone:
        - constructive: Helpful, polite, professional.
        - harsh: Aggressive, condescending, rude.
        - neutral: Matter-of-fact, direct.

        Output ONLY JSON in this format:
        {
            "results": [
                {"id": 123, "category": "nitpick", "tone": "neutral"},
                ...
            ]
        }
        """

        try:
            message = self.client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=1024,
                temperature=0,
                system=system_prompt,
                messages=[
                    {"role": "user", "content": comments_text}
                ]
            )
            
            # 3. Parse and Save
            response_content = message.content[0].text
            parsed = json.loads(response_content)
            
            for result in parsed.get("results", []):
                comment_id = result.get("id")
                comment = next((c for c in comments if c.id == int(comment_id)), None)
                if comment:
                    comment.classification = result.get("category")
                    comment.tone = result.get("tone")
            
            self.db.commit()
            return len(parsed.get("results", []))

        except Exception as e:
            print(f"Classification failed: {e}")
            return 0
