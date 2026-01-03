from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.models.user import User, UserRole
from backend.models.employee import Employee
from backend.models.payroll import SalaryStructure
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
    
    # Fetch Salary Structure
    salary = db.query(SalaryStructure).filter(SalaryStructure.employee_id == employee.id).first()
    
    return EmployeeProfileResponse.model_validate(
        {
            "full_name": employee.full_name,
            "email": current_user.email, # Source of truth for email is User
            "phone": employee.phone,
            "department": employee.department,
            "job_title": employee.job_title,
            "joining_date": employee.date_of_joining,
            "address": employee.address,
            "profile_picture_url": employee.profile_picture_url,
            "employee_code": employee.employee_code,
            
            # Enhanced Fields
            "gender": employee.gender,
            "marital_status": employee.marital_status,
            "nationality": employee.nationality,
            "personal_email": employee.personal_email,
            "emergency_contact_name": employee.emergency_contact_name,
            "emergency_contact_phone": employee.emergency_contact_phone,
            "emergency_contact_relation": employee.emergency_contact_relation,
            
            # Resume Fields
            "about_me": employee.about_me,
            "job_love": employee.job_love,
            "interests": employee.interests,
            "skills": employee.skills,
            "certifications": employee.certifications,

            # Salary Data
            "salary_wage": salary.wage if salary else 0,
            "salary_basic": salary.basic_component if salary else 0,
            "salary_hra": salary.hra_component if salary else 0,
            "salary_sa": salary.standard_allowance if salary else 0,
            "salary_pb": salary.performance_bonus if salary else 0,
            "salary_lta": salary.leave_travel_allowance if salary else 0,
            "salary_fixed": salary.fixed_allowance if salary else 0,
            "salary_pf_employee": salary.pf_employee_amount if salary else 0,
            "salary_pt": salary.professional_tax if salary else 0,
            "salary_net": (salary.wage - salary.pf_employee_amount - salary.professional_tax) if salary else 0
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
    
    # Update Resume Fields
    employee.about_me = profile_data.about_me
    employee.job_love = profile_data.job_love
    employee.interests = profile_data.interests
    employee.skills = profile_data.skills
    employee.certifications = profile_data.certifications
    
    db.commit()
    db.refresh(employee)
    
    # Fetch Salary for response consistency
    salary = db.query(SalaryStructure).filter(SalaryStructure.employee_id == employee.id).first()
    
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
            "emergency_contact_relation": employee.emergency_contact_relation,
            
            # Resume Fields
            "about_me": employee.about_me,
            "job_love": employee.job_love,
            "interests": employee.interests,
            "skills": employee.skills,
            "certifications": employee.certifications,

             # Salary Data
            "salary_wage": salary.wage if salary else 0,
            "salary_basic": salary.basic_component if salary else 0,
            "salary_hra": salary.hra_component if salary else 0,
            "salary_sa": salary.standard_allowance if salary else 0,
            "salary_pb": salary.performance_bonus if salary else 0,
            "salary_lta": salary.leave_travel_allowance if salary else 0,
            "salary_fixed": salary.fixed_allowance if salary else 0,
            "salary_pf_employee": salary.pf_employee_amount if salary else 0,
            "salary_pt": salary.professional_tax if salary else 0,
            "salary_net": (salary.wage - salary.pf_employee_amount - salary.professional_tax) if salary else 0 
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
            "emergency_contact_relation": employee.emergency_contact_relation,
            
            # Resume Fields
            "about_me": employee.about_me,
            "job_love": employee.job_love,
            "interests": employee.interests,
            "skills": employee.skills,
            "certifications": employee.certifications,

            # Salary Data (Empty or defaults here is fine, typically upload doesn't need full context but consistent schema requires it)
            # Salary Data
            "salary_wage": 0,
            "salary_basic": 0,
            "salary_hra": 0,
            "salary_sa": 0,
            "salary_pb": 0,
            "salary_lta": 0,
            "salary_fixed": 0,
            "salary_pf_employee": 0,
            "salary_pt": 0,
            "salary_net": 0
        }
    )
