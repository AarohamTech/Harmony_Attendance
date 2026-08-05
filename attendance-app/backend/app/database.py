import sqlite3
import os
import hashlib
import json
from datetime import datetime, date, timedelta
from typing import Optional, List, Dict, Any

from sqlalchemy import (
    create_engine, Column, Integer, String, Float, Text, DateTime, ForeignKey, UniqueConstraint, Index, event
)
from sqlalchemy.orm import declarative_base, sessionmaker, relationship, Session
from sqlite3 import Connection as SQLite3Connection

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "attendance.db")
DATABASE_URL = f"sqlite:///{DB_PATH}"

# ----------------------------------------------------------------------
# SQLAlchemy Engine & Session Configuration
# ----------------------------------------------------------------------
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=False
)

# Enable Foreign Keys and WAL Mode on SQLite Connection startup
@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    if isinstance(dbapi_connection, SQLite3Connection):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys = ON;")
        cursor.execute("PRAGMA journal_mode = WAL;")
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db_session() -> Session:
    db = SessionLocal()
    try:
        return db
    finally:
        pass

def get_db_connection():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.execute("PRAGMA journal_mode = WAL;")
    return conn

def hash_pin(pin: str) -> str:
    return hashlib.sha256(f"salt_harmony_{pin}".encode("utf-8")).hexdigest()

# ----------------------------------------------------------------------
# SQLAlchemy ORM Table Definitions
# ----------------------------------------------------------------------
class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    badge_id = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, nullable=False, index=True)
    phone = Column(String(30), nullable=True)
    department = Column(String(80), nullable=False)
    role = Column(String(80), nullable=False)
    pin_hash = Column(String(256), nullable=False)
    profile_photo = Column(Text, nullable=True)
    location_label = Column(String(150), default="Head Office, Silicon Tower")
    latitude = Column(Float, default=12.9716)
    longitude = Column(Float, default=77.5946)
    status = Column(String(20), default="ACTIVE")
    created_at = Column(DateTime, default=datetime.utcnow)

    attendance_logs = relationship("AttendanceLog", back_populates="employee", cascade="all, delete-orphan")
    punch_records = relationship("PunchRecord", back_populates="employee", cascade="all, delete-orphan")
    face_embeddings = relationship("FaceEmbedding", back_populates="employee", cascade="all, delete-orphan")
    leave_requests = relationship("LeaveRequest", back_populates="employee", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="employee", cascade="all, delete-orphan")

class FaceEmbedding(Base):
    __tablename__ = "face_embeddings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    direction = Column(String(30), nullable=False)
    embedding_json = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    employee = relationship("Employee", back_populates="face_embeddings")

class AttendanceLog(Base):
    __tablename__ = "attendance_logs"
    __table_args__ = (
        UniqueConstraint("employee_id", "date", name="uix_employee_date"),
        Index("idx_attendance_emp_date", "employee_id", "date"),
    )

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    date = Column(String(10), nullable=False)
    punch_in_time = Column(String(30), nullable=True)
    punch_out_time = Column(String(30), nullable=True)
    status = Column(String(30), nullable=False, default="PRESENT")
    total_working_minutes = Column(Integer, default=0)
    overtime_minutes = Column(Integer, default=0)
    remarks = Column(Text, nullable=True)
    primary_location = Column(String(150), default="Head Office, Silicon Tower")
    latitude = Column(Float, default=12.9716)
    longitude = Column(Float, default=77.5946)
    face_verified = Column(Integer, default=1)
    face_confidence = Column(Float, default=99.5)
    created_at = Column(DateTime, default=datetime.utcnow)

    employee = relationship("Employee", back_populates="attendance_logs")

