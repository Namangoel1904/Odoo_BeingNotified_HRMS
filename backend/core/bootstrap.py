import uuid
from sqlalchemy.orm import Session
from backend.models.user import User, UserRole
from backend.core.config import settings
from backend.core.security import get_password_hash
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def check_create_initial_admin(db: Session):
    admin = db.query(User).filter(User.role == UserRole.ADMIN).first()
    if not admin:
        logger.info("No ADMIN found. Creating initial admin user.")
        
        user_in = User(
            public_id=str(uuid.uuid4()),
            email=settings.INITIAL_ADMIN_EMAIL,
            login_id="admin", # Default admin login id
            password_hash=get_password_hash(settings.INITIAL_ADMIN_PASSWORD),
            role=UserRole.ADMIN,
            must_change_password=True,
            is_active=True
        )
        db.add(user_in)
        db.commit()
        db.refresh(user_in)
        logger.info(f"Initial Admin created: {user_in.email}")
    else:
        logger.info("Admin already exists. Skipping bootstrap.")
