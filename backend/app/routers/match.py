from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List

from app.database.database import get_db
from app.utils.jwt import get_current_user, role_required
from app.models.user import User
from app.models.resume import Resume  
from app.models.job import Job        
from app.models.match import Match     # 🚀 Import for Match model mapping

from app.schemas.match import RecruiterMatchResponse, MatchResponse    
from app.crud.resume import get_latest_resume_by_user
from app.crud.job import get_job_by_id
from app.crud.match import save_match

from app.ai.matcher import calculate_match

router = APIRouter(
    prefix="/match",
    tags=["Match"]
)

@router.post("/apply/{job_id}", status_code=status.HTTP_201_CREATED)
def apply_to_desired_role(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Candidate Action Endpoint: Submits an application against a desired job role
    and calculates/stores the match percentage vectors securely.
    """
    resume = get_latest_resume_by_user(db, current_user.id)
    if resume is None:
        raise HTTPException(
            status_code=404,
            detail="No resume profile found on your profile. Please upload a resume first."
        )

    job = get_job_by_id(db, job_id)
    if job is None:
        raise HTTPException(
            status_code=404,
            detail="The target job vacancy node could not be found."
        )

    if not resume.skills:
        raise HTTPException(
            status_code=400,
            detail="Your parsed resume vector contains zero technology tokens."
        )

    if not job.skills:
        raise HTTPException(
            status_code=400,
            detail="Target job description has no tech tags initialized for scoring."
        )

    # Prevent duplicate applications
    existing_application = db.query(Match).filter(
        Match.user_id == current_user.id,
        Match.job_id == job_id
    ).first()
    if existing_application:
        raise HTTPException(
            status_code=400,
            detail="You have already submitted an application vector for this role."
        )

    resume_skills = [s.strip() for s in resume.skills.split(",") if s.strip()]
    job_skills = [s.strip() for s in job.skills.split(",") if s.strip()]

    result = calculate_match(resume_skills, job_skills)

    # Save application matrix log
    save_match(
        db=db,
        user_id=current_user.id,
        job_id=job.id,
        resume_id=resume.id,
        percentage=result["match_percentage"]
    )

    return {
        "message": f"Successfully applied for {job.title}!",
        "match_score": float(result["match_percentage"])
    }


@router.get(
    "/job/{job_id}",
    response_model=List[dict] # Changed to a generic dict list temporarily to prevent rigid Pydantic validation crashes
)
def get_job_matches(
    job_id: int,
    limit: int = Query(default=5, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(role_required("recruiter"))
):
    """
    Recruiter Console Query: Displays ONLY candidates who intentionally applied.
    """
    matches = db.query(Match).filter(Match.job_id == job_id).all()

    # SAFE SCORE EXTRACTOR FOR RECRUITER ROWS
    def get_match_score(m):
        if hasattr(m, 'match_percentage') and m.match_percentage is not None:
            return float(m.match_percentage)
        elif hasattr(m, 'percentage') and m.percentage is not None:
            return float(m.percentage)
        return 0.0

    sorted_matches = sorted(matches, key=get_match_score, reverse=True)[:limit]

    result = []
    for index, match in enumerate(sorted_matches, start=1):
        candidate_user = db.query(User).filter(User.id == match.user_id).first()
        resume = db.query(Resume).filter(Resume.id == match.resume_id).first()
        
        if not candidate_user or not resume:
            continue

        result.append(
            {
                "id": match.id, # 🚀 REQUIRED: Exposing the application instance primary key node
                "rank": index,
                "resume_id": match.resume_id,
                "candidate_name": candidate_user.name if hasattr(candidate_user, 'name') else f"Candidate #{match.user_id}",
                "email": candidate_user.email,
                "resume_file": resume.file_path if hasattr(resume, 'file_path') else "resume_file.pdf",
                "match_percentage": get_match_score(match),
                "status": getattr(match, 'status', 'Applied') or 'Applied' # 🚀 INJECTED: Pass status mapping downstream
            }
        )

    return result


# 🚀 NEW INTERACTIVE ROUTE: Patch selection status matrix parameters dynamically
@router.patch("/status/{match_id}", status_code=status.HTTP_200_OK)
def update_application_status(
    match_id: int,
    status_update: str, # "Shortlisted" or "Rejected"
    db: Session = Depends(get_db),
    current_user: User = Depends(role_required("recruiter"))
):
    """
    Recruiter Console Control: Mutates status logs to shortlist or reject applicants.
    """
    match_record = db.query(Match).filter(Match.id == match_id).first()
    if not match_record:
        raise HTTPException(status_code=404, detail="Target application node not found.")

    normalized_status = status_update.strip().capitalize()
    if normalized_status not in ["Applied", "Shortlisted", "Rejected"]:
        raise HTTPException(status_code=400, detail="Invalid process status update assignment parameter.")

    # Write changes securely to your state machine column context
    match_record.status = normalized_status
    db.commit()
    db.refresh(match_record)

    return {
        "message": f"Candidate state updated to {normalized_status} successfully.",
        "status": normalized_status
    }


@router.get("/candidate/history", response_model=List[dict])
def get_candidate_application_matching_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Candidate history tracking.
    """
    applied_records = db.query(Match).filter(Match.user_id == current_user.id).all()
    if not applied_records:
        return []

    history_log = []
    for app_record in applied_records:
        job = db.query(Job).filter(Job.id == app_record.job_id).first()
        if not job:
            continue
            
        # SAFE SCORE EXTRACTOR FOR CANDIDATE HISTORY
        score = 0.0
        if hasattr(app_record, 'match_percentage') and app_record.match_percentage is not None:
            score = float(app_record.match_percentage)
        elif hasattr(app_record, 'percentage') and app_record.percentage is not None:
            score = float(app_record.percentage)
            
        history_log.append({
            "job_id": job.id,
            "title": job.title,
            "company": job.company,
            "location": job.location,
            "match_percentage": score,
            "job_skills": job.skills or "",
            "status": getattr(app_record, 'status', 'Applied') or 'Applied' # Included candidate status perspective
        })

    history_log.reverse()
    return history_log