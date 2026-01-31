from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, ingestion, analysis, classification, reports, settings as settings_router, bottlenecks
from .config import settings
from .database import engine, Base

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="ReviewLens API", version="0.1.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(ingestion.router)
app.include_router(analysis.router)
app.include_router(classification.router)
app.include_router(reports.router)
app.include_router(settings_router.router)
app.include_router(bottlenecks.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to ReviewLens API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
