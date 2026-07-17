from sqlalchemy.orm import Session
from sqlalchemy import text # 🚀 Added text for secure raw SQL execution
from app.models.resume import Resume


def create_resume(
    db: Session,
    user_id: int,
    file_name: str,
    file_path: str,
    extracted_text: str,
    skills: str
):
    resume = Resume(
        user_id=user_id,
        file_name=file_name,
        file_path=file_path,
        extracted_text=extracted_text,
        skills=skills
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)
    return resume


def get_latest_resume_by_user(
    db: Session,
    user_id: int
):
    return (
        db.query(Resume)
        .filter(Resume.user_id == user_id)
        .order_by(Resume.id.desc())
        .first()
    )


def delete_resume_by_user(
    db: Session,
    user_id: int
):
    """
    Safely purges the old resume by first clearing out the children records 
    in the matches table to avoid foreign key integrity constraint violations.
    """
    resume = (
        db.query(Resume)
        .filter(Resume.user_id == user_id)
        .first()
    )

    if resume:
        # 🚀 THE FIX: Clear out the associated rows in the `matches` table first
        db.execute(
            text("DELETE FROM matches WHERE resume_id = :resume_id"),
            {"resume_id": resume.id}
        )
        
        # Now it is completely unlinked and safe to delete the resume parent row
        db.delete(resume)
        db.commit()


def get_resume_by_id(
    db: Session,
    resume_id: int
):
    return (
        db.query(Resume)
        .filter(Resume.id == resume_id)
        .first()
    )