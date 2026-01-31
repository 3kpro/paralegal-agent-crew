from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from .base import TimeStampedModel

class Organization(TimeStampedModel):
    __tablename__ = 'organizations'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    domain = Column(String, unique=True) # e.g. @company.com
    
    # Relationships (back_populates will be added in other models)
    users = relationship("User", back_populates="organization")
    vendors = relationship("Vendor", back_populates="organization")
    
    def __repr__(self):
        return f"<Organization(name='{self.name}')>"
