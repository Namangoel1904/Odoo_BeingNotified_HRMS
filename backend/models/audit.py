from sqlalchemy import Column, String, Integer, ForeignKey, Text
from sqlalchemy.orm import relationship
from .base import Base, BaseModel
from .user import User

class AuditLog(Base, BaseModel):
    __tablename__ = "audit_logs"

    actor_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String, nullable=False) # e.g. "CREATE_USER", "APPROVE_LEAVE"
    target_type = Column(String, nullable=False) # e.g. "Employee", "LeaveRequest"
    target_public_id = Column(String, nullable=False)
    details = Column(Text, nullable=True) # JSON or text details

    actor = relationship("User")
