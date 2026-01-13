from fastapi import FastAPI, HTTPException, Request, Header, Form
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
from pydantic import BaseModel
import uuid
import json

# Import our models
from src.models.domain import Event, Conversion, WebhookConfig, TrialExtension, ChurnScore, Trial, CRMConfig, User, Classification, AbandonmentCategory, Cohort, TrialStatus
from src.churn_predictor import ChurnPredictor
from src.integrations.crm import CRMClient
from src.cohort_analyzer import CohortAnalyzer

app = FastAPI(title="TrialRevive Event Ingestion API")

class SegmentPayload(BaseModel):
    """Minimal schema for Segment Webhook Payload"""
    type: str
    event: Optional[str] = None
    userId: str
    properties: Dict[str, Any] = {}
    timestamp: datetime
    messageId: str

@app.get("/health")
def health_check():
    return {"status": "ok", "timestamp": datetime.utcnow()}

@app.post("/api/events/segment")
async def ingest_segment(payload: SegmentPayload, x_api_key: str = Header(...)):
    """
    Accepts a webhook event from Segment.
    """
    org_id = _resolve_org(x_api_key)
    return await _process_event(
        id=payload.messageId,
        org_id=org_id,
        user_id=payload.userId,
        event_name=payload.event or payload.type,
        timestamp=payload.timestamp,
        properties=payload.properties
    )

class MixpanelPayload(BaseModel):
    event: str
    properties: Dict[str, Any]

@app.post("/api/events/mixpanel")
async def ingest_mixpanel(payload: MixpanelPayload, x_api_key: str = Header(...)):
    """
    Accepts a webhook event from Mixpanel.
    """
    org_id = _resolve_org(x_api_key)
    # Mixpanel properties usually include distinct_id
    user_id = payload.properties.get("distinct_id") or "unknown"
    return await _process_event(
        id=str(uuid.uuid4()),
        org_id=org_id,
        user_id=user_id,
        event_name=payload.event,
        timestamp=datetime.utcnow(),
        properties=payload.properties
    )

class AmplitudeEvent(BaseModel):
    user_id: str
    event_type: str
    time: int
    event_properties: Dict[str, Any] = {}

class AmplitudePayload(BaseModel):
    events: List[AmplitudeEvent]

@app.post("/api/events/amplitude")
async def ingest_amplitude(payload: AmplitudePayload, x_api_key: str = Header(...)):
    """
    Accepts a webhook event from Amplitude (batch).
    """
    org_id = _resolve_org(x_api_key)
    results = []
    for am_event in payload.events:
        res = await _process_event(
            id=str(uuid.uuid4()),
            org_id=org_id,
            user_id=am_event.user_id,
            event_name=am_event.event_type,
            timestamp=datetime.fromtimestamp(am_event.time / 1000.0), # Amplitude time is ms
            properties=am_event.event_properties
        )
        results.append(res)
    
    return {"status": "success", "processed_events": len(results)}

class ConversionPayload(BaseModel):
    user_id: str
    trial_id: str
    value: float = 0.0
    playbook_id: Optional[str] = None

@app.post("/api/events/conversion")
async def ingest_conversion(payload: ConversionPayload, x_api_key: str = Header(...)):
    """
    Accepts a conversion event to track recovery ROI.
    """
    org_id = _resolve_org(x_api_key)
    
    conversion = Conversion(
        id=str(uuid.uuid4()),
        org_id=org_id,
        user_id=payload.user_id,
        trial_id=payload.trial_id,
        conversion_value=payload.value,
        playbook_id=payload.playbook_id
    )
    
    print(f"DEBUG: Success! User {conversion.user_id} converted in org {conversion.org_id} (ROI: ${conversion.conversion_value})")
    return {
        "status": "success",
        "conversion_id": conversion.id
    }

@app.post("/api/integrations/slack/interactivity")
async def handle_slack_interaction(payload: str = Form(...)):
    """
    Handles interactive actions from Slack (e.g., button clicks).
    """
    try:
        data = json.loads(payload)
        user_slack = data.get("user", {}).get("username", "Unknown")
        actions = data.get("actions", [])
        
        for action in actions:
            if action.get("action_id") == "trigger_recovery_playbook":
                value = action.get("value", "")
                # Format: trigger_playbook:trial_id:user_id
                parts = value.split(":")
                if len(parts) >= 3:
                    trial_id = parts[1]
                    user_id = parts[2]
                    
                    print(f"DEBUG: Slack user @{user_slack} triggered recovery for Trial {trial_id} (User {user_id})")
                    # In production, this would trigger the Customer.io/Email flow
                    return {
                        "response_type": "ephemeral",
                        "text": f"✅ Playbook triggered successfully for Trial {trial_id}!"
                    }
        
        return {"status": "ok"}
    except Exception as e:
        print(f"ERROR: Slack interaction failed: {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid Slack payload")

