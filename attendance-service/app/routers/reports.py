from fastapi import APIRouter, Depends, Query
from fastapi.responses import Response
from typing import Optional
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.attendance_day import AttendanceDay

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("/export")
def export_reports(
    format: str = Query("csv"),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    records = db.query(AttendanceDay).all()
    csv_lines = ["ID,Employee_ID,Date,Status,Total_Working_Minutes,Punch_In,Punch_Out"]
    for r in records:
        in_t = r.punch_in_time.isoformat() if r.punch_in_time else ""
        out_t = r.punch_out_time.isoformat() if r.punch_out_time else ""
        csv_lines.append(f"{r.id},{r.employee_id},{r.date},{r.status},{r.total_working_minutes or 0},{in_t},{out_t}")
    content = "\n".join(csv_lines)
    return Response(
        content=content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=attendance_report.{format}"}
    )
