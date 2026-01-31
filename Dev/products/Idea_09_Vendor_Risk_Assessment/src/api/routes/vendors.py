from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class VendorBase(BaseModel):
    id: int
    name: str
    domain: str
    score: int
    certs: List[str]

# Mock DB
MOCK_VENDORS = [
    {"id": 1, "name": "Acme SaaS Corp", "domain": "acme.com", "score": 85, "certs": ["SOC 2 Type II", "ISO 27001", "GDPR"]},
    {"id": 2, "name": "CloudNine Storage", "domain": "cloud9.io", "score": 45, "certs": ["GDPR"]},
    {"id": 3, "name": "SecureAuth Provider", "domain": "auth.net", "score": 92, "certs": ["SOC 2", "ISO 27001", "FedRAMP", "HIPAA"]}
]

@router.get("/", response_model=List[VendorBase])
async def get_vendors():
    return MOCK_VENDORS

@router.get("/{vendor_id}", response_model=VendorBase)
async def get_vendor(vendor_id: int):
    vendor = next((v for v in MOCK_VENDORS if v["id"] == vendor_id), None)
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return vendor

@router.post("/", response_model=VendorBase)
async def create_vendor(vendor: VendorBase):
    MOCK_VENDORS.append(vendor.dict())
    return vendor
