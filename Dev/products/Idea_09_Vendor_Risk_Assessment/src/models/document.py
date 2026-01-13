from sqlalchemy import Column, String, ForeignKey, Boolean, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import enum
from .base import TimeStampedModel

class DocumentType(str, enum.Enum):
    SOC2 = "SOC2"
    ISO27001 = "ISO27001"
    PRIVACY_POLICY = "PRIVACY_POLICY"
    SECURITY_WHITE_PAPER = "SECURITY_WHITE_PAPER"
    TERMS_OF_SERVICE = "TERMS_OF_SERVICE"
    OTHER = "OTHER"

class Document(TimeStampedModel):
    __tablename__ = 'documents'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    vendor_id = Column(UUID(as_uuid=True), ForeignKey('vendors.id'), nullable=False)
    
    doc_type = Column(Enum(DocumentType), nullable=False, default=DocumentType.OTHER)
    title = Column(String)
    s3_key = Column(String, nullable=False)
    url = Column(String)  # Source URL if fetched from web
    content_hash = Column(String)
    is_processed = Column(Boolean, default=False)
    
    vendor = relationship("Vendor", back_populates="documents")
