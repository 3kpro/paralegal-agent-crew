
import gitlab
from sqlalchemy.orm import Session
from ..models import PullRequest, Review, Comment
from datetime import datetime
import dateutil.parser

class GitLabIngestionService:
    def __init__(self, token: str, db: Session):
        self.gl = gitlab.Gitlab("https://gitlab.com", private_token=token)
        self.db = db

    def ingest_repo_history(self, repo_name: str, limit: int = 50):
        """
        Fetches Merge Requests, Discussions, and Approvals from a GitLab project.
        """
        project = self.gl.projects.get(repo_name)
        # state='merged' or 'closed' to match GitHub state='closed'
        mrs = project.mergerequests.list(state='merged', order_by='created_at', sort='desc', get_all=False, per_page=limit)
        
        ingested_count = 0
        from concurrent.futures import ThreadPoolExecutor, as_completed

        def process_mr(mr_data):
            try:
                # Check exists
                # We use github_id column as a generic remote_id
                exists = self.db.query(PullRequest).filter(PullRequest.github_id == mr_data.id).first()
                if exists:
                    return 0

                # Create PR entry
                created_at = dateutil.parser.parse(mr_data.created_at)
                merged_at = dateutil.parser.parse(mr_data.merged_at) if mr_data.merged_at else None
                closed_at = dateutil.parser.parse(mr_data.closed_at) if mr_data.closed_at else None
                
                pr = PullRequest(
                    github_id=mr_data.id,
                    number=mr_data.iid,
                    repo_name=repo_name,
                    title=mr_data.title,
                    author_login=mr_data.author['username'],
                    state=mr_data.state,
                    created_at=created_at,
                    merged_at=merged_at,
                    closed_at=closed_at or merged_at
                )
                self.db.add(pr)
                self.db.commit()
                self.db.refresh(pr)

                # Fetch Discussions (Notes)
                notes = mr_data.notes.list(get_all=True)
                for note in notes:
                    if note.system: # Skip system notes like "merged by..."
                        # But we can use system notes to find approvals if MR doesn't have approval API access
                        if "approved" in note.body.lower():
                            self.db.add(Review(
                                github_id=note.id, # Using note ID as review ID for approvals
                                pr_id=pr.id,
                                reviewer_login=note.author['username'],
                                state="APPROVED",
                                submitted_at=dateutil.parser.parse(note.created_at)
                            ))
                        continue
                    
                    self.db.add(Comment(
                        github_id=note.id,
                        pr_id=pr.id,
                        author_login=note.author['username'],
                        body=note.body,
                        created_at=dateutil.parser.parse(note.created_at)
                    ))
                
                self.db.commit()
                return 1
            except Exception as e:
                print(f"Error processing MR {mr_data.iid}: {e}")
                self.db.rollback()
                return 0

        # Parallel processing
        with ThreadPoolExecutor(max_workers=5) as executor:
            futures = [executor.submit(process_mr, mr) for mr in mrs]
            for future in as_completed(futures):
                ingested_count += future.result()
                
        return {"features": ingested_count, "repo": repo_name}
