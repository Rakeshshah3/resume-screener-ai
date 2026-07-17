from sqlalchemy.orm import Session
from app.models.match import Match
from app.models.user import User
from app.models.resume import Resume


def get_job_matches_with_candidate_details(
    db: Session,
    job_id: int,
    limit: int = 5
):
    return (
        db.query(
            Resume.id.label("resume_id"),
            User.name.label("candidate_name"),
            User.email.label("email"),
            Resume.file_name.label("resume_file"),
            Match.match_percentage.label("match_percentage")
        )
        .join(User, Match.user_id == User.id)
        .join(Resume, Match.resume_id == Resume.id)
        .filter(Match.job_id == job_id)
        .order_by(Match.match_percentage.desc())
        .limit(limit)
        .all()
    )

def get_matches_by_job(db: Session, job_id: int):
    return (
        db.query(Match)
        .filter(Match.job_id == job_id)
        .order_by(Match.match_percentage.desc())
        .all()
    )
def save_match(
    db: Session,
    user_id: int,
    job_id: int,
    resume_id: int,
    percentage: float
):

    match = get_match(
        db,
        user_id,
        job_id
    )

    if match:

        match.resume_id = resume_id
        match.match_percentage = percentage

        db.commit()
        db.refresh(match)

        return match

    match = Match(
        user_id=user_id,
        job_id=job_id,
        resume_id=resume_id,
        match_percentage=percentage
    )

    db.add(match)
    db.commit()
    db.refresh(match)

    return match

def get_match(
    db: Session,
    user_id: int,
    job_id: int
):
    return (
        db.query(Match)
        .filter(
            Match.user_id == user_id,
            Match.job_id == job_id
        )
        .first()
    )    