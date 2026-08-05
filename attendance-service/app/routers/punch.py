from datetime import date, datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.session import get_db
from app.models.punch_record import PunchRecord
from app.schemas.punch import PunchCreate, PunchOut
from app.services.punch_service import record_punch
from app.services.attendance_rules import to_local_time
from app.core.config import settings

router = APIRouter(prefix="/punch", tags=["punch"])

@router.post("", response_model=PunchOut)
def create_punch(punch_data: PunchCreate, db: Session = Depends(get_db)):
    """Records a punch (idempotent via client_generated_id) and recalculates AttendanceDay."""
    return record_punch(db, punch_data)

@router.get("/today", response_model=List[PunchOut])
def get_today_punches(employee_id: int = Query(...), db: Session = Depends(get_db)):
    """Returns today's raw punch records for an employee."""
    today_dt = to_local_time(datetime.now(), settings.ATTENDANCE_TIMEZONE).date()
    punches = db.query(PunchRecord).filter(
        PunchRecord.employee_id == employee_id,
        func.date(PunchRecord.timestamp) == today_dt
    ).order_by(PunchRecord.timestamp.asc()).all()
    return punches

@router.get("/history", response_model=List[PunchOut])
def get_punch_history(
    employee_id: int = Query(...),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db)
):
    """Returns raw punch records for an employee over a date range."""
    query = db.query(PunchRecord).filter(PunchRecord.employee_id == employee_id)
    if start_date:
        query = query.filter(func.date(PunchRecord.timestamp) >= start_date)
    if end_date:
        query = query.filter(func.date(PunchRecord.timestamp) <= end_date)
    return query.order_by(PunchRecord.timestamp.desc()).all()
