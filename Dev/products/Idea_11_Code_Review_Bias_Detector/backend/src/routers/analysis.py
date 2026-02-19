from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..services.analysis_service import AnalysisService
from ..services.insights_service import InsightsService
from ..services.metrics_service import MetricsService
from ..dependencies import verify_subscription
from pydantic import BaseModel

router = APIRouter(prefix="/analysis", tags=["analysis"])

@router.get("/trends/{repo_name:path}")
def get_analysis_trends(
    repo_name: str,
    days: int = 7,
    db: Session = Depends(get_db),
    user = Depends(verify_subscription)
):
    """
    Get trend metrics for a specific repository.
    """
    try:
        service = AnalysisService(db)
        result = service.get_trends(repo_name, days)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/insights/{repo_name:path}")
def get_repo_insights(
    repo_name: str,
    db: Session = Depends(get_db),
    user = Depends(verify_subscription)
):
    """
    Get AI-generated insights for a repository.
    """
    try:
        service = InsightsService(db)
        insights = service.get_dashboard_insights(repo_name)
        return {"status": "success", "data": insights}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class AskRequest(BaseModel):
    repo_name: str
    question: str

@router.post("/insights/ask")
def ask_ai(
    request: AskRequest,
    db: Session = Depends(get_db),
    user = Depends(verify_subscription)
):
    """
    Ask a question about the repository.
    """
    try:
        service = InsightsService(db)
        answer = service.ask_question(request.repo_name, request.question)
        return {"status": "success", "data": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/metrics/cycle-time/{repo_name:path}")
def get_cycle_time(
    repo_name: str,
    days: int = 30,
    db: Session = Depends(get_db),
    user = Depends(verify_subscription)
):
    """
    Get cycle time metrics for a repository.
    """
    try:
        service = MetricsService(db)
        result = service.calculate_cycle_time(repo_name, days)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/metrics/velocity/{repo_name:path}")
def get_review_velocity(
    repo_name: str,
    days: int = 30,
    db: Session = Depends(get_db),
    user = Depends(verify_subscription)
):
    """
    Get review velocity metrics for a repository.
    """
    try:
        service = MetricsService(db)
        result = service.calculate_review_velocity(repo_name, days)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{repo_name:path}")
def get_analysis(
    repo_name: str,
    db: Session = Depends(get_db),
    user = Depends(verify_subscription)
):
    """
    Get analysis metrics for a specific repository.
    repo_name should be URL encoded if it contains slash, but starlette handles path params usually.
    Actually for 'owner/repo', let's use a query param or handle the path carefully. 
    FastAPI handles paths with slashes if we define it right, but simpler to pass as 'owner/repo' in path 
    Requires {repo_path} to catch all.
    """
    try:
        service = AnalysisService(db)
        result = service.analyze_repo(repo_name)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
