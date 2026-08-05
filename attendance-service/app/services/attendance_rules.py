from datetime import datetime, time
from typing import Optional, Tuple
import zoneinfo
from app.core.config import settings

def to_local_time(dt: datetime, tz_name: str) -> datetime:
    """Converts a naive or aware datetime to the specified target timezone."""
    try:
        tz = zoneinfo.ZoneInfo(tz_name)
    except Exception:
        tz = zoneinfo.ZoneInfo("UTC")
    if dt.tzinfo is None:
        return dt.replace(tzinfo=tz)
    return dt.astimezone(tz)

def parse_time_str(time_str: str) -> time:
    """Parses HH:MM or HH:MM:SS string into a datetime.time object."""
    parts = time_str.strip().split(":")
    return time(int(parts[0]), int(parts[1]))

def calculate_status(
    punch_in: Optional[datetime],
    punch_out: Optional[datetime],
    approved_request_type: Optional[str] = None,
    tz_name: Optional[str] = None,
    cutoff_str: Optional[str] = None,
    min_punch_out_str: Optional[str] = None,
) -> str:
    """
    Pure function to calculate employee daily attendance status based on timing rules and approved requests.

    Status calculation rules:
    1. No punch-in recorded -> 'absent'
    2. Punch-in between 09:00-09:15 (or <= cutoff) -> 'on_time' (or 'present')
    3. Punch-in after 09:15 -> 'half_day'
    4. Punch-in before 09:00 -> 'on_time'
    5. Punch-in present but punch-out missing -> 'incomplete'
    6. Punch-out before 18:00 without approved early exit request -> downgrade to 'half_day'
    7. Approved AttendanceRequest ('early_exit' or 'leave') overrides/excuses status.
    8. Worst case status wins ('half_day' stays 'half_day', not penalized twice).
    """
    tz = tz_name or settings.ATTENDANCE_TIMEZONE
    cutoff_t = parse_time_str(cutoff_str or settings.ATTENDANCE_HALF_DAY_PUNCH_IN_CUTOFF)
    min_punch_out_t = parse_time_str(min_punch_out_str or settings.ATTENDANCE_MIN_PUNCH_OUT_FOR_FULL_DAY)

    # Approved leave overrides day to 'present'
    if approved_request_type == "leave":
        return "present"

    # Rule 1: No punch in -> absent
    if not punch_in:
        return "absent"

    # Rule 5: Punched in, but no punch out -> incomplete
    if not punch_out:
        return "incomplete"

    local_in = to_local_time(punch_in, tz)
    local_out = to_local_time(punch_out, tz)

    in_time = local_in.time()
    out_time = local_out.time()

    # Determine status from punch in
    if in_time <= cutoff_t:
        status = "on_time"
    else:
        status = "half_day"

    # Check punch out timing
    if out_time < min_punch_out_t:
        if approved_request_type == "early_exit":
            # Approved early exit excuses early punch out
            pass
        else:
            status = "half_day"

    return status

def calculate_working_minutes(
    punch_in: Optional[datetime],
    punch_out: Optional[datetime]
) -> Optional[int]:
    """Calculates total working duration in minutes between punch_in and punch_out."""
    if not punch_in or not punch_out:
        return None
    delta = punch_out - punch_in
    minutes = int(delta.total_seconds() // 60)
    return max(0, minutes)

def calculate_overtime_minutes(
    working_minutes: Optional[int],
    standard_shift_hours: Optional[float] = None
) -> Optional[int]:
    """Calculates overtime minutes beyond the standard shift hours."""
    if working_minutes is None:
        return None
    shift_h = standard_shift_hours if standard_shift_hours is not None else settings.ATTENDANCE_STANDARD_SHIFT_HOURS
    standard_minutes = int(shift_h * 60)
    return max(0, working_minutes - standard_minutes)
