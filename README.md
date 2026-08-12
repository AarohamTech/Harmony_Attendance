# Harmony AI Attendance System

## Overview

**Harmony AI Attendance System** is an enterprise-grade biometric attendance and Human Resource Management System (HRMS) platform. It provides a complete workforce management ecosystem allowing employees to record face-verified attendance, manage personal profiles, view clocking histories, and submit leave or missed-punch adjustment requests. Concurrently, it empowers administrators, HR personnel, and team managers with a robust, role-authorized Admin Dashboard to oversee staff attendance, evaluate leave applications, configure department shifts, manage office geofences, broadcast notifications, and generate comprehensive HR reports.

The platform links an employee-facing cross-platform web/mobile app and an administrative Vite dashboard with a high-performance Express REST API backend backed by a Supabase PostgreSQL database.

---

## Main Applications

### Employee Application

The **Employee Web & Mobile Application** (`attendance-frontend`) is a cross-platform Expo React Native application designed for daily employee attendance and self-service HR functions. 

**Features**:
- **Employee Login**: Secure authentication via Employee Code or Email and PIN/Password with persistent session management.
- **Registration**: Guided self-service registration allowing new staff to sign up under their respective department and designation.
- **Forgot Password**: Password/PIN recovery flow for account access.
- **Employee Profile**: Profile management hub to inspect employee codes, shift schedules, assigned office premises, and update contact information.
- **Punch In**: Face-verified clock-in with live camera capture, facial embedding comparison, and geolocation tracking.
- **Punch Out**: Clock-out action with automated daily working hours calculation.
- **Attendance History**: Monthly calendar and list view displaying daily clocking records, punch-in/out timestamps, working hours, and status badges (`ON TIME`, `LATE`, `PRESENT`, `ABSENT`, `ON LEAVE`).
- **Location-Based Attendance**: Geolocation recording (latitude and longitude) during attendance events to verify office proximity.
- **Face Authentication / Registration**: Guided 128-dimensional biometric facial embedding generation and database registration.
- **Leave Requests**: Self-service submission of single-day or multi-day leave requests with reason tracking.
- **Missed Punch Requests**: Adjustment request workflow allowing employees to request time corrections for missed clocking events.
- **Notifications**: Real-time alert feed tracking punch confirmations and manager approval/rejection updates.
- **Attendance Status**: Instant visual feedback on daily clock-in status, late arrival warnings, and shift completion.

### Admin Dashboard

The **Admin Dashboard** (`attendance-admin`) is a dedicated administrative web portal built using React, Vite, and Tailwind CSS. It visualizes enterprise analytics and provides control over HR operations.

**Features**:
- **Admin Login**: Dedicated login gateway for management staff.
- **Admin Authentication**: Secure token-based authentication verified on every action.
- **Role-Based Access**: Role verification ensuring only authorized administrative roles (`Admin`, `HR`, `Manager`) can enter.
- **Dashboard Overview**: Live KPI statistics (Total Staff, Present Today, Absent Today, Late Employees, On Leave Today, Pending Requests, Active Punches), 7-day attendance trend charts, leave status summaries, and quick action shortcuts.
- **Employee Management**: Comprehensive directory listing all workforce members, account activation/deactivation toggles, role assignments, department filtering, and detailed employee attendance history views.
- **Attendance Management**: Master auditing view of daily attendance logs, punch times, calculated working hours, location details, late/early flags, date range filters, and CSV export.
- **Leave Request Management**: Centralized management portal to inspect pending leave applications, view employee reasons, and execute approvals or rejections with admin remarks.
- **Missed Punch Request Management**: Review and process missed punch correction requests, updating attendance logs in real-time.
- **Department Management**: Create, edit, and delete company departments, assign department managers, and track active staff counts.
- **Manager Management**: Oversee team leaders and managers, assign department supervisory roles, and audit direct report counts.
- **Holiday Management**: Configure company and national holiday schedules, date labels, and holiday types (`National`, `Public`, `Festival`, `Optional`).
- **Office Locations**: Set up geofenced office premises with street addresses, exact latitude/longitude coordinates, and allowed geofence radii.
- **Notifications**: Inspect system alerts and broadcast system-wide or employee-specific announcements.
- **Reports**: Generate and export attendance, leave, and monthly summary reports to CSV or printable document views.
- **Settings**: Manage global company configurations, default shift start/end times, grace period minutes, working days, weekly off settings, and leave policy limits.

