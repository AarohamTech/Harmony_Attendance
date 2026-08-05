from sqlalchemy import Column, Integer, String, DateTime, func
from sqlalchemy.orm import relationship
from app.db.base import Base

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    badge_id = Column(String(50), unique=True, index=True, nullable=False)
    pin_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="employee", nullable=False)
    department = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    punch_records = relationship("PunchRecord", back_populates="employee", cascade="all, delete-orphan")
    attendance_days = relationship("AttendanceDay", back_populates="employee", cascade="all, delete-orphan")
    attendance_requests = relationship("AttendanceRequest", back_populates="employee", cascade="all, delete-orphan")
