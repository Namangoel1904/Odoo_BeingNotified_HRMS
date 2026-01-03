from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from datetime import date
from typing import Optional
import os
import shutil
import uuid
from backend.models.user import User, UserRole
from backend.models.employee import Employee
from backend.models.work import LeaveRequest, LeaveStatus, LeaveType
from backend.schemas.work import LeaveRequestResponse
from backend.api.deps import get_db, get_current_active_user, RoleChecker

router = APIRouter()
allow_employee = RoleChecker([UserRole.EMPLOYEE])

UPLOAD_DIR = "backend/uploads"

@router.post("", response_model=LeaveRequestResponse, dependencies=[Depends(allow_employee)])
def create_leave_request(
    leave_type: LeaveType = Form(...),
    start_date: date = Form(...),
    end_date: date = Form(...),
    reason: str = Form(...),
    file: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    employee = db.query(Employee).filter(Employee.user_id == current_user.id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee profile not found")
    
    # 1. Validate Date Range
    if end_date < start_date:
        raise HTTPException(status_code=400, detail="End date cannot be before start date")
    
    if start_date < date.today():
        raise HTTPException(status_code=400, detail="Cannot apply for leave in the past")

    # 2. Check Overlap
    # Overlap logic: (StartA <= EndB) and (EndA >= StartB)
    overlap = db.query(LeaveRequest).filter(
        LeaveRequest.employee_id == employee.id,
        LeaveRequest.status != LeaveStatus.REJECTED, # Ignore rejected
        or_(
            and_(LeaveRequest.start_date <= end_date, LeaveRequest.end_date >= start_date)
        )
    ).first()
    
    if overlap:
         raise HTTPException(status_code=400, detail="Leave request overlaps with an existing request")

    # 3. Handle File Upload (Sick Leave)
    attachment_url = None
    if file:
        if leave_type == LeaveType.SICK:
            # Save file
            file_ext = file.filename.split(".")[-1]
            file_name = f"{uuid.uuid4()}.{file_ext}"
            file_path = os.path.join(UPLOAD_DIR, file_name)
            
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            attachment_url = f"/static/{file_name}"
        else:
             # Just ignore or warn? Let's allow upload but maybe log it. Or just save it. 
             # User requirement: "if user select Sick leave then ask for... upload". Implicitly, only needed for Sick.
             # But if they upload for others, we can still save it.
             pass
    elif leave_type == LeaveType.SICK:
         # Requirement: "Ask for... upload". Could interpret as mandatory.
         # "And if user select Sick leave then ask for ... attachment upload."
         # Let's enforce it for now to be safe, or just ensure frontend asks.
         # For backend, let's keep it optional but recommended. Or enforce?
         # "Ask for" implies it's a prompt. I will make it optional in backend to avoid blocking if they don't have it *yet*, 
         # but frontend should enforce or at least show the field.
         pass
         
    new_request = LeaveRequest(
        employee_id=employee.id,
        leave_type=leave_type,
        start_date=start_date,
        end_date=end_date,
        reason=reason,
        attachment_url=attachment_url,
        status=LeaveStatus.PENDING
    )
    
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    return new_request

@router.get("", response_model=list[LeaveRequestResponse], dependencies=[Depends(allow_employee)])
def get_my_leaves(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    employee = db.query(Employee).filter(Employee.user_id == current_user.id).first()
    leaves = db.query(LeaveRequest).filter(
        LeaveRequest.employee_id == employee.id
    ).order_by(LeaveRequest.created_at.desc()).all()
    return leaves
