from datetime import date, datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.session import get_db
from app.models.attendance_day import AttendanceDay
from app.schemas.attendance_day import AttendanceDayOut, AttendanceSummary
from app.services.attendance_rules import to_local_time
from app.core.config import settings

router = APIRouter(prefix="/attendance", tags=["attendance"])

@router.get("/today", response_model=Optional[AttendanceDayOut])
def get_today_attendance(employee_id: int = Query(...), db: Session = Depends(get_db)):
    """Returns today's computed AttendanceDay for an employee."""
    today_dt = to_local_time(datetime.now(), settings.ATTENDANCE_TIMEZONE).date()
    att_day = db.query(AttendanceDay).filter(
        AttendanceDay.employee_id == employee_id,
        AttendanceDay.date == today_dt
    ).first()
    return att_day

@router.get("/history", response_model=List[AttendanceDayOut])
def get_attendance_history(
    employee_id: int = Query(...),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db)
):
    """Returns computed AttendanceDay records for an employee over a date range."""
    query = db.query(AttendanceDay).filter(AttendanceDay.employee_id == employee_id)
    if start_date:
        query = query.filter(AttendanceDay.date >= start_date)
    if end_date:
        query = query.filter(AttendanceDay.date <= end_date)
    return query.order_by(AttendanceDay.date.desc()).all()

@router.get("/summary", response_model=AttendanceSummary)
def get_attendance_summary(
    employee_id: Optional[int] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db)
):
    """Returns summary counts of attendance statuses over a date range for charts/reports."""
    query = db.query(AttendanceDay)
    if employee_id:
        query = query.filter(AttendanceDay.employee_id == employee_id)
    if start_date:
        query = query.filter(AttendanceDay.date >= start_date)
    if end_date:
        query = query.filter(AttendanceDay.date <= end_date)

    records = query.all()

    on_time_cnt = sum(1 for r in records if r.status == "on_time")
    present_cnt = sum(1 for r in records if r.status in ("present", "on_time"))
    half_day_cnt = sum(1 for r in records if r.status == "half_day")
    absent_cnt = sum(1 for r in records if r.status == "absent")
    incomplete_cnt = sum(1 for r in records if r.status == "incomplete")

    s_date = start_date or (min((r.date for r in records), default=to_local_time(datetime.now(), settings.ATTENDANCE_TIMEZONE).date()))
    e_date = end_date or (max((r.date for r in records), default=to_local_time(datetime.now(), settings.ATTENDANCE_TIMEZONE).date()))

    return AttendanceSummary(
        start_date=s_date,
        end_date=e_date,
        on_time_count=on_time_cnt,
        present_count=present_cnt,
        half_day_count=half_day_cnt,
        absent_count=absent_cnt,
        incomplete_count=incomplete_cnt,
        total_days=len(records)
    )
