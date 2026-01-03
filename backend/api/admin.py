from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from backend.models.user import UserRole, User
from backend.api.deps import RoleChecker, get_current_active_user, get_db
from backend.schemas.admin import CreateHRSchema, CreateHRResponse
from backend.core.security import get_password_hash
import uuid
import secrets
import string

router = APIRouter()

allow_admin = RoleChecker([UserRole.ADMIN])

@router.get("/dashboard", dependencies=[Depends(allow_admin)])
def admin_dashboard():
    return {"message": "Welcome to the Admin Dashboard"}

def generate_hr_login_id(db: Session, full_name: str, year: int) -> str:
    # Format: OI + 2 letters first name + 2 letters last name + year + 4 digit serial
    names = full_name.strip().split()
    if len(names) >= 2:
        f = names[0][:2].upper()
        l = names[-1][:2].upper()
    elif len(names) == 1:
        f = names[0][:2].upper()
        l = "XX" # Fallback if single name
    else:
        f = "XX"
        l = "XX"
    
    base_prefix = f"OI{f}{l}{year}"
    
    # Find last serial for this prefix pattern to ensure uniqueness
    # Implementation simplifiction: Count existing users with this prefix? 
    # Or just query the database for "OI{f}{l}{year}%"
    
    # We will simply count how many users match the prefix pattern
    # Note: SQLite LIKE is case insensitive usually, but let's be careful.
    
    existing_count = db.query(User).filter(User.login_id.like(f"{base_prefix}%")).count()
    serial = existing_count + 1
    
    return f"{base_prefix}{serial:04d}"

def generate_temp_password(length=10):
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(secrets.choice(alphabet) for i in range(length))

@router.post("/create-hr", response_model=CreateHRResponse, dependencies=[Depends(allow_admin)])
def create_hr_user(
    hr_data: CreateHRSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Check if email exists
    if db.query(User).filter(User.email == hr_data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    hr_login_id = generate_hr_login_id(db, hr_data.full_name, hr_data.year_of_joining)
    
    # Ensure login ID is unique (though serial logic should handle it, redundancy check)
    if db.query(User).filter(User.login_id == hr_login_id).first():
        # Highly unlikely with serial, but retry logic or error could go here.
        # Simple fix: increment serial
        hr_login_id = hr_login_id[:-4] + f"{int(hr_login_id[-4:]) + 1:04d}"

    temp_password = generate_temp_password()
    
    new_user = User(
        public_id=str(uuid.uuid4()),
        email=hr_data.email,
        login_id=hr_login_id,
        password_hash=get_password_hash(temp_password),
        role=UserRole.HR,
        must_change_password=True,
        is_active=True
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {
        "message": "HR User Created Successfully",
        "hr_login_id": hr_login_id,
        "temporary_password": temp_password
    }
