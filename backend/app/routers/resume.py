import os
import shutil
import uuid
from typing import Optional
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.utils.jwt import get_current_user, role_required
from app.models.resume import Resume
from app.crud.resume import (
    create_resume,
    delete_resume_by_user,
    get_resume_by_id
)
from app.schemas.resume import ResumeResponse
from app.services.pdf_parser import extract_text_from_pdf
from app.services.skill_extractor import extract_skills

router = APIRouter(
    prefix="/resume",
    tags=["Resume"]
)

# 🚀 NEW ENDPOINT: Fetch the logged-in candidate's own resume profile vector
@router.get("/my-resume", response_model=ResumeResponse)
def get_my_resume(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Queries the database for a resume associated with the currently
    authenticated user context. Allows frontend dashboard score loops to resolve.
    """
    resume = db.query(Resume).filter(Resume.user_id == current_user.id).first()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No resume profile vector registered for this account node yet."
        )
        
    return resume


@router.post("/upload", response_model=ResumeResponse)
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Check if a file was selected
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file selected."
        )

    # Validate PDF format metadata
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed."
        )

    # Create local storage folders
    os.makedirs("uploads/resumes", exist_ok=True)

    # Save uploaded file structure
    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    file_path = f"uploads/resumes/{unique_filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Extract raw text assets
    try:
        # Note: Since your pdf_parser logic takes file bytes, we read the buffer
        file.file.seek(0)  # Reset pointer just in case
        file_bytes = file.file.read()
        extracted_text = extract_text_from_pdf(file_bytes)
    except Exception as e:
        # Delete corrupted file artifacts immediately
        if os.path.exists(file_path):
            os.remove(file_path)

        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse PDF: {str(e)}"
        )

    # Extract target parsing skillsets
    extracted_data = extract_skills(extracted_text)
    
    # 🚀 FIX: Safety parsing check to ensure a flat string layout hits the database layer
    if isinstance(extracted_data, (list, set, tuple)):
        skills_text = ",".join(sorted(list(set(extracted_data))))
    elif isinstance(extracted_data, str):
        skills_text = extracted_data
    else:
        skills_text = ""

    # Flush historic resume row data for clean candidate constraints
    delete_resume_by_user(
        db=db,
        user_id=current_user.id
    )

    # Persist the newly parsed record mapping
    resume = create_resume(
        db=db,
        user_id=current_user.id,
        file_name=unique_filename,
        file_path=file_path,
        extracted_text=extracted_text,
        skills=skills_text
    )

    return resume


@router.get("/download/{resume_id}")
def download_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(role_required("recruiter"))
):
    """
    Recruiter-Only Route: Fetches the candidate's physical resume file using 
    the numerical database record primary key ID.
    """
    resume = get_resume_by_id(
        db=db,
        resume_id=resume_id
    )

    if resume is None:
        raise HTTPException(
            status_code=404,
            detail="Resume record not found in database registry."
        )

    if not os.path.exists(resume.file_path):
        raise HTTPException(
            status_code=404,
            detail="Physical PDF file missing from backend file system storage."
        )

    return FileResponse(
        path=resume.file_path,
        filename=resume.file_name,
        media_type="application/pdf"
    )