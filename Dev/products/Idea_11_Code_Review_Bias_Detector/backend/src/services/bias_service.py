from sqlalchemy.orm import Session
from ..models import PullRequest, Review, Comment
import pandas as pd
import numpy as np
from scipy import stats

class BiasService:
    def __init__(self, db: Session):
        self.db = db

    def detect_anomalies(self, repo_name: str):
        """
        Detects statistical anomalies in reviewer behavior.
        """
        # 1. Fetch data with explicit joins
        reviews = self.db.query(Review).join(PullRequest).filter(PullRequest.repo_name == repo_name).all()
        comments = self.db.query(Comment).join(PullRequest).filter(PullRequest.repo_name == repo_name).all()

        if not reviews:
            return {"alerts": [], "summary": "No evaluation possible - missing review data."}

        # 2. Build DataFrames
        review_data = []
        for r in reviews:
            review_data.append({
                "reviewer": r.reviewer_login,
                "author": r.pull_request.author_login,
                "state": r.state,
                "pr_id": r.pr_id
            })
        df_reviews = pd.DataFrame(review_data)

        comment_data = []
        for c in comments:
            # Tone mapping to numeric value for calculation
            # constructive: 1, neutral: 0, critical: -1, toxic: -2
            tone_map = {"constructive": 1, "neutral": 0, "critical": -1, "toxic": -2, "praise": 2}
            tone_val = tone_map.get(c.sentiment_score, 0)
            
            comment_data.append({
                "reviewer": c.author_login,
                "pr_id": c.pr_id,
                "category": c.category,
                "tone_val": tone_val
            })
        df_comments = pd.DataFrame(comment_data)

        # 3. Aggregate Comment Volume per Review (Approximation: comments by reviewer on that PR)
        # In reality, multiple reviews on one PR. We'll simplify to reviewer-pr pairs.
        if not df_comments.empty:
            vol_stats = df_comments.groupby(['reviewer', 'pr_id']).agg({
                'category': 'count',
                'tone_val': 'mean'
            }).reset_index()
            vol_stats.rename(columns={'category': 'comment_count'}, inplace=True)
            
            # Merge with reviews to get author info
            df_merged = pd.merge(df_reviews, vol_stats, on=['reviewer', 'pr_id'], how='left').fillna(0)
        else:
            df_merged = df_reviews.copy()
            df_merged['comment_count'] = 0
            df_merged['tone_val'] = 0

        # 4. Detect Anomalies
        alerts = []
        
        # Check for Reviewer Consistency (Z-Score on comment count per reviewer)
        for reviewer in df_merged['reviewer'].unique():
            reviewer_subset = df_merged[df_merged['reviewer'] == reviewer]
            if len(reviewer_subset) < 3: continue # Not enough data for stats

            # Average for this reviewer across all authors
            global_avg_comments = reviewer_subset['comment_count'].mean()
            global_std_comments = reviewer_subset['comment_count'].std()

            # Group by author to see if they treat someone differently
            author_groups = reviewer_subset.groupby('author').agg({
                'comment_count': 'mean',
                'state': lambda x: (x == 'CHANGES_REQUESTED').mean()
            })

            for author, row in author_groups.iterrows():
                # If they leave significantly more comments for one author
                if global_std_comments > 0:
                    z_score = (row['comment_count'] - global_avg_comments) / global_std_comments
                    if z_score > 2:
                        alerts.append({
                            "type": "rigor_anomaly",
                            "severity": "medium",
                            "message": f"{reviewer} leaves {row['comment_count']:.1f} avg comments for {author} (Global Avg: {global_avg_comments:.1f})",
                            "reviewer": reviewer,
                            "target_author": author
                        })

                # Check for high rejection rate
                if row['state'] > 0.8 and len(reviewer_subset[reviewer_subset['author'] == author]) >= 2:
                    alerts.append({
                        "type": "rejection_pattern",
                        "severity": "high",
                        "message": f"{reviewer} has rejected {row['state']*100:.0f}% of {author}'s PRs analyzed.",
                        "reviewer": reviewer,
                        "target_author": author
                    })

        return {
            "alerts": alerts,
            "metadata": {
                "reviews_analyzed": len(df_reviews),
                "authors_scanned": len(df_reviews['author'].unique())
            }
        }
