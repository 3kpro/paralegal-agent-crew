from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..services.analysis_service import AnalysisService
from ..dependencies import verify_subscription

router = APIRouter(prefix="/analysis", tags=["analysis"])

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
