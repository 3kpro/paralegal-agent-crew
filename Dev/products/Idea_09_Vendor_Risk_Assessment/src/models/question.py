from sqlalchemy import Column, String, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid
from .base import TimeStampedModel

class Question(TimeStampedModel):
    __tablename__ = 'questions'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey('organizations.id'), nullable=True) # Null for Global questions
    text = Column(Text, nullable=False, unique=True)
    category = Column(String, index=True) # e.g. Access Control, Encryption
    standard_ref = Column(String) # e.g. SIG-Lite A.1
    guidance = Column(Text) # Instructions on how to answer this
    
    def __repr__(self):
        return f"<Question(id={self.id}, text='{self.text[:20]}...')>"
