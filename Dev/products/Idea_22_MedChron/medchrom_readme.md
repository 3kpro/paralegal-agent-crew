Product Spec: MedChron.ai (Powered by Gemini)
Version: 1.2 (Gemini + Vertex AI)
Target Audience: Medical Malpractice Attorneys
Core Value: Zero-shot extraction of clinical timelines from massive PDF records using Gemini's Long Context capabilities.

1. Technical Stack (Updated)
Cloud Provider: Google Cloud Platform (Vertex AI)

AI Model: Gemini 1.5 Pro (Primary for extraction), Gemini 1.5 Flash (Secondary for quick metadata checks).

SDK: google-cloud-aiplatform (Vertex AI SDK)

Backend: Python (FastAPI)

Document Processing: Google Document AI (OCR) OR pdfplumber (standard text). Recommendation: Use standard pdfplumber first to save credits, fallback to Document AI for handwriting.

2. The "Long Context" Advantage Logic
Unlike standard RAG, we will not vector-search small snippets. We will pass large sequential blocks of the record.

The Processing Strategy:

Block Ingestion: Instead of page-by-page, we group pages into "Chapters" (e.g., 50-100 pages at a time).

Context-Aware Extraction: We pass the entire chapter to Gemini 1.5 Pro.

Prompt Instruction: "You are reading pages 1-100. Extract events chronologically. If an event references a previous page in this block, link them."

3. Data Models (Pydantic)
python
import datetime
from pydantic import BaseModel, Field
from typing import List, Optional

class MedicalEvent(BaseModel):
    # Gemini is great at handling native datetime objects if instructed well
    event_timestamp: str = Field(description="ISO 8601 format or 'Unknown'")
    event_type: str = Field(description="Admission, Vitals, Meds, Procedure, Note")
    provider: str = Field(description="Name of doctor/nurse if available")
    description: str = Field(description="Concise summary of what happened")
    source_page: int = Field(description="The exact PDF page number this comes from")
    risk_flag: bool = Field(description="True if this indicates a gap in care or medical error")

class ChronologyResponse(BaseModel):
    events: List[MedicalEvent]
    patient_name: str
    mrn_number: str
4. The Gemini System Prompt
Use this exact prompt structure in your code. Note the request for JSON output.

System: You are an expert Legal Nurse Consultant assisting in a malpractice investigation.

Task: Analyze the provided medical record text and extract a strict chronological timeline of events.

Input Context: You are analyzing Pages {start_page} to {end_page} of a larger file.

Strict Rules:

JSON Output: Return the result only as a list of JSON objects matching the MedicalEvent schema.

Hallucination Check: Do not infer dates. If a date is missing, mark it "Unknown".

Verbatim Check: The description must accurately reflect the clinical note.

Gap Detection: If you see a note saying "Patient unmonitored" or if there is a gap in vitals > 4 hours, set risk_flag to True.

User: Here is the medical record content:
{document_content}

5. Implementation Plan (Vertex AI Focus)
GCP Setup:

Enable Vertex AI API.

Create a Service Account with Vertex AI User role.

Download the JSON key and set GOOGLE_APPLICATION_CREDENTIALS.

Code Scaffold (Python):

python
import vertexai
from vertexai.generative_models import GenerativeModel, Part
import json

def extract_timeline(text_block):
    vertexai.init(project="your-project-id", location="us-central1")
    model = GenerativeModel("gemini-1.5-pro-001")
    
    # Configure output to be strict JSON
    generation_config = {
        "response_mime_type": "application/json",
        "temperature": 0.1, # Low temp for factual accuracy
    }

    response = model.generate_content(
        f"Extract medical events from this text: {text_block}",
        generation_config=generation_config
    )
    
    return json.loads(response.text)
Cost Management (Smart Triage):

Tier 1 (Fast): Use Gemini 1.5 Flash to scan the page. Is it a blank page? A billing page? An admin form? -> Skip it.

Tier 2 (Deep): Use Gemini 1.5 Pro only on pages identified as "Clinical Notes," "Vitals Logs," or "Operative Reports." This saves massive tokens/money.

Why this is better for your "Law Firm Contact":
When you chat with them, say this:
"Most AI tools read one page at a time and get confused. My system uses Google's latest 'Long Context' engine—it reads the whole chapter at once, just like a human nurse would. It connects the dots between page 5 and page 50."