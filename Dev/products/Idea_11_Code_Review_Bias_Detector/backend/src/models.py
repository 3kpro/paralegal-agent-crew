from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

class PullRequest(Base):
    __tablename__ = "pull_requests"

    id = Column(Integer, primary_key=True, index=True)
    github_id = Column(Integer, unique=True, index=True)
    number = Column(Integer)
    repo_name = Column(String, index=True)
    title = Column(String)
    author_login = Column(String, index=True)
    state = Column(String)
    created_at = Column(DateTime)
    closed_at = Column(DateTime, nullable=True)
    merged_at = Column(DateTime, nullable=True)
    
    reviews = relationship("Review", back_populates="pull_request")
    comments = relationship("Comment", back_populates="pull_request")

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    github_id = Column(Integer, unique=True)
    pr_id = Column(Integer, ForeignKey("pull_requests.id"))
    reviewer_login = Column(String, index=True)
    state = Column(String) # APPROVED, CHANGES_REQUESTED, COMMENTED
    submitted_at = Column(DateTime)
    
    pull_request = relationship("PullRequest", back_populates="reviews")
    comments = relationship("Comment", back_populates="review")

class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    github_id = Column(Integer, unique=True)
    pr_id = Column(Integer, ForeignKey("pull_requests.id"))
    review_id = Column(Integer, ForeignKey("reviews.id"), nullable=True)
    author_login = Column(String)
    body = Column(Text)
    created_at = Column(DateTime)
    
    # Analysis fields (to be filled by AI later)
    sentiment_score = Column(String, nullable=True)
    category = Column(String, nullable=True) # nitpick, blocking, question, praise
    
    pull_request = relationship("PullRequest", back_populates="comments")
    review = relationship("Review", back_populates="comments")
