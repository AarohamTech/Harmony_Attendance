from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routers import auth, punch, attendance, requests, dashboard, notifications, reports, employees
from app.db.base import Base
from app.db.session import engine

# Ensure tables exist for immediate development setup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Attendance Service Backend API with real timing business rules",
    version="1.0.0"
)

# CORS middleware configuration
origins = settings.CORS_ORIGINS
if isinstance(origins, str):
    origins = [origins]

explicit_origins = [
    "http://localhost:8081",
    "http://127.0.0.1:8081",
    "http://localhost:19000",
    "http://localhost:19006",
    "http://localhost:8082",
    "http://127.0.0.1:8082",
    "*"
]
for origin in explicit_origins:
    if origin not in origins:
        origins.append(origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(punch.router)
app.include_router(attendance.router)
app.include_router(requests.router)
app.include_router(dashboard.router)
app.include_router(notifications.router)
app.include_router(reports.router)
app.include_router(employees.router)

@app.get("/health", tags=["health"])
def health_check():
    return {
        "status": "ok",
        "service": settings.PROJECT_NAME,
        "timezone": settings.ATTENDANCE_TIMEZONE
    }
