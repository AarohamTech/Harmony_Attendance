import pytest
from datetime import datetime, timezone
import zoneinfo
from app.services.attendance_rules import (
    calculate_status,
    calculate_working_minutes,
    calculate_overtime_minutes,
    to_local_time
)

TZ_KOLKATA = zoneinfo.ZoneInfo("Asia/Kolkata")

def make_dt(year=2026, month=8, day=5, hour=9, minute=0):
    return datetime(year, month, day, hour, minute, tzinfo=TZ_KOLKATA)

def test_rule_1_no_punch_in():
    """Rule 1: No punch-in recorded for the day -> status = 'absent'"""
    status = calculate_status(punch_in=None, punch_out=None)
    assert status == "absent"

def test_rule_2_on_time_in():
    """Rule 2: Punch-in between 09:00-09:15 (inclusive) -> 'on_time'"""
    p_in = make_dt(hour=9, minute=10)
    p_out = make_dt(hour=18, minute=0)
    status = calculate_status(punch_in=p_in, punch_out=p_out)
    assert status == "on_time"

def test_rule_2_exact_cutoff_in():
    """Rule 2: Punch-in exactly at 09:15 -> 'on_time'"""
    p_in = make_dt(hour=9, minute=15)
    p_out = make_dt(hour=18, minute=0)
    status = calculate_status(punch_in=p_in, punch_out=p_out)
    assert status == "on_time"

def test_rule_3_late_in_half_day():
    """Rule 3: Punch-in after 09:15 -> 'half_day'"""
    p_in = make_dt(hour=9, minute=16)
    p_out = make_dt(hour=18, minute=0)
    status = calculate_status(punch_in=p_in, punch_out=p_out)
    assert status == "half_day"

def test_rule_4_early_in():
    """Rule 4: Punch-in before 09:00 -> 'on_time'"""
    p_in = make_dt(hour=8, minute=30)
    p_out = make_dt(hour=18, minute=0)
    status = calculate_status(punch_in=p_in, punch_out=p_out)
    assert status == "on_time"

def test_rule_5_incomplete_no_punch_out():
    """Rule 5: Punched in but no punch out -> 'incomplete'"""
    p_in = make_dt(hour=9, minute=0)
    status = calculate_status(punch_in=p_in, punch_out=None)
    assert status == "incomplete"

def test_rule_6_early_out_half_day():
    """Rule 6: Punched out before 18:00 without approved request -> downgrade to 'half_day'"""
    p_in = make_dt(hour=9, minute=0)
    p_out = make_dt(hour=17, minute=45)
    status = calculate_status(punch_in=p_in, punch_out=p_out, approved_request_type=None)
    assert status == "half_day"

def test_rule_6_late_in_and_early_out():
    """Rule 6 combination: Late in + early out is still 'half_day' (worst-case wins, not double-penalized)"""
    p_in = make_dt(hour=9, minute=30)
    p_out = make_dt(hour=17, minute=0)
    status = calculate_status(punch_in=p_in, punch_out=p_out, approved_request_type=None)
    assert status == "half_day"

def test_rule_7_approved_early_exit():
    """Rule 7: Approved early_exit request excuses early punch-out"""
    p_in = make_dt(hour=9, minute=0)
    p_out = make_dt(hour=17, minute=0)
    status = calculate_status(punch_in=p_in, punch_out=p_out, approved_request_type="early_exit")
    assert status == "on_time"

def test_rule_7_approved_leave():
    """Rule 7: Approved leave request overrides status to 'present'"""
    status = calculate_status(punch_in=None, punch_out=None, approved_request_type="leave")
    assert status == "present"

def test_working_hours_and_overtime():
    """Rule 8: Total working minutes and overtime calculation"""
    p_in = make_dt(hour=9, minute=0)
    p_out = make_dt(hour=19, minute=30)  # 10.5 hours = 630 mins
    wm = calculate_working_minutes(p_in, p_out)
    assert wm == 630

    ot = calculate_overtime_minutes(wm, standard_shift_hours=9.0)  # 9 hours = 540 mins
    assert ot == 90  # 630 - 540 = 90 mins overtime
