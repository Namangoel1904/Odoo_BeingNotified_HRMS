from sqlalchemy import Column, String, Integer, ForeignKey, Date, Text
from sqlalchemy.orm import relationship
from .base import Base, BaseModel
from .user import User

class Employee(Base, BaseModel):
    __tablename__ = "employees"

    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False) # HR who created this profile
    
    employee_code = Column(String, unique=True, index=True, nullable=False) # e.g. EMP001 (Internal usage if needed, or same as login_id)
    # Actually user wanted login_id on User. Employee code might be redundant but good for display.
    
    full_name = Column(String, nullable=False)
    department = Column(String, nullable=False)
    job_title = Column(String, nullable=False)
    date_of_joining = Column(Date, nullable=False)
    phone = Column(String, unique=True, nullable=False)
    address = Column(Text, nullable=True)
    profile_picture_url = Column(Text, nullable=True)
    
    # Enhanced Fields
    gender = Column(String, nullable=True)
    marital_status = Column(String, nullable=True)
    nationality = Column(String, nullable=True)
    personal_email = Column(String, nullable=True)
    emergency_contact_name = Column(String, nullable=True)
    emergency_contact_phone = Column(String, nullable=True)
    emergency_contact_relation = Column(String, nullable=True)

    # Resume Fields
    about_me = Column(Text, nullable=True)
    job_love = Column(Text, nullable=True)
    interests = Column(Text, nullable=True)
    skills = Column(Text, nullable=True)
    certifications = Column(Text, nullable=True)

    # Relationships
    user = relationship("User", foreign_keys=[user_id], backref="employee_profile")
    created_by = relationship("User", foreign_keys=[created_by_id])
    
