# 🎯 Harmony AI Attendance System

<p align="center">

![Platform](https://img.shields.io/badge/Platform-Android-green)
![Frontend](https://img.shields.io/badge/Frontend-React%20Native%20%2B%20Expo-blue)
![Backend](https://img.shields.io/badge/Backend-FastAPI-green)
![Database](https://img.shields.io/badge/Database-Supabase%20%7C%20PostgreSQL-orange)
![Authentication](https://img.shields.io/badge/Auth-JWT-red)
![License](https://img.shields.io/badge/License-MIT-yellow)

</p>

---

# Harmony AI Attendance System

An AI-powered Employee Attendance Management System built using **React Native (Expo)** and **Python FastAPI**.

The system enables employees to securely punch in/out using facial verification, GPS location, and real-time backend APIs while providing attendance history, leave requests, dashboards, reports, and employee profile management.

---

# 📁 Project Structure

```
Attendence/
│
├── attendance-app/          # React Native Mobile Application
│
├── attendance-service/      # FastAPI Backend
│
└── README.md
```

---

# 🚀 Features

## Employee

- Secure Login
- JWT Authentication
- Face Registration
- Face Verification
- Punch In
- Punch Out
- Attendance History
- Attendance Details
- Attendance Requests
- Leave Requests
- Early Exit Requests
- Notifications
- Employee Profile
- Edit Profile
- Dashboard
- Pull to Refresh
- GPS Location Capture
- Live Attendance Status

---

## Admin

- Employee Management
- Attendance Reports
- Attendance Dashboard
- Live Statistics
- Export Reports
- Department-wise Attendance
- Notification Management
- Employee Registration

---

# 🤖 AI Features

- Face Recognition
- Face Verification
- Confidence Score
- Face Embedding Storage
- Duplicate Face Detection
- Biometric Attendance
- AI Attendance Validation

---

# 🛠 Technology Stack

## Mobile Application

- React Native
- Expo
- TypeScript
- React Navigation
- Expo Camera
- Expo Location
- Expo Secure Store

---

## Backend

- Python 3.13+
- FastAPI
- SQLAlchemy
- Pydantic
- JWT Authentication
- Passlib
- Uvicorn

---

## Database

- PostgreSQL / Supabase
- SQLite (Development)

---

## Reports

- CSV
- Excel
- PDF

---

# 📱 Mobile Screens

- Splash Screen
- Login
- Employee Dashboard
- Punch In
- Punch Out
- Attendance History
- Attendance Details
- Requests
- New Request
- Notifications
- Employee Profile
- Edit Profile
- Face Registration
- Face Capture
- Registration Success

---

# 🔐 Authentication

- JWT Token Authentication
- Password Hashing
- Secure Login
- Protected APIs
- Session Validation

---

# 📊 Dashboard

The dashboard displays real-time statistics including:

- Present Employees
- Absent Employees
- Late Employees
- Total Employees
- Average Working Hours
- Today's Attendance
- Face Match Rate

---

# 📍 Attendance Workflow

```
Employee Login
        │
        ▼
Face Verification
        │
        ▼
GPS Location Verification
        │
        ▼
Punch In
        │
        ▼
Working Hours Calculation
        │
        ▼
Punch Out
        │
        ▼
Attendance Saved
```

---

# 🗄 Database

Major tables

- employees
- attendance_logs
- punch_records
- face_embeddings
- leave_requests
- notifications

---

# 🔌 REST APIs

Authentication

```
POST /auth/login
POST /auth/register
GET  /auth/me
```

Attendance

```
GET  /attendance/today
GET  /attendance/history
POST /punch
```

Dashboard

```
GET /dashboard/overview
GET /dashboard/charts
```

Employee

```
GET /employees
PUT /profile/update
```

Face

```
POST /face/register
```

Requests

```
GET /requests
POST /requests
```

Reports

```
GET /reports/export
```

---

# ⚙ Prerequisites

Install:

- Node.js 20+
- npm
- Python 3.13+
- Git
- Expo Go App
- PostgreSQL (optional)
- Supabase Account (optional)

---

# 📥 Installation

## Clone Repository

```bash
git clone https://github.com/AarohamTech/attendance.git

cd attendance
```

---

# 📱 Frontend Setup

Go to project

```bash
cd attendance-app
```

Install packages

```bash
npm install
```

Start Expo

```bash
npx expo start
```

Run Android

```bash
a
```

or scan QR using Expo Go.

---

# ⚙ Backend Setup

Go to backend

```bash
cd attendance-service
```

Create virtual environment

Windows

```bash
python -m venv venv
```

Activate

```bash
venv\Scripts\activate
```

Install packages

```bash
pip install -r requirements.txt
```

Run server

```bash
python -m uvicorn app.main:app --reload --port 8002
```

Swagger API

```
http://127.0.0.1:8002/docs
```

---

# 🌐 Environment Variables

Create `.env`

```
DATABASE_URL=

SUPABASE_URL=

SUPABASE_KEY=

JWT_SECRET=

JWT_EXPIRE_MINUTES=1440
```

---

# 📤 Reports

Generate

- CSV
- Excel
- PDF

Attendance reports can be exported directly from the backend.

---

# 📸 Screenshots

Add screenshots here.

```
docs/images/
```

Example

```
Login Screen

Dashboard

Attendance

Profile

Face Registration

Punch In

Punch Out
```

---

# 📌 Future Improvements

- FaceNet Integration
- TensorFlow Lite
- Push Notifications
- Admin Web Portal
- Offline Sync
- Biometric Device Support
- QR Attendance
- Analytics Dashboard
- Multi Company Support

---

# 📄 License

MIT License

---

# 👨‍💻 Author

**Prajwal Yadav**

Software Developer

AI / ML Enthusiast

GitHub:

https://github.com/AarohamTech

---

# ⭐ Support

If you like this project,

please ⭐ Star this repository.

---

# 🙌 Acknowledgements

- React Native
- Expo
- FastAPI
- SQLAlchemy
- Supabase
- PostgreSQL
- Open Source Community

---

## Project Status

✅ Active Development

```
Frontend        ✅
Backend         ✅
Authentication  ✅
Attendance      ✅
Dashboard       ✅
Reports         ✅
Profile         ✅
Notifications   ✅
Face Recognition ✅
```
