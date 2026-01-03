from sqlalchemy.orm import Session
from backend.db.session import engine, SessionLocal
from backend.models.user import User

def inspect_db():
    db = SessionLocal()
    users = db.query(User).all()
    print(f"Total Users: {len(users)}")
    for user in users:
        print(f"Email: {user.email}, Role: {user.role}, Hash: {user.password_hash}")
    db.close()

if __name__ == "__main__":
    inspect_db()
