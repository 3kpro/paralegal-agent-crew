from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import PullRequest, Review, Comment
from ..dependencies import get_current_user

router = APIRouter(prefix="/settings", tags=["settings"])

@router.delete("/nuke")
def nuke_data(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    DANGER: Deletes ALL data from the database.
    This includes all comments, reviews, and pull requests.
    Only allows access to authenticated users.
    """
    try:
        # Delete in order of dependencies to avoid foreign key constraint violations
        # Comments depend on Reviews and PRs
        # Reviews depend on PRs
        
        # Delete all comments
        db.query(Comment).delete()
        
        # Delete all reviews
        db.query(Review).delete()
        
        # Delete all pull requests
        db.query(PullRequest).delete()
        
        db.commit()
        
        return {"message": "All data has been successfully deleted."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to nuke data: {str(e)}")
