from sqlalchemy import Column, String, ForeignKey, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
import uuid
import enum
from .base import TimeStampedModel

class AuditAction(str, enum.Enum):
    LOGIN = "LOGIN"
    CREATE = "CREATE"
    UPDATE = "UPDATE"
    DELETE = "DELETE"
    EXPORT = "EXPORT"
    IMPORT = "IMPORT"
    
class AuditEvent(TimeStampedModel):
    __tablename__ = 'audit_events'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey('organizations.id'), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=True) # System events may be null
    
    action = Column(String, nullable=False) # e.g. "CREATE_VENDOR"
    target_resource = Column(String) # e.g. "Vendor:123"
    details = Column(JSON) # Changed fields, diffs, or metadata
    ip_address = Column(String)
    
    def __repr__(self):
        return f"<AuditEvent(action='{self.action}', user='{self.user_id}')>"
