from sqlalchemy.orm import Session

from app.models.job import Job
from app.schemas.job import JobCreate
from app.ai.skill_extractor import extract_skills


def create_job(db: Session, job: JobCreate):

    extracted_skills = extract_skills(job.description)

    db_job = Job(
        title=job.title,
        company=job.company,
        location=job.location,
        description=job.description,
        skills=",".join(extracted_skills)
    )

    db.add(db_job)
    db.commit()
    db.refresh(db_job)

    return db_job


def get_job_by_id(db: Session, job_id: int):
    return db.query(Job).filter(Job.id == job_id).first()

def get_all_jobs(db: Session):
    return db.query(Job).all()
