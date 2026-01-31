from sqlalchemy import Column, String, ForeignKey, Date, Float, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import enum
from .base import TimeStampedModel

class ContractStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    EXPIRED = "EXPIRED"
    RENEWAL_DUE = "RENEWAL_DUE"
    TERMINATED = "TERMINATED"

class Contract(TimeStampedModel):
    __tablename__ = 'contracts'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey('organizations.id'), nullable=False)
    vendor_id = Column(UUID(as_uuid=True), ForeignKey('vendors.id'), nullable=False)
    
    title = Column(String, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    
    value = Column(Float) # Annual Value
    currency = Column(String, default="USD")
    
    status = Column(Enum(ContractStatus), default=ContractStatus.ACTIVE)
    owner = Column(String) # Internal owner email
    
    vendor = relationship("Vendor", back_populates="contracts")
