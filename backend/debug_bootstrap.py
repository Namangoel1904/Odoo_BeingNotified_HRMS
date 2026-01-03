from backend.db.session import SessionLocal
from backend.core.bootstrap import check_create_initial_admin
from backend.models.user import User
from backend.core.config import settings

def debug():
    db = SessionLocal()
    print(f"DB URL: {settings.DATABASE_URL}")
    print(f"Initial Admin Password: '{settings.INITIAL_ADMIN_PASSWORD}' (len: {len(settings.INITIAL_ADMIN_PASSWORD)})")
    
    print("Running bootstrap...")
    check_create_initial_admin(db)
    
    user = db.query(User).filter(User.email == settings.INITIAL_ADMIN_EMAIL).first()
    if user:
        print(f"Admin found: {user.email}")
        print(f"Password Hash: {user.password_hash}")
        from backend.core.security import verify_password
        valid = verify_password(settings.INITIAL_ADMIN_PASSWORD, user.password_hash)
        print(f"Password '{settings.INITIAL_ADMIN_PASSWORD}' Valid? {valid}")
    else:
        print("Admin NOT found!")
    db.close()

if __name__ == "__main__":
    debug()
