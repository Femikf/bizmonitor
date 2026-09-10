import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.upload import router as upload_router
from app.api.analytics_router import router as analytics_router
from app.api.cloud_router import router as cloud_router
from app.api.ask_router import router as ask_router

app = FastAPI(
    title="OpsPilot API",
    description="Backend API for BizMonitor Business Intelligence & Telemetry Platform",
    version="1.0.0",
)

# Enable CORS middleware for frontend client connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router)
app.include_router(analytics_router)
app.include_router(cloud_router)
app.include_router(ask_router)




@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "OpsPilot API"
    }



if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
