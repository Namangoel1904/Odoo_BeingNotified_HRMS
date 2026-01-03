from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date

class EmployeeProfileResponse(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    department: str
    job_title: str
    joining_date: date
    address: Optional[str] = None
    profile_picture_url: Optional[str] = None
    employee_code: str
    
    # Enhanced Fields
    gender: Optional[str] = None
    marital_status: Optional[str] = None
    nationality: Optional[str] = None
    personal_email: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    emergency_contact_relation: Optional[str] = None
    
    # Resume Fields
    about_me: Optional[str] = None
    job_love: Optional[str] = None
    interests: Optional[str] = None
    skills: Optional[str] = None
    certifications: Optional[str] = None

    # Salary Info (Read Only)
    salary_wage: Optional[float] = 0
    salary_basic: Optional[float] = 0
    salary_hra: Optional[float] = 0
    salary_sa: Optional[float] = 0 # Standard Allowance
    salary_pb: Optional[float] = 0 # Performance Bonus
    salary_lta: Optional[float] = 0
    salary_fixed: Optional[float] = 0 # Fixed Allowance
    salary_pf_employee: Optional[float] = 0
    salary_pt: Optional[float] = 0
    salary_net: Optional[float] = 0
    
    class Config:
        from_attributes = True

class EmployeeProfileUpdate(BaseModel):
    phone: str
    address: str
    
    # Enhanced Fields
    gender: Optional[str] = None
    marital_status: Optional[str] = None
    nationality: Optional[str] = None
    personal_email: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    emergency_contact_relation: Optional[str] = None

    # Resume Fields
    about_me: Optional[str] = None
    job_love: Optional[str] = None
    interests: Optional[str] = None
    skills: Optional[str] = None
    certifications: Optional[str] = None
