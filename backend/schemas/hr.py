from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, datetime, time

class CreateEmployeeSchema(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    department: str
    job_title: str
    joining_date: date
    joining_year: int
    monthly_wage: float
    
    # Optional fields
    address: Optional[str] = None

class CreateEmployeeResponse(BaseModel):
    message: str
    employee_login_id: str
    temporary_password: str
    public_id: str

class HRDashboardStats(BaseModel):
    total_employees: int
    present_today: int
    on_leave_today: int
    pending_leaves: int
    open_tickets: int

class HREmployeeSummary(BaseModel):
    public_id: str
    employee_code: str
    full_name: str
    department: str
    job_title: str
    profile_picture_url: Optional[str] = None
    is_active: bool
    email: str

class HRAttendanceToday(BaseModel):
    employee_id: str
    employee_name: str
    department: str
    check_in: Optional[time]
    check_out: Optional[time]
    status: str # Present, Absent, Late, On Leave
    profile_picture_url: Optional[str] = None

class HRAttendanceHistory(BaseModel):
    date: date
    check_in: Optional[datetime]
    check_out: Optional[datetime]
    status: str

class HRLeaveRequestResponse(BaseModel):
    id: int
    public_id: str
    employee_name: str
    employee_code: str
    leave_type: str
    start_date: date
    end_date: date
    reason: Optional[str] = None
    status: str
    attachment_url: Optional[str] = None
    created_at: datetime
    hr_remarks: Optional[str] = None

    class Config:
        from_attributes = True

class LeaveActionRequest(BaseModel):
    action: str # "APPROVE" or "REJECT"
    remarks: Optional[str] = None

class HRTicketResponse(BaseModel):
    id: int
    public_id: str
    employee_name: str
    employee_code: str
    category: str
    subject: str
    description: str
    status: str
    resolution: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class TicketActionRequest(BaseModel):
    status: str # OPEN, IN_PROGRESS, RESOLVED, CLOSED
    resolution: Optional[str] = None

class HRSalaryResponse(BaseModel):
    employee_id: str
    wage: float
    basic_component: float
    hra_component: float
    standard_allowance: float
    performance_bonus: float
    leave_travel_allowance: float
    fixed_allowance: float
    pf_employee_amount: float
    pf_employer_amount: float
    professional_tax: float
    net_salary: float
    # Percentages if needed, or just amounts for display
    
    class Config:
        from_attributes = True

class SalaryUpdateRequest(BaseModel):
    monthly_wage: float
