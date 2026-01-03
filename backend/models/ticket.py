from sqlalchemy import Column, Integer, String, Text, ForeignKey, Enum, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base, BaseModel
import enum

class TicketStatus(str, enum.Enum):
    OPEN = "OPEN"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"

class Ticket(Base, BaseModel):
    __tablename__ = "tickets"

    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    
    category = Column(String, nullable=False) # e.g. IT, HR, Payroll
    subject = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    
    status = Column(String, default=TicketStatus.OPEN, nullable=False)
    resolution = Column(Text, nullable=True)
    
    assigned_to_id = Column(Integer, ForeignKey("users.id"), nullable=True) # HR User
    
    # Relationships
    employee = relationship("Employee", backref="tickets")
    assigned_to = relationship("User", foreign_keys=[assigned_to_id])
