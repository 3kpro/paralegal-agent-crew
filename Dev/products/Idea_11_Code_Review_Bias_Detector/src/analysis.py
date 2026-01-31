from sqlalchemy.orm import Session
from sqlalchemy import func
from . import models
import pandas as pd
from datetime import datetime

class Analyzer:
    def __init__(self, db: Session):
        self.db = db

    def get_repo_stats(self, repo_id: int):
        """Calculate high-level repository statistics."""
        # Clean: PR count
        total_prs = self.db.query(models.PullRequest).filter(models.PullRequest.repo_id == repo_id).count()
        
        # Clean: Review Speed (Avg minutes)
        avg_speed = self.db.query(func.avg(models.Review.response_time_minutes))\
            .join(models.PullRequest)\
            .filter(models.PullRequest.repo_id == repo_id)\
            .scalar() or 0
            
        return {
            "total_prs": total_prs,
            "avg_review_speed_hours": round(avg_speed / 60, 1)
        }

    def get_reviewer_matrix(self, repo_id: int):
        """
        Generate a matrix of 'Who Reviews Whom'.
        Returns a list of interactions: {reviewer, author, count}
        """
        results = self.db.query(
            models.Review.reviewer_id,
            models.PullRequest.author_id,
            func.count(models.Review.id).label('count')
        ).join(models.PullRequest)\
         .filter(models.PullRequest.repo_id == repo_id)\
         .group_by(models.Review.reviewer_id, models.PullRequest.author_id)\
         .all()

        matrix = []
        for row in results:
            reviewer = self.db.query(models.User).get(row.reviewer_id)
            author = self.db.query(models.User).get(row.author_id)
            if reviewer and author:
                matrix.append({
                    "reviewer": reviewer.login,
                    "author": author.login,
                    "count": row.count
                })
        
        return matrix

    def detect_anomalies(self, repo_id: int):
        """
        Identify potential bias patterns.
        MVP: Detect if a reviewer is significantly slower/harsher for specific authors.
        """
        # Fetch detailed review data
        query = self.db.query(
            models.Review.reviewer_id,
            models.PullRequest.author_id,
            models.Review.response_time_minutes,
            models.Review.state
        ).join(models.PullRequest)\
         .filter(models.PullRequest.repo_id == repo_id)
         
        df = pd.read_sql(query.statement, self.db.bind)
        
        if df.empty:
            return []

        anomalies = []
        
        # 1. Calculate baseline speed per reviewer
        reviewer_stats = df.groupby('reviewer_id')['response_time_minutes'].mean()
        
        # 2. Check for deviations
        # For each reviewer-author pair, compare to reviewer's baseline
        interactions = df.groupby(['reviewer_id', 'author_id'])['response_time_minutes'].mean().reset_index()
        
        for _, row in interactions.iterrows():
            reviewer_avg = reviewer_stats.get(row['reviewer_id'], 0)
            pair_avg = row['response_time_minutes']
            
            # Simple heuristic: If pair avg is > 2x global avg (and significant time)
            if pair_avg > (reviewer_avg * 2) and pair_avg > 60: # at least 1 hour difference
                reviewer = self.db.query(models.User).get(row['reviewer_id'])
                author = self.db.query(models.User).get(row['author_id'])
                anomalies.append({
                    "type": "slow_review_time",
                    "reviewer": reviewer.login,
                    "author": author.login,
                    "deviation": f"{round(pair_avg/60, 1)}h vs avg {round(reviewer_avg/60, 1)}h",
                    "severity": "medium"
                })

        return anomalies

    def detect_bias(self, repo_id: int):
        """
        Analyze comment interactions to detect potential bias (tone/nitpicks).
        """
        # Fetch comment classification data
        query = self.db.query(
            models.Comment.classification,
            models.Comment.tone,
            models.Comment.author_id.label('reviewer_id'),
            models.PullRequest.author_id.label('pr_author_id')
        ).join(models.PullRequest, models.Comment.pr_id == models.PullRequest.id)\
         .filter(models.PullRequest.repo_id == repo_id)\
         .filter(models.Comment.classification != None)
         
        df = pd.read_sql(query.statement, self.db.bind)
        
        if df.empty:
            return []

        bias_reports = []

        # 1. Analyze "Nitpick" Ratio per Reviewer->Author pair
        # Calculate global nitpick rate per reviewer
        reviewer_nitpicks = df[df['classification'] == 'nitpick'].groupby('reviewer_id').size()
        reviewer_total = df.groupby('reviewer_id').size()
        reviewer_nitpick_rate = (reviewer_nitpicks / reviewer_total).fillna(0)

        # Calculate pair nitpick rate
        pair_nitpicks = df[df['classification'] == 'nitpick'].groupby(['reviewer_id', 'pr_author_id']).size()
        pair_total = df.groupby(['reviewer_id', 'pr_author_id']).size()
        pair_nitpick_rate = (pair_nitpicks / pair_total).fillna(0)

        # 2. Analyze "Harsh" Tone Ratio
        reviewer_harsh = df[df['tone'] == 'harsh'].groupby('reviewer_id').size()
        reviewer_harsh_rate = (reviewer_harsh / reviewer_total).fillna(0)

        pair_harsh = df[df['tone'] == 'harsh'].groupby(['reviewer_id', 'pr_author_id']).size()
        pair_harsh_rate = (pair_harsh / pair_total).fillna(0)

        # Detect deviations
        interactions = pair_total.index.tolist()
        for reviewer_id, pr_author_id in interactions:
            total_comments = pair_total.get((reviewer_id, pr_author_id), 0)
            if total_comments < 3: continue  # Skip insignificant data

            # Nitpick Bias
            base_rate = reviewer_nitpick_rate.get(reviewer_id, 0)
            pair_rate = pair_nitpick_rate.get((reviewer_id, pr_author_id), 0)
            
            if pair_rate > (base_rate + 0.3): # 30% higher than baseline
                reviewer = self.db.query(models.User).get(reviewer_id)
                author = self.db.query(models.User).get(pr_author_id)
                bias_reports.append({
                    "type": "nitpick_focus",
                    "reviewer": reviewer.login,
                    "target": author.login,
                    "metric": f"{round(pair_rate*100)}% nitpicks vs avg {round(base_rate*100)}%",
                    "severity": "high" if pair_rate > 0.8 else "medium"
                })

            # Harshness Bias
            base_harsh = reviewer_harsh_rate.get(reviewer_id, 0)
            pair_harsh_val = pair_harsh_rate.get((reviewer_id, pr_author_id), 0)

            if pair_harsh_val > (base_harsh + 0.2): # 20% harsher than baseline
                reviewer = self.db.query(models.User).get(reviewer_id)
                author = self.db.query(models.User).get(pr_author_id)
                bias_reports.append({
                    "type": "harsh_tone",
                    "reviewer": reviewer.login,
                    "target": author.login,
                    "metric": f"{round(pair_harsh_val*100)}% harsh vs avg {round(base_harsh*100)}%",
                    "severity": "critical"
                })

        return bias_reports
