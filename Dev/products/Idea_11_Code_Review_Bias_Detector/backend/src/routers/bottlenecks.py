from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import List, Optional
from ..database import get_db
from ..models import PullRequest, Review
from ..dependencies import verify_subscription

router = APIRouter(prefix="/bottlenecks", tags=["bottlenecks"])

@router.get("/stale-prs")
def get_stale_prs(
    repo_name: Optional[str] = Query(None, description="Filter by repository name"),
    hours_threshold: int = Query(48, description="Hours without review to be considered stale"),
    db: Session = Depends(get_db),
    user = Depends(verify_subscription)
):
    """
    Get list of Pull Requests that are considered bottlenecks.
    Default definition: Open, > 48 hours old, 0 reviews.
    """
    
    # Calculate cutoff time
    cutoff_time = datetime.utcnow() - timedelta(hours=hours_threshold)
    
    # Base query for open PRs created before cutoff
    query = db.query(PullRequest).filter(
        PullRequest.state == 'open',
        PullRequest.created_at < cutoff_time
    )
    
    if repo_name:
        query = query.filter(PullRequest.repo_name == repo_name)
    
    # Logic to filter PRs with 0 reviews
    # We can join with Reviews or use a subquery/not exists, but since we have a relationship:
    # We want PRs where ~PullRequest.reviews.any()
    
    query = query.filter(~PullRequest.reviews.any())
    
    stale_prs = query.all()
    
    result = []
    for pr in stale_prs:
        time_diff = datetime.utcnow() - pr.created_at
        hours_pending = int(time_diff.total_seconds() / 3600)
        
        result.append({
            "id": pr.id,
            "github_id": pr.github_id,
            "number": pr.number,
            "repo_name": pr.repo_name,
            "title": pr.title,
            "author_login": pr.author_login,
            "created_at": pr.created_at,
            "hours_pending": hours_pending,
            "reviews_count": 0, # By definition of this filter
            "status": "stale"
        })
        
    # Sort by staleness (descending hours pending)
    result.sort(key=lambda x: x['hours_pending'], reverse=True)
    
    return {"status": "success", "count": len(result), "data": result}
