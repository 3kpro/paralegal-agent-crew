from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Enum as SqlEnum
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
import enum
from .database import Base

class MonitoringMethod(enum.Enum):
    RSS = "rss"
    HTML = "html"
    GITHUB_RELEASE = "github_release"

class ChangeType(enum.Enum):
    BREAKING = "breaking"
    DEPRECATION = "deprecation"
    FEATURE = "feature"
    BUGFIX = "bugfix"
    UNKNOWN = "unknown"

class Severity(enum.Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class ApiRegistry(Base):
    __tablename__ = "api_registry"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    homepage_url = Column(String, nullable=True)
    changelog_url = Column(String, nullable=False)
    documentation_url = Column(String, nullable=True)
    logo_url = Column(String, nullable=True)
    
    # Configuration
    monitoring_method = Column(SqlEnum(MonitoringMethod), default=MonitoringMethod.HTML)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_checked_at = Column(DateTime, nullable=True)
    
    # Relations
    changes = relationship("ApiChange", back_populates="api", cascade="all, delete-orphan")

class ApiChange(Base):
    __tablename__ = "api_changes"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    api_id = Column(String, ForeignKey("api_registry.id"), nullable=False)
    
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    
    # Classification (AI populated)
    change_type = Column(SqlEnum(ChangeType), default=ChangeType.UNKNOWN)
    severity = Column(SqlEnum(Severity), default=Severity.LOW)
    
    published_at = Column(DateTime, nullable=True)
    detected_at = Column(DateTime, default=datetime.utcnow)
    source_url = Column(String, nullable=True)
    original_id = Column(String, nullable=True) # Hash or external ID for deduplication

    # Relations
    api = relationship("ApiRegistry", back_populates="changes")
