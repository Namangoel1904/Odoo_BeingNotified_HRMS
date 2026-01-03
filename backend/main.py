from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from backend.core.config import settings
from backend.db.session import engine, Base, SessionLocal
from backend.core.bootstrap import check_create_initial_admin
# Import models so Base.metadata can create tables
from backend.models import user, employee, work, ticket, payroll

# Import Routers
from backend.api import auth, admin, hr, employee as employee_api, attendance, leave, ticket as ticket_api, dashboard

# Create tables (simple sync for now, instead of alembic for speed)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Dayflow HRMS")

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

# Routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])
app.include_router(hr.router, prefix="/hr", tags=["HR"])
app.include_router(employee_api.router, prefix="/employee", tags=["Employee"])
app.include_router(attendance.router, prefix="/employee/attendance", tags=["Attendance"])
app.include_router(leave.router, prefix="/employee/leave", tags=["Leave"])
app.include_router(ticket_api.router, prefix="/employee/ticket", tags=["Ticket"])
app.include_router(dashboard.router, prefix="/employee/dashboard", tags=["Dashboard"])
