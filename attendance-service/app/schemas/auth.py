from pydantic import BaseModel, Field
from typing import Optional

class LoginRequest(BaseModel):
    badge_id: Optional[str] = None
    email: Optional[str] = None
    pin: Optional[str] = None
    password: Optional[str] = None

class EmployeeInfo(BaseModel):
    id: int
    name: str
    email: str
    badge_id: str
    role: str
    department: Optional[str] = None
    profile_photo: Optional[str] = None

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    employee: EmployeeInfo

