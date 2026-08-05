from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime

class AttendanceRequestCreate(BaseModel):
    employee_id: int
    request_type: str = Field(..., pattern="^(early_exit|leave|correction)$")
    target_date: date
    reason: Optional[str] = None

class AttendanceRequestUpdate(BaseModel):
    status: str = Field(..., pattern="^(approved|rejected)$")

class AttendanceRequestOut(BaseModel):
    id: int
    employee_id: int
    request_type: str
    target_date: date
    reason: Optional[str] = None
    status: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
