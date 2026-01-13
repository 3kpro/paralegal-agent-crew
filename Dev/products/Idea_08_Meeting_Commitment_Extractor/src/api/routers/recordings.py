import os
import shutil
import logging
from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, BackgroundTasks
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from ...db import get_db, AsyncSessionLocal
from ...models.domain import Recording, Transcript, Commitment, ProcessingStatus
from ...schemas import RecordingRead
from ...config import get_settings
from ...services.transcription import TranscriptionService
from ...services.extraction import ExtractionService

router = APIRouter(prefix="/recordings", tags=["recordings"])
settings = get_settings()
logger = logging.getLogger(__name__)

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

async def process_recording_task(recording_id: int):
    """
    Background task to process the recording:
    1. Transcribe with Deepgram
    2. Save Transcript to DB
    3. Update Recording status
    """
    logger.info(f"Starting processing for recording {recording_id}")
    
    # Create a new session for the background task
    async with AsyncSessionLocal() as db:
        try:
            # Fetch recording
            result = await db.execute(select(Recording).where(Recording.id == recording_id))
            recording = result.scalar_one_or_none()
            
            if not recording:
                logger.error(f"Recording {recording_id} not found in background task")
                return

            # Update status to PROCESSING
            recording.status = ProcessingStatus.PROCESSING
            await db.commit()

            # Transcribe
            ts_service = TranscriptionService()
            transcript_text = await ts_service.transcribe_file(recording.file_path)

            # Create Transcript record
            new_transcript = Transcript(
                recording_id=recording.id,
                raw_text=transcript_text
            )
            db.add(new_transcript)
            
            # Extract Commitments
            extraction_service = ExtractionService()
            extracted_items = await extraction_service.extract_commitments(transcript_text)
            
            for item in extracted_items:
                new_commitment = Commitment(
                    recording_id=recording.id,
                    description=item.description,
                    assignee=item.assignee,
                    due_date_text=item.due_date_text,
                    confidence_score=item.confidence_score
                )
                db.add(new_commitment)

            # Update Recording status to COMPLETED
            recording.status = ProcessingStatus.COMPLETED
            await db.commit()
            logger.info(f"Successfully processed recording {recording_id} with {len(extracted_items)} commitments")

        except Exception as e:
            logger.error(f"Error processing recording {recording_id}: {e}")
            # Update status to FAILED
            # We need to re-fetch if the session was rolled back or tracking lost, 
            # but here we can try to update directly if session is alive.
            try:
                # If transaction failed, we might need to rollback first
                await db.rollback() 
                # Re-fetch to accept the update
                result = await db.execute(select(Recording).where(Recording.id == recording_id))
                recording = result.scalar_one_or_none()
                if recording:
                    recording.status = ProcessingStatus.FAILED
                    await db.commit()
            except Exception as inner_e:
                logger.error(f"Failed to update status to FAILED for {recording_id}: {inner_e}")

@router.post("/upload", response_model=RecordingRead)
async def upload_recording(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    """
    Upload an audio file, save it, and queue it for transcription.
    """
    try:
        # Create a safe filename
        safe_filename = f"{datetime.now().timestamp()}_{file.filename}"
        file_path = os.path.join(settings.UPLOAD_DIR, safe_filename)

        # Save the file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Create DB entry
        file_size = os.path.getsize(file_path)
        new_recording = Recording(
            filename=file.filename,
            file_path=file_path,
            content_type=file.content_type,
            file_size_bytes=file_size,
            status=ProcessingStatus.PENDING
        )
        
        db.add(new_recording)
        await db.commit()
        await db.refresh(new_recording)

        # Trigger background processing
        background_tasks.add_task(process_recording_task, new_recording.id)

        return new_recording

    except Exception as e:
        logger.error(f"Upload failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{recording_id}", response_model=RecordingRead)
async def get_recording(recording_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Recording).where(Recording.id == recording_id))
    recording = result.scalar_one_or_none()
    
    if not recording:
        raise HTTPException(status_code=404, detail="Recording not found")
        
    return recording
