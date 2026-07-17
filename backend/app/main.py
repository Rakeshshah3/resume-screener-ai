from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware # Added middleware import
from app.routers.match import router as match_router
from app.database.database import Base, engine
from app.models.job import Job

# Import models BEFORE create_all()
from app.models.user import User
from app.models.resume import Resume
from app.routers.ai import router as ai_router
from app.routers.auth import router as auth_router
from app.routers.jobs import router as job_router
from app.routers.resume import router as resume_router

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Resume Screener & Job Matcher",
    version="1.0.0"
)

# Configure CORS Middleware to allow connections from your Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Maps to your frontend local server
    allow_credentials=True,
    allow_methods=["*"],                      # Allows all POST, GET, OPTIONS methods
    allow_headers=["*"],                      # Allows all security headers
)

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