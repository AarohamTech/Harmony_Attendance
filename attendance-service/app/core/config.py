import os
from typing import List, Union
from pydantic_settings import BaseSettings
from pydantic import field_validator, ConfigDict

class Settings(BaseSettings):
    model_config = ConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    PROJECT_NAME: str = "Attendance Service"
    
    DATABASE_URL: str = "sqlite:///./attendance.db"
    
    SECRET_KEY: str = "super-secret-attendance-key-2026-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    ATTENDANCE_TIMEZONE: str = "Asia/Kolkata"
    
    ATTENDANCE_ON_TIME_START: str = "09:00"
    ATTENDANCE_ON_TIME_END: str = "09:15"
    ATTENDANCE_HALF_DAY_PUNCH_IN_CUTOFF: str = "09:15"
    ATTENDANCE_STANDARD_PUNCH_OUT: str = "18:00"
    ATTENDANCE_MIN_PUNCH_OUT_FOR_FULL_DAY: str = "18:00"
    ATTENDANCE_STANDARD_SHIFT_HOURS: float = 9.0
    
    CORS_ORIGINS: Union[List[str], str] = ["*"]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                import json
                return json.loads(v)
            return [i.strip() for i in v.split(",")]
        return v

settings = Settings()
