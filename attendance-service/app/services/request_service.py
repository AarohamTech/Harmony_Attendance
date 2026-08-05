from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.attendance_request import AttendanceRequest
from app.schemas.request import AttendanceRequestCreate, AttendanceRequestUpdate
from app.services.punch_service import recalculate_attendance_day

def create_attendance_request(db: Session, req_data: AttendanceRequestCreate) -> AttendanceRequest:
    request_obj = AttendanceRequest(
        employee_id=req_data.employee_id,
        request_type=req_data.request_type,
        target_date=req_data.target_date,
        reason=req_data.reason,
        status="pending"
    )
    db.add(request_obj)
    db.commit()
    db.refresh(request_obj)
    return request_obj

def update_attendance_request(db: Session, request_id: int, update_data: AttendanceRequestUpdate) -> AttendanceRequest:
    req = db.query(AttendanceRequest).filter(AttendanceRequest.id == request_id).first()
    if not req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Attendance request with id {request_id} not found"
        )

    req.status = update_data.status
    db.commit()
    db.refresh(req)

    # Trigger recalculation for the employee's AttendanceDay on target_date
    recalculate_attendance_day(db, req.employee_id, req.target_date)

    return req
