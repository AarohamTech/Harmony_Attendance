from typing import List, Optional
from fastapi import APIRouter, Depends, Query, Path
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.attendance_request import AttendanceRequest
from app.schemas.request import (
    AttendanceRequestCreate,
    AttendanceRequestUpdate,
    AttendanceRequestOut
)
from app.services.request_service import create_attendance_request, update_attendance_request

router = APIRouter(prefix="/requests", tags=["requests"])

@router.post("", response_model=AttendanceRequestOut)
def create_request(req_data: AttendanceRequestCreate, db: Session = Depends(get_db)):
    """Submits an attendance request (early_exit, leave, correction)."""
    return create_attendance_request(db, req_data)

@router.get("", response_model=List[AttendanceRequestOut])
def get_requests(
    employee_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """List requests filtered by employee_id or status."""
    query = db.query(AttendanceRequest)
    if employee_id:
        query = query.filter(AttendanceRequest.employee_id == employee_id)
    if status:
        query = query.filter(AttendanceRequest.status == status)
    return query.order_by(AttendanceRequest.created_at.desc()).all()

@router.patch("/{id}", response_model=AttendanceRequestOut)
def update_request_status(
    id: int = Path(...),
    update_data: AttendanceRequestUpdate = ...,
    db: Session = Depends(get_db)
):
    """Approves or rejects an attendance request and triggers AttendanceDay status recalculation."""
    return update_attendance_request(db, id, update_data)
