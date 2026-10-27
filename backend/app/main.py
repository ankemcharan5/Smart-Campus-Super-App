from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import auth
from app.routes import roles
from app.routes import users
from app.routes import student
from app.routes import notices
from app.routes import events
from app.routes import timetable
from app.routes import attendance
from app.routes import assignments
from app.routes import results
from app.routes import fees
from app.routes import complaints
from app.routes import lost_found
from app.routes import campus_resources
from app.routes import faculty
from app.routes import admin
from app.routes import notifications
from app.routes import ai

# ============================================================
# CREATE FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    
    title="Smart Campus Super App API",
    description="Backend API for Smart Campus Super App",
    version="1.0.0"
)
@app.get("/health")
def health_check():
    return {
        "status": "success",
        "message": "Smart Campus API is running"
    }
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# ROOT ENDPOINT
# ============================================================

@app.get("/")
def root():
    return {
        "message": "Smart Campus API is running",
        "status": "success"
    }


# ============================================================
# AUTH ROUTES
# ============================================================

app.include_router(auth.router)


# ============================================================
# USER & FUNCTIONAL ROUTES
# ============================================================

app.include_router(users.router)
app.include_router(roles.router)
app.include_router(student.router)
app.include_router(notices.router)
app.include_router(events.router)
app.include_router(timetable.router)
app.include_router(attendance.router)
app.include_router(assignments.router)
app.include_router(results.router)
app.include_router(fees.router)
app.include_router(complaints.router)
app.include_router(lost_found.router)
app.include_router(campus_resources.router)
app.include_router(faculty.router)
app.include_router(admin.router)
app.include_router(notifications.router)
app.include_router(ai.router)
