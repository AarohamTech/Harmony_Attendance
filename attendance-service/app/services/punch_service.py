from datetime import datetime, date
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status

from app.models.punch_record import PunchRecord
from app.models.attendance_day import AttendanceDay
from app.models.attendance_request import AttendanceRequest
from app.schemas.punch import PunchCreate
from app.services.attendance_rules import (
    calculate_status,
    calculate_working_minutes,
    calculate_overtime_minutes,
    to_local_time
)
from app.core.config import settings

def recalculate_attendance_day(db: Session, employee_id: int, target_date: date) -> AttendanceDay:
    """
    Recalculates and upserts the AttendanceDay summary for a given employee and date.
    Fetches raw punches for the day, checks for approved requests, calls pure attendance_rules,
    and updates or creates the AttendanceDay row.
    """
    # Fetch all punches for the target date
    # Convert timestamps to target timezone for date grouping if necessary
    punches = db.query(PunchRecord).filter(
        PunchRecord.employee_id == employee_id,
        func.date(PunchRecord.timestamp) == target_date
    ).order_by(PunchRecord.timestamp.asc()).all()

    in_punches = [p for p in punches if p.punch_type == "in"]
    out_punches = [p for p in punches if p.punch_type == "out"]

    punch_in_time: Optional[datetime] = in_punches[0].timestamp if in_punches else None
    punch_out_time: Optional[datetime] = out_punches[-1].timestamp if out_punches else None

    # Check for approved requests on this date
    approved_req = db.query(AttendanceRequest).filter(
        AttendanceRequest.employee_id == employee_id,
        AttendanceRequest.target_date == target_date,
        AttendanceRequest.status == "approved"
    ).first()

    approved_request_type = approved_req.request_type if approved_req else None

    # Calculate status and durations using pure attendance rules
    status_str = calculate_status(
        punch_in=punch_in_time,
        punch_out=punch_out_time,
        approved_request_type=approved_request_type
    )

    working_mins = calculate_working_minutes(punch_in_time, punch_out_time)
    overtime_mins = calculate_overtime_minutes(working_mins)

    # Upsert AttendanceDay
    att_day = db.query(AttendanceDay).filter(
        AttendanceDay.employee_id == employee_id,
        AttendanceDay.date == target_date
    ).first()

    if not att_day:
        att_day = AttendanceDay(
            employee_id=employee_id,
            date=target_date,
            punch_in_time=punch_in_time,
            punch_out_time=punch_out_time,
            status=status_str,
            total_working_minutes=working_mins,
            overtime_minutes=overtime_mins
        )
        db.add(att_day)
    else:
        att_day.punch_in_time = punch_in_time
        att_day.punch_out_time = punch_out_time
        att_day.status = status_str
        att_day.total_working_minutes = working_mins
        att_day.overtime_minutes = overtime_mins

    db.commit()
    db.refresh(att_day)
    return att_day

def record_punch(db: Session, punch_data: PunchCreate, default_employee_id: Optional[int] = None) -> PunchRecord:
    emp_id = punch_data.employee_id or default_employee_id
    if not emp_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Employee ID is required for punch"
        )

    # Idempotency check via client_generated_id
    existing_punch = db.query(PunchRecord).filter(
        PunchRecord.client_generated_id == punch_data.client_generated_id
    ).first()

    if existing_punch:
        # Already recorded - trigger recalculation to ensure sync and return existing
        punch_date = to_local_time(existing_punch.timestamp, settings.ATTENDANCE_TIMEZONE).date()
        recalculate_attendance_day(db, emp_id, punch_date)
        return existing_punch

    new_punch = PunchRecord(
        employee_id=emp_id,
        punch_type=punch_data.punch_type,
        timestamp=punch_data.timestamp,
        latitude=punch_data.latitude,
        longitude=punch_data.longitude,
        source=punch_data.source,
        client_generated_id=punch_data.client_generated_id
    )
    db.add(new_punch)
    db.commit()
    db.refresh(new_punch)

    # Extract date in attendance timezone and recalculate
    punch_date = to_local_time(new_punch.timestamp, settings.ATTENDANCE_TIMEZONE).date()
    recalculate_attendance_day(db, emp_id, punch_date)

    return new_punch
