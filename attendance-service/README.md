# Attendance Service Backend

A complete, standalone FastAPI backend service for employee attendance tracking with timing business logic, JWT authentication, offline idempotency, and automated status calculation.

## Features

- **Auth**: POST `/auth/login` (Badge ID / Email + PIN verification with bcrypt)
- **Punch Recording**: POST `/punch` with `client_generated_id` for offline idempotency
- **Pure Timing Rules Engine** (`app/services/attendance_rules.py`):
  - On-Time (09:00 - 09:15)
  - Late Punch-In (> 09:15 -> Half Day)
  - Early Punch-Out (< 18:00 without approved early exit -> Half Day)
  - Approved Requests (`early_exit`, `leave`) override automatic downgrades
  - Incomplete day flagging (punched in but missing punch out)
- **Attendance Summary & History**: `/attendance/today`, `/attendance/history`, `/attendance/summary`
- **Attendance Requests**: POST `/requests`, GET `/requests`, PATCH `/requests/{id}` (triggers status recalculation)
- **Dashboard Overview**: GET `/dashboard/overview` (Real aggregate KPIs)
- **CORS Configured**: Fully enabled for React Native Expo (`http://localhost:8081`, `http://127.0.0.1:8081`, `http://localhost:19006`, Expo mobile apps)
- **Timezone Awareness**: All business rules evaluated in configurable local timezone (`Asia/Kolkata`)

---

## Directory Structure

```
attendance-service/
├── app/
│   ├── main.py                # FastAPI application entrypoint
│   ├── core/
│   │   └── config.py          # Settings loaded from .env
│   ├── db/
│   │   ├── base.py            # SQLAlchemy Base
│   │   └── session.py         # DB Engine and Session Local
│   ├── models/                # SQLAlchemy Models
│   │   ├── employee.py
│   │   ├── punch_record.py
│   │   ├── attendance_day.py
│   │   └── attendance_request.py
│   ├── schemas/               # Pydantic Schemas
│   │   ├── auth.py
│   │   ├── employee.py
│   │   ├── punch.py
│   │   ├── attendance_day.py
│   │   └── request.py
│   ├── routers/               # API Endpoints
│   │   ├── auth.py
│   │   ├── punch.py
│   │   ├── attendance.py
│   │   ├── requests.py
│   │   └── dashboard.py
│   ├── services/
│   │   ├── attendance_rules.py  # Pure status calculation logic
│   │   ├── auth_service.py      # JWT & PIN hashing
│   │   ├── punch_service.py     # Punch recording & recalculation
│   │   └── request_service.py   # Requests & recalculation trigger
│   └── seed.py                # Demo database seeder
├── alembic/                    # Migration scripts
├── tests/                     # Test suite
│   ├── __init__.py
│   ├── test_attendance_rules.py # Pure unit tests (11 passing cases)
│   ├── test_e2e_integration.py  # E2E test script
│   └── test_live_api.py         # Live API endpoint tests
├── .env
├── .env.example
├── alembic.ini
├── pytest.ini
├── requirements.txt
├── run_backend.bat             # One-click Windows Batch launcher
├── run_backend.ps1             # One-click PowerShell launcher
└── README.md
```

---

## Quick Setup & Running

### One-Command Startup

#### Windows Batch:
```cmd
run_backend.bat
```

#### Windows PowerShell:
```powershell
.\run_backend.ps1
```

#### Universal Command Line:
```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8002 --reload
```

---

## Detailed Step-by-Step Instructions

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment Variables (`.env`)

Verify your `.env` contains:

```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
SECRET_KEY=super-secret-attendance-key-2026-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
ATTENDANCE_TIMEZONE=Asia/Kolkata
ATTENDANCE_ON_TIME_START=09:00
ATTENDANCE_ON_TIME_END=09:15
ATTENDANCE_HALF_DAY_PUNCH_IN_CUTOFF=09:15
ATTENDANCE_STANDARD_PUNCH_OUT=18:00
ATTENDANCE_MIN_PUNCH_OUT_FOR_FULL_DAY=18:00
ATTENDANCE_STANDARD_SHIFT_HOURS=9.0
CORS_ORIGINS=["*"]
```

### 3. Seed Demo Data (Optional)

```bash
python app/seed.py
```

### 4. Run Unit Tests

```bash
pytest
```

### 5. Start Backend Server on Port 8002

```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8002 --reload
```

---

## API Documentation & OpenAPI Specification

Interactive API documentation and schema endpoints:
- **Swagger UI**: [http://127.0.0.1:8002/docs](http://127.0.0.1:8002/docs)
- **OpenAPI Schema**: [http://127.0.0.1:8002/openapi.json](http://127.0.0.1:8002/openapi.json)
- **Health Check**: [http://127.0.0.1:8002/health](http://127.0.0.1:8002/health)

---

## Demo Credentials Seeded

| Employee Name | Badge ID | Default PIN | Role | Department |
|--------------|----------|-------------|------|------------|
| Alice Smith | `EMP101` | `1234` | admin | Engineering |
| Bob Jones | `EMP102` | `1234` | employee | Operations |
| Charlie Brown | `EMP103` | `1234` | employee | Sales |
| Diana Prince | `EMP104` | `1234` | employee | HR |