@app.post("/api/integrations/automation/webhooks")
async def register_automation_webhook(config: Dict[str, Any], x_api_key: str = Header(...)):
    """
    Registers a Zapier or n8n webhook URL for this organization.
    """
    org_id = _resolve_org(x_api_key)
    
    # In production, this would save to a database
    new_config = WebhookConfig(
        id=str(uuid.uuid4()),
        org_id=org_id,
        target_url=config.get("target_url"),
        is_active=True
    )
    
    print(f"DEBUG: Registered automation webhook for org {org_id} -> {new_config.target_url}")
    return {
        "status": "success",
        "webhook_id": new_config.id,
        "message": "Automation platform (Zapier/n8n) registered successfully."
    }

@app.post("/api/trials/{trial_id}/extension-link")
async def generate_extension_link(trial_id: str, days: int = 7, x_api_key: str = Header(...)):
    """
    Generates a secure, tokenized link for a user to extend their own trial.
    """
    org_id = _resolve_org(x_api_key)
    
    token = str(uuid.uuid4()).replace("-", "")[:12]
    extension = TrialExtension(
        id=str(uuid.uuid4()),
        trial_id=trial_id,
        token=token,
        days=days,
        expires_at=datetime.utcnow() + timedelta(days=3)
    )
    
    # In production, this would be saved to DB
    print(f"DEBUG: Generated extension link for Trial {trial_id} ({days} days) in org {org_id}")
    return {
        "status": "success",
        "extension_link": f"https://trialrevive.app/recover/extension/{token}",
        "token": token
    }

@app.get("/api/recover/extension/{token}")
async def consume_extension(token: str):
    """
    Landing page endpoint that validates the token and applies the trial extension.
    """
    # Mocking lookup logic
    if len(token) != 12:
        raise HTTPException(status_code=404, detail="Invalid or expired extension link.")
    
    print(f"DEBUG: Extension token {token} successfully consumed. Extending trial.")
    
    return {
        "status": "success",
        "message": "Your trial has been successfully extended!",
        "new_expiry": (datetime.utcnow() + timedelta(days=7)).strftime("%Y-%m-%d")
    }

@app.get("/api/trials/{trial_id}/churn-score")
async def get_churn_score(trial_id: str, x_api_key: str = Header(...)):
    """
    Calculates the churn risk score for a specific trial based on behavioral decay.
    """
    org_id = _resolve_org(x_api_key)
    
    # Mocking trial and event fetching
    trial = Trial(
        id=trial_id,
        org_id=org_id,
        user_id="user_mock",
        product_id="prod_mock",
        start_date=datetime.utcnow() - timedelta(days=10),
        end_date=datetime.utcnow() + timedelta(days=4),
        last_active_at=datetime.utcnow() - timedelta(days=5)
    )
    
    # Mocking some negative signals
    events = [
        Event(id="e1", org_id=org_id, user_id="user_mock", event_name="Visited Settings", timestamp=datetime.utcnow() - timedelta(days=6)),
        Event(id="e2", org_id=org_id, user_id="user_mock", event_name="Cancel Account Page", timestamp=datetime.utcnow() - timedelta(days=5))
    ]
    
    predictor = ChurnPredictor()
    churn_score = predictor.predict_score(trial, events)
    
    print(f"DEBUG: Churn score for Trial {trial_id}: {churn_score.score}")
    return churn_score

@app.post("/api/integrations/crm/configure")
async def configure_crm(config: Dict[str, Any], x_api_key: str = Header(...)):
    """
    Configures CRM integration (HubSpot/Salesforce) for the organization.
    """
    org_id = _resolve_org(x_api_key)
    
    # In production, save to DB
    crm_config = CRMConfig(
        id=str(uuid.uuid4()),
        org_id=org_id,
        provider=config.get("provider", "hubspot"),
        api_key=config.get("api_key", ""),
        sync_fields=config.get("sync_fields", {})
    )
    
    print(f"DEBUG: Configured {crm_config.provider} CRM for org {org_id}")
    return {
        "status": "success",
        "config_id": crm_config.id,
        "message": f"{crm_config.provider.title()} integration active."
    }

