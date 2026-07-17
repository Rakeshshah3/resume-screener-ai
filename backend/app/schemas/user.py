from pydantic import BaseModel,EmailStr,Field,ConfigDict
from typing import Literal

class UserCreate(BaseModel):
    name:str=Field(...,min_length=3,max_length=100)
    email:EmailStr
    password:str=Field(...,min_length=8,max_length=100)
    role: Literal["candidate", "recruiter"]

class UserResponse(BaseModel):
    id: int
    name: str   
    email: str
    role: str

    model_config = ConfigDict(from_attributes=True) 

class UserLogin(BaseModel):
    email: EmailStr
    password: str      
    