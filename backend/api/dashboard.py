from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date
from backend.models.user import User, UserRole
from backend.models.employee import Employee
from backend.models.work import Attendance, AttendanceStatus, LeaveRequest, LeaveStatus
from backend.models.ticket import Ticket, TicketStatus
from backend.schemas.dashboard import EmployeeDashboardResponse, DashboardStats, DashboardProfile, DashboardAttendance
from backend.api.deps import get_db, get_current_active_user, RoleChecker

router = APIRouter()
allow_employee = RoleChecker([UserRole.EMPLOYEE])

@router.get("", response_model=EmployeeDashboardResponse, dependencies=[Depends(allow_employee)])
def get_dashboard_data(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    employee = db.query(Employee).filter(Employee.user_id == current_user.id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee profile not found")

    # 1. Attendance Today
    today = date.today()
    att_record = db.query(Attendance).filter(
        Attendance.employee_id == employee.id,
        Attendance.date == today
    ).first()
    
    attendance_data = DashboardAttendance(
        checked_in=bool(att_record),
        check_in_time=att_record.check_in.time() if att_record and att_record.check_in else None,
        check_out_time=att_record.check_out.time() if att_record and att_record.check_out else None,
        status=att_record.status.value if att_record else "ABSENT"
    )

    # 2. Leave Summary
    total_leaves = db.query(LeaveRequest).filter(LeaveRequest.employee_id == employee.id).count()
    pending_leaves = db.query(LeaveRequest).filter(
        LeaveRequest.employee_id == employee.id, 
        LeaveRequest.status == LeaveStatus.PENDING
    ).count()
    
    leave_summary = DashboardStats(total=total_leaves, active=pending_leaves)

    # 3. Ticket Summary
    total_tickets = db.query(Ticket).filter(Ticket.employee_id == employee.id).count()
    open_tickets = db.query(Ticket).filter(
        Ticket.employee_id == employee.id,
        Ticket.status == TicketStatus.OPEN
    ).count()
    
    ticket_summary = DashboardStats(total=total_tickets, active=open_tickets)

    # 4. Profile Completion
    missing_fields = []
    if not employee.phone: missing_fields.append("phone")
    if not employee.address: missing_fields.append("address")
    if not employee.profile_picture_url: missing_fields.append("profile_picture")
    
    profile_status = DashboardProfile(
        is_complete=len(missing_fields) == 0,
        missing_fields=missing_fields
    )

    return EmployeeDashboardResponse(
        employee={
            "id": employee.employee_code, # Using Employee Code for display, public_id is user.public_id
            "name": employee.full_name,
            "public_id": current_user.public_id
        },
        attendance_today=attendance_data,
        leave_summary=leave_summary,
        ticket_summary=ticket_summary,
        profile_status=profile_status
    )
