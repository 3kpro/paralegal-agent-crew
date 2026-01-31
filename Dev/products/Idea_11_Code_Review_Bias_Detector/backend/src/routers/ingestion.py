from fastapi import APIRouter, Depends, HTTPException, Header, BackgroundTasks
from sqlalchemy.orm import Session
from ..database import get_db
from ..services.github_service import GitHubIngestionService
from ..services.gitlab_service import GitLabIngestionService
from ..dependencies import verify_subscription
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/ingest", tags=["ingest"])

class IngestRequest(BaseModel):
    repo_name: str
    limit: int = 20
    platform: Optional[str] = "github" # "github" or "gitlab"

@router.post("/")
def ingest_history(
    request: IngestRequest,
    x_github_token: str = Header(None),
    x_gitlab_token: str = Header(None),
    db: Session = Depends(get_db),
    user = Depends(verify_subscription)
):
    """
    Triggers PRO ingestion of PR/MR history for a repo.
    """
    platform = request.platform.lower() if request.platform else "github"
    
    if platform == "github":
        if not x_github_token:
            raise HTTPException(status_code=400, detail="Missing X-GitHub-Token header")
        service = GitHubIngestionService(x_github_token, db)
    elif platform == "gitlab":
        if not x_gitlab_token:
            raise HTTPException(status_code=400, detail="Missing X-GitLab-Token header")
        service = GitLabIngestionService(x_gitlab_token, db)
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported platform: {platform}")
    
    try:
        result = service.ingest_repo_history(request.repo_name, request.limit)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

