from pydantic import BaseModel
from typing import Optional

class JobCreate(BaseModel):
    title: str
    company: str
    location: str
    description: str

class JobResponse(BaseModel):
    id: int
    title: str
    company: str
    location: str
    description: str
    skills: Optional[str] = None  # Allows skills string parameter context to pass through

    class Config:
        from_attributes = True

class JobRecommendation(BaseModel):
    job_id: int
    resume_id: int  # 🚀 FIXED: Crucial identification link passed securely to client payload
    title: str
    company: str
    location: str
    match_percentage: float
    skills: str     # 🚀 FIXED: Supplies raw data fields to compute local diagnostic matrix overlays

    class Config:
        from_attributes = True