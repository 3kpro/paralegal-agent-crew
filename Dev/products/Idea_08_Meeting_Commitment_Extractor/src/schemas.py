from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from .models.domain import ProcessingStatus

class RecordingBase(BaseModel):
    filename: str

class RecordingCreate(RecordingBase):
    pass

class RecordingRead(RecordingBase):
    id: int
    status: ProcessingStatus
    created_at: datetime
    updated_at: datetime
    transcript_preview: Optional[str] = None

    class Config:
        from_attributes = True

class TranscriptRead(BaseModel):
    id: int
    recording_id: int
    raw_text: str
    created_at: datetime

    class Config:
        from_attributes = True
