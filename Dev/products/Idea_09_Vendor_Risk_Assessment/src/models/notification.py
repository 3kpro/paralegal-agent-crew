from sqlalchemy import Column, String, Enum, ForeignKey, Text, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid
import enum
from datetime import datetime
from .base import TimeStampedModel

class NotificationType(str, enum.Enum):
    INFO = "INFO"
    WARNING = "WARNING"
    ALERT = "ALERT" # Critical
    SUCCESS = "SUCCESS"

class Notification(TimeStampedModel):
    __tablename__ = 'notifications'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Target (User or Org)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=True) # Specific user
    organization_id = Column(UUID(as_uuid=True), ForeignKey('organizations.id'), nullable=False) # Broadcast to org
    
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(Enum(NotificationType), default=NotificationType.INFO)
    
    is_read = Column(Boolean, default=False)
    link = Column(String, nullable=True) # e.g. /vendor/123
    
    # Relationships
    user = relationship("User")
    organization = relationship("Organization")

    def to_dict(self):
        return {
            "id": str(self.id),
            "title": self.title,
            "message": self.message,
            "type": self.type.value,
            "is_read": self.is_read,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "link": self.link
        }