Only authorized administrative roles (`Admin`, `HR`, `Manager`) can access the admin dashboard.

---

## Authentication & Authorization

The system enforces a role-based authorization model powered by JWT Bearer tokens and `bcrypt` password hashing.

### Authentication Flow

#### Employee Flow
```text
Employee User → Login Screen → Credentials Authenticated → Employee Role Verified → Access Granted to Employee Application
```

#### Admin / HR / Manager Flow
```text
Administrative User → Admin Login Screen → Credentials Authenticated → Role Verification (Admin, HR, or Manager) → Access Granted to Admin Dashboard
```

### Access Control Rules
- **Standard Employees**: Accounts with the `Employee` role are strictly prohibited from accessing administrative routes (`/admin/*`). Any unauthorized navigation attempts redirect to access-denied handling or the employee home screen.
- **Administrative Roles**: Access to the Admin Dashboard requires an active account with a role of `Admin`, `HR`, or `Manager`.
- **Session Handling**: Bearer JWT tokens are stored securely in local storage / client storage and validated on every API request via backend `authMiddleware`.
- **Login, Logout, Registration & Forgot Password**: Built-in authentication endpoints supporting secure login, session destruction on logout, public employee registration, and password recovery.

---

## Technology Stack

### Frontend
- **React**: Component-driven user interface library (`v19` for Employee Web App, `v18` for Admin Dashboard)
- **TypeScript & JavaScript**: Type-safe client development
- **HTML & CSS**: Core structural and custom styling
- **NativeWind & Tailwind CSS**: Utility-first responsive design
- **Vite**: Fast frontend build tool used for the Admin Dashboard (`attendance-admin`)

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Backend REST API server architecture (`attendance-backend`)
- **Python / FastAPI**: Python service script (`main.py`) providing biometric and API services

### Database
- **Supabase**: Cloud database infrastructure
- **PostgreSQL**: Relational database engine

### Mobile
- **React Native / Expo**: Cross-platform web and mobile application framework
- **Capacitor**: Native Android wrapper framework
- **Android APK**: Native release binary for mobile devices

### AI & Biometrics
- **Facial Feature Embedding**: 128-dimensional facial vector matching and cosine similarity calculation for biometric attendance authentication.

### Deployment
- **Vercel**: Web hosting for applications and backend REST API
- **Android APK**: Native release APK build

---

## Project Structure

```text
Harmony_Attendance/
├── attendance-admin/               # Vite + React + TypeScript Admin Dashboard Portal
│   ├── src/
│   │   ├── api/                    # API services (attendance, employee, department, holiday, manager, etc.)
│   │   ├── components/             # Reusable UI components (DataTable, Modal, StatCard, Header, Sidebar)
│   │   ├── context/                # AuthContext state provider
│   │   ├── layouts/                # AdminLayout template
│   │   ├── pages/                  # Admin Dashboard screens (Dashboard, Employees, Attendance, LeaveRequests, Departments, Managers, Holidays, Locations, Reports, Settings)
│   │   ├── types/                  # TypeScript interfaces
│   │   ├── utils/                  # Auth and formatting utilities
│   │   ├── App.tsx                 # Admin route configuration
│   │   ├── index.css               # CSS & Tailwind configuration
│   │   └── main.tsx                # Admin React entry point
│   ├── index.html                  # HTML entry template
│   ├── package.json                # Admin scripts and dependencies
│   ├── tailwind.config.js          # Tailwind design tokens
│   ├── vercel.json                 # Vercel SPA rewrite configuration
│   └── vite.config.ts              # Vite configuration
│
├── attendance-frontend/            # Expo + React Native Web Employee Application
│   ├── api/                        # Employee client API calls and storage
│   ├── assets/                     # Visual brand icons and graphics
│   ├── components/                 # Employee UI components (BottomTabBar)
│   ├── screens/                    # Employee screens (Login, EmployeeDashboard, AttendanceHistory, Requests, Profile, FaceCapture)
│   ├── theme/                      # Color palette definitions and ThemeContext
│   ├── App.tsx                     # Employee application entry & navigation
│   ├── app.json                    # Expo application metadata
│   ├── package.json                # Employee app dependencies
│   ├── vercel.json                 # Frontend Vercel deployment configuration
│   │
│   └── attendance-apk/             # Capacitor Android Native Project
│       ├── android/                # Native Android Studio project & Gradle configuration
│       ├── capacitor.config.json   # Capacitor configuration
│       └── package.json            # Capacitor CLI build scripts
│
├── attendance-backend/             # Node.js Express REST API Backend
│   ├── config/                     # Database connection configuration (`database.js`)
│   ├── controllers/                # Controller handlers (admin, auth, attendance, employee, manager, notification, etc.)
│   ├── database/                   # Schema SQL scripts & table setup (`schema.sql`, `setup_admin_tables.js`)
│   ├── middleware/                 # Auth JWT validation & error middleware
│   ├── routes/                     # Express API endpoint definitions (`adminRoutes.js`, `authRoutes.js`, etc.)
│   ├── services/                   # Attendance logic & face biometric services
│   ├── main.py                     # FastAPI Python service script
│   ├── server.js                   # Main Express server entry point
│   ├── vercel.json                 # Backend Vercel serverless deployment specification
│   └── package.json                # Backend dependencies and scripts
│
├── copy_dist.js                    # Web build asset copy script for Capacitor
├── run_backend.bat                 # Windows script to launch backend
├── run_frontend.bat                # Windows script to launch frontend
├── start-all.js                    # Unified single-command launcher
└── package.json                    # Root package configuration
```

