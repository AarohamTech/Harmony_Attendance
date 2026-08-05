import sys
import os
from datetime import datetime, date, time
import zoneinfo

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.db.session import SessionLocal, engine
from app.db.base import Base
from app.models.employee import Employee
from app.models.punch_record import PunchRecord
from app.models.attendance_day import AttendanceDay
from app.models.attendance_request import AttendanceRequest
from app.services.auth_service import get_pin_hash
from app.services.punch_service import record_punch, recalculate_attendance_day
from app.schemas.punch import PunchCreate
from app.core.config import settings

TZ_KOLKATA = zoneinfo.ZoneInfo(settings.ATTENDANCE_TIMEZONE)

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Clear existing data cleanly
        db.query(PunchRecord).delete()
        db.query(AttendanceDay).delete()
        db.query(AttendanceRequest).delete()
        db.query(Employee).delete()
        db.commit()

        print("Seeding demo employees...")
        default_pin = "1234"
        hashed_pin = get_pin_hash(default_pin)

        e1 = Employee(name="Alice Smith", email="alice@company.com", badge_id="EMP101", pin_hash=hashed_pin, role="admin", department="Engineering")
        e2 = Employee(name="Bob Jones", email="bob@company.com", badge_id="EMP102", pin_hash=hashed_pin, role="employee", department="Operations")
        e3 = Employee(name="Charlie Brown", email="charlie@company.com", badge_id="EMP103", pin_hash=hashed_pin, role="employee", department="Sales")
        e4 = Employee(name="Diana Prince", email="diana@company.com", badge_id="EMP104", pin_hash=hashed_pin, role="employee", department="HR")

        db.add_all([e1, e2, e3, e4])
        db.commit()

        for e in [e1, e2, e3, e4]:
            db.refresh(e)

        print(f"Created employees: {e1.id} (Alice), {e2.id} (Bob), {e3.id} (Charlie), {e4.id} (Diana)")

        today = datetime.now(TZ_KOLKATA).date()
        yesterday = today.replace(day=today.day - 1) if today.day > 1 else today

        # -------------------------------------------------------------
        # Case 1: Alice - On Time today (09:05 in, 18:05 out)
        # -------------------------------------------------------------
        record_punch(db, PunchCreate(
            employee_id=e1.id,
            punch_type="in",
            timestamp=datetime.combine(today, time(9, 5), tzinfo=TZ_KOLKATA),
            latitude=12.9716, longitude=77.5946, source="web",
            client_generated_id="seed-alice-in-today"
        ))
        record_punch(db, PunchCreate(
            employee_id=e1.id,
            punch_type="out",
            timestamp=datetime.combine(today, time(18, 5), tzinfo=TZ_KOLKATA),
            latitude=12.9716, longitude=77.5946, source="web",
            client_generated_id="seed-alice-out-today"
        ))

        # -------------------------------------------------------------
        # Case 2: Bob - Half Day due to Late Punch In today (09:35 in, 18:00 out)
        # -------------------------------------------------------------
        record_punch(db, PunchCreate(
            employee_id=e2.id,
            punch_type="in",
            timestamp=datetime.combine(today, time(9, 35), tzinfo=TZ_KOLKATA),
            latitude=12.9716, longitude=77.5946, source="android",
            client_generated_id="seed-bob-in-today"
        ))
        record_punch(db, PunchCreate(
            employee_id=e2.id,
            punch_type="out",
            timestamp=datetime.combine(today, time(18, 0), tzinfo=TZ_KOLKATA),
            latitude=12.9716, longitude=77.5946, source="android",
            client_generated_id="seed-bob-out-today"
        ))

        # -------------------------------------------------------------
        # Case 3: Charlie - Half Day due to Early Punch Out without approved request today (09:00 in, 16:30 out)
        # -------------------------------------------------------------
        record_punch(db, PunchCreate(
            employee_id=e3.id,
            punch_type="in",
            timestamp=datetime.combine(today, time(9, 0), tzinfo=TZ_KOLKATA),
            latitude=12.9716, longitude=77.5946, source="web",
            client_generated_id="seed-charlie-in-today"
        ))
        record_punch(db, PunchCreate(
            employee_id=e3.id,
            punch_type="out",
            timestamp=datetime.combine(today, time(16, 30), tzinfo=TZ_KOLKATA),
            latitude=12.9716, longitude=77.5946, source="web",
            client_generated_id="seed-charlie-out-today"
        ))

        # -------------------------------------------------------------
        # Case 4: Diana - Incomplete today (09:10 in, NO punch out)
        # -------------------------------------------------------------
        record_punch(db, PunchCreate(
            employee_id=e4.id,
            punch_type="in",
            timestamp=datetime.combine(today, time(9, 10), tzinfo=TZ_KOLKATA),
            latitude=12.9716, longitude=77.5946, source="android",
            client_generated_id="seed-diana-in-today"
        ))

        # -------------------------------------------------------------
        # Case 5: Bob - Absent yesterday (No punches, AttendanceDay absent)
        # -------------------------------------------------------------
        absent_day = AttendanceDay(
            employee_id=e2.id,
            date=yesterday,
            status="absent",
            punch_in_time=None,
            punch_out_time=None,
            total_working_minutes=None,
            overtime_minutes=None
        )
        db.add(absent_day)

        # -------------------------------------------------------------
        # Case 6: Charlie - Approved Early Exit yesterday (09:00 in, 16:00 out + Approved Request)
        # -------------------------------------------------------------
        req = AttendanceRequest(
            employee_id=e3.id,
            request_type="early_exit",
            target_date=yesterday,
            reason="Doctor appointment",
            status="approved"
        )
        db.add(req)
        db.commit()

        record_punch(db, PunchCreate(
            employee_id=e3.id,
            punch_type="in",
            timestamp=datetime.combine(yesterday, time(9, 0), tzinfo=TZ_KOLKATA),
            latitude=12.9716, longitude=77.5946, source="web",
            client_generated_id="seed-charlie-in-yesterday"
        ))
        record_punch(db, PunchCreate(
            employee_id=e3.id,
            punch_type="out",
            timestamp=datetime.combine(yesterday, time(16, 0), tzinfo=TZ_KOLKATA),
            latitude=12.9716, longitude=77.5946, source="web",
            client_generated_id="seed-charlie-out-yesterday"
        ))

        db.commit()
        print("Database seeded successfully with all status cases!")

    finally:
        db.close()

if __name__ == "__main__":
    seed()
