from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from backend.core.config import settings

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# Import all models here so Alembic/SQLAlchemy can find them
from backend.models.user import User
from backend.models.employee import Employee
from backend.models.work import Attendance, LeaveRequest
from backend.models.payroll import SalaryStructure
from backend.models.audit import AuditLog
from backend.models.base import Base

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
