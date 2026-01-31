
import pytest
from unittest.mock import MagicMock
from datetime import datetime, timedelta
from src.services.analysis_service import AnalysisService
from src.models import PullRequest, Review, Comment

@pytest.fixture
def mock_db():
    return MagicMock()

def test_get_health_check_metrics(mock_db):
    service = AnalysisService(mock_db)
    repo_name = "test-repo"

    # Mock Data
    now = datetime.now()
    
    # PR 1: Created 2 hours ago, first comment 1 hour ago (Pickup: 1 hour)
    pr1 = PullRequest(
        repo_name=repo_name, 
        created_at=now - timedelta(hours=2), 
        author_login="author1",
        comments=[] # Will fill below
    )
    
    # PR 2: Created 5 hours ago, first comment 2 hours ago (Pickup: 3 hours)
    pr2 = PullRequest(
        repo_name=repo_name,
        created_at=now - timedelta(hours=5),
        author_login="author2",
        comments=[]
    )

    # Comments
    c1 = Comment(
        category="nitpick", 
        author_login="reviewer1", 
        created_at=now - timedelta(hours=1)
    )
    pr1.comments = [c1] # Attach to PR for pickup calc

    c2 = Comment(
        category="question", 
        author_login="reviewer1", 
        created_at=now - timedelta(hours=2)
    )
    pr2.comments = [c2]

    c3 = Comment(
        category="nitpick", 
        author_login="reviewer2", 
        created_at=now - timedelta(hours=0.5)
    )
    # Just a standalone comment for stats
    
    all_prs = [pr1, pr2]
    all_comments = [c1, c2, c3]

    # Mock DB Query results
    # Query(PullRequest)
    mock_db.query.return_value.filter.return_value.all.side_effect = [all_prs, all_comments]
    # Note: verify implementation query order. 
    # AnalysisService.get_health_check_metrics calls:
    # 1. prs = self.db.query(PullRequest)...
    # 2. comments = self.db.query(Comment)...
    
    # So side_effect order [all_prs, all_comments] should work if the query objects are distinct enough 
    # or if we mock the chain better. 
    # Let's mock properly based on the class types if possible, or just be simple.
    
    # Simpler Mocking Strategy relying on call order which we saw in source:
    # prs = ... .all()
    # comments = ... .all()
    # Simpler Mocking Strategy relying on call order which we saw in source:
    # prs = ... .all()
    # comments = ... .all()
    mock_query = mock_db.query.return_value
    # Fix: join() must return the same query object so chains continue to the same filter
    mock_query.join.return_value = mock_query
    
    mock_filter = mock_query.filter.return_value
    mock_filter.all.side_effect = [all_prs, all_comments]

    # Execute
    metrics = service.get_health_check_metrics(repo_name)

    # Assertions
    
    # Nitpick %
    # Total comments: 3. Nitpicks: 2. % = 66.67
    assert metrics["nitpick_percentage"] == 66.67
    
    # Top Reviewers
    # reviewer1: 2 comments
    # reviewer2: 1 comment
    top_reviewers = metrics["top_reviewers"]
    assert top_reviewers[0]["login"] == "reviewer1"
    assert top_reviewers[0]["comments"] == 2
    assert top_reviewers[1]["login"] == "reviewer2"
    assert top_reviewers[1]["comments"] == 1
    
    # Average Pickup Time
    # PR1: 1 hour
    # PR2: 3 hours
    # Avg: 2 hours
    assert metrics["average_pickup_time"] == 2.0

