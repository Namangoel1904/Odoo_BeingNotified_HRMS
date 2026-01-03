from sqlalchemy import Column, String, Integer, ForeignKey, Date, DateTime, Enum, Text
from sqlalchemy.orm import relationship
from .base import Base, BaseModel
from .employee import Employee
from .user import User
import enum

class AttendanceStatus(str, enum.Enum):
    PRESENT = "PRESENT"
    ABSENT = "ABSENT"
    HALF_DAY = "HALF_DAY"
    LEAVE = "LEAVE"

class Attendance(Base, BaseModel):
    __tablename__ = "attendance_records"

    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    date = Column(Date, nullable=False)
    check_in = Column(DateTime, nullable=True)
    check_out = Column(DateTime, nullable=True)
    status = Column(Enum(AttendanceStatus), default=AttendanceStatus.ABSENT, nullable=False)

    employee = relationship("Employee", backref="attendance_records")


class LeaveType(str, enum.Enum):
    PAID = "PAID"
    SICK = "SICK"
    UNPAID = "UNPAID"

class LeaveStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class LeaveRequest(Base, BaseModel):
    __tablename__ = "leave_requests"

    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    leave_type = Column(Enum(LeaveType), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    reason = Column(Text, nullable=False)
    attachment_url = Column(Text, nullable=True) # For sick leave certificate
    
    status = Column(Enum(LeaveStatus), default=LeaveStatus.PENDING, nullable=False)
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    review_comment = Column(Text, nullable=True)

    employee = relationship("Employee", backref="leave_requests")
    reviewer = relationship("User")
