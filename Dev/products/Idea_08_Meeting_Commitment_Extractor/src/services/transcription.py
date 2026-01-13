import os
import logging
from deepgram import DeepgramClient, PrerecordedOptions, FileSource

from ..config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

class TranscriptionService:
    def __init__(self):
        try:
            self.client = DeepgramClient(settings.DEEPGRAM_API_KEY)
        except Exception as e:
            logger.error(f"Failed to initialize Deepgram client: {e}")
            self.client = None

    async def transcribe_file(self, file_path: str) -> str:
        if not self.client:
            raise RuntimeError("Deepgram client not initialized")

        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Audio file not found: {file_path}")

        try:
            with open(file_path, "rb") as file:
                buffer_data = file.read()

            payload: FileSource = {
                "buffer": buffer_data,
            }

            options = PrerecordedOptions(
                model="nova-2",
                smart_format=True,
                punctuate=True,
                diarize=True,
            )

            response = self.client.listen.rest.v("1").transcribe_file(payload, options)
            
            # Extract the raw transcript
            # Depending on version this might be response.results...
            # Using v3 SDK structure
            
            transcript_text = ""
            if response.results and response.results.channels:
                channel = response.results.channels[0]
                if channel.alternatives:
                    transcript_text = channel.alternatives[0].transcript

            return transcript_text

        except Exception as e:
            logger.error(f"Transcription failed: {e}")
            raise e
