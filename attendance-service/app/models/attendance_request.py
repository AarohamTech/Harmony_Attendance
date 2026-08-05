from sqlalchemy import Column, Integer, String, DateTime, Date, Text, ForeignKey, func
from sqlalchemy.orm import relationship
from app.db.base import Base

class AttendanceRequest(Base):
    __tablename__ = "attendance_requests"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    request_type = Column(String(50), nullable=False)  # 'early_exit', 'leave', 'correction'
    target_date = Column(Date, nullable=False)
    reason = Column(Text, nullable=True)
    status = Column(String(20), nullable=False, default="pending")  # 'pending', 'approved', 'rejected'
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    employee = relationship("Employee", back_populates="attendance_requests")
