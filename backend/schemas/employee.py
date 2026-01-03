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
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    emergency_contact_relation: Optional[str] = None
    
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
