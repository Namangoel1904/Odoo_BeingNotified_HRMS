from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.db.session import get_db
from backend.core.security import verify_password, create_access_token, get_password_hash
from backend.models.user import User
from backend.schemas.auth import LoginSchema, TokenSchema, ChangePasswordSchema
from backend.api.deps import get_current_user

router = APIRouter()

@router.post("/login", response_model=TokenSchema)
def login(login_data: LoginSchema, db: Session = Depends(get_db)):
    # Try finding by email first
    from sqlalchemy import or_
    # Try finding by email or login_id
    user = db.query(User).filter(
        or_(
            User.email == login_data.login_id,
            User.login_id == login_data.login_id
        )
    ).first()
    # In a real system we would also check employee_code etc if available
    
    if not user or not verify_password(login_data.password, user.password_hash):
        # Generic error message
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid login credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
         raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )

    access_token = create_access_token(
        subject=user.public_id,
        role=user.role.value,
        must_change_password=user.must_change_password
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/change-password")
def change_password(
    password_data: ChangePasswordSchema,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Requirement: Only users with must_change_password = true can access this endpoint? 
    # Or should we allow voluntary change? The prompt says: "Only users with must_change_password = true can access this endpoint."
    if not current_user.must_change_password:
        raise HTTPException(status_code=400, detail="Password change not required or allowed via this endpoint.")

    if password_data.new_password != password_data.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    
    # Validation logic (length etc)
    if len(password_data.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")

    current_user.password_hash = get_password_hash(password_data.new_password)
    current_user.must_change_password = False
    db.commit()
    
    return {"message": "Password updated successfully"}
