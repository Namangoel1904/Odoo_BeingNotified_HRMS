from fastapi import FastAPI
from backend.core.config import settings
from backend.db.session import engine, Base, SessionLocal
from backend.core.bootstrap import check_create_initial_admin
# Import models so Base.metadata can create tables
from backend.models import user

# Create tables (simple sync for now, instead of alembic for speed)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Dayflow HRMS")

from fastapi.middleware.cors import CORSMiddleware

from fastapi.staticfiles import StaticFiles
import os

# Create uploads dir if not exists
UPLOAD_DIR = os.path.join(os.getcwd(), "backend", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

app.mount("/static", StaticFiles(directory=UPLOAD_DIR), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For dev only, restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    try:
        check_create_initial_admin(db)
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Welcome to Dayflow HRMS Backend"}

from backend.api import auth, admin, hr, employee
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])
app.include_router(hr.router, prefix="/hr", tags=["hr"])
app.include_router(employee.router, prefix="/employee", tags=["employee"])
