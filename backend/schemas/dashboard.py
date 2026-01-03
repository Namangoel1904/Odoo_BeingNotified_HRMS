from pydantic import BaseModel
from typing import Optional, List
from datetime import time

class DashboardAttendance(BaseModel):
    checked_in: bool
    check_in_time: Optional[time] = None
    check_out_time: Optional[time] = None
    status: str

class DashboardStats(BaseModel):
    total: int
    active: int # pending for leave, open for tickets

class DashboardProfile(BaseModel):
    is_complete: bool
    missing_fields: List[str]

class EmployeeDashboardResponse(BaseModel):
    employee: dict # {id, name}
    attendance_today: DashboardAttendance
    leave_summary: DashboardStats
    ticket_summary: DashboardStats
    profile_status: DashboardProfile
