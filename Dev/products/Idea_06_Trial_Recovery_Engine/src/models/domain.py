from datetime import datetime
from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class TrialStatus(str, Enum):
    ACTIVE = "active"
    EXPIRED = "expired"
    CONVERTED = "converted"
    ABANDONED = "abandoned"

class Organization(BaseModel):
    id: str
    name: str
    api_key: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class WebhookConfig(BaseModel):
    id: str
    org_id: str
    target_url: str
    is_active: bool = True
    event_types: List[str] = Field(default_factory=lambda: ["classification_created", "conversion_recorded"])

class CRMConfig(BaseModel):
    id: str
    org_id: str
    provider: str  # "hubspot", "salesforce"
    api_key: str
    is_active: bool = True
    sync_fields: Dict[str, str] = Field(default_factory=dict)  # Map internal field -> CRM field

class User(BaseModel):
    id: str
    org_id: str
    email: str
    name: Optional[str] = None
    created_at: datetime
    metadata: Dict[str, Any] = Field(default_factory=dict)

class Trial(BaseModel):
    id: str
    org_id: str
    user_id: str
    product_id: str
    start_date: datetime
    end_date: datetime
    status: TrialStatus = TrialStatus.ACTIVE
    last_active_at: Optional[datetime] = None

class Event(BaseModel):
    id: str
    org_id: str
    user_id: str
    event_name: str
    timestamp: datetime
    properties: Dict[str, Any] = Field(default_factory=dict)

class AbandonmentCategory(str, Enum):
    CONFUSED = "confused"           # Started but didn't finish onboarding
    WRONG_FIT = "wrong_fit"         # Used it, but it doesn't solve their specific problem
    NEEDS_MORE_TIME = "more_time"   # Active but ran out of time
    COMPETITOR_EVAL = "competitor"  # Testing against others, high volume then silence
    GHOSTED = "ghosted"             # Zero usage after signup
    PRICE_SENSITIVE = "price"       # Viewed pricing multiple times but didn't buy

class Classification(BaseModel):
    trial_id: str
    org_id: str
    category: AbandonmentCategory
    confidence: float = Field(ge=0, le=1)
    reasoning: str
    suggested_playbook_id: Optional[str] = None
    classified_at: datetime = Field(default_factory=datetime.utcnow)

class Playbook(BaseModel):
    id: str
    name: str
    target_category: AbandonmentCategory
    email_templates: List[Dict[str, str]]  # List of subject/body objects
    offer_type: Optional[str] = None       # e.g., "discount", "extension", "consultation"
    timing_days: List[int]                 # Days after abandonment to send

class ABTestVariant(BaseModel):
    id: str
    playbook_id: str
    weight: float = 0.5

class ABTest(BaseModel):
    id: str
    org_id: str
    name: str
    category: AbandonmentCategory
    variants: List[ABTestVariant]
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ABAssignment(BaseModel):
    user_id: str
    test_id: str
    variant_id: str
    assigned_at: datetime = Field(default_factory=datetime.utcnow)

class Conversion(BaseModel):
    id: str
    org_id: str
    user_id: str
    trial_id: str
    conversion_value: float = 0.0
    converted_at: datetime = Field(default_factory=datetime.utcnow)
    playbook_id: Optional[str] = None  # To link back to recovery success

class TrialExtension(BaseModel):
    id: str
    trial_id: str
    token: str
    days: int
    is_used: bool = False
    expires_at: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ChurnScore(BaseModel):
    trial_id: str
    org_id: str
    score: float = Field(ge=0, le=1)  # 0 = Safe, 1 = High Churn Risk
    signals: List[str]
    calculated_at: datetime = Field(default_factory=datetime.utcnow)

class Cohort(BaseModel):
    org_id: str
    period: str  # e.g., "2025-01" (January 2025)
    total_signups: int
    conversions: int
    recoveries: int
    conversion_rate: float
    recovery_rate: float
    analysis_date: datetime = Field(default_factory=datetime.utcnow)
