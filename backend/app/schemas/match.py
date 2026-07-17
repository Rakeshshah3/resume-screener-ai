from pydantic import BaseModel


class MatchResponse(BaseModel):
    id: int
    user_id: int
    job_id: int
    resume_id: int
    match_percentage: float

    class Config:
        from_attributes = True



class RecruiterMatchResponse(BaseModel):
    rank: int
    resume_id: int
    candidate_name: str
    email: str
    resume_file: str
    match_percentage: float