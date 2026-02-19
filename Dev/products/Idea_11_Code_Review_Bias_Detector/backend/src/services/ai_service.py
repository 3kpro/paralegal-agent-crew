import google.generativeai as genai
from sqlalchemy.orm import Session
from ..models import Comment
from ..config import settings
import json

class AIService:
    def __init__(self, db: Session):
        self.db = db
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-1.5-flash')

    def classify_comments(self, repo_name: str, limit: int = 20):
        """
        Classifies unclassified comments in a repo.
        """
        # Fetch unclassified comments
        comments = self.db.query(Comment).join(Comment.pull_request)\
            .filter(Comment.pull_request.has(repo_name=repo_name))\
            .filter(Comment.category == None)\
            .limit(limit).all()

        if not comments:
            return {"status": "no_comments_to_classify"}

        # Prepare prompt
        comments_text = "\n".join([f"ID {c.id}: {c.body}" for c in comments])
        
        prompt = f"""
        Analyze the following code review comments. For each comment, determine:
        1. Category (nitpick, question, suggestion, praise, blocking)
        2. Tone (constructive, neutral, critical, toxic)

        Output as a JSON object where keys are the ID and values are objects with 'category' and 'tone'.

        Comments:
        {comments_text}
        """

        try:
            system_prompt = "You are an expert engineering manager analyzing code review dynamics."
            full_prompt = f"{system_prompt}\n\n{prompt}"

            message = self.model.generate_content(
                full_prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0,
                    max_output_tokens=2000
                )
            )

            # Extract JSON from response
            response_text = message.text
            # Simple heuristic to extract JSON if Claude adds text around it
            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            if json_start != -1 and json_end != -1:
                results = json.loads(response_text[json_start:json_end])
                
                updated_count = 0
                for comment_id_str, result in results.items():
                    comment_id = int(comment_id_str.replace("ID ", ""))
                    comment = next((c for c in comments if c.id == comment_id), None)
                    if comment:
                        comment.category = result.get('category')
                        comment.sentiment_score = result.get('tone') # Using sentiment_score column for tone
                        updated_count += 1
                
                self.db.commit()
                return {"classified": updated_count}
            else:
                 return {"error": "Failed to parse AI response"}

        except Exception as e:
            return {"error": str(e)}

    def generate_insights(self, repo_name: str, context_data: dict):
        """
        Generates structured insights based on repo metrics.
        """
        prompt = f"""
        Analyze the following code review metrics for repository '{repo_name}' and identify the top 3-5 most critical insights or patterns.
        Focus on:
        - Bottlenecks (slow merge times, stale PRs)
        - Reviewer load imbalance
        - Nitpicky behavior vs value-add
        - Bias or unfair patterns
        
        Metrics:
        {json.dumps(context_data, indent=2)}
        
        Output strictly as a JSON list of objects with the following schema:
        [
            {{
                "type": "alert" | "opportunity" | "praise",
                "title": "Short title",
                "message": "One sentence explanation",
                "severity": "high" | "medium" | "low"
            }}
        ]
        """
        
        try:
            full_prompt = f"You are an expert engineering management consultant.\n\n{prompt}"
            message = self.model.generate_content(
                full_prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.2,
                    response_mime_type="application/json"
                )
            )
            return json.loads(message.text)
        except Exception as e:
            print(f"AI Insight Generation Error: {e}")
            return []

    def ask_question(self, repo_name: str, question: str, context_data: dict):
        """
        Answers a user question based on repo metrics.
        """
        prompt = f"""
        Context (Metrics for {repo_name}):
        {json.dumps(context_data, indent=2)}
        
        User Question: "{question}"
        
        Answer the question concisely based on the data provided. If the data doesn't support an answer, say so.
        """
        
        try:
            full_prompt = f"You are a helpful data analyst for engineering teams.\n\n{prompt}"
            message = self.model.generate_content(full_prompt)
            return {"answer": message.text}
        except Exception as e:
            return {"error": str(e)}
