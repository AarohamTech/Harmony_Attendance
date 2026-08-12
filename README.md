# Harmony AI Attendance

### Secure Biometric

Harmony AI Attendance is an enterprise-ready biometric employee attendance and HR management system. Built with modern web and mobile technologies, the platform provides secure employee authentication, face-verified Punch In / Punch Out attendance tracking, profile management, leave and missed-punch request workflows, real-time notifications, manager approval portals, and cloud data persistence.

---

## 1. Project Overview

**Harmony AI Attendance** streamlines corporate workforce management by connecting employee web and mobile applications with a robust cloud API and PostgreSQL database.

### Core Architecture & Capabilities
- **Employee Authentication**: Secure authentication using employee codes or email addresses coupled with bcrypt-hashed passwords/PINs and JWT session tokens.
- **Biometric Punch Tracking**: Real-time facial biometric matching for Punch In and Punch Out actions to eliminate proxy clocking.
- **Attendance & Hour Computation**: Automated daily work duration tracking, late arrival detection, and location logging.
- **Leave & Request Workflows**: Self-service submission of leave applications and missed-punch adjustment requests.
- **Manager Approval Portal**: Administrative workflows for managers to inspect employee requests, approve or reject applications, and view staff attendance records.
- **Cloud Database Persistence**: Enterprise-grade data persistence powered by Supabase PostgreSQL.
- **REST Backend API**: Node.js and Express backend service deployed on Vercel for high reliability and scaling.
- **Multi-Platform Access**: Cross-platform support for web browsers and native Android devices via Expo Web and Capacitor Android compilation.

---

## 2. Key Features

### Employee Features
- **Login & Authentication**: Secure login via Employee Code or Email and Password/PIN with JWT session persistence.
- **Employee Registration**: Guided self-service registration supporting department, designation, and shift setup.
- **Biometric Punch In**: Face-verified clock-in with live camera capture, cosine similarity facial comparison, and location coordinate logging.
- **Biometric Punch Out**: Biometric clock-out with automatic daily working hours computation.
- **Attendance History & Calendar**: Filterable attendance logs with status indicators (`ON TIME`, `LATE`, `PRESENT`) and monthly calendar lookup.
- **Profile Hub**: View and update profile information, contact numbers, email addresses, designations, and avatar images.
- **Leave & Missed-Punch Management**: Create and submit leave requests or missed-punch correction applications with reason details.
- **Notifications Hub**: System alerts for punch confirmations, request status updates (Approved/Rejected), and unread badge tracking.
- **Location-Based Attendance**: Geolocation recording (latitude and longitude) during attendance events.
- **Biometric Face Registration**: Guided 128-dimensional biometric facial embedding generation and database registration.

### Admin & Manager Features
- **Employee Directory Management**: Overview of registered employees, codes, designations, departments, and active statuses.
- **Attendance Monitoring**: Real-time attendance log auditing across teams and CSV report export capability.
- **Leave & Request Approval**: Centralized manager workflow to review, approve, or reject employee leave and missed-punch submissions.
- **Manager Dashboard**: Overview of workforce attendance metrics, team statistics, and pending action items.
- **Employee Records**: Comprehensive employee profiles including shift timing schedules and assigned office locations.

---

## 3. System Architecture

```text
Employee / Admin
      ↓
Web Application / Android APK
      ↓
Node.js + Express REST API
      ↓
Supabase PostgreSQL
      ↓
Authentication / Attendance / Employee / HRMS Data
```

### Technology Breakdown
- **Client Layer**: Expo Web application for desktop/mobile browsers and Capacitor Android APK for mobile devices.
- **Backend API Layer**: Express.js REST API providing secure routing, authentication middleware, and attendance logic.
- **Database Layer**: Supabase PostgreSQL cloud database managing relational tables, indexes, and constraints.

---

## 4. Technology Stack

