from pydantic import BaseModel
from datetime import datetime


class ResumeResponse(BaseModel):
    id: int
    user_id: int
    file_name: str
    file_path: str
    uploaded_at: datetime

    model_config = {
        "from_attributes": True
    }