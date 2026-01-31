from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    github_id = Column(Integer, unique=True, index=True)
    login = Column(String, unique=True, index=True)
    avatar_url = Column(String, nullable=True)
    name = Column(String, nullable=True)
    is_internal = Column(Boolean, default=True)  # To differentiate team members from external contributors

    # Relationships
    prs_authored = relationship("PullRequest", back_populates="author", foreign_keys="PullRequest.author_id")
    reviews_given = relationship("Review", back_populates="reviewer")

class Repository(Base):
    __tablename__ = "repositories"

    id = Column(Integer, primary_key=True, index=True)
    platform = Column(String, default="github")  # github, gitlab
    external_id = Column(Integer, unique=True, index=True) # github_id or gitlab_id
    github_id = Column(Integer, nullable=True) # Kept for backward compat if needed, or alias to external_id
    full_name = Column(String, unique=True, index=True)  # owner/repo
    is_active = Column(Boolean, default=True)
    last_synced_at = Column(DateTime, nullable=True)

    prs = relationship("PullRequest", back_populates="repo")

class PullRequest(Base):
    __tablename__ = "pull_requests"

    id = Column(Integer, primary_key=True, index=True)
    github_id = Column(Integer, unique=True, index=True)
    number = Column(Integer, index=True)
    title = Column(String)
    state = Column(String)  # open, closed, merged
    created_at = Column(DateTime)
    closed_at = Column(DateTime, nullable=True)
    merged_at = Column(DateTime, nullable=True)
    
    # Foreign Keys
    repo_id = Column(Integer, ForeignKey("repositories.id"))
    author_id = Column(Integer, ForeignKey("users.id"))

    # Relationships
    repo = relationship("Repository", back_populates="prs")
    author = relationship("User", back_populates="prs_authored", foreign_keys=[author_id])
    reviews = relationship("Review", back_populates="pr")
    comments = relationship("Comment", back_populates="pr")

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    github_id = Column(Integer, unique=True)
    state = Column(String)  # APPROVED, CHANGES_REQUESTED, COMMENTED, PASSED
    submitted_at = Column(DateTime)
    
    # Metrics
    response_time_minutes = Column(Float, nullable=True)  # Time from PR open/update to review

    # Foreign Keys
    pr_id = Column(Integer, ForeignKey("pull_requests.id"))
    reviewer_id = Column(Integer, ForeignKey("users.id"))

    # Relationships
    pr = relationship("PullRequest", back_populates="reviews")
    reviewer = relationship("User", back_populates="reviews_given")
    comments = relationship("Comment", back_populates="review")

class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    github_id = Column(Integer, unique=True)
    body = Column(Text)
    created_at = Column(DateTime)
    
    # AI Classification (populated later)
    classification = Column(String, nullable=True)  # e.g., 'nitpick', 'logic', 'style', 'praise'
    tone = Column(String, nullable=True)  # e.g., 'constructive', 'harsh', 'neutral'
    
    # Foreign Keys
    pr_id = Column(Integer, ForeignKey("pull_requests.id"))
    review_id = Column(Integer, ForeignKey("reviews.id"), nullable=True)
    author_id = Column(Integer, ForeignKey("users.id"))

    # Relationships
    pr = relationship("PullRequest", back_populates="comments")
    review = relationship("Review", back_populates="comments")
