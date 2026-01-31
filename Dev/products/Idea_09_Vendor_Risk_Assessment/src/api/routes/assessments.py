from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter()

class AssessmentRequest(BaseModel):
    vendor_domain: str

class AssessmentResponse(BaseModel):
    status: str
    risk_score: int
    findings: List[str]

@router.post("/start", response_model=AssessmentResponse)
async def start_assessment(request: AssessmentRequest):
    # Mock logic
    return {
        "status": "COMPLETED",
        "risk_score": 88,
        "findings": ["No SOC 2 report found active.", "Cookies not compliant."]
    }
