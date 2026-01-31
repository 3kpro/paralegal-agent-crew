from sqlalchemy import Column, String, Enum, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid
import enum
from .base import TimeStampedModel
from src.security.encryption import EncryptedString

class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    EDITOR = "EDITOR"
    VIEWER = "VIEWER"
    AUDITOR = "AUDITOR"

class User(TimeStampedModel):
    __tablename__ = 'users'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.VIEWER)
    full_name = Column(EncryptedString, nullable=True) # Protected PII
    
    organization_id = Column(UUID(as_uuid=True), ForeignKey('organizations.id'), nullable=True)
    organization = relationship("Organization", back_populates="users")
