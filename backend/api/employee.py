from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.models.user import User, UserRole
from backend.models.employee import Employee
from backend.api.deps import get_db, get_current_active_user, RoleChecker
from backend.schemas.employee import EmployeeProfileResponse, EmployeeProfileUpdate

router = APIRouter()

allow_employee = RoleChecker([UserRole.EMPLOYEE])

@router.get("/profile", response_model=EmployeeProfileResponse, dependencies=[Depends(allow_employee)])
def get_employee_profile(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    employee = db.query(Employee).filter(Employee.user_id == current_user.id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee profile not found")
    
    return EmployeeProfileResponse.model_validate(
        {
            "full_name": employee.full_name,
            "email": current_user.email, # Source of truth for email is User
            "phone": employee.phone,
            "department": employee.department,
            "job_title": employee.job_title,
            "joining_date": employee.date_of_joining,
            "address": employee.address,
            "address": employee.address,
            "profile_picture_url": employee.profile_picture_url,
            "employee_code": employee.employee_code,
            "gender": employee.gender,
            "marital_status": employee.marital_status,
            "nationality": employee.nationality,
            "personal_email": employee.personal_email,
            "emergency_contact_name": employee.emergency_contact_name,
            "emergency_contact_phone": employee.emergency_contact_phone,
            "emergency_contact_relation": employee.emergency_contact_relation
        }
    )

@router.put("/profile", response_model=EmployeeProfileResponse, dependencies=[Depends(allow_employee)])
def update_employee_profile(
    profile_data: EmployeeProfileUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    employee = db.query(Employee).filter(Employee.user_id == current_user.id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee profile not found")
    
    # Check phone uniqueness if changed
    if profile_data.phone != employee.phone:
        if db.query(Employee).filter(Employee.phone == profile_data.phone).first():
            raise HTTPException(status_code=400, detail="Phone number already in use")
    
    employee.phone = profile_data.phone
    employee.address = profile_data.address
    
    # Update enhanced fields
    employee.gender = profile_data.gender
    employee.marital_status = profile_data.marital_status
    employee.nationality = profile_data.nationality
    employee.personal_email = profile_data.personal_email
    employee.emergency_contact_name = profile_data.emergency_contact_name
    employee.emergency_contact_phone = profile_data.emergency_contact_phone
    employee.emergency_contact_relation = profile_data.emergency_contact_relation
    
    db.commit()
    db.refresh(employee)
    
    return EmployeeProfileResponse.model_validate(
        {
            "full_name": employee.full_name,
            "email": current_user.email,
            "phone": employee.phone,
            "department": employee.department,
            "job_title": employee.job_title,
            "joining_date": employee.date_of_joining,
            "address": employee.address,
            "profile_picture_url": employee.profile_picture_url,
            "employee_code": employee.employee_code,
            "gender": employee.gender,
            "marital_status": employee.marital_status,
            "nationality": employee.nationality,
            "personal_email": employee.personal_email,
            "emergency_contact_name": employee.emergency_contact_name,
            "emergency_contact_phone": employee.emergency_contact_phone,
            "emergency_contact_relation": employee.emergency_contact_relation
        }
    )

from fastapi import UploadFile, File
import shutil
import os

@router.put("/profile-pic", response_model=EmployeeProfileResponse, dependencies=[Depends(allow_employee)])
def upload_profile_picture(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    employee = db.query(Employee).filter(Employee.user_id == current_user.id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee profile not found")
        
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
        
    # Generate filename
    file_ext = file.filename.split(".")[-1]
    filename = f"{current_user.public_id}.{file_ext}"
    file_path = f"backend/uploads/{filename}"
    
    # Save file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Could not save file")
        
    # Update DB with URL 
    # NOTE: In production, use full URL or CDN. Here, we use relative static path.
    # Frontend handles base URL pre-pending if needed, or we return full URL.
    # Let's return the static path like "/static/filename.ext"
    
    # Check absolute URL construction if we had request object, but relative is fine for now
    photo_url = f"/static/{filename}"
    employee.profile_picture_url = photo_url
    
    db.commit()
    db.refresh(employee)
    
    return EmployeeProfileResponse.model_validate(
        {
            "full_name": employee.full_name,
            "email": current_user.email,
            "phone": employee.phone,
            "department": employee.department,
            "job_title": employee.job_title,
            "joining_date": employee.date_of_joining,
            "address": employee.address,
            "profile_picture_url": employee.profile_picture_url,
            "employee_code": employee.employee_code,
            "gender": employee.gender,
            "marital_status": employee.marital_status,
            "nationality": employee.nationality,
            "personal_email": employee.personal_email,
            "emergency_contact_name": employee.emergency_contact_name,
            "emergency_contact_phone": employee.emergency_contact_phone,
            "emergency_contact_relation": employee.emergency_contact_relation
        }
    )
