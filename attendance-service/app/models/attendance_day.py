from sqlalchemy import Column, Integer, String, DateTime, Date, ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import relationship
from app.db.base import Base

class AttendanceDay(Base):
    __tablename__ = "attendance_days"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False)
    punch_in_time = Column(DateTime(timezone=True), nullable=True)
    punch_out_time = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(50), nullable=False)  # 'present', 'on_time', 'half_day', 'absent', 'incomplete'
    total_working_minutes = Column(Integer, nullable=True)
    overtime_minutes = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        UniqueConstraint("employee_id", "date", name="uq_employee_date"),
    )

    employee = relationship("Employee", back_populates="attendance_days")
