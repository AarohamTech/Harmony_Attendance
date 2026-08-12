import os
import sys
from datetime import datetime, date, timedelta
from typing import Optional, List, Dict, Any

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import json

from fastapi import FastAPI, HTTPException, Depends, Header, Query, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel, EmailStr

from app.database import init_db, get_db_connection, hash_pin
from app.auth import create_access_token, decode_access_token
from app.face_engine import extract_face_embedding, verify_face_against_embeddings
from app.reports import generate_csv_report, generate_excel_report, generate_pdf_report

# Initialize DB
init_db()

app = FastAPI(
    title="Harmony AI Attendance System API",
    description="Production backend REST API for Harmony AI Attendance system with SQLite DB, JWT auth, face verification, and analytics.",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------------------------------------------------
# Dependency: Auth Bearer Header Verification
# ----------------------------------------------------------------------
def get_current_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authorization token required")

    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired access token")

    emp_id = int(payload.get("sub"))
    conn = get_db_connection()
    emp = conn.execute("SELECT * FROM employees WHERE id = ?;", (emp_id,)).fetchone()
    conn.close()

    if not emp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User account not found")

    return dict(emp)


# ----------------------------------------------------------------------
# Schemas
# ----------------------------------------------------------------------
class LoginRequest(BaseModel):
    pin: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None

class RegisterRequest(BaseModel):
    name: str
    employeeId: str
    email: Optional[str] = None
    phone: Optional[str] = None
    department: str = "Engineering"
    role: str = "Employee"
    pin: str

class PunchPayload(BaseModel):
    client_generated_id: str
    employee_id: int
    punch_type: str # 'in' or 'out'
    timestamp: str
    latitude: Optional[float] = 12.9716
    longitude: Optional[float] = 77.5946
    source: Optional[str] = "web"
    face_image: Optional[str] = None

class CreateRequestPayload(BaseModel):
    employee_id: int
    request_type: str
    target_date: Optional[str] = None
    reason: str

class ProfileUpdatePayload(BaseModel):
    name: Optional[str] = None
    department: Optional[str] = None
    role: Optional[str] = None

class FaceCapturePayload(BaseModel):
    direction: str = "front"
    base64Image: str

# ----------------------------------------------------------------------
# Endpoints
# ----------------------------------------------------------------------

@app.get("/")
def root():
    return {
        "status": "online",
        "app": "Harmony AI Attendance System",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }

# 1. Auth Endpoints
@app.post("/auth/login")
def login(req: LoginRequest):
    conn = get_db_connection()
    emp = None

    if req.pin:
        pin_h = hash_pin(req.pin.strip())
        emp = conn.execute("SELECT * FROM employees WHERE pin_hash = ? AND status = 'ACTIVE';", (pin_h,)).fetchone()
    elif req.email and req.password:
        pin_h = hash_pin(req.password.strip())
        emp = conn.execute("SELECT * FROM employees WHERE email = ? AND pin_hash = ?;", (req.email.strip(), pin_h)).fetchone()

    if not emp:
        conn.close()
        raise HTTPException(status_code=401, detail="Invalid credentials. Please verify your PIN or login details.")

    emp_dict = dict(emp)
    conn.close()

    token = create_access_token({"sub": str(emp_dict["id"]), "role": emp_dict["role"]})


    return {
        "access_token": token,
        "token_type": "bearer",
        "employee": {
            "id": emp_dict["id"],
            "badge_id": emp_dict["badge_id"],
            "name": emp_dict["name"],
            "email": emp_dict["email"],
            "department": emp_dict["department"],
            "role": emp_dict["role"],
            "profile_photo": emp_dict["profile_photo"]
        }
    }

@app.post("/auth/register")
def register(req: RegisterRequest):
    conn = get_db_connection()
    pin_h = hash_pin(req.pin.strip())
    email = req.email or f"{req.employeeId.lower()}@company.com"

    try:
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO employees (badge_id, name, email, phone, department, role, pin_hash)
        VALUES (?, ?, ?, ?, ?, ?, ?);
        """, (req.employeeId.strip(), req.name.strip(), email, req.phone, req.department.strip(), req.role.strip(), pin_h))
        conn.commit()
        new_id = cursor.lastrowid
        conn.close()
        return {"status": "success", "employee_id": new_id, "message": "Employee account registered successfully."}
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=400, detail=f"Registration failed: Badge ID or email already exists.")

@app.get("/auth/me")
def get_me(user: Dict[str, Any] = Depends(get_current_user)):
    return user

@app.put("/profile/update")
def update_profile(req: ProfileUpdatePayload, user: Dict[str, Any] = Depends(get_current_user)):
    conn = get_db_connection()
    fields = []
    values = []

    if req.name:
        fields.append("name = ?")
        values.append(req.name.strip())
    if req.department:
        fields.append("department = ?")
        values.append(req.department.strip())
    if req.role:
        fields.append("role = ?")
        values.append(req.role.strip())

    if fields:
        values.append(user["id"])
        query = f"UPDATE employees SET {', '.join(fields)} WHERE id = ?;"
        conn.execute(query, values)
        conn.commit()

    updated = conn.execute("SELECT * FROM employees WHERE id = ?;", (user["id"],)).fetchone()
    conn.close()
    return dict(updated)

# 2. Dashboard Metrics & Charts
@app.get("/dashboard/overview")
def dashboard_overview():
    conn = get_db_connection()
    today_str = date.today().isoformat()

    total_employees = conn.execute("SELECT COUNT(*) FROM employees WHERE status = 'ACTIVE';").fetchone()[0]
    today_present = conn.execute("SELECT COUNT(*) FROM attendance_logs WHERE date = ? AND status IN ('ON TIME', 'PRESENT');", (today_str,)).fetchone()[0]
    today_late = conn.execute("SELECT COUNT(*) FROM attendance_logs WHERE date = ? AND status = 'LATE';", (today_str,)).fetchone()[0]
    today_absent = total_employees - (today_present + today_late)

    punch_in_count = conn.execute("SELECT COUNT(*) FROM punch_records WHERE DATE(timestamp) = ? AND punch_type = 'in';", (today_str,)).fetchone()[0]
    punch_out_count = conn.execute("SELECT COUNT(*) FROM punch_records WHERE DATE(timestamp) = ? AND punch_type = 'out';", (today_str,)).fetchone()[0]

    pending_requests = conn.execute("SELECT COUNT(*) FROM leave_requests WHERE status = 'PENDING';").fetchone()[0]
    approved_requests = conn.execute("SELECT COUNT(*) FROM leave_requests WHERE status = 'APPROVED';").fetchone()[0]
    rejected_requests = conn.execute("SELECT COUNT(*) FROM leave_requests WHERE status = 'REJECTED';").fetchone()[0]

    avg_hours_row = conn.execute("SELECT AVG(total_working_minutes) FROM attendance_logs WHERE date >= ?;", ((date.today() - timedelta(days=7)).isoformat(),)).fetchone()[0]
    avg_working_hours = round((avg_hours_row or 520) / 60.0, 1)

    face_verified_count = conn.execute("SELECT COUNT(*) FROM attendance_logs WHERE face_verified = 1;").fetchone()[0]
    total_logs = conn.execute("SELECT COUNT(*) FROM attendance_logs;").fetchone()[0] or 1
    face_success_rate = round((face_verified_count / float(total_logs)) * 100.0, 1)

    conn.close()

    return {
        "total_employees": total_employees,
        "today_present": today_present,
        "today_late": today_late,
        "today_half_day": today_late, # mapped for compatibility
        "today_absent": max(0, today_absent),
        "punch_in_count": punch_in_count,
        "punch_out_count": punch_out_count,
        "pending_requests_count": pending_requests,
        "approved_requests_count": approved_requests,
        "rejected_requests_count": rejected_requests,
        "avg_working_hours_this_week": avg_working_hours,
        "face_recognition_success_rate": face_success_rate
    }

@app.get("/dashboard/charts")
def dashboard_charts():
    conn = get_db_connection()
    today = date.today()

    # 1. Attendance Trend (last 7 days)
    trend_labels = []
    trend_present = []
    trend_late = []
    trend_absent = []

    for i in range(6, -1, -1):
        d_str = (today - timedelta(days=i)).isoformat()
        day_name = (today - timedelta(days=i)).strftime("%a")
        trend_labels.append(day_name)
        
        p = conn.execute("SELECT COUNT(*) FROM attendance_logs WHERE date = ? AND status IN ('ON TIME', 'PRESENT');", (d_str,)).fetchone()[0]
        l = conn.execute("SELECT COUNT(*) FROM attendance_logs WHERE date = ? AND status = 'LATE';", (d_str,)).fetchone()[0]
        a = conn.execute("SELECT COUNT(*) FROM attendance_logs WHERE date = ? AND status = 'ABSENT';", (d_str,)).fetchone()[0]

        trend_present.append(p)
        trend_late.append(l)
        trend_absent.append(a)

    # 2. Department Breakdown
    dept_rows = conn.execute("""
    SELECT department, COUNT(e.id) as total_emps,
           SUM(CASE WHEN a.status IN ('ON TIME', 'PRESENT') THEN 1 ELSE 0 END) as present_count
    FROM employees e
    LEFT JOIN attendance_logs a ON e.id = a.employee_id AND a.date = ?
    GROUP BY department;
    """, (today.isoformat(),)).fetchall()

    dept_labels = [r["department"] for r in dept_rows]
    dept_present = [r["present_count"] or 0 for r in dept_rows]
    dept_total = [r["total_emps"] for r in dept_rows]

    # 3. Leave Statistics from DB
    pending_leaves = conn.execute("SELECT COUNT(*) FROM leave_requests WHERE status = 'PENDING';").fetchone()[0]
    approved_leaves = conn.execute("SELECT COUNT(*) FROM leave_requests WHERE status = 'APPROVED';").fetchone()[0]
    rejected_leaves = conn.execute("SELECT COUNT(*) FROM leave_requests WHERE status = 'REJECTED';").fetchone()[0]

    # 4. Face Success Rate from DB
    face_verified_count = conn.execute("SELECT COUNT(*) FROM attendance_logs WHERE face_verified = 1;").fetchone()[0]
    total_logs = conn.execute("SELECT COUNT(*) FROM attendance_logs;").fetchone()[0] or 1
    face_success_rate = round((face_verified_count / float(total_logs)) * 100.0, 1)

    conn.close()

    return {
        "attendance_trend": {
            "labels": trend_labels,
            "present": trend_present,
            "late": trend_late,
            "absent": trend_absent
        },
        "department_attendance": {
            "labels": dept_labels,
            "present": dept_present,
            "total": dept_total
        },
        "leave_statistics": {
            "pending": pending_leaves,
            "approved": approved_leaves,
            "rejected": rejected_leaves
        },
        "face_success_rate": face_success_rate
    }

# 3. Attendance Logs & History
@app.get("/attendance/today")
def get_attendance_today(employee_id: int):
    conn = get_db_connection()
    today_str = date.today().isoformat()
    log = conn.execute("SELECT * FROM attendance_logs WHERE employee_id = ? AND date = ?;", (employee_id, today_str)).fetchone()
    
    if not log:
        # Create initial empty record if none exists today
        conn.execute("""
        INSERT OR IGNORE INTO attendance_logs (employee_id, date, status, total_working_minutes, overtime_minutes, remarks)
        VALUES (?, ?, 'ON TIME', 0, 0, 'No punch recorded yet today.');
        """, (employee_id, today_str))
        conn.commit()
        log = conn.execute("SELECT * FROM attendance_logs WHERE employee_id = ? AND date = ?;", (employee_id, today_str)).fetchone()

    result = dict(log)
    conn.close()
    return result

@app.get("/attendance/history")
def get_attendance_history(employee_id: int):
    conn = get_db_connection()
    logs = conn.execute("""
    SELECT * FROM attendance_logs 
    WHERE employee_id = ? 
    ORDER BY date DESC LIMIT 30;
    """, (employee_id,)).fetchall()
    conn.close()
    return [dict(l) for l in logs]

# 4. Punch In / Punch Out
@app.post("/punch")
def record_punch(payload: PunchPayload):
    conn = get_db_connection()
    now_iso = payload.timestamp or datetime.now().isoformat()
    date_str = now_iso[:10] if len(now_iso) >= 10 else date.today().isoformat()

    # Retrieve face embeddings for face verification
    embeddings = conn.execute("SELECT embedding_json FROM face_embeddings WHERE employee_id = ?;", (payload.employee_id,)).fetchall()
    stored_json = [e["embedding_json"] for e in embeddings]

    is_verified, confidence, verify_msg = verify_face_against_embeddings(
        payload.face_image or "sample_face",
        stored_json,
        threshold=0.60
    )

    if payload.face_image and not is_verified:
        conn.close()
        raise HTTPException(status_code=400, detail=verify_msg)

    # Insert into punch_records
    try:
        conn.execute("""
        INSERT INTO punch_records (client_generated_id, employee_id, punch_type, timestamp, latitude, longitude, source, verified_by_face, confidence)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
        """, (payload.client_generated_id, payload.employee_id, payload.punch_type, now_iso, payload.latitude, payload.longitude, payload.source, 1 if is_verified else 0, confidence))
    except Exception:
        pass # Ignore idempotency duplication


    # Update attendance_logs
    log = conn.execute("SELECT * FROM attendance_logs WHERE employee_id = ? AND date = ?;", (payload.employee_id, date_str)).fetchone()
    
    if payload.punch_type == "in":
        punch_in_time = now_iso
        punch_out_time = log["punch_out_time"] if log else None
    else:
        punch_in_time = log["punch_in_time"] if log else now_iso
        punch_out_time = now_iso

    # Calculate total working minutes
    total_mins = 0
    if punch_in_time and punch_out_time:
        try:
            t1 = datetime.fromisoformat(punch_in_time.replace("Z", "+00:00"))
            t2 = datetime.fromisoformat(punch_out_time.replace("Z", "+00:00"))
            diff = (t2 - t1).total_seconds() / 60.0
            total_mins = max(0, int(diff))
        except Exception:
            total_mins = 540 # 9h default fallback

    overtime = max(0, total_mins - 480)
    status_str = "ON TIME"
    if payload.punch_type == "in":
        # Late check if punch in after 09:15
        if "T09:15" in now_iso or "T10:" in now_iso or "T11:" in now_iso:
            status_str = "LATE"

    if log:
        conn.execute("""
        UPDATE attendance_logs 
        SET punch_in_time = COALESCE(punch_in_time, ?),
            punch_out_time = CASE WHEN ? = 'out' THEN ? ELSE punch_out_time END,
            total_working_minutes = ?,
            overtime_minutes = ?,
            status = ?,
            face_verified = ?,
            face_confidence = ?
        WHERE employee_id = ? AND date = ?;
        """, (punch_in_time, payload.punch_type, punch_out_time, total_mins, overtime, status_str, 1 if is_verified else 0, confidence, payload.employee_id, date_str))
    else:
        conn.execute("""
        INSERT INTO attendance_logs (employee_id, date, punch_in_time, punch_out_time, status, total_working_minutes, overtime_minutes, remarks, face_verified, face_confidence)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'Face verified punch record.', ?, ?);
        """, (payload.employee_id, date_str, punch_in_time, punch_out_time, status_str, total_mins, overtime, 1 if is_verified else 0, confidence))

    # Add notification
    p_title = "Punch In Successful" if payload.punch_type == "in" else "Punch Out Successful"
    p_body = f"Clocked {payload.punch_type} at {now_iso[11:16]} ({verify_msg})."
    conn.execute("INSERT INTO notifications (employee_id, type, title, body, unread) VALUES (?, 'GEOLOCATION', ?, ?, 1);", (payload.employee_id, p_title, p_body))

    conn.commit()

    updated_log = conn.execute("SELECT * FROM attendance_logs WHERE employee_id = ? AND date = ?;", (payload.employee_id, date_str)).fetchone()
    conn.close()
    return dict(updated_log)

# 5. Employees Endpoints
@app.get("/employees")
def list_employees(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    department: Optional[str] = None
):
    conn = get_db_connection()
    offset = (page - 1) * limit
    where_clauses = ["status = 'ACTIVE'"]
    params = []

    if search:
        where_clauses.append("(name LIKE ? OR badge_id LIKE ? OR email LIKE ?)")
        params.extend([f"%{search}%", f"%{search}%", f"%{search}%"])
    if department:
        where_clauses.append("department = ?")
        params.append(department)

    where_str = " AND ".join(where_clauses)
    total = conn.execute(f"SELECT COUNT(*) FROM employees WHERE {where_str};", params).fetchone()[0]

    params.extend([limit, offset])
    items = conn.execute(f"SELECT id, badge_id, name, email, phone, department, role, profile_photo, created_at FROM employees WHERE {where_str} ORDER BY name ASC LIMIT ? OFFSET ?;", params).fetchall()

    conn.close()
    return {
        "items": [dict(i) for i in items],
        "total": total,
        "page": page,
        "limit": limit
    }

# 6. Leave & Attendance Requests
@app.get("/requests")
def get_requests(employee_id: Optional[int] = None):
    conn = get_db_connection()
    if employee_id:
        reqs = conn.execute("SELECT * FROM leave_requests WHERE employee_id = ? ORDER BY created_at DESC;", (employee_id,)).fetchall()
    else:
        reqs = conn.execute("SELECT r.*, e.name as employee_name FROM leave_requests r JOIN employees e ON r.employee_id = e.id ORDER BY r.created_at DESC;").fetchall()
    conn.close()
    return [dict(r) for r in reqs]

@app.post("/requests")
def submit_request(payload: CreateRequestPayload):
    conn = get_db_connection()
    target = payload.target_date or date.today().isoformat()
    parts = payload.reason.split(" - ", 1)
    title = parts[0] if len(parts) > 1 else "Attendance Request"
    reason = parts[1] if len(parts) > 1 else payload.reason

    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO leave_requests (employee_id, request_type, target_date, title, reason, status)
    VALUES (?, ?, ?, ?, ?, 'PENDING');
    """, (payload.employee_id, payload.request_type, target, title, reason))
    conn.commit()
    new_id = cursor.lastrowid

    # Notification
    cursor.execute("INSERT INTO notifications (employee_id, type, title, body, unread) VALUES (?, 'APPROVAL', 'Request Submitted', ?, 1);",
                   (payload.employee_id, f"Your {payload.request_type} request was submitted and is pending HR approval."))
    conn.commit()

    row = conn.execute("SELECT * FROM leave_requests WHERE id = ?;", (new_id,)).fetchone()
    conn.close()
    return dict(row)

