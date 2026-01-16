import httpx
from sqlalchemy.orm import Session
from datetime import datetime
from . import models

GITLAB_API_BASE = "https://gitlab.com/api/v4"

class GitLabIngestor:
    def __init__(self, token: str, db: Session):
        self.client = httpx.AsyncClient(
            base_url=GITLAB_API_BASE,
            headers={
                "Private-Token": token,
            }
        )
        self.db = db

    async def ingest_project(self, project_id: str):
        # 1. Get or Create Project (Repo)
        # Handle project_id which can be numeric or URL-encoded path
        safe_id = project_id.replace('/', '%2F')
        
        resp = await self.client.get(f"/projects/{safe_id}")
        if resp.status_code != 200:
            raise Exception(f"Failed to fetch project: {resp.text}")
        project_data = resp.json()
        
        full_name = project_data['path_with_namespace']
        repo = self.db.query(models.Repository).filter(models.Repository.full_name == full_name).first()
        
        if not repo:
            repo = models.Repository(
                external_id=project_data['id'],
                platform="gitlab",
                full_name=full_name,
                is_active=True
            )
            self.db.add(repo)
            self.db.commit()
            self.db.refresh(repo)

        # 2. Ingest Merge Requests (PRs)
        mrs_resp = await self.client.get(f"/projects/{safe_id}/merge_requests", params={"state": "all", "per_page": 50})
        mrs_data = mrs_resp.json()

        for mr_item in mrs_data:
            await self._process_mr(repo, mr_item)

        repo.last_synced_at = datetime.utcnow()
        self.db.commit()
        return {"status": "success", "processed_mrs": len(mrs_data)}

    async def _process_mr(self, repo: models.Repository, mr_data: dict):
        # Handle Author
        author = self._get_or_create_user(mr_data['author'])
        
        # Upsert PR (MR)
        # Currently mapping MR IID to number, and ID to github_id (or external_id)
        # Note: We reused 'github_id' column in models for external_id logic or need to update model usage.
        # For this MVP, assuming 'github_id' column is used as generic ID or we added external_id.
        # Let's use 'github_id' field in model as the external generic ID catch-all for now if models not fully migrated,
        # OR use the new 'external_id' if we trust the previous step added it.
        # Im using external_id.
        
        pr = self.db.query(models.PullRequest).filter(models.PullRequest.github_id == mr_data['id']).first()
        if not pr:
            pr = models.PullRequest(
                github_id=mr_data['id'], # Using ID as unique key
                repo_id=repo.id,
                number=mr_data['iid']
            )
        
        pr.title = mr_data['title']
        pr.state = 'open' if mr_data['state'] == 'opened' else mr_data['state'] # Map to generic
        pr.created_at = datetime.fromisoformat(mr_data['created_at'].replace('Z', '+00:00'))
        pr.closed_at = datetime.fromisoformat(mr_data['closed_at'].replace('Z', '+00:00')) if mr_data.get('closed_at') else None
        pr.merged_at = datetime.fromisoformat(mr_data['merged_at'].replace('Z', '+00:00')) if mr_data.get('merged_at') else None
        pr.author_id = author.id
        
        self.db.add(pr)
        self.db.commit()
        self.db.refresh(pr)

        # 3. Ingest Reviews (Notes/Discussions)
        # GitLab structure is different: Reviews are often just notes or "approvals"
        # Fetching approvals for Reviewer mapping
        approvals_resp = await self.client.get(f"/projects/{repo.external_id}/merge_requests/{pr.number}/approvals")
        if approvals_resp.status_code == 200:
            approvals_data = approvals_resp.json()
            # In Gitlab explicit approvals are easier to track as "APPROVED" reviews
            for approver in approvals_data.get('approved_by', []):
                self._create_approval_review(pr, approver['user'], approvals_data.get('updated_at'))
        
        # Fetch Notes (Comments)
        notes_resp = await self.client.get(f"/projects/{repo.external_id}/merge_requests/{pr.number}/notes", params={"sort": "asc"})
        if notes_resp.status_code == 200:
            for note in notes_resp.json():
                if note.get('system'): continue # Skip system notes
                await self._process_note(pr, note)

    def _create_approval_review(self, pr: models.PullRequest, user_data: dict, date_str: str):
        reviewer = self._get_or_create_user(user_data)
        # Check if exists
        # Review ID is tricky since approvals don't have unique IDs in the same way. 
        # We can synthesize one or just upsert based on PR+User.
        review = self.db.query(models.Review).filter(
            models.Review.pr_id == pr.id, 
            models.Review.reviewer_id == reviewer.id,
            models.Review.state == 'APPROVED'
        ).first()

        if not review:
            review = models.Review(
                github_id=int(f"999{pr.id}{reviewer.id}"), # Synthetic ID
                pr_id=pr.id,
                reviewer_id=reviewer.id,
                state='APPROVED',
                submitted_at=datetime.fromisoformat(date_str.replace('Z', '+00:00')) if date_str else datetime.utcnow()
            )
            # Calc speed
            if review.submitted_at and pr.created_at:
                delta = review.submitted_at - pr.created_at
                review.response_time_minutes = delta.total_seconds() / 60
            
            self.db.add(review)
            self.db.commit()

    async def _process_note(self, pr: models.PullRequest, note_data: dict):
        author = self._get_or_create_user(note_data['author'])
        
        comment = self.db.query(models.Comment).filter(models.Comment.github_id == note_data['id']).first()
        if not comment:
            comment = models.Comment(
                github_id=note_data['id'],
                pr_id=pr.id,
                author_id=author.id,
                body=note_data['body'],
                created_at=datetime.fromisoformat(note_data['created_at'].replace('Z', '+00:00'))
            )
            self.db.add(comment)
            self.db.commit()

    def _get_or_create_user(self, user_data: dict) -> models.User:
        user = self.db.query(models.User).filter(models.User.github_id == user_data['id']).first()
        if not user:
            user = models.User(
                github_id=user_data['id'],
                login=user_data['username'],
                avatar_url=user_data['avatar_url'],
                name=user_data['name']
            )
            self.db.add(user)
            self.db.commit()
            self.db.refresh(user)
        return user
