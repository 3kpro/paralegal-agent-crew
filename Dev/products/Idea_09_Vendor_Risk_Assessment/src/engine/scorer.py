from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from .framework import RiskFramework, RiskControl, STANDARD_FRAMEWORK
from .mitigation import MitigationGenerator

@dataclass
class Finding:
    control_id: str
    is_satisfied: bool
    confidence: float
    evidence: str  # Snippet or Source
    mitigation_plan: Optional[str] = None

@dataclass
class ScoreResult:
    total_score: float  # 0-100
    max_score: float
    details: List[Finding]
    framework_name: str

class RiskScorer:
    def __init__(self, framework: RiskFramework = STANDARD_FRAMEWORK, use_ai: bool = False):
        self.framework = framework
        self.use_ai = use_ai
        self.mitigation_gen = MitigationGenerator()

    def evaluate(self, 
                 certs: List[str], 
                 text_corpus: str = "") -> ScoreResult:
        """
        Evaluate vendor risk based on known certs and available text corpus 
        (from scraped snippets or parsed docs).
        """
        findings = []
        earned_score = 0.0
        total_possible = sum(c.weight for c in self.framework.controls)
        
        text_lower = text_corpus.lower()
        certs_lower = [c.lower() for c in certs]

        for control in self.framework.controls:
            satisfied = False
            evidence = ""
            confidence = 0.0
            mitigation_plan = None
            
            # Check Certs first (High Confidence)
            for cert in certs_lower:
                if any(k.lower() in cert for k in control.keywords):
                    satisfied = True
                    confidence = 1.0
                    evidence = f"Certificate found: {cert}"
                    break
            
            # Check Text Corpus (Medium Confidence)
            if not satisfied and text_lower:
                # Naive Keyword match
                for keyword in control.keywords:
                    k_lower = keyword.lower()
                    if k_lower in text_lower:
                        satisfied = True
                        confidence = 0.7  # Lower confidence since it's just text mention
                        evidence = f"Keyword match in documents: '{keyword}'"
                        break
            
            if satisfied:
                earned_score += control.weight
            else:
                # Generate mitigation suggestion if AI enabled and control failed
                if self.use_ai:
                    mitigation_plan = self.mitigation_gen.suggest_mitigation(
                        control.name, 
                        control.description
                    )
                else:
                    mitigation_plan = f"Remediate {control.name} to improve security posture."
            
            findings.append(Finding(
                control_id=control.id,
                is_satisfied=satisfied,
                confidence=confidence,
                evidence=evidence,
                mitigation_plan=mitigation_plan
            ))

        final_score = (earned_score / total_possible * 100.0) if total_possible > 0 else 0.0

        return ScoreResult(
            total_score=round(final_score, 2),
            max_score=100.0,
            details=findings,
            framework_name=self.framework.name
        )
