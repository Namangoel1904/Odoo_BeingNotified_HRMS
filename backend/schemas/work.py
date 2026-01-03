from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime
from enum import Enum

# Enums (Must match Models)
class AttendanceStatus(str, Enum):
    PRESENT = "PRESENT"
    ABSENT = "ABSENT"
    HALF_DAY = "HALF_DAY"
    LEAVE = "LEAVE"

class LeaveType(str, Enum):
    PAID = "PAID"
    SICK = "SICK"
    UNPAID = "UNPAID"

class LeaveStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

# Attendance Schemas
class AttendanceBase(BaseModel):
    pass

class AttendanceCreate(AttendanceBase):
    pass # No input needed for check-in/out, derived from context

class AttendanceResponse(AttendanceBase):
    public_id: str
    date: date
    check_in: Optional[datetime] = None
    check_out: Optional[datetime] = None
    status: AttendanceStatus

    class Config:
        from_attributes = True

class AttendanceMonthSummary(BaseModel):
    month: str # "YYYY-MM"
    records: List[AttendanceResponse]
    stats: dict # { "present": 10, "absent": 2 }

# Leave Schemas
class LeaveRequestCreate(BaseModel):
    leave_type: LeaveType
    start_date: date
    end_date: date
    reason: str

class LeaveRequestResponse(BaseModel):
    public_id: str
    leave_type: LeaveType
    start_date: date
    end_date: date
    reason: str
    attachment_url: Optional[str] = None
    status: LeaveStatus
    created_at: datetime
    
    class Config:
        from_attributes = True
