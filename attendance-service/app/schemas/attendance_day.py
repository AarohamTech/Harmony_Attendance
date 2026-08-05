from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class AttendanceDayOut(BaseModel):
    id: int
    employee_id: int
    date: date
    punch_in_time: Optional[datetime] = None
    punch_out_time: Optional[datetime] = None
    status: str
    total_working_minutes: Optional[int] = None
    overtime_minutes: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class AttendanceSummary(BaseModel):
    start_date: date
    end_date: date
    on_time_count: int = 0
    present_count: int = 0
    half_day_count: int = 0
    absent_count: int = 0
    incomplete_count: int = 0
    total_days: int = 0