# 7. Notifications
@app.get("/notifications")
def get_notifications(employee_id: int):
    conn = get_db_connection()
    items = conn.execute("SELECT * FROM notifications WHERE employee_id = ? ORDER BY created_at DESC;", (employee_id,)).fetchall()
    conn.close()
    return [dict(i) for i in items]

@app.put("/notifications/{notif_id}/read")
def mark_notification_read(notif_id: int):
    conn = get_db_connection()
    conn.execute("UPDATE notifications SET unread = 0 WHERE id = ?;", (notif_id,))
    conn.commit()
    conn.close()
    return {"status": "success"}

@app.put("/notifications/read-all")
def mark_all_notifications_read(employee_id: int):
    conn = get_db_connection()
    conn.execute("UPDATE notifications SET unread = 0 WHERE employee_id = ?;", (employee_id,))
    conn.commit()
    conn.close()
    return {"status": "success"}

# 8. Face Registration & Biometrics
@app.post("/face/register")
def register_face(payload: FaceCapturePayload, user: Dict[str, Any] = Depends(get_current_user)):
    conn = get_db_connection()
    emb = extract_face_embedding(payload.base64Image)
    emb_json = json.dumps(emb)

    conn.execute("""
    INSERT INTO face_embeddings (employee_id, direction, embedding_json)
    VALUES (?, ?, ?);
    """, (user["id"], payload.direction, emb_json))
    conn.commit()
    conn.close()
    return {"status": "success", "message": f"Face biometric embedding for direction '{payload.direction}' registered."}

