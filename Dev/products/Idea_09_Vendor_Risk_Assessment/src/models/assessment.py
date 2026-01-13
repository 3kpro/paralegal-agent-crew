from sqlalchemy import Column, String, ForeignKey, Float, Enum, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid
import enum
from .base import TimeStampedModel

class AssessmentStatus(str, enum.Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class Assessment(TimeStampedModel):
    __tablename__ = 'assessments'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    vendor_id = Column(UUID(as_uuid=True), ForeignKey('vendors.id'), nullable=False)
    
    # MVP: Simple user ID (could be expanded to User model later)
    user_id = Column(String, nullable=True) 
    
    status = Column(Enum(AssessmentStatus), default=AssessmentStatus.PENDING)
    risk_score = Column(Float) # 0.0 to 100.0
    
    # AI Analysis Results
    findings = Column(JSONB, default=list) # e.g. [{ "severity": "HIGH", "issue": "No SOC2" }]
    generated_report = Column(Text) # Full markdown report
    
    vendor = relationship("Vendor", back_populates="assessments")
