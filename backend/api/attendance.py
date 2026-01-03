from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, date
from backend.models.user import User, UserRole
from backend.models.employee import Employee
from backend.models.work import Attendance, AttendanceStatus
from backend.schemas.work import AttendanceResponse, AttendanceMonthSummary
from backend.api.deps import get_db, get_current_active_user, RoleChecker

router = APIRouter()
allow_employee = RoleChecker([UserRole.EMPLOYEE])

@router.post("/check-in", response_model=AttendanceResponse, dependencies=[Depends(allow_employee)])
def check_in(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    employee = db.query(Employee).filter(Employee.user_id == current_user.id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee profile not found")
    
    today = date.today()
    record = db.query(Attendance).filter(
        Attendance.employee_id == employee.id,
        Attendance.date == today
    ).first()
    
    if record:
        raise HTTPException(status_code=400, detail="Already checked in for today")
    
    new_record = Attendance(
        employee_id=employee.id,
        date=today,
        check_in=datetime.now(),
        status=AttendanceStatus.PRESENT
    )
    
    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    return new_record

@router.post("/check-out", response_model=AttendanceResponse, dependencies=[Depends(allow_employee)])
def check_out(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    employee = db.query(Employee).filter(Employee.user_id == current_user.id).first()
    today = date.today()
    record = db.query(Attendance).filter(
        Attendance.employee_id == employee.id,
        Attendance.date == today
    ).first()
    
    if not record:
        raise HTTPException(status_code=400, detail="No check-in record found for today")
    
    if record.check_out:
        raise HTTPException(status_code=400, detail="Already checked out today")

    record.check_out = datetime.now()
    db.commit()
    db.refresh(record)
    return record

@router.get("", response_model=list[AttendanceResponse], dependencies=[Depends(allow_employee)])
def get_attendance_history(
    skip: int = 0,
    limit: int = 30,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    employee = db.query(Employee).filter(Employee.user_id == current_user.id).first()
    records = db.query(Attendance).filter(
        Attendance.employee_id == employee.id
    ).order_by(Attendance.date.desc()).offset(skip).limit(limit).all()
    
    return records
