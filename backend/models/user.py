from sqlalchemy import Column, String, Boolean, Enum
from .base import Base, BaseModel
import enum

class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    HR = "HR"
    EMPLOYEE = "EMPLOYEE"

class User(Base, BaseModel):
    __tablename__ = "users"

    login_id = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.EMPLOYEE, nullable=False)
    must_change_password = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False) # Email verification status

    # Relationships can be defined here if needed, but for now we keep it clean.
    # Inverse relationships will be defined in other models.
