from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class EmployeeBase(BaseModel):
    name: str
    email: str
    badge_id: str
    role: str = "employee"
    department: Optional[str] = None

class EmployeeCreate(EmployeeBase):
    pin: str

class EmployeeOut(EmployeeBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