| Category | Technology | Version / Tool | Application Purpose |
|---|---|---|---|
| **Frontend Web** | React | `19.2.3` | User interface component library |
| **Cross-Platform Engine** | React Native / React Native Web | `0.86.2` / `0.21.2` | Web and mobile cross-platform framework |
| **App Framework** | Expo | `~57.0.10` | Web application bundler & development platform |
| **Styling** | NativeWind / CSS | `^4.2.6` | Utility-first responsive design framework |
| **Navigation** | React Navigation (Stack) | `^7.10.18` | Application navigation and screen transitions |
| **Language** | TypeScript | `~6.0.3` | Type-safe client codebase |
| **Mobile Container** | Capacitor (Android) | `^6.2.0` | Native Android wrapper framework |
| **Native Plugins** | `@capacitor/camera`, `@capacitor/preferences` | `^6.1.0` / `^6.0.0` | Device hardware camera access & secure preference storage |
| **Backend REST API** | Node.js / Express.js | `^4.19.2` | Production API server architecture |
| **Authentication** | JWT (`jsonwebtoken`), `bcrypt` | `^9.0.2` / `^5.1.1` | Bearer token security and password hashing |
| **Database** | PostgreSQL (Supabase) | `pg ^8.12.0` | Cloud database connection and queries |
| **Deployment** | Vercel | Cloud Platform | Production hosting for backend REST API |
| **Build Tools** | Gradle / npm | Android CLI / Node | Native APK assembly and dependency management |

---

## 5. Project Structure

```text
AarohamTech/Harmony_Attendance/
├── attendance-backend/             # Node.js Express REST API Backend
│   ├── api/                        # API routes and handlers
│   ├── config/                     # Database connection pool setup (database.js)
│   ├── controllers/                # Request handlers (auth, attendance, employee, face, manager, request, notification)
│   ├── database/                   # Database scripts & schema definitions (schema.sql, init_db.js)
│   ├── middleware/                 # Auth JWT validation & global error middleware
│   ├── routes/                     # Express router endpoints
│   ├── services/                   # Face biometric logic & service functions
│   ├── server.js                   # Main Express server entry point
│   ├── vercel.json                 # Vercel backend deployment configuration
│   └── package.json                # Backend dependencies and scripts
│
├── attendance-frontend/            # Expo & React Native Web Frontend Application
│   ├── api/                        # API client, HTTP handlers & local storage management
│   ├── assets/                     # Visual brand assets, icons, and splash screens
│   ├── components/                 # Reusable UI components
│   ├── screens/                    # Application screen views (Login, Dashboard, Attendance, Requests, Profile, FaceCapture)
│   ├── theme/                      # Visual design system tokens & ThemeContext
│   ├── App.tsx                     # Main application entry point & stack navigation configuration
│   ├── app.json                    # Expo application metadata and settings
│   ├── metro.config.js             # Metro web bundler configuration
│   ├── vercel.json                 # Frontend Vercel deployment configuration
│   ├── package.json                # Frontend dependencies and npm scripts
│   │
│   └── attendance-apk/             # Capacitor Android Native Project
│       ├── android/                # Native Android Studio codebase & Gradle configuration
│       ├── public/ & dist/         # Web build assets synced for offline Android execution
│       ├── capacitor.config.json   # Capacitor Android runtime config
│       └── package.json            # Capacitor CLI scripts (`build:apk:release`, `cap:sync`)
│
├── copy_dist.js                    # Web asset sync utility for Capacitor builds
├── run_backend.bat                 # Windows launcher script for backend
├── run_frontend.bat                # Windows launcher script for frontend
├── start-all.js                    # Unified single-command application launcher
└── package.json                    # Root package configuration
```

---

## 6. Backend API

### Production Backend API Base URL
```text
https://harmony-attendance-backend.vercel.app
```

### Health Check Endpoint
```http
GET /api/health
```
**Response Sample**:
```json
{
  "success": true,
  "message": "Harmony Attendance API is running",
  "timestamp": "2026-08-12T14:00:00.000Z"
}
```

### Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new employee account | No |
| `POST` | `/api/auth/login` | Authenticate employee & return JWT token | No |
| `POST` | `/api/auth/logout` | Invalidate current user session | Yes |
| `GET` | `/api/auth/me` | Fetch authenticated user information | Yes |
| `POST` | `/api/punch` | Unified biometric Punch In / Punch Out | Yes |
| `POST` | `/api/attendance/punch-in` | Biometric Punch In clocking | Yes |
| `POST` | `/api/attendance/punch-out` | Biometric Punch Out clocking | Yes |
| `GET` | `/api/attendance/today` | Fetch current day's attendance record | Yes |
| `GET` | `/api/attendance/history` | Retrieve complete attendance history | Yes |
| `GET` | `/api/attendance/calendar` | Retrieve monthly attendance calendar view | Yes |
| `GET` | `/api/attendance/date/:date` | Fetch attendance details for specific date | Yes |
| `GET` | `/api/employees/profile` | Retrieve employee profile details | Yes |
| `PUT` | `/api/employees/profile` | Update employee profile information | Yes |
| `GET` | `/api/employees` | List all registered employees | Yes |
| `POST` | `/api/face/register` | Save 128D biometric face vector | Yes |
| `POST` | `/api/face/verify` | Verify camera frame against stored face embedding | Yes |
| `GET` | `/api/face` | Check employee biometric registration status | Yes |
| `GET` | `/api/requests` | List leave and missed-punch requests | Yes |
| `POST` | `/api/requests` | Submit new leave or missed-punch request | Yes |
| `GET` | `/api/manager/requests` | Retrieve pending employee requests | Yes (Manager) |
| `POST` | `/api/manager/requests/:id/action` | Approve or reject employee request | Yes (Manager) |
| `GET` | `/api/notifications` | Fetch employee notifications | Yes |
| `PATCH` | `/api/notifications/:id/read` | Mark individual notification as read | Yes |
| `PUT` | `/api/notifications/read-all` | Mark all notifications as read | Yes |
| `GET` | `/api/dashboard` | Retrieve summary metrics & status overview | Yes |
| `GET` | `/api/dashboard/charts` | Retrieve weekly attendance chart data | Yes |
| `GET` | `/api/reports/export` | Export attendance report (CSV format) | Yes |

---

## 7. Database Architecture

Production system data is hosted on **Supabase PostgreSQL**.

### Primary Tables (`attendance-backend/database/schema.sql`)

- **`employees`**: Stores core employee master data including `employee_code`, `full_name`, `email`, hashed `password`, `department`, `designation`, `shift_start`, `shift_end`, and account `status`.
- **`attendance`**: Records daily clocking events, `attendance_date`, `punch_in`, `punch_out`, calculated `working_hours`, `latitude`, `longitude`, `location_name`, and `attendance_status`.
- **`attendance_requests`**: Stores employee applications for leave and missed-punch adjustments alongside approval `status` and `manager_remark`.
- **`face_registrations`**: Stores stringified 128-dimensional biometric embeddings (`embedding`) linked to `employee_id`.
- **`office_locations`**: Geo-fencing metadata containing office latitude, longitude, and allowed radius.
- **`notifications`**: User alert system logs with read state tracking (`is_read`).
- **`managers` & `manager_actions`**: Manager directory and detailed audit log of request approvals/rejections.
- **`login_sessions`**: Active JWT authentication token tracking and session timestamps.
- **`holidays`**: Official company and national holiday listings.

> **Security Note**: Never commit actual database passwords, connection URIs, or secret tokens into public repositories.

---

## 8. Environment Variables

Configure local development environment variables in `.env` files.

### Backend Setup (`attendance-backend/.env`)
```env
# Express Server Configuration
PORT=8000

# Supabase PostgreSQL Connection String (Template Only)
DATABASE_URL=postgresql://your_db_user:your_db_password@your_db_host:5432/your_db_name

# JWT Token Secret Key (Template Only)
JWT_SECRET=your_jwt_secret_key_here
```

### Frontend / Mobile Setup (`attendance-frontend/.env`)
```env
# Base API URL for Client Application
EXPO_PUBLIC_API_URL=https://harmony-attendance-backend.vercel.app
```

### Critical Security Guidelines
- Never commit `.env` files to git version control.
- Never hardcode production database passwords or JWT secret keys.
- Production secrets must be configured directly within Vercel platform environment settings.

---

## 9. Local Development

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher

### Option 1: Unified Application Launcher (Recommended)
Run both backend and frontend applications concurrently from the root directory:

```bash
# Install root dependencies
npm install

# Start both Express Backend (Port 8000) and Expo Web (Port 8081)
npm start
```

### Option 2: Individual Service Launch

#### 1. Express Backend Service
```bash
cd attendance-backend
npm install
npm start
```
- Server URL: `http://localhost:8000`
- Health Endpoint: `http://localhost:8000/api/health`

#### 2. Expo Web Frontend Service
```bash
cd attendance-frontend
npm install
npm run dev
```
- Web Application URL: `http://localhost:8081`

#### 3. Android APK Project
```bash
cd attendance-frontend/attendance-apk
npm install
```

---

## 10. Production Android APK

The release version of the Android mobile application is generated using Gradle.

### Release APK Build Commands

