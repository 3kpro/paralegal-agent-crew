from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import logging

from src.core.orchestrator import MultiLaneOrchestrator
from src.api.routes import router
from src.core.logger import setup_logging

import os

# Config
logger = setup_logging()
MOCK_MODE = os.getenv("MOCK_MODE", "True").lower() == "true"

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting SolForge Engine...")
    config = {"mock_mode": MOCK_MODE}
    orchestrator = MultiLaneOrchestrator(config)
    orchestrator.initialize()
    
    # Attach to app state for routes to access
    app.state.orchestrator = orchestrator
    
    # Start the tick loop in background task
    task = asyncio.create_task(orchestrator.run_loop(interval_seconds=60))
    app.state.orchestrator_task = task
    
    yield
    
    # Shutdown
    logger.info("Shutting down SolForge Engine...")
    orchestrator.shutdown()
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass

app = FastAPI(
    title="SolForge AI Trading Bot",
    version="0.1.0",
    lifespan=lifespan
)

# CORS (Allow all for local dev integration with React)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "SolForge API is running"}
