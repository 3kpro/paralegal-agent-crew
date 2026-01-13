from datetime import datetime
from typing import Optional, List
import enum
from sqlalchemy import String, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base

class ProcessingStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class Organization(Base):
    __tablename__ = "organizations"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    users: Mapped[List["User"]] = relationship(back_populates="organization")
    recordings: Mapped[List["Recording"]] = relationship(back_populates="organization")

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    full_name: Mapped[Optional[str]] = mapped_column(String(255))
    organization_id: Mapped[int] = mapped_column(ForeignKey("organizations.id"))
    
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    organization: Mapped["Organization"] = relationship(back_populates="users")
    recordings: Mapped[List["Recording"]] = relationship(back_populates="uploader")

class Recording(Base):
    __tablename__ = "recordings"

    id: Mapped[int] = mapped_column(primary_key=True)
    filename: Mapped[str] = mapped_column(String(255))
    file_path: Mapped[str] = mapped_column(String(1024))
    content_type: Mapped[Optional[str]] = mapped_column(String(100))
    file_size_bytes: Mapped[Optional[int]]
    duration_seconds: Mapped[Optional[float]]
    
    status: Mapped[ProcessingStatus] = mapped_column(
        SQLEnum(ProcessingStatus), default=ProcessingStatus.PENDING
    )
    
    # Ownership
    organization_id: Mapped[Optional[int]] = mapped_column(ForeignKey("organizations.id"))
    uploader_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"))
    
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    transcript: Mapped[Optional["Transcript"]] = relationship(back_populates="recording", uselist=False)
    commitments: Mapped[List["Commitment"]] = relationship(back_populates="recording")
    organization: Mapped[Optional["Organization"]] = relationship(back_populates="recordings")
    uploader: Mapped[Optional["User"]] = relationship(back_populates="recordings")

class Transcript(Base):
    __tablename__ = "transcripts"

    id: Mapped[int] = mapped_column(primary_key=True)
    recording_id: Mapped[int] = mapped_column(ForeignKey("recordings.id"))
    
    # Full raw text
    raw_text: Mapped[str] = mapped_column(Text)
    
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    recording: Mapped["Recording"] = relationship(back_populates="transcript")


class Commitment(Base):
    __tablename__ = "commitments"

    id: Mapped[int] = mapped_column(primary_key=True)
    recording_id: Mapped[int] = mapped_column(ForeignKey("recordings.id"))
    
    description: Mapped[str] = mapped_column(Text) # The commitment text
    assignee: Mapped[Optional[str]] = mapped_column(String(255)) # Who said it / who it's for
    due_date_text: Mapped[Optional[str]] = mapped_column(String(255)) # Extracted date text
    
    confidence_score: Mapped[Optional[float]] # 0.0 to 1.0
    
    # Validation status
    is_valid: Mapped[bool] = mapped_column(default=True)
    
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    recording: Mapped["Recording"] = relationship(back_populates="commitments")
    tasks: Mapped[List["Task"]] = relationship(back_populates="commitment")


class TaskPlatform(str, enum.Enum):
    ASANA = "asana"
    LINEAR = "linear"

class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(primary_key=True)
    commitment_id: Mapped[int] = mapped_column(ForeignKey("commitments.id"))
    
    platform: Mapped[TaskPlatform] = mapped_column(SQLEnum(TaskPlatform))
    external_task_id: Mapped[str] = mapped_column(String(255))
    external_url: Mapped[Optional[str]] = mapped_column(String(1024))
    
    status: Mapped[str] = mapped_column(String(50)) # Status in the external tool
    
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    
    commitment: Mapped["Commitment"] = relationship(back_populates="tasks")
