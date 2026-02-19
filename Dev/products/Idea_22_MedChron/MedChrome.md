Product Spec: MedChron.ai (Powered by Gemini)
Version: 1.3 (Gemini + Vertex AI + Strict Schema)
Target Audience: Medical Malpractice Attorneys & Legal Nurse Consultants
Core Value: Zero-shot extraction of defensible clinical timelines from massive PDF records using Gemini 1.5 Pro.

1. Technical Stack
Cloud Provider: Google Cloud Platform (Vertex AI)

AI Model: Gemini 1.5 Pro (Primary extraction), Gemini 1.5 Flash (Metadata/Filtering).

SDK: google-cloud-aiplatform (Vertex AI SDK)

Backend: Python (FastAPI)

Data Validation: Pydantic (Strict Mode)

PDF Processing: pdfplumber (Text Extraction) + Google Document AI (Handwriting fallback).

2. The "Long Context" Logic
We leverage Gemini's 2M token window to process entire "Chapters" of medical records at once, ensuring continuity (e.g., connecting a diagnosis on page 50 to a symptom on page 2).

The Processing Strategy:

Block Ingestion: Group PDF pages into "Chapters" (e.g., 50-100 pages).

Context-Aware Extraction: Pass the full chapter text to Gemini 1.5 Pro.

Strict Output: Force application/json output adhering to the Pydantic schema below.

3. Data Models (The "Legal Source of Truth")
This model is designed for defensibility. It separates the "Raw" evidence from the "Normalized" data used for sorting.

python
from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

# 1. Strict Categories for Filtering (e.g., "Show me only Meds")
class EventCategory(str, Enum):
    ADMISSION_DISCHARGE = "admission_discharge"
    VITALS_MEASUREMENT = "vitals"
    MEDICATION_ADMIN = "medication"
    LAB_RESULT = "lab_result"
    PROCEDURE_SURGERY = "procedure"
    PROVIDER_NOTE = "provider_note"
    NURSING_NOTE = "nursing_note"
    ORDER = "physician_order"
    OTHER = "other"

# 2. The Core Event Model
class MedicalEvent(BaseModel):
    # --- TIMING (Critical for Liability) ---
    timestamp_iso: Optional[str] = Field(
        None, 
        description="Best guess normalized ISO 8601 timestamp (YYYY-MM-DDTHH:MM:SS). If time is missing/ambiguous, leave None."
    )
    timestamp_raw: str = Field(
        ..., 
        description="The exact string found in the document representing time, e.g., 'approx 1400 hours' or 'late afternoon'."
    )

    # --- WHAT HAPPENED ---
    category: EventCategory = Field(
        ..., 
        description="The strict category of the event."
    )
    summary: str = Field(
        ..., 
        description="A concise, professional summary (e.g., 'Administered 50mg Propofol IV')."
    )
    
    # --- WHO DID IT ---
    provider_name: Optional[str] = Field(
        None, 
        description="Name of the healthcare provider, e.g., 'Dr. Smith' or 'Jane Doe, RN'."
    )
    provider_role: Optional[str] = Field(
        None, 
        description="Role if mentioned, e.g., 'Attending Physician', 'Triage Nurse'."
    )

    # --- STRUCTURED DATA CATCH-ALL ---
    # Captures specific values without creating infinite columns
    key_values: Optional[Dict[str, Any]] = Field(
        default_factory=dict, 
        description="Structured data extracted. Example: {'bp': '120/80', 'hr': '90', 'medication': 'Morphine', 'dose': '2mg'}."
    )

    # --- EVIDENTIARY PROOF (The "Trust" Fields) ---
    source_page_number: int = Field(
        ..., 
        description="The integer page number of the PDF file."
    )
    source_text_snippet: str = Field(
        ..., 
        description="The EXACT verbatim text snippet from the document used to generate this event. Used for click-to-verify."
    )
    
    # --- RISK ANALYSIS (The Value Add) ---
    is_gap_in_care: bool = Field(
        False, 
        description="True ONLY if the text explicitly mentions a lack of monitoring or if the event indicates a significant delay."
    )
    flag_warning: Optional[str] = Field(
        None, 
        description="Explanation for the flag. E.g., 'Patient unattended for 6 hours', 'Medication given late'."
    )

class TimelineResponse(BaseModel):
    patient_name: Optional[str]
    mrn_number: Optional[str]
    events: List[MedicalEvent]
4. The Gemini System Prompt
Use this strict prompt to enforce the schema.

System: You are an expert Legal Nurse Consultant assisting in a strict malpractice investigation.

Task: Analyze the provided medical record text and extract a chronological timeline of events.

Input Context: You are analyzing Pages {start_page} to {end_page}.

Rules:

Strict JSON: You must return a JSON object matching the TimelineResponse schema.

No Hallucinations: If a timestamp is not present, use "Unknown" for timestamp_raw and leave timestamp_iso null. Do not guess.

Verbatim Evidence: The source_text_snippet MUST be an exact quote from the text.

Gap Detection: If the notes indicate the patient was left unattended or unmonitored for >4 hours (or against protocol), mark is_gap_in_care as True.

Structured Vitals: If you see "BP 120/80", extract it into the key_values dict as {"bp": "120/80"}.

User: Here is the medical record text:
{document_content}

5. Implementation Steps (Vertex AI)
GCP Setup:

Enable Vertex AI API.

Set up Service Account.

Python Scaffold:

Install: pip install fastapi uvicorn google-cloud-aiplatform pdfplumber pydantic

Create main.py with the Pydantic models above.

Gemini Integration:

python
import vertexai
from vertexai.generative_models import GenerativeModel

vertexai.init(project="YOUR_PROJECT_ID", location="us-central1")

def analyze_chunk(text_content: str):
    model = GenerativeModel("gemini-1.5-pro-001")
    response = model.generate_content(
        f"Extract timeline from: {text_content}",
        generation_config={
            "response_mime_type": "application/json",
            "response_schema": TimelineResponse.model_json_schema()
        }
    )
    return response.text
Testing Strategy:

Run against a redacted sample file first.

Verify that source_text_snippet matches the PDF exactly.