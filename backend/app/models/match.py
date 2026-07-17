from sqlalchemy import Column, Integer, Float, ForeignKey
from sqlalchemy.orm import relationship

from app.database.database import Base


class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)

    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=False)

    match_percentage = Column(Float)

    user = relationship("User")
    job = relationship("Job")
    resume = relationship("Resume")