---

## Web Application

The **Employee Web Application** is deployed on Vercel for instant browser-based clocking and HR access.

- **Production Web Application URL**: `https://harmony-attendance-frontend.vercel.app` (also available at `https://harmony-attendance.vercel.app`)
- **Local Web Development URL**: `http://localhost:8081`

---

## Admin Dashboard

The **Admin Dashboard** is the dedicated portal for HR managers and administrators to audit workforce attendance and manage organization settings.

- **Admin Portal URL**: Accessible on the web application via `/admin` routes (e.g., `/admin/login`, `/admin/dashboard`) or via local dev server.
- **Functionality**: Real-time attendance monitoring, employee directory management, leave & missed punch request processing, department setup, manager assignment, holiday management, geofence radius configuration, notification broadcasts, and analytics reporting.

---

## Backend

The **Harmony Backend API** provides RESTful endpoints handling authentication, database interactions, attendance calculations, and biometric verification.

- **Production Backend API URL**: `https://harmony-attendance-backend.vercel.app`
- **Node.js / Express Server (Local)**: `http://localhost:8000`
- **Python / FastAPI Server (Local)**: `http://localhost:8002`

### Health Check Endpoint
```http
GET /api/health
```

---

## Database

The project uses **Supabase PostgreSQL** for relational data storage.

### Confirmed Database Tables

- **`employees`**: Employee master records, employee codes, full names, emails, phone numbers, hashed passwords, departments, designations, roles, assigned office IDs, shift timings, weekly off days, and status.
- **`attendance`**: Daily attendance logs, punch-in/out timestamps, working hours, geolocation coordinates, location labels, attendance status (`Present`, `Late`, `Absent`, `On Leave`), and remarks.
- **`attendance_requests`**: Employee applications for leave and missed punch adjustments, request types, request dates, reasons, approval status (`Pending`, `Approved`, `Rejected`), and manager remarks.
- **`departments`**: Organization departments, descriptions, and assigned manager IDs.
- **`face_registrations`**: Stringified 128-dimensional facial biometric embeddings linked to employee IDs.
- **`holidays`**: Official holiday listing, dates, and holiday types (`National`, `Public`, `Festival`, `Optional`).
- **`login_sessions`**: Active authentication session logs, JWT tokens, device names, and login/logout timestamps.
- **`managers`**: Directory of assigned department managers.
- **`manager_actions`**: Audit log recording manager approval and rejection actions.
- **`notifications`**: Notification message logs with read state tracking (`is_read`).
- **`office_locations`**: Geofenced premises metadata including office names, street addresses, latitude/longitude coordinates, and allowed radius limits in meters.
- **`company_settings`**: Global HR configuration, company name, default shift timings, grace period minutes, weekly off settings, and annual leave allowances.

---

## Environment Variables

Configure environment variables in `.env` files using placeholder values:

```env
# Backend Environment Variables (attendance-backend/.env)
PORT=8000
DATABASE_URL=postgresql://your_db_user:your_db_password@your_db_host:5432/your_db_name
JWT_SECRET=your_jwt_secret_key

# Frontend Environment Variables (attendance-frontend/.env)
EXPO_PUBLIC_API_URL=your_backend_api_url

# Admin Dashboard Environment Variables (attendance-admin/.env)
VITE_API_BASE_URL=your_backend_api_url
```