@app.post("/api/integrations/crm/sync-test")
async def test_crm_sync(payload: Dict[str, Any], x_api_key: str = Header(...)):
    """
    Test endpoint to manually trigger a CRM sync for a user/classification.
    """
    org_id = _resolve_org(x_api_key)
    
    # Mock Config retrieval
    mock_config = CRMConfig(
        id="mock_crm_id",
        org_id=org_id,
        provider=payload.get("provider", "hubspot"),
        api_key="mock_key_123"
    )
    
    client = CRMClient(mock_config)
    
    # fetch/create mock user/classification
    user = User(
        id=payload.get("user_id", "user_crm_test"),
        org_id=org_id,
        email=payload.get("email", "crm_test@example.com"),
        name="CR M Test",
        created_at=datetime.utcnow()
    )
    
    classification = Classification(
        trial_id="trial_crm_test",
        org_id=org_id,
        category=AbandonmentCategory.PRICE_SENSITIVE,
        confidence=0.92,
        reasoning="User checked pricing page 5 times."
    )
    
    result = client.sync_contact(user, classification)
    return result

    
    result = client.sync_contact(user, classification)
    return result

@app.get("/api/analytics/cohorts")
async def get_cohort_analysis(x_api_key: str = Header(...)):
    """
    Returns monthly cohort analysis of trial retention and recovery impact.
    """
    org_id = _resolve_org(x_api_key)
    
    # Mock Data Generation for Demo
    trials = []
    conversions = []
    
    # Create mock cohorts: current month, last month, month before
    now = datetime.utcnow()
    
    # Month 1 (Current) - early days
    for i in range(5):
        trials.append(Trial(id=f"t_cur_{i}", org_id=org_id, user_id=f"u_{i}", product_id="p1", 
                           start_date=now, end_date=now+timedelta(days=14), status=TrialStatus.ACTIVE))

    # Month 2 (Last Month) - mixed bag
    last_month = now - timedelta(days=30)
    for i in range(10):
        status = TrialStatus.CONVERTED if i < 3 else TrialStatus.ABANDONED
        t_id = f"t_lm_{i}"
        trials.append(Trial(id=t_id, org_id=org_id, user_id=f"u_lm_{i}", product_id="p1", 
                           start_date=last_month, end_date=last_month+timedelta(days=14), status=status))
        # Add a recovery
        if i == 4: 
            # This one abandoned but then converted (recovered)
            trials[-1].status = TrialStatus.CONVERTED 
            conversions.append(Conversion(id="c1", org_id=org_id, user_id=f"u_lm_{i}", trial_id=t_id, playbook_id="pb_discount"))
        elif i < 3:
             # Natural conversion
             conversions.append(Conversion(id=f"c_nat_{i}", org_id=org_id, user_id=f"u_lm_{i}", trial_id=t_id))

    # Month 3 (Older)
    old_month = now - timedelta(days=60)
    for i in range(8):
        trials.append(Trial(id=f"t_old_{i}", org_id=org_id, user_id=f"u_old_{i}", product_id="p1", 
                           start_date=old_month, end_date=old_month+timedelta(days=14), status=TrialStatus.EXPIRED))

    analyzer = CohortAnalyzer()
    cohorts = analyzer.analyze_by_month(trials, conversions)
    
    return {
        "status": "success",
        "cohorts": cohorts
    }

def _resolve_org(api_key: str) -> str:
    """
    Resolves an API Key to an Organization ID.
    In production, this would look up in a database/cache.
    """
    mock_keys = {
        "trial_revive_key_3kpro": "org_3kpro",
        "trial_revive_key_startup": "org_startup"
    }
    if api_key not in mock_keys:
        raise HTTPException(status_code=401, detail="Invalid API Key")
    return mock_keys[api_key]

async def _process_event(id: str, org_id: str, user_id: str, event_name: str, timestamp: datetime, properties: dict):
    try:
        internal_event = Event(
            id=id,
            org_id=org_id,
            user_id=user_id,
            event_name=event_name,
            timestamp=timestamp,
            properties=properties
        )
        print(f"DEBUG: Ingested event {internal_event.event_name} for user {internal_event.user_id} in org {internal_event.org_id}")
        return {
            "status": "success",
            "message_id": internal_event.id
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
