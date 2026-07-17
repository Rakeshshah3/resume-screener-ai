from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.utils.jwt import get_current_user
from app.models.user import User
from app.models.resume import Resume
from app.models.job import Job  
from app.ai.matcher import calculate_match

router = APIRouter(
    prefix="/candidate",
    tags=["Candidate Console"]
)

@router.get("/history", response_model=List[dict])
def get_application_matching_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Candidate-Facing Route: Compiles neural alignment metrics across all system vacancies.
    """
    # 1. Locate the user's active resume node
    resume = db.query(Resume).filter(Resume.user_id == current_user.id).first()
    if not resume or not resume.skills:
        return [] # Return empty structural payload safely if no profile file exists yet

    resume_skills = [s.strip() for s in resume.skills.split(",") if s.strip()]
    all_jobs = db.query(Job).all()
    history_log = []

    # 2. Iterate across all open market matrices to map historical alignments
    for job in all_jobs:
        if not job.skills:
            continue
            
        job_skills = [s.strip() for s in job.skills.split(",") if s.strip()]
        result = calculate_match(resume_skills, job_skills)
        
        history_log.append({
            "job_id": job.id,
            "title": job.title,
            "company": job.company,
            "location": job.location,
            "match_percentage": float(result["match_percentage"]),
            "job_skills": job.skills
        })

    # Sort alignment scores from peak placement match down to lowest baseline entries
    history_log.sort(key=lambda x: x["match_percentage"], reverse=True)
    return history_log