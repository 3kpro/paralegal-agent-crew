from typing import List, Optional
from dataclasses import dataclass
import os
import anthropic

@dataclass
class Answer:
    question: str
    answer: str
    confidence: str # HIGH, MEDIUM, LOW
    reasoning: str
    sources: List[str]

class AutoFiller:
    def __init__(self, api_key: Optional[str] = None):
        # Allow None for development scaffolding
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")
        self.client = anthropic.Anthropic(api_key=self.api_key) if self.api_key else None

    def generate_answer(self, question: str, context_chunks: List[str]) -> Answer:
        """
        Generates an answer to a security questionnaire question using the provided context chunks.
        """
        if not self.client:
            return Answer(
                question=question,
                answer="[MOCK] Anthropic API key not configured.",
                confidence="LOW",
                reasoning="Missing API Key",
                sources=[]
            )

        # Construct Prompt
        context_str = "\n\n".join([f"Source [{i+1}]: {chunk}" for i, chunk in enumerate(context_chunks)])
        
        prompt = f"""You are a security compliance expert assisting with a vendor risk assessment. 
Your task is to answer the following security questionnaire question based ONLY on the provided context snippets from the vendor's documentation.

CONTEXT:
{context_str}

QUESTION:
{question}

INSTRUCTIONS:
1. Answer the question directly (Yes/No/Partial) followed by a concise explanation.
2. If the context does not contain the answer, state "Insufficient information provided in documents."
3. Cite the Source ID (e.g. [1]) for your answer.
4. Assess your confidence (HIGH/MEDIUM/LOW).

Format your response as:
ANSWER: <text>
CONFIDENCE: <level>
REASONING: <explanation>
SOURCES: <ids>
"""

        try:
            # Call Claude API (using Haiku for speed/cost or Sonnet for reasoning)
            message = self.client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=1000,
                temperature=0,
                system="You are a helpful and precise security analyst.",
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            
            response_text = message.content[0].text
            return self._parse_response(question, response_text)
            
        except Exception as e:
            return Answer(
                question=question,
                answer=f"Error calling AI: {str(e)}",
                confidence="LOW",
                reasoning="API Error",
                sources=[]
            )

    def _parse_response(self, question: str, response_text: str) -> Answer:
        # Simple parsing logic (robustness would be improved in prod)
        lines = response_text.split('\n')
        answer = ""
        confidence = "LOW"
        reasoning = ""
        sources = []
        
        current_section = None
        
        for line in lines:
            if line.startswith("ANSWER:"):
                answer = line.replace("ANSWER:", "").strip()
            elif line.startswith("CONFIDENCE:"):
                confidence = line.replace("CONFIDENCE:", "").strip()
            elif line.startswith("REASONING:"):
                reasoning = line.replace("REASONING:", "").strip()
            elif line.startswith("SOURCES:"):
                 # Extract source IDs
                 src_text = line.replace("SOURCES:", "").strip()
                 # Naive extraction - could use regex
                 sources.append(src_text)
        
        # Fallback if parsing fails (Claude usually robust with structure)
        if not answer: 
            answer = response_text
            
        return Answer(
            question=question,
            answer=answer,
            confidence=confidence,
            reasoning=reasoning,
            sources=sources
        )
