from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class PunchCreate(BaseModel):
    employee_id: Optional[int] = None
    punch_type: str = Field(..., pattern="^(in|out)$", description="Must be 'in' or 'out'")
    timestamp: datetime
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    source: str = Field("web", pattern="^(web|android)$")
    client_generated_id: str
    face_image: Optional[str] = None


class PunchOut(BaseModel):
    id: int
    employee_id: int
    punch_type: str
    timestamp: datetime
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    source: str
    client_generated_id: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
