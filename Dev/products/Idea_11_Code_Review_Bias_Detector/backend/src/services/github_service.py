from github import Github
from sqlalchemy.orm import Session
from ..models import PullRequest, Review, Comment
from datetime import datetime

class GitHubIngestionService:
    def __init__(self, token: str, db: Session):
        self.github = Github(token)
        self.db = db

    def ingest_repo_history(self, repo_name: str, limit: int = 50):
        """
        Fetches PRs, Reviews, and Comments from a GitHub repo using parallelism.
        """
        repo = self.github.get_repo(repo_name)
        prs = repo.get_pulls(state='closed', sort='created', direction='desc')[:limit]
        
        ingested_count = 0
        from concurrent.futures import ThreadPoolExecutor, as_completed

        # Define processing function for a single PR
        def process_pr(pr_data):
            try:
                # Check exist strictly to avoid constraint errors
                exists = self.db.query(PullRequest).filter(PullRequest.github_id == pr_data.id).first()
                if exists:
                    return 0

                # Create PR
                pr = PullRequest(
                    github_id=pr_data.id,
                    number=pr_data.number,
                    repo_name=repo_name,
                    title=pr_data.title,
                    author_login=pr_data.user.login,
                    state=pr_data.state,
                    created_at=pr_data.created_at,
                    closed_at=pr_data.closed_at,
                    merged_at=pr_data.merged_at
                )
                self.db.add(pr)
                self.db.commit() 
                self.db.refresh(pr)

                # Fetch Reviews & Comments in parallel if needed, or just fetch them here linearly per PR
                # Linear per PR is fine if we parallelize across PRs
                
                # Reviews
                reviews = pr_data.get_reviews()
                for review_data in reviews:
                    self.db.add(Review(
                        github_id=review_data.id,
                        pr_id=pr.id,
                        reviewer_login=review_data.user.login if review_data.user else "ghost",
                        state=review_data.state,
                        submitted_at=review_data.submitted_at
                    ))

                # Comments
                comments = pr_data.get_review_comments()
                for comment_data in comments:
                    self.db.add(Comment(
                        github_id=comment_data.id,
                        pr_id=pr.id,
                        author_login=comment_data.user.login if comment_data.user else "ghost",
                        body=comment_data.body,
                        created_at=comment_data.created_at
                    ))
                
                self.db.commit()
                return 1
            except Exception as e:
                print(f"Error processing PR {pr_data.number}: {e}")
                self.db.rollback()
                return 0

        # Execute in parallel
        with ThreadPoolExecutor(max_workers=5) as executor:
            futures = [executor.submit(process_pr, pr) for pr in prs]
            for future in as_completed(futures):
                ingested_count += future.result()
            
        return {"features": ingested_count, "repo": repo_name}
