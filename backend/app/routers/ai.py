from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.utils.jwt import get_current_user
from app.models.user import User

from app.crud.resume import get_latest_resume_by_user
from app.services.resume_analyzer import analyze_resume

router = APIRouter(
    prefix="/ai",
    tags=["AI"]
)


@router.get("/analyze")
def analyze_my_resume(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    resume = get_latest_resume_by_user(
        db,
        current_user.id
    )

    if resume is None:
        raise HTTPException(
            status_code=404,
            detail="Resume not found"
        )

    if not resume.extracted_text:
        raise HTTPException(
            status_code=400,
            detail="Resume text not found"
        )

    result = analyze_resume(
        resume.extracted_text
    )

    return result