from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..services.ai_service import AIService
from ..dependencies import verify_subscription
from pydantic import BaseModel

router = APIRouter(prefix="/classify", tags=["classify"])

class ClassifyRequest(BaseModel):
    repo_name: str
    limit: int = 50

@router.post("/")
def trigger_classification(
    request: ClassifyRequest,
    db: Session = Depends(get_db),
    user = Depends(verify_subscription)
):
    """
    Triggers AI classification for unclassified comments.
    """
    try:
        service = AIService(db)
        result = service.classify_comments(request.repo_name, request.limit)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