```bash
# Navigate to native Android folder
cd attendance-frontend/attendance-apk/android

# Clean previous build artifacts
.\gradlew clean

# Compile release APK
.\gradlew assembleRelease
```

### Generated APK Output Path
```text
attendance-frontend/attendance-apk/android/app/build/outputs/apk/release/app-release.apk
```

### APK Production Endpoint Configuration
The release APK is compiled to communicate with the production API:
```text
https://harmony-attendance-backend.vercel.app
```
> **Important**: Production release builds must **never** reference `localhost` or local IP addresses.

---

## 11. Production Deployment

| Component | Platform | URL / Artifact |
|---|---|---|
| **Backend REST API** | Vercel Cloud | `https://harmony-attendance-backend.vercel.app` |
| **Database** | Supabase Cloud PostgreSQL | Managed Cloud Instance |
| **Android Application** | Native Android | `app-release.apk` |

### Environment URL Comparison
- **Local Development API**: `http://localhost:8000`
- **Local Frontend Web**: `http://localhost:8081`
- **Production Backend API**: `https://harmony-attendance-backend.vercel.app`

---

## 12. Security Architecture

- **JWT Authentication**: Secured route protection using Bearer JWT headers validated by custom Express middleware (`authMiddleware.js`).
- **Password Protection**: User passwords and security PINs hashed using `bcrypt` salting algorithm prior to database storage.
- **SQL Injection Prevention**: Database interactions executed using parameterized PostgreSQL queries (`$1`, `$2`).
- **CORS Protection**: REST API origins restricted to authorized web domains and mobile applications.
- **HTTPS Encryption**: All client-server communications over public networks enforced via HTTPS.
- **Credential Hygiene**: Sensitive parameters kept out of source code and stored exclusively in environment variables.

---

## 13. Production Checklist

- [ ] Production API configured (`https://harmony-attendance-backend.vercel.app`)
- [ ] Supabase database connected
- [ ] Environment variables configured
- [ ] JWT secret configured
- [ ] CORS configured
- [ ] Login tested
- [ ] Registration tested
- [ ] Punch In tested
- [ ] Punch Out tested
- [ ] Attendance tested
- [ ] Admin features tested
- [ ] Android release APK generated
- [ ] APK tested on physical Android device
- [ ] No localhost API URL in production build
- [ ] No .env or secrets committed to GitHub

---

## 14. GitHub Repository

This repository contains the complete full-stack codebase for **Harmony AI Attendance**, comprising:
- **`attendance-frontend/`**: Expo and React Native Web application supporting browser and mobile execution.
- **`attendance-backend/`**: Express REST API backend powering authentication, biometric matching, and HR metrics.
- **`attendance-frontend/attendance-apk/`**: Native Capacitor Android build environment for assembling Android APK binaries.
- **Database & Cloud Integration**: Supabase PostgreSQL connection layer and Vercel serverless deployment specifications.

---

## 15. Screenshots

Screen captures depicting key workflows are located in the repository under:
`attendance-frontend/existing-web-app/UI/`

Key visual documentation includes:
- **Login View**: `attendance-frontend/existing-web-app/UI/login/screen.png`
- **Employee Dashboard**: `attendance-frontend/existing-web-app/UI/employee_dashboard/screen.png`
- **Biometric Face Capture**: `attendance-frontend/existing-web-app/UI/punch_in_face_scan/screen.png`
- **Attendance History**: `attendance-frontend/existing-web-app/UI/attendance_history/screen.png`
- **Leave & Requests Portal**: `attendance-frontend/existing-web-app/UI/attendance_requests/screen.png`
- **Employee Profile Hub**: `attendance-frontend/existing-web-app/UI/employee_profile/screen.png`

---

## 16. Future Enhancements

The following capabilities are identified for future release iterations:
- **Advanced Anti-Spoofing & Liveness Detection**: Implementation of blink detection and depth verification.
- **Payroll System Integration**: Automated attendance data mapping into payroll processing software.
- **Advanced HR Analytics**: Graphical attendance heatmaps and automated executive report generation.
- **Firebase Push Notifications (FCM)**: Native push alerts for request approvals and shift reminders.
- **Enhanced Audit Logs**: System-wide access logs for compliance auditing.
- **Granular Role-Based Access Control (RBAC)**: Custom permission levels for enterprise HR departments.

---

## 17. License

License: Not specified.
