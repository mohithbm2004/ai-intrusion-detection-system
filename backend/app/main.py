from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.database.session import engine
from app.database.base import Base
import app.models  # Ensures models are imported for table creation
from app.services.ml_service import ml_service
from app.api.auth import router as auth_router
from app.api.predictions import router as predictions_router

# Auto-create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    print("Initializing AI Intrusion Detection System FastAPI Server...")
    # Attempt loading trained ML model artifacts
    ml_service.load_model_artifacts()

# Register Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(predictions_router, prefix=settings.API_V1_STR)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": f"An unexpected error occurred: {str(exc)}",
            "detail": type(exc).__name__
        },
    )

@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": "1.0.0",
        "status": "online",
        "ml_model_loaded": ml_service.is_loaded,
        "docs": f"{settings.API_V1_STR}/docs"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "ml_engine": "online" if ml_service.is_loaded else "not_loaded"
    }
