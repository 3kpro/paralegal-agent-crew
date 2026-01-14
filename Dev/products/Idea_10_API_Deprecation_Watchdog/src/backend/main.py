from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from .database import engine, get_db, Base
from .models import ApiRegistry, MonitoringMethod, ApiChange

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="BreakingChange API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Models
class ApiCreate(BaseModel):
    name: str
    changelog_url: str
    homepage_url: Optional[str] = None
    monitoring_method: str = "html"

class ApiRead(BaseModel):
    id: str
    name: str
    changelog_url: str
    last_checked_at: Optional[datetime]
    
    class Config:
        orm_mode = True

class ChangeRead(BaseModel):
    id: str
    api_id: str
    title: str
    description: Optional[str]
    change_type: str
    severity: str
    published_at: Optional[datetime]
    detected_at: datetime
    source_url: Optional[str]
    
    class Config:
        orm_mode = True
        use_enum_values = True

@app.get("/")
def read_root():
    return {"message": "Welcome to BreakingChange API Deprecation Watchdog"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/apis", response_model=ApiRead)
def create_api(api: ApiCreate, db: Session = Depends(get_db)):
    db_api = ApiRegistry(
        name=api.name,
        changelog_url=api.changelog_url,
        homepage_url=api.homepage_url,
        monitoring_method=MonitoringMethod(api.monitoring_method)
    )
    db.add(db_api)
    db.commit()
    db.refresh(db_api)
    return db_api

@app.get("/apis", response_model=List[ApiRead])
def list_apis(db: Session = Depends(get_db)):
    return db.query(ApiRegistry).all()

@app.get("/changes", response_model=List[ChangeRead])
def list_changes(severity: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(ApiChange)
    if severity:
        # Filter by severity (case-insensitive in DB usually lower)
        from .models import Severity
        try:
             # Map string to enum
             sev_enum = Severity(severity.lower())
             query = query.filter(ApiChange.severity == sev_enum)
        except ValueError:
             pass # Ignore invalid severity
             
    return query.order_by(ApiChange.detected_at.desc()).limit(100).all()

@app.post("/apis/{api_id}/scan")
async def scan_api(api_id: str, db: Session = Depends(get_db)):
    api = db.query(ApiRegistry).filter(ApiRegistry.id == api_id).first()
    if not api:
        raise HTTPException(status_code=404, detail="API not found")
    
    try:
        changes = []
        if api.monitoring_method == MonitoringMethod.RSS:
            from .rss_parser import RssParser
            parser = RssParser()
            changes = parser.parse_feed(api.changelog_url)
            
        elif api.monitoring_method == MonitoringMethod.HTML:
            from .scraper import ChangelogScraper
            scraper = ChangelogScraper()
            html_content = await scraper.fetch_page(api.changelog_url)
            changes = scraper.parse_changelog(html_content)

        elif api.monitoring_method == MonitoringMethod.GITHUB_RELEASE:
            from .github_monitor import GithubMonitor
            monitor = GithubMonitor()
            changes = await monitor.fetch_releases(api.changelog_url)
        
        # Initialize Classifier
        from .classifier import ChangeClassifier
        classifier = ChangeClassifier()

        # Save changes
        count = 0
        for change in changes:
            # Check if exists (using original_id if available, else title)
            query = db.query(ApiChange).filter(ApiChange.api_id == api.id)
            
            if 'original_id' in change and change['original_id']:
                exists = query.filter(ApiChange.original_id == change['original_id']).first()
            else:
                exists = query.filter(ApiChange.title == change['title']).first()
            
            if not exists:
                # Classify the new change
                change_type, severity = classifier.classify(
                    change['title'], 
                    change['raw_content'] if change.get('raw_content') else change['title']
                )

                new_change = ApiChange(
                    api_id=api.id,
                    title=change['title'],
                    description=change['raw_content'],
                    source_url=change.get('source_url', api.changelog_url),
                    original_id=change.get('original_id'),
                    published_at=change.get('published_at'),
                    change_type=change_type,
                    severity=severity
                )
                # Send Notification
                from .notifier import SlackNotifier
                notifier = SlackNotifier()
                # We await sending the alert, but in prod this should be a background task (Celery)
                # For MVP, await is fine as volume is low.
                await notifier.send_alert(new_change, api.name)

                db.add(new_change)
                count += 1
        
        api.last_checked_at = datetime.utcnow()
        db.commit()
        
        return {
            "status": "success", 
            "method": api.monitoring_method.value,
            "new_changes_found": count, 
            "scanned_url": api.changelog_url
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

