from sqlalchemy import Column, Integer, ForeignKey, Numeric, Date
from sqlalchemy.orm import relationship
from .base import Base, BaseModel
from .employee import Employee

class SalaryStructure(Base, BaseModel):
    __tablename__ = "salary_structures"

    employee_id = Column(Integer, ForeignKey("employees.id"), unique=True, nullable=False)
    
    wage = Column(Numeric(10, 2), nullable=False)
    
    # Components (Calculated or Set)
    basic_component = Column(Numeric(10, 2), default=0)
    hra_component = Column(Numeric(10, 2), default=0)
    standard_allowance = Column(Numeric(10, 2), default=0)
    performance_bonus = Column(Numeric(10, 2), default=0)
    leave_travel_allowance = Column(Numeric(10, 2), default=0)
    fixed_allowance = Column(Numeric(10, 2), default=0)
    
    # Deductions
    pf_amount = Column(Numeric(10, 2), default=0)
    professional_tax = Column(Numeric(10, 2), default=0)
    
    effective_from = Column(Date, nullable=False)

    employee = relationship("Employee", backref="salary_structure")
