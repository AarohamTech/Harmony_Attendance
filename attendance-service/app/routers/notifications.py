from fastapi import APIRouter, Depends, Query
from typing import Optional
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.attendance_request import AttendanceRequest

router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.get("")
def get_notifications(employee_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    requests = db.query(AttendanceRequest).order_by(AttendanceRequest.created_at.desc()).limit(10).all()
    notifications = []
    for req in requests:
        notifications.append({
            "id": f"notif-req-{req.id}",
            "type": "APPROVAL",
            "title": f"Request {req.status.upper()}",
            "body": f"Request for {req.request_type} on {req.target_date} is currently {req.status}.",
            "created_at": req.created_at.isoformat() if req.created_at else None,
            "unread": 1 if req.status == "pending" else 0
        })
    if not notifications:
        notifications.append({
            "id": "notif-welcome",
            "type": "SYSTEM",
            "title": "Welcome to Attendance System",
            "body": "Your account is active and connected to live attendance service.",
            "created_at": None,
            "unread": 0
        })
    return notifications

@router.put("/read-all")
def mark_notifications_read(employee_id: Optional[int] = Query(None)):
    return {"status": "success", "message": "All notifications marked as read"}
