import httpx
from sqlalchemy.orm import Session
from datetime import datetime
from . import models, database

GITHUB_API_BASE = "https://api.github.com"

class GitHubIngestor:
    def __init__(self, token: str, db: Session):
        self.client = httpx.AsyncClient(
            base_url=GITHUB_API_BASE,
            headers={
                "Authorization": f"Bearer {token}",
                "Accept": "application/vnd.github.v3+json"
            }
        )
        self.db = db

    async def ingest_repository(self, owner: str, repo_name: str):
        # 1. Get or Create Repository
        full_name = f"{owner}/{repo_name}"
        repo = self.db.query(models.Repository).filter(models.Repository.full_name == full_name).first()
        if not repo:
            # Fetch repo details from GitHub
            resp = await self.client.get(f"/repos/{owner}/{repo_name}")
            if resp.status_code != 200:
                raise Exception(f"Failed to fetch repo: {resp.text}")
            repo_data = resp.json()
            
            repo = models.Repository(
                github_id=repo_data['id'],
                full_name=full_name,
                is_active=True
            )
            self.db.add(repo)
            self.db.commit()
            self.db.refresh(repo)

        # 2. Ingest PRs (fetch last 100 for MVP)
        prs_resp = await self.client.get(f"/repos/{owner}/{repo_name}/pulls", params={"state": "all", "per_page": 50})
        prs_data = prs_resp.json()

        for pr_item in prs_data:
            await self._process_pr(repo, pr_item)

        repo.last_synced_at = datetime.utcnow()
        self.db.commit()
        return {"status": "success", "processed_prs": len(prs_data)}

    async def _process_pr(self, repo: models.Repository, pr_data: dict):
        # Handle Author
        author = self._get_or_create_user(pr_data['user'])
        
        # Upsert PR
        pr = self.db.query(models.PullRequest).filter(models.PullRequest.github_id == pr_data['id']).first()
        if not pr:
            pr = models.PullRequest(
                github_id=pr_data['id'],
                repo_id=repo.id,
                number=pr_data['number']
            )
        
        pr.title = pr_data['title']
        pr.state = pr_data['state']
        pr.created_at = datetime.fromisoformat(pr_data['created_at'].replace('Z', '+00:00'))
        pr.closed_at = datetime.fromisoformat(pr_data['closed_at'].replace('Z', '+00:00')) if pr_data.get('closed_at') else None
        pr.merged_at = datetime.fromisoformat(pr_data['merged_at'].replace('Z', '+00:00')) if pr_data.get('merged_at') else None
        pr.author_id = author.id
        
        self.db.add(pr)
        self.db.commit()
        self.db.refresh(pr)

        # 3. Ingest Reviews
        reviews_resp = await self.client.get(f"/repos/{repo.full_name}/pulls/{pr.number}/reviews")
        if reviews_resp.status_code == 200:
            for review_data in reviews_resp.json():
                await self._process_review(pr, review_data)

    async def _process_review(self, pr: models.PullRequest, review_data: dict):
        if not review_data.get('user'): return # Ghost user

        reviewer = self._get_or_create_user(review_data['user'])
        
        review = self.db.query(models.Review).filter(models.Review.github_id == review_data['id']).first()
        if not review:
            review = models.Review(
                github_id=review_data['id'],
                pr_id=pr.id,
                reviewer_id=reviewer.id
            )
        
        review.state = review_data['state']
        review.submitted_at = datetime.fromisoformat(review_data['submitted_at'].replace('Z', '+00:00'))
        
        # Calculate response time (Naive MVP: Review Time - PR Creation Time)
        # Ideally this should be Time since requested, checking review_requested events
        if review.submitted_at and pr.created_at:
            delta = review.submitted_at - pr.created_at
            review.response_time_minutes = delta.total_seconds() / 60

        self.db.add(review)
        self.db.commit()

    def _get_or_create_user(self, user_data: dict) -> models.User:
        user = self.db.query(models.User).filter(models.User.github_id == user_data['id']).first()
        if not user:
            user = models.User(
                github_id=user_data['id'],
                login=user_data['login'],
                avatar_url=user_data['avatar_url'],
                name=user_data.get('name')
            )
            self.db.add(user)
            self.db.commit()
            self.db.refresh(user)
        return user
