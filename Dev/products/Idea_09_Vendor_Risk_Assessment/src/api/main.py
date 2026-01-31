from fastapi import FastAPI
from .routes import vendors, assessments
from src.monitoring.logger import setup_monitoring

# Setup monitoring
logger = setup_monitoring()

def create_app() -> FastAPI:
    app = FastAPI(title="VendorScope API", version="1.0.0")

    # Include Routers
    app.include_router(vendors.router, prefix="/api/v1/vendors", tags=["vendors"])
    app.include_router(assessments.router, prefix="/api/v1/assessments", tags=["assessments"])

    @app.get("/health")
    async def health_check():
        return {"status": "ok", "version": "1.0.0"}

    return app

app = create_app()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
