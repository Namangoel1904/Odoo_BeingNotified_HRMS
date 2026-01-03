from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.models.user import User, UserRole
from backend.models.employee import Employee
from backend.models.ticket import Ticket, TicketStatus
from backend.schemas.ticket import TicketCreate, TicketResponse
from backend.api.deps import get_db, get_current_active_user, RoleChecker

router = APIRouter()
allow_employee = RoleChecker([UserRole.EMPLOYEE])

@router.post("", response_model=TicketResponse, dependencies=[Depends(allow_employee)])
def create_ticket(
    ticket_data: TicketCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    employee = db.query(Employee).filter(Employee.user_id == current_user.id).first()
    
    # Auto-assign to first available HR
    hr_user = db.query(User).filter(User.role == UserRole.HR).first()
    assigned_to_id = hr_user.id if hr_user else None
    
    new_ticket = Ticket(
        employee_id=employee.id,
        category=ticket_data.category,
        subject=ticket_data.subject,
        description=ticket_data.description,
        status=TicketStatus.OPEN,
        assigned_to_id=assigned_to_id
    )
    
    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)
    return new_ticket

@router.get("", response_model=list[TicketResponse], dependencies=[Depends(allow_employee)])
def get_my_tickets(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    employee = db.query(Employee).filter(Employee.user_id == current_user.id).first()
    tickets = db.query(Ticket).filter(
        Ticket.employee_id == employee.id
    ).order_by(Ticket.created_at.desc()).all()
    return tickets
