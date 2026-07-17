from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.utils.jwt import get_current_user, role_required
from app.models.user import User
from app.models.resume import Resume
from app.models.job import Job  
from app.schemas.job import JobCreate, JobResponse, JobRecommendation
from app.ai.matcher import calculate_match
from app.services.skill_extractor import extract_skills

router = APIRouter(
    prefix="/jobs",
    tags=["Jobs"]
)

# 1. Fetch all jobs directly from the DB layer
@router.get("/", response_model=List[JobResponse])
def fetch_all_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Job).all()

# 2. Inline CRUD creation with automated extraction sequence active
@router.post("/", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_new_job(
    job: JobCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(role_required("recruiter"))
):
    # Run the text analysis logic on the incoming description field
    extracted_data = extract_skills(job.description)

    # Prevent 1241 OperationalError by transforming lists/sets into a flat string
    if isinstance(extracted_data, (list, set, tuple)):
        extracted_skills = ",".join(sorted(list(set(extracted_data))))
    elif isinstance(extracted_data, str):
        extracted_skills = extracted_data
    else:
        extracted_skills = None

    db_job = Job(
        title=job.title,
        company=job.company,
        location=job.location,
        description=job.description,
        skills=extracted_skills  # Clean comma-separated string formatting bound safely
    )
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

# 3. Dynamic candidate alignment matching console
@router.get("/{job_id}/recommendations", response_model=List[JobRecommendation])
def get_job_recommendations(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=404,
            detail="Target job record not found."
        )

    if not job.skills:
        return []

    job_skills = [skill.strip() for skill in job.skills.split(",") if skill.strip()]
    all_resumes = db.query(Resume).all()
    recommendations = []

    for resume in all_resumes:
        if not resume.skills:
            continue

        # 🚀 FIX: Resolve user information details to fetch the real candidate name
        user_record = db.query(User).filter(User.id == resume.user_id).first()
        
        # Pull candidate name dynamically, falling back safely if name isn't set
        if user_record and hasattr(user_record, 'name') and user_record.name:
            candidate_display_name = user_record.name
        else:
            candidate_display_name = f"Candidate #{resume.user_id}"

        resume_skills = [skill.strip() for skill in resume.skills.split(",") if skill.strip()]
        result = calculate_match(resume_skills, job_skills)

        # We map candidate_display_name directly into the location attribute
        # so your frontend's c.location field populates with the real name
        recommendations.append(
            {
                "job_id": job.id,
                "resume_id": resume.id,
                "title": job.title,
                "company": resume.file_name,
                "location": candidate_display_name,  # 🚀 Real name injected successfully!
                "match_percentage": float(result["match_percentage"]),
                "skills": resume.skills  # Passed down to resolve local React modal logic
            }
        )

    recommendations.sort(key=lambda x: x["match_percentage"], reverse=True)
    return recommendations

# 🚀 4. Secure endpoint to delete an obsolete vacancy node
@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job_vacancy(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(role_required("recruiter"))
):
    """
    Recruiter-Only Route: Removes a job vacancy node from the system registry.
    """
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=404,
            detail="Target job record not found in system storage database."
        )
    
    try:
        db.delete(job)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Database operational constraint failure: {str(e)}"
        )
        
    return None