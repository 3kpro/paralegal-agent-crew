from sqlalchemy import Column, String, ForeignKey, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import enum
from datetime import datetime, timedelta
from .base import TimeStampedModel

class InvitationStatus(enum.Enum):
    PENDING = "PENDING"
    SENT = "SENT"
    OPENED = "OPENED"
    COMPLETED = "COMPLETED"
    EXPIRED = "EXPIRED"

class Invitation(TimeStampedModel):
    __tablename__ = 'invitations'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey('organizations.id'), nullable=False)
    vendor_id = Column(UUID(as_uuid=True), ForeignKey('vendors.id'), nullable=False)
    email = Column(String, nullable=False)
    token = Column(String, unique=True, nullable=False)
    status = Column(Enum(InvitationStatus), default=InvitationStatus.PENDING)
    expires_at = Column(DateTime, nullable=False)

    # Relationship to Vendor
    vendor = relationship("Vendor")

    def is_valid(self):
        return self.status != InvitationStatus.EXPIRED and \
               self.status != InvitationStatus.COMPLETED and \
               datetime.utcnow() < self.expires_at
