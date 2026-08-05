from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, func
from sqlalchemy.orm import relationship
from app.db.base import Base

class PunchRecord(Base):
    __tablename__ = "punch_records"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    punch_type = Column(String(20), nullable=False)  # 'in' or 'out'
    timestamp = Column(DateTime(timezone=True), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    source = Column(String(20), nullable=False, default="web")  # 'web' or 'android'
    client_generated_id = Column(String(100), unique=True, index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    employee = relationship("Employee", back_populates="punch_records")
