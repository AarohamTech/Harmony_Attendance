# Attendance App & Service Startup Guide

> [!NOTE]
> Both backend and frontend applications are configured to run locally without any mock data dependency. All data is managed live via FastAPI and SQLite/PostgreSQL.

---

## 🚀 Quick Start (One-Click Launchers)

### 1. Launch Backend (FastAPI on Port 8002)
Double-click `run_backend.bat` inside `F:\attendance-service` or `F:\attendance-app`.

Or run via command prompt / terminal:
```cmd
cd /d F:\attendance-service
venv\Scripts\activate.bat
python -m app.seed
python -m uvicorn app.main:app --host 0.0.0.0 --port 8002 --reload
```

- **API Base URL**: `http://127.0.0.1:8002`
- **Swagger Documentation**: `http://127.0.0.1:8002/docs`
- **Health Endpoint**: `http://127.0.0.1:8002/health`

---

### 2. Launch Frontend (React Native Expo on Port 8081)
Double-click `run_frontend.bat` inside `F:\attendance-app` or `F:\attendance-service`.

Or run via command prompt / terminal:
```cmd
cd /d F:\attendance-app
npx expo start --port 8081 --web
```

- **Frontend App URL**: `http://localhost:8081`

---

## 🔐 Credentials & Demo Accounts

Default demo accounts loaded into the database:

| Employee Name | Role | Badge ID | Email | PIN |
|---|---|---|---|---|
| Alice Smith | Admin | `EMP101` | `alice@company.com` | `1234` |
| Bob Jones | Employee | `EMP102` | `bob@company.com` | `1234` |
| Charlie Brown | Employee | `EMP103` | `charlie@company.com` | `1234` |
| Diana Prince | Employee | `EMP104` | `diana@company.com` | `1234` |

---

## 🛠 Project Architecture & Features

### Backend (`F:\attendance-service`)
- **Framework**: FastAPI with Pydantic v2 validation
- **Database**: SQLite (`attendance.db`) / PostgreSQL (SQLAlchemy ORM)
- **Authentication**: JWT Bearer token with bcrypt PIN hashing
- **Business Rules**: Real-time punch processing & AttendanceDay state machine (On Time, Late/Half-Day, Absent, Incomplete, Overtime computation)

### Frontend (`F:\attendance-app`)
- **Framework**: React Native + Expo (v57.0.10) with Expo Router / Stack Navigation
- **API Communication**: `api/client.ts` pointing to `http://127.0.0.1:8002`
- **Offline Support**: Queueing punch in/out requests when network is disconnected and auto-syncing on reconnect
- **Features Tested & Verified**:
  - Login (PIN & Email)
  - Dashboard Overview & Weekly KPIs
  - Attendance History & Today status
  - Punch In / Punch Out with face vector payload support
  - Leave / Early Exit Requests
  - Notifications & Reports Export
