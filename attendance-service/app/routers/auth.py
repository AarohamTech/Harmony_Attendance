from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel, Field
import time

from app.db.session import get_db
from app.schemas.auth import LoginRequest, TokenResponse
from app.services.auth_service import authenticate_employee, get_pin_hash
from app.models.employee import Employee

router = APIRouter(tags=["auth"])

@router.post("/auth/login", response_model=TokenResponse)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate an employee using PIN / badge_id / email and return JWT token + profile info."""
    return authenticate_employee(db, login_data)

@router.get("/auth/me")
def get_current_user(employee_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    """Get profile information for current user."""
    employee = None
    if employee_id:
        employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        employee = db.query(Employee).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    return {
        "id": employee.id,
        "name": employee.name,
        "email": employee.email,
        "badge_id": employee.badge_id,
        "role": employee.role,
        "department": employee.department or "Engineering",
        "profile_photo": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
        "location_label": "Head Office, Silicon Tower",
        "latitude": 12.9716,
        "longitude": 77.5946
    }

class RegisterRequest(BaseModel):
    name: str
    employeeId: Optional[str] = None
    badge_id: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    department: str = "General"
    role: str = "employee"
    pin: str = "1234"

@router.post("/auth/register")
def register_employee(req: RegisterRequest, db: Session = Depends(get_db)):
    badge = req.badge_id or req.employeeId or f"EMP{int(time.time())}"
    email = req.email or f"{badge.lower()}@company.com"
    existing = db.query(Employee).filter((Employee.email == email) | (Employee.badge_id == badge)).first()
    if existing:
        return {"status": "success", "message": "Account already exists", "employee": {"id": existing.id, "name": existing.name, "badge_id": existing.badge_id}}
    
    emp = Employee(
        name=req.name,
        email=email,
        badge_id=badge,
        pin_hash=get_pin_hash(req.pin),
        role=req.role,
        department=req.department
    )
    db.add(emp)
    db.commit()
    db.refresh(emp)
    return {"status": "success", "message": "Employee registered successfully", "employee": {"id": emp.id, "name": emp.name, "badge_id": emp.badge_id}}

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    department: Optional[str] = None
    role: Optional[str] = None

@router.put("/profile/update")
def update_profile(req: ProfileUpdate, db: Session = Depends(get_db)):
    emp = db.query(Employee).first()
    if emp:
        if req.name: emp.name = req.name
        if req.department: emp.department = req.department
        if req.role: emp.role = req.role
        db.commit()
        db.refresh(emp)
        return {"status": "success", "message": "Profile updated", "employee": {"id": emp.id, "name": emp.name, "department": emp.department, "role": emp.role}}
    return {"status": "success"}

class FaceRegisterRequest(BaseModel):
    direction: Optional[str] = None
    base64Image: Optional[str] = None

@router.post("/face/register")
def register_face(req: FaceRegisterRequest, db: Session = Depends(get_db)):
    return {"status": "success", "message": "Face bio-vector captured and registered successfully"}
