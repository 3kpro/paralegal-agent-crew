from sqlalchemy.orm import Session
from sqlalchemy import func
from ..models import PullRequest, Review, Comment
from .bias_service import BiasService
from .cache_service import CacheService
from datetime import datetime
import pandas as pd
import numpy as np

class AnalysisService:
    def __init__(self, db: Session):
        self.db = db
        self.cache = CacheService()

    def analyze_repo(self, repo_name: str):
        """
        Calculates review patterns and metrics for a repository.
        """
        # Check Cache
        cached_result = self.cache.get_analysis(repo_name)
        if cached_result:
            return cached_result

        # Fetch data
        prs = self.db.query(PullRequest).filter(PullRequest.repo_name == repo_name).all()
        
        if not prs:
            return {"error": "No data found for this repository"}

        # Basic Stats
        total_prs = len(prs)
        merged_prs = sum(1 for pr in prs if pr.merged_at)
        closed_prs = sum(1 for pr in prs if pr.state == 'closed')
        
        # Calculate time-to-merge (for merged PRs)
        merge_times = []
        for pr in prs:
            if pr.merged_at and pr.created_at:
                diff = (pr.merged_at - pr.created_at).total_seconds() / 3600 # hours
                merge_times.append(diff)
        
        avg_time_to_merge_hours = np.mean(merge_times) if merge_times else 0

        # Reviewer Stats
        reviews = self.db.query(Review).join(PullRequest).filter(PullRequest.repo_name == repo_name).all()
        
        reviewer_counts = {}
        for review in reviews:
            login = review.reviewer_login
            reviewer_counts[login] = reviewer_counts.get(login, 0) + 1
            
        # Sort top reviewers
        top_reviewers = sorted(reviewer_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        
        # Bias/Interaction Matrix (Simple version: count of reviews by Reviewer X for Author Y)
        # We can use pandas for this
        interaction_data = []
        for review in reviews:
            interaction_data.append({
                "reviewer": review.reviewer_login,
                "author": review.pull_request.author_login,
                "state": review.state
            })
            
        df = pd.DataFrame(interaction_data)
        
        # If empty
        if df.empty:
            interaction_matrix = {}
        else:
            # Cross tabulation
            matrix = pd.crosstab(df['reviewer'], df['author'])
            # Convert to dict for JSON response
            interaction_matrix = matrix.to_dict()

        # Comment Classification Stats
        comments = self.db.query(Comment).join(PullRequest).filter(PullRequest.repo_name == repo_name).all()
        comment_categories = {}
        comment_tones = {}
        
        for c in comments:
            if c.category:
                comment_categories[c.category] = comment_categories.get(c.category, 0) + 1
            if c.sentiment_score:
                comment_tones[c.sentiment_score] = comment_tones.get(c.sentiment_score, 0) + 1

        # Run Bias Detection
        bias_service = BiasService(self.db)
        bias_results = bias_service.detect_anomalies(repo_name)

        result = {
            "summary": {
                "total_prs": total_prs,
                "merged_prs": merged_prs,
                "merge_rate": round(merged_prs / total_prs, 2) if total_prs > 0 else 0,
                "avg_merge_time_hours": round(avg_time_to_merge_hours, 2)
            },
            "top_reviewers": [{"login": k, "reviews": v} for k, v in top_reviewers],
            "interaction_matrix": interaction_matrix,
            "comment_stats": {
                "categories": comment_categories,
                "tones": comment_tones
            },
            "bias_alerts": bias_results.get("alerts", [])
        }
        
        # Set Cache (1 hour TTL)
        self.cache.set_analysis(repo_name, result, ttl=3600)
        
        return result

    def get_health_check_metrics(self, repo_name: str):
        """
        Calculates executive summary metrics for a repository.
        """
        # Fetch data
        prs = self.db.query(PullRequest).filter(PullRequest.repo_name == repo_name).all()
        comments = self.db.query(Comment).join(PullRequest).filter(PullRequest.repo_name == repo_name).all()
        
        if not prs:
             return {"error": "No data found for this repository"}
            
        # 1. Nitpick Percentage
        total_comments = len(comments)
        nitpick_count = sum(1 for c in comments if c.category == 'nitpick')
        nitpick_percentage = (nitpick_count / total_comments * 100) if total_comments > 0 else 0
        
        # 2. Top Reviewers (by comment count)
        reviewer_comment_counts = {}
        for c in comments:
            login = c.author_login
            if login:
                reviewer_comment_counts[login] = reviewer_comment_counts.get(login, 0) + 1
        
        top_reviewers = sorted(reviewer_comment_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        top_reviewers_list = [{"login": k, "comments": v} for k, v in top_reviewers]

        # 3. Average Pickup Time (time between PR open and first comment)
        pickup_times = []
        for pr in prs:
            if pr.created_at:
                # Find first comment for this PR
                pr_comments = [c for c in pr.comments if c.created_at]
                if pr_comments:
                    first_comment = min(pr_comments, key=lambda c: c.created_at)
                    if first_comment.created_at > pr.created_at:
                        diff = (first_comment.created_at - pr.created_at).total_seconds() / 3600 # hours
                        pickup_times.append(diff)
        
        average_pickup_time = np.mean(pickup_times) if pickup_times else 0
        
        return {
            "nitpick_percentage": round(nitpick_percentage, 2),
            "top_reviewers": top_reviewers_list,
            "average_pickup_time": round(average_pickup_time, 2)
        }

    def get_trends(self, repo_name: str, days: int = 7):
        """
        Calculates daily metrics for the last N days.
        """
        end_date = datetime.utcnow()
        start_date = end_date - pd.Timedelta(days=days)
        
        # Fetch all data once (optimization: filter by date range if DB large, but for MVP fetch all is fine or filter created_at >= start_date)
        # We need data slightly before start_date for pickup time calc, but simple is fine.
        prs = self.db.query(PullRequest).filter(
            PullRequest.repo_name == repo_name,
            PullRequest.created_at >= start_date
        ).all()
        
        # We also need merged PRs in that range, even if created earlier
        merged_prs_query = self.db.query(PullRequest).filter(
            PullRequest.repo_name == repo_name,
            PullRequest.merged_at >= start_date
        ).all()
        
        # Convert to pandas for easier resampling
        dates = pd.date_range(end=end_date, periods=days, freq='D').normalize()
        trends = {
            "dates": [d.strftime("%Y-%m-%d") for d in dates],
            "prs_opened": [],
            "prs_merged": [],
            "avg_merge_time": []
        }
        
        # Pre-process data
        pr_created_dates = [pr.created_at.date() for pr in prs if pr.created_at]
        pr_merged_data = [(pr.merged_at.date(), (pr.merged_at - pr.created_at).total_seconds() / 3600) 
                          for pr in merged_prs_query if pr.merged_at and pr.created_at]
        
        for date in dates:
            d = date.date()
            
            # PRs Opened
            opened_count = sum(1 for pd_date in pr_created_dates if pd_date == d)
            trends["prs_opened"].append(opened_count)
            
            # PRs Merged & Merge Time
            merged_on_day = [m for m in pr_merged_data if m[0] == d]
            trends["prs_merged"].append(len(merged_on_day))
            
            if merged_on_day:
                avg_time = np.mean([m[1] for m in merged_on_day])
                trends["avg_merge_time"].append(round(avg_time, 2))
            else:
                trends["avg_merge_time"].append(0)
                
        return trends

