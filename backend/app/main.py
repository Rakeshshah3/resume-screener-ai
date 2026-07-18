from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.database import Base, engine

# Import models BEFORE create_all()
from app.models.user import User
from app.models.resume import Resume
from app.models.job import Job

from app.routers.auth import router as auth_router
from app.routers.jobs import router as job_router
from app.routers.resume import router as resume_router
from app.routers.match import router as match_router
from app.routers.ai import router as ai_router

# Create all database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Resume Screener & Job Matcher",
    version="1.0.0"
)

# Allowed frontend origins
origins = [
    "http://localhost:5173",                      # Local React app
    "https://bejewelled-druid-512269.netlify.app" # Netlify frontend
]

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(auth_router)
app.include_router(job_router)
app.include_router(resume_router)
app.include_router(match_router)
app.include_router(ai_router)


@app.get("/")
def home():
    return {
        "message": "Welcome to AI Resume Screener & Job Matcher"
    }


@app.get("/health")
def health():
    return {
        "status": "Running"
    }