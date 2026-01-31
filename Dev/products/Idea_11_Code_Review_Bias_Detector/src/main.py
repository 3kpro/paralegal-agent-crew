from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from dotenv import load_dotenv

load_dotenv()

from auth import router as auth_router
from database import engine, Base, get_db
from models import Repository  # Import models to ensure they are registered
from ingestion import GitHubIngestor
import models
from sqlalchemy.orm import Session
from fastapi import Depends, BackgroundTasks

# Create DB tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="ReviewLens API", version="0.1.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)

@app.get("/")
async def root():
    return {"message": "ReviewLens API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

from analysis import Analyzer
from classifier import CommentClassifier

@app.get("/repos/{owner}/{repo}/analysis")
async def get_repo_analysis(
    owner: str, 
    repo: str,
    db: Session = Depends(get_db)
):
    # Find repo ID
    full_name = f"{owner}/{repo}"
    repo_obj = db.query(models.Repository).filter(models.Repository.full_name == full_name).first()
    if not repo_obj:
        return {"error": "Repository not found or not yet ingested"}
    
    analyzer = Analyzer(db)
    
    return {
        "stats": analyzer.get_repo_stats(repo_obj.id),
        "matrix": analyzer.get_reviewer_matrix(repo_obj.id),
        "anomalies": analyzer.detect_anomalies(repo_obj.id),
        "bias_risks": analyzer.detect_bias(repo_obj.id)
    }

@app.post("/classify/trigger")
async def trigger_classification(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Manually trigger the comment classification process in the background.
    In a real app, this might be scheduled or triggered after ingestion.
    """
    classifier = CommentClassifier(db)
    # Using a simple async wrapper for the synchronous anthropic call provided in the snippet,
    # or ideally ensure threaded execution if the library is sync.
    # For now, we'll assume the method in classifier.py is async-friendly or we wrap it.
    
    async def run_classification():
        # Running in loop to process multiple batches
        total_processed = 0
        while True:
            count = await classifier.classify_batch(batch_size=50)
            if count == 0:
                break
            total_processed += count
            
    background_tasks.add_task(run_classification)
    return {"status": "Classification started"}

@app.post("/ingest/{owner}/{repo}")
async def ingest_repo(
    owner: str, 
    repo: str, 
    background_tasks: BackgroundTasks,
    token: str,  # In real app, extract from JWT dependency
    db: Session = Depends(get_db)
):
    ingestor = GitHubIngestor(token, db)
    # Run in background to avoid timeout
    background_tasks.add_task(ingestor.ingest_repository, owner, repo)
    return {"status": "Ingestion started", "repository": f"{owner}/{repo}"}

from gitlab_ingestion import GitLabIngestor

@app.post("/ingest/gitlab/{project_id_or_path}")
async def ingest_gitlab(
    project_id_or_path: str,
    background_tasks: BackgroundTasks,
    token: str,
    db: Session = Depends(get_db)
):
    ingestor = GitLabIngestor(token, db)
    background_tasks.add_task(ingestor.ingest_project, project_id_or_path)
    return {"status": "GitLab Ingestion started", "project": project_id_or_path}

from exporter import ReportExporter
from fastapi.responses import Response

@app.get("/repos/{owner}/{repo}/export")
async def export_report(
    owner: str, 
    repo: str,
    format: str = "json", # json or csv
    db: Session = Depends(get_db)
):
    # Find repo ID
    full_name = f"{owner}/{repo}"
    repo_obj = db.query(models.Repository).filter(models.Repository.full_name == full_name).first()
    if not repo_obj:
        return {"error": "Repository not found"}

    exporter = ReportExporter(db, repo_obj.id)
    
    if format == "csv":
        csv_content = exporter.generate_csv_report()
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=reviewlens_report_{owner}_{repo}.csv"}
        )
    
    # Default to JSON
    json_content = exporter.generate_json_report()
    return Response(
        content=json_content,
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename=reviewlens_report_{owner}_{repo}.json"}
    )

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