class PunchRecord(Base):
    __tablename__ = "punch_records"
    __table_args__ = (
        Index("idx_punch_emp_time", "employee_id", "timestamp"),
    )

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    client_generated_id = Column(String(100), unique=True, nullable=False)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    punch_type = Column(String(10), nullable=False)
    timestamp = Column(String(30), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    source = Column(String(20), default="web")
    verified_by_face = Column(Integer, default=1)
    confidence = Column(Float, default=99.5)

    employee = relationship("Employee", back_populates="punch_records")

class LeaveRequest(Base):
    __tablename__ = "leave_requests"
    __table_args__ = (
        Index("idx_requests_emp_status", "employee_id", "status"),
    )

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    request_type = Column(String(30), nullable=False)
    target_date = Column(String(10), nullable=False)
    title = Column(String(150), nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(String(20), nullable=False, default="PENDING")
    rejection_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    employee = relationship("Employee", back_populates="leave_requests")

class Notification(Base):
    __tablename__ = "notifications"
    __table_args__ = (
        Index("idx_notifications_emp_unread", "employee_id", "unread"),
    )

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    type = Column(String(30), nullable=False)
    title = Column(String(150), nullable=False)
    body = Column(Text, nullable=False)
    unread = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)

    employee = relationship("Employee", back_populates="notifications")

# ----------------------------------------------------------------------
# DB Initialization & Seeding
# ----------------------------------------------------------------------
def init_db():
    Base.metadata.create_all(bind=engine)

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM employees;")
    count = cursor.fetchone()[0]
    if count == 0:
        seed_database(conn)

    conn.close()

def seed_database(conn):
    cursor = conn.cursor()
    print("[DB] Seeding database with initial production setup...")

    # Seed Employees
    employees = [
        ('EMP-88210', 'Alex Thompson', 'alex@company.com', '+1 (555) 012-3456', 'UX Department', 'Senior UX Designer', hash_pin('1234'), 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', 'Head Office, Silicon Tower', 12.9716, 77.5946),
        ('EMP-77091', 'Priya Nair', 'priya@company.com', '+1 (555) 012-7890', 'People Ops', 'HR Operations Lead', hash_pin('2580'), 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80', 'Head Office, Silicon Tower', 12.9716, 77.5946),
        ('EMP-99120', 'Daniel Kim', 'daniel@company.com', '+1 (555) 012-4411', 'Engineering', 'Platform Engineer', hash_pin('9000'), 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80', 'Head Office, Silicon Tower', 12.9716, 77.5946),
        ('EMP-11452', 'Maya Reddy', 'maya@company.com', '+1 (555) 012-8822', 'Finance', 'Accounts Specialist', hash_pin('0000'), 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80', 'Head Office, Silicon Tower', 12.9716, 77.5946),
        ('EMP-55412', 'Sarah Jenkins', 'sarah@company.com', '+1 (555) 012-9900', 'Engineering', 'Staff Frontend Architect', hash_pin('1111'), 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80', 'Head Office, Silicon Tower', 12.9716, 77.5946),
        ('EMP-33214', 'Marcus Vance', 'marcus@company.com', '+1 (555) 012-3344', 'Marketing', 'Brand Lead', hash_pin('2222'), 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', 'Head Office, Silicon Tower', 12.9716, 77.5946)
    ]

    cursor.executemany("""
    INSERT INTO employees (badge_id, name, email, phone, department, role, pin_hash, profile_photo, location_label, latitude, longitude)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, employees)
    conn.commit()

    # Seed Face Embeddings for Alex (EMP-88210) & others
    cursor.execute("SELECT id, name FROM employees;")
    emp_rows = cursor.fetchall()
    
    for emp in emp_rows:
        emp_id = emp['id']
        vector = [(0.1 * i + emp_id * 0.05) % 1.0 for i in range(128)]
        norm = sum(v * v for v in vector) ** 0.5
        vector = [v / norm for v in vector]
        
        for dir_name in ['front', 'left', 'right']:
            cursor.execute("""
            INSERT INTO face_embeddings (employee_id, direction, embedding_json)
            VALUES (?, ?, ?);
            """, (emp_id, dir_name, json.dumps(vector)))

    # Seed Attendance Logs for the past 30 days
    today = date.today()
    alex_id = 1

    for i in range(30):
        past_date = today - timedelta(days=i)
        date_str = past_date.isoformat()
        day_of_week = past_date.weekday()

        if day_of_week == 6:
            continue

        if i == 0:
            punch_in = f"{date_str}T08:52:00"
            punch_out = f"{date_str}T18:05:00"
            status = 'ON TIME'
            total_mins = 553
            overtime_mins = 13
            remarks = "Completed sprint sync and Project Aurora wireframe review."
        elif i == 1:
            punch_in = f"{date_str}T09:04:00"
            punch_out = f"{date_str}T18:01:00"
            status = 'ON TIME'
            total_mins = 537
            overtime_mins = 1
            remarks = "Feature review and design backlog triage."
        elif i == 3:
            punch_in = f"{date_str}T09:35:00"
            punch_out = f"{date_str}T18:05:00"
            status = 'LATE'
            total_mins = 510
            overtime_mins = 0
            remarks = "Traffic delay on main highway."
        elif i == 5:
            punch_in = None
            punch_out = None
            status = 'ABSENT'
            total_mins = 0
            overtime_mins = 0
            remarks = "Sick leave."
        else:
            punch_in = f"{date_str}T08:55:00"
            punch_out = f"{date_str}T18:00:00"
            status = 'ON TIME'
            total_mins = 545
            overtime_mins = 5
            remarks = "Regular working day."

        if punch_in:
            cursor.execute("""
            INSERT OR IGNORE INTO attendance_logs (employee_id, date, punch_in_time, punch_out_time, status, total_working_minutes, overtime_minutes, remarks, primary_location, face_verified, face_confidence)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Head Office, Silicon Tower', 1, 99.8);
            """, (alex_id, date_str, punch_in, punch_out, status, total_mins, overtime_mins, remarks))

        for emp in emp_rows:
            if emp['id'] == alex_id:
                continue
            e_status = 'ON TIME' if (emp['id'] + i) % 4 != 0 else 'LATE'
            e_in = f"{date_str}T08:50:00" if e_status == 'ON TIME' else f"{date_str}T09:30:00"
            e_out = f"{date_str}T18:00:00"
            cursor.execute("""
            INSERT OR IGNORE INTO attendance_logs (employee_id, date, punch_in_time, punch_out_time, status, total_working_minutes, overtime_minutes, remarks)
            VALUES (?, ?, ?, ?, ?, 540, 0, 'Daily routine task execution');
            """, (emp['id'], date_str, e_in, e_out, e_status))

    # Seed Leave Requests
    requests_data = [
        (alex_id, 'early_exit', today.isoformat(), 'Early exit request for medical appointment', 'Need to leave early around 3:00 PM for family healthcare checkup.', 'PENDING', None),
        (alex_id, 'leave', (today - timedelta(days=5)).isoformat(), 'Annual Leave Request', 'Planning long weekend with family.', 'APPROVED', None),
        (alex_id, 'correction', (today - timedelta(days=12)).isoformat(), 'Attendance Correction', 'VPN session disconnected, requesting punch update.', 'REJECTED', 'VPN logs do not match requested start time. Please resubmit with correct timestamps.'),
        (2, 'leave', today.isoformat(), 'Personal Leave', 'Attending workshop.', 'PENDING', None),
        (3, 'wfh', today.isoformat(), 'Work From Home', 'Remote setup day.', 'APPROVED', None)
    ]

    for req in requests_data:
        cursor.execute("""
        INSERT INTO leave_requests (employee_id, request_type, target_date, title, reason, status, rejection_reason)
        VALUES (?, ?, ?, ?, ?, ?, ?);
        """, req)

    # Seed Notifications
    notifications_data = [
        (alex_id, 'APPROVAL', 'Request Approved', 'Your leave request for Annual Leave has been approved by HR.', 1),
        (alex_id, 'GEOLOCATION', 'Geofence Verified', 'Location confirmed at Silicon Tower (Head Office). Punch-in available.', 1),
        (alex_id, 'REMINDER', 'Punch Out Reminder', "Don't forget to clock out before 06:15 PM today.", 0),
        (alex_id, 'SYSTEM', 'System Maintenance', 'Harmony AI Attendance portal undergoing system security optimization.', 0)
    ]

    for notif in notifications_data:
        cursor.execute("""
        INSERT INTO notifications (employee_id, type, title, body, unread)
        VALUES (?, ?, ?, ?, ?);
        """, notif)

    conn.commit()
    print("[DB] Seeding completed successfully.")

