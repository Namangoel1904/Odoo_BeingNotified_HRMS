from sqlalchemy import Column, Integer, ForeignKey, Numeric, Date
from sqlalchemy.orm import relationship
from .base import Base, BaseModel
from .employee import Employee

class SalaryStructure(Base, BaseModel):
    __tablename__ = "salary_structures"

    employee_id = Column(Integer, ForeignKey("employees.id"), unique=True, nullable=False)
    
    # Input
    wage = Column(Numeric(10, 2), nullable=False)
    
    # Configuration (Snapshot)
    basic_percentage = Column(Numeric(5, 2), default=50.00) # e.g. 50.00
    hra_percentage = Column(Numeric(5, 2), default=50.00)   # % of Basic
    pf_employee_percentage = Column(Numeric(5, 2), default=12.00) 
    pf_employer_percentage = Column(Numeric(5, 2), default=12.00)
    professional_tax = Column(Numeric(10, 2), default=200.00)

    # Calculated Components (Monthly)
    basic_component = Column(Numeric(10, 2), nullable=False)
    hra_component = Column(Numeric(10, 2), nullable=False)
    standard_allowance = Column(Numeric(10, 2), default=4167.00)
    performance_bonus = Column(Numeric(10, 2), nullable=False)
    leave_travel_allowance = Column(Numeric(10, 2), nullable=False)
    fixed_allowance = Column(Numeric(10, 2), nullable=False) # Residual
    
    # Deductions
    pf_employee_amount = Column(Numeric(10, 2), nullable=False)
    pf_employer_amount = Column(Numeric(10, 2), nullable=False)
    
    effective_from = Column(Date, nullable=False)

    employee = relationship("Employee", backref="salary_structure")
