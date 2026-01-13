from sqlalchemy import Column, String, Text, ForeignKey, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid
from .base import TimeStampedModel

class Vendor(TimeStampedModel):
    __tablename__ = 'vendors'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    domain = Column(String, unique=True, nullable=False)
    website_url = Column(String)
    description = Column(Text)
    
    # Relationships
    intelligence = relationship("VendorIntelligence", back_populates="vendor", uselist=False, cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="vendor", cascade="all, delete-orphan")
    assessments = relationship("Assessment", back_populates="vendor", cascade="all, delete-orphan")

class VendorIntelligence(TimeStampedModel):
    __tablename__ = 'vendor_intelligence'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    vendor_id = Column(UUID(as_uuid=True), ForeignKey('vendors.id'), unique=True, nullable=False)
    
    compliance_certs = Column(JSONB, default=list)  # e.g. ["SOC2", "ISO27001"]
    security_page_url = Column(String)
    privacy_policy_url = Column(String)
    last_scraped_at = Column(TIMESTAMP(timezone=True))
    
    risk_summary = Column(Text)
    
    vendor = relationship("Vendor", back_populates="intelligence")
