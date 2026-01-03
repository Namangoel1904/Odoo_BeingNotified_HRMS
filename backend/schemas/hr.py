from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date

class CreateEmployeeSchema(BaseModel):
    full_name: str
    email: EmailStr
    phone: str # Mandatory now
    department: str
    job_title: str
    joining_date: date
    joining_year: int
    
    # Optional fields for future use or if we want to allow setting them now
    address: Optional[str] = None

class CreateEmployeeResponse(BaseModel):
    message: str
    employee_login_id: str
    temporary_password: str
    public_id: str
