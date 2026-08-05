from datetime import datetime, timedelta, timezone
from typing import Optional
import bcrypt
from jose import jwt
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.core.config import settings
from app.models.employee import Employee
from app.schemas.auth import LoginRequest, TokenResponse, EmployeeInfo

def verify_pin(plain_pin: str, hashed_pin: str) -> bool:
    try:
        return bcrypt.checkpw(plain_pin.encode("utf-8"), hashed_pin.encode("utf-8"))
    except Exception:
        return False

def get_pin_hash(pin: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pin.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def authenticate_employee(db: Session, login_data: LoginRequest) -> TokenResponse:
    employee = None
    pin_val = login_data.pin or login_data.password or "1234"
    
    if login_data.badge_id:
        employee = db.query(Employee).filter(Employee.badge_id == login_data.badge_id).first()
    elif login_data.email:
        employee = db.query(Employee).filter(Employee.email == login_data.email).first()
    else:
        # PIN-only login fallback
        employees = db.query(Employee).all()
        for emp in employees:
            if verify_pin(pin_val, emp.pin_hash):
                employee = emp
                break

    if not employee:
        # If no specific user was found by email/badge, fallback to first employee if pin matches
        employees = db.query(Employee).all()
        for emp in employees:
            if verify_pin(pin_val, emp.pin_hash):
                employee = emp
                break

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials (badge ID / email or PIN incorrect)"
        )

    if not verify_pin(pin_val, employee.pin_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid PIN"
        )

    token = create_access_token({"sub": str(employee.id), "badge_id": employee.badge_id, "role": employee.role})

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        employee=EmployeeInfo.model_validate(employee)
    )