# 9. Report Exporting (CSV, XLSX, PDF)
@app.get("/reports/export")
def export_report(
    format: str = Query("csv", pattern="^(csv|xlsx|pdf)$"),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    conn = get_db_connection()
    s_date = start_date or (date.today() - timedelta(days=30)).isoformat()
    e_date = end_date or date.today().isoformat()

    query = """
    SELECT e.badge_id as Employee_ID, e.name as Employee_Name, e.department as Department,
           a.date as Date, a.punch_in_time as Punch_In, a.punch_out_time as Punch_Out,
           a.total_working_minutes as Working_Minutes, a.status as Status, a.primary_location as Location
    FROM attendance_logs a
    JOIN employees e ON a.employee_id = e.id
    WHERE a.date BETWEEN ? AND ?
    ORDER BY a.date DESC, e.name ASC;
    """
    rows = [dict(r) for r in conn.execute(query, (s_date, e_date)).fetchall()]
    conn.close()

    filename = f"attendance_report_{s_date}_to_{e_date}"

    if format == "csv":
        csv_content = generate_csv_report(rows)
        return Response(content=csv_content, media_type="text/csv", headers={"Content-Disposition": f"attachment; filename={filename}.csv"})
    elif format == "xlsx":
        xlsx_content = generate_excel_report(rows)
        return Response(content=xlsx_content, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", headers={"Content-Disposition": f"attachment; filename={filename}.xlsx"})
    else: # PDF
        pdf_content = generate_pdf_report(rows, title=f"Attendance Report ({s_date} to {e_date})")
        return Response(content=pdf_content, media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename={filename}.pdf"})

if __name__ == "__main__":
    import uvicorn
    try:
        uvicorn.run(app, host="127.0.0.1", port=8002)
    except Exception:
        uvicorn.run(app, host="127.0.0.1", port=8000)

