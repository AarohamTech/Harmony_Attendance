# Harmony AI Attendance System

A production-grade, real-time employee attendance management system featuring biometric face recognition, attendance tracking, Punch In / Punch Out verification, interactive calendar-based attendance history, employee leave & correction requests, real-time notifications, report exports (CSV/Excel/PDF), and cross-platform Web and Native Android application support.

---

## 1. PROJECT OVERVIEW

The **Harmony AI Attendance System** is an enterprise-ready attendance solution designed for organizations requiring secure, accurate, and automated employee attendance tracking.

### Primary Purpose
- Eliminate proxy attendance through biometric facial verification.
- Provide seamless, real-time Punch In and Punch Out workflows for both Web and Mobile devices.
- Offer an interactive attendance calendar where employees can review historical attendance, working hours, and late/early exit statuses.
- Streamline employee leave requests and manager approval workflows.
- Provide exportable attendance logs in CSV, Excel (`.xlsx`), and PDF formats.

### System Architecture Overview
The application is built on a decoupled architecture featuring:
1. **Web Application**: React 19 / React Native Web application built with Expo, supporting responsive layouts across desktop, tablet, and mobile browsers.
2. **Android Application**: Native Android APK built using Capacitor 6, exposing native camera hardware and biometric scanning interfaces.
3. **Backend API**: Dual REST API server architecture (Node.js Express primary server on port `8000` & Python FastAPI server on port `8002`) providing JWT authentication, business logic, and face embedding processing.
4. **Database Layer**: Production Supabase PostgreSQL database holding all employee profiles, face embeddings, attendance logs, requests, and notifications.

---

## 2. KEY FEATURES

- **One-Time Employee Registration**: Self-registration flow with badge ID, email, phone, department, designation, and encrypted PIN/password.
- **Secure JWT Authentication**: Token-based authentication with automatic session persistence across web browsers and Android devices.
- **Biometric Face Registration**: Capture live face frames to generate 128-dimensional L2-normalized feature vectors saved directly to PostgreSQL.
- **Real-Time Biometric Face Verification**: Punch In and Punch Out enforce real camera capture and backend cosine similarity verification against stored employee embeddings.
- **Biometric Punch In**: Face-verified clocking-in with late status tracking (`ON TIME`, `LATE`).
- **Biometric Punch Out**: Face-verified clocking-out with automated total working hours calculation (`HHh MMm`).
- **Interactive Attendance Calendar**: Navigate months, select specific dates, and view exact punch times, working hours, location details, and remarks.
- **Attendance Requests & Manager Workflow**: Submit leave requests, missed punch corrections, or early exit reasons, with manager approve/reject tracking.
- **Real-Time Notifications**: Automated system alerts for request approvals, late attendance warnings, and clock-out reminders.
- **Multi-Format Report Exporting**: Download attendance logs in CSV, Excel (`.xlsx`), or PDF formats.
- **Native Android APK**: Built with Capacitor, granting camera access and cleartext network security for local network and production servers.
- **AI Assistant**: *Not implemented* (Roadmap enhancement).

---

## 3. APPLICATION WORKFLOW

### Employee Onboarding & Registration Flow

```mermaid
flowchart TD
    A[Employee] --> B[Open Registration]
    B --> C[Submit Details Name, Email, Badge ID, PIN]
    C --> D[Account Created in PostgreSQL]
    D --> E[Open Face Registration]
    E --> F[Capture Camera Frame]
    F --> G[Extract 128D Embedding Vector]
    G --> H[Save Embedding to face_registrations Table]
    H --> I[Redirect to Login]
```

### Biometric Punch In Flow

```mermaid
flowchart TD
    A[Employee Dashboard] --> B[Click Biometric Punch In]
    B --> C[Camera Preview Opens]
    C --> D[Capture Live Face Frame]
    D --> E[Send Image Payload to Backend /api/punch]
    E --> F[Compute Cosine Similarity vs Stored Embeddings]
    F -->|Match Confidence >= 60%| G[Verify Active Punch Record]
    F -->|Match Failed| H[Display Verification Failed Error]
    G --> I[Create attendance Log Entry]
    I --> J[Return Success & Refresh Dashboard]
```

### Biometric Punch Out Flow

```mermaid
flowchart TD
    A[Employee Dashboard] --> B[Click Biometric Punch Out]
    B --> C[Camera Preview Opens]
    C --> D[Capture Live Face Frame]
    D --> E[Send Payload to Backend /api/attendance/punch-out]
    E --> F[Backend Face Verification]
    F -->|Verified| G[Locate Open Punch In Record]
    G --> H[Calculate Working Hours: Punch Out - Punch In]
    H --> I[Update DB record: Punch Out Time & Working Hours]
    I --> J[Update Dashboard KPIs]
```

### Attendance Calendar & History Flow

```mermaid
flowchart TD
    A[Navigation Bar] --> B[Open Attendance History]
    B --> C[Fetch Monthly Calendar API /api/attendance/calendar]
    C --> D[Render Interactive Day Grid]
    D --> E[Select Specific Date e.g. 2026-08-10]
    E --> F[Query Date API /api/attendance/date/2026-08-10]
    F --> G[Display Detailed Card: Punch Times, Hours, Status]
```

---

## 4. SYSTEM ARCHITECTURE

```
+------------------------------------+        +------------------------------------+
|          React Web Application     |        |      Capacitor Android Application |
|  (Expo React Native Web - Port 8081)|        |       (Package: com.harmony.aiatt) |
+------------------------------------+        +------------------------------------+
                   |                                           |
                   +-------------------+   +-------------------+
                                       |   |
                                       v   v
                      +----------------------------------+
                      |         Backend REST API         |
                      |   (Node.js Express - Port 8000 / |
                      |    Python FastAPI - Port 8002)   |
                      +----------------------------------+
                                       |
                                       v
                      +----------------------------------+
                      |     PostgreSQL Database          |
                      |   (Hosted on Supabase Cloud)     |
                      +----------------------------------+
```

### Layer Responsibilities

- **Frontend (Web & Mobile UI)**: Manages UI rendering, navigation state, local session storage (`AsyncStorage` / `SecureStore`), and camera feed capture.
- **Backend API**: Handles authentication, password hashing (`bcrypt`), JWT token validation, 128D face feature extraction, cosine similarity matrix comparison, working hours computation, and business logic execution.
- **Database (Supabase PostgreSQL)**: Holds persistent tables for employees, face embeddings, attendance records, leave requests, and notifications.
- **Android Runtime (Capacitor)**: Packages the compiled web application into a native Android wrapper, exposing camera permissions and cleartext network configuration.

---

## 5. TECHNOLOGY STACK

| Layer | Technology |
|---|---|
| **Web Frontend** | React 19.2.3, React Native Web 0.21.2, Expo 57.0.10, NativeWind, React Navigation 7.x |
| **Mobile Runtime** | Capacitor 6.2.0 (`@capacitor/android`, `@capacitor/camera`, `@capacitor/preferences`) |
| **Backend Primary** | Node.js Express 4.19 (`server.js` on Port 8000) |
| **Backend Secondary** | Python 3.13 FastAPI 0.100+ (`main.py` on Port 8002) |
| **Database** | PostgreSQL on Supabase (`db.hgtwhgnschadrwhtimne.supabase.co`) & SQLite fallback |
| **Authentication** | JSON Web Tokens (`jsonwebtoken` / `pyjwt`), `bcrypt` PIN hashing |
| **Face Recognition Engine** | Multi-channel histogram & spatial frequency moment grids (128D vectors), Cosine Similarity |
| **Document Exporting** | CSV, Excel (`openpyxl` / custom builder), PDF (`reportlab`) |
| **Build Tools** | Expo Web Metro Bundler, Gradle 8.x (`gradlew.bat`), Capacitor CLI |

---

## 6. PROJECT STRUCTURE

```
F:\Attendence\
├── attendance-app/                # Main Web & Expo Frontend Project
│   ├── api/
│   │   ├── client.ts              # Production API Client & Storage Logic
│   │   └── mock-data.ts           # Re-exports only (Purged of mock arrays)
│   ├── components/
│   │   └── BottomTabBar.tsx       # Bottom Navigation Bar Component
│   ├── screens/
│   │   ├── AttendanceDetailsScreen.tsx
│   │   ├── AttendanceHistoryScreen.tsx
│   │   ├── AttendanceRequestsScreen.tsx
│   │   ├── CreateEmployeeAccountScreen.tsx
│   │   ├── EditProfileScreen.tsx
│   │   ├── EmployeeDashboardScreen.tsx
│   │   ├── EmployeeProfileScreen.tsx
│   │   ├── FaceCaptureScreen.tsx
│   │   ├── ForgotPasswordScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── NewRequestScreen.tsx
│   │   └── NotificationsScreen.tsx
│   ├── theme/
│   │   └── ThemeContext.tsx       # Application Light/Dark Color Token Context
│   ├── App.tsx                    # React Navigation Stack Container
│   ├── package.json               # Expo Dependencies & Scripts
│   └── run_frontend.bat           # Frontend Launcher Batch Script
│
├── attendance-apk/                # Standalone Android Application Folder
│   ├── android/                   # Native Android Studio Project
│   │   └── app/build/outputs/apk/
│   │       ├── debug/app-debug.apk
│   │       └── release/app-release.apk
│   ├── releases/                  # Copy Directory for Generated APKs
│   │   ├── harmony-attendance-debug.apk
│   │   └── harmony-attendance-release.apk
│   ├── src/
│   │   └── config/
│   │       └── api.ts             # Dynamic Host IP Resolution for Android
│   ├── public/                    # HTML Index Template
│   ├── capacitor.config.js        # Capacitor Configuration File
│   ├── capacitor.config.json      # Capacitor JSON Config
│   └── package.json               # Android Packaging Dependencies
│
├── backend/                       # Production Backend Service
│   ├── app/
│   │   ├── database.py            # SQLAlchemy PostgreSQL/SQLite Connection
│   │   ├── face_engine.py         # 128D Face Feature Extraction Engine
│   │   └── reports.py             # CSV / Excel / PDF Report Generator
│   ├── config/
│   │   └── database.js            # Node.js pg Pool Connection for Supabase
│   ├── controllers/
│   │   ├── attendanceController.js
│   │   ├── authController.js
│   │   ├── employeeController.js
│   │   ├── faceController.js
│   │   ├── managerController.js
│   │   ├── notificationController.js
│   │   └── requestController.js
│   ├── routes/                    # Express Router Endpoints
│   ├── main.py                    # FastAPI Entry Script (Port 8002)
│   ├── server.js                  # Express Entry Script (Port 8000)
│   ├── package.json
│   ├── requirements.txt
│   └── test_all_endpoints.js      # Automated Verification Test Suite
│
├── copy_dist.js                   # Build Asset Copy Utility
├── run_backend.bat                # Backend Launcher Batch Script
├── run_frontend.bat               # Frontend Launcher Batch Script
└── README.md                      # Complete System Documentation
```

---

## 7. DATABASE

The application connects to a Supabase PostgreSQL database (`db.hgtwhgnschadrwhtimne.supabase.co`).

### Entity Relationship Diagram

```
+------------------+         +-----------------------+
|    employees     | 1     * |   face_registrations  |
|------------------|<--------|-----------------------|
| employee_id (PK) |         | face_id (PK)          |
| employee_code    |         | employee_id (FK)      |
| full_name        |         | embedding (TEXT)      |
| email            |         +-----------------------+
| password         |
| department       |         +-----------------------+
| designation      | 1     * |      attendance       |
| profile_photo    |---------|-----------------------|
| shift_start      |         | attendance_id (PK)    |
| shift_end        |         | employee_id (FK)      |
+------------------+         | attendance_date       |
   |                         | punch_in / punch_out  |
   |                         | working_hours         |
   | 1                       | attendance_status     |
   |                         +-----------------------+
   | *                       
   +----------------+        +-----------------------+
   |  notifications |        |  attendance_requests  |
   |----------------|        |-----------------------|
   | notification_id|        | request_id (PK)       |
   | employee_id(FK)|        | employee_id (FK)      |
   | title, message |        | request_type, status  |
   +----------------+        +-----------------------+
```

### Table Definitions
- **`employees`**: Stores core profile data, credential hashes, office shifts, and role information.
- **`face_registrations`**: Stores 128-dimensional JSON stringified face feature vectors associated with employees.
- **`attendance`**: Log table storing daily punch in/out timestamps, calculated working hours, status (`ON TIME`, `LATE`, `ABSENT`), location, and remarks.
- **`attendance_requests`**: Stores leave requests, missed punch corrections, and early exit reasons submitted by employees.
- **`notifications`**: Stores system alerts, request status notifications, and attendance reminders.

---

## 8. ENVIRONMENT VARIABLES

Ensure the environment files contain valid production configurations:

### `backend/.env`
```env
# PostgreSQL Database Connection URL (Supabase)
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE

# Authentication Secret Key
JWT_SECRET=your_super_secret_jwt_key_here

# Backend Service Port
PORT=8000
```

### `attendance-app/.env` (Optional)
```env
# Configurable API Base URL for Web Application
EXPO_PUBLIC_API_URL=http://localhost:8000
VITE_API_BASE_URL=http://localhost:8000
```

---

## 9. INSTALLATION

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: v3.10 or higher
- **Java Development Kit (JDK)**: JDK 17 or higher
- **Android Studio / Android SDK**: API Level 33+ (For Android builds)

### 1. Backend Setup
```bash
cd backend
npm install
pip install -r requirements.txt
```

### 2. Web Application Setup
```bash
cd attendance-app
npm install
```

### 3. Android Application Setup
```bash
cd attendance-apk
npm install
```

---

## 10. RUNNING THE BACKEND

### Option A: Express Backend (Primary - Port 8000)
```bash
cd backend
node server.js
```
Or execute the Windows launcher:
```cmd
run_backend.bat
```
- **Port**: `8000`
- **Health Check**: `http://localhost:8000/api/health`

### Option B: FastAPI Backend (Secondary - Port 8002)
```bash
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8002 --reload
```
- **Swagger Documentation**: `http://localhost:8002/docs`

---

## 11. RUNNING THE WEB APPLICATION

```bash
cd attendance-app
npx expo start --port 8081 --web
```
Or execute the Windows launcher:
```cmd
run_frontend.bat
```
- **Local URL**: `http://localhost:8081`

---

## 12. RUNNING ANDROID

To test the Android application on an attached physical Android device or emulator:

1. Configure host machine IP in `attendance-apk/src/config/api.ts` (e.g. `http://172.20.10.3:8000`).
2. Sync compiled assets to Android native wrapper:
   ```bash
   cd attendance-app
   npx expo export --platform web
   node ../copy_dist.js
   cd ../attendance-apk
   npx cap sync android
   ```
3. Launch in Android Studio:
   ```bash
   npx cap open android
   ```

---

## 13. APK BUILD

### 1. Debug APK Build
```bash
cd attendance-apk/android
.\gradlew.bat assembleDebug
```
- **Generated Debug APK Path**:
  `attendance-apk/android/app/build/outputs/apk/debug/app-debug.apk`

### 2. Release APK Build
```bash
cd attendance-apk/android
.\gradlew.bat assembleRelease
```
- **Generated Release APK Path**:
  `attendance-apk/android/app/build/outputs/apk/release/app-release.apk`

### 3. Release Directory Copies
Copies of the built APKs are stored in:
- `attendance-apk/releases/harmony-attendance-debug.apk` (Size: `9.9 MB`)
- `attendance-apk/releases/harmony-attendance-release.apk` (Size: `8.3 MB`)

---

## 14. API DOCUMENTATION

| Method | Endpoint | Purpose | Authentication |
|---|---|---|---|
| `GET` | `/api/health` | Backend & Database connection health check | Public |
| `POST` | `/api/auth/register` | Register a new employee account | Public |
| `POST` | `/api/auth/login` | Authenticate employee with PIN/email & password | Public |
| `POST` | `/api/auth/logout` | Invalidate employee session | Bearer Token |
| `GET` | `/api/auth/me` | Fetch authenticated user context | Bearer Token |
| `GET` | `/api/employees/profile` | Retrieve employee profile data | Bearer Token |
| `PUT` | `/api/employees/profile` | Update profile information | Bearer Token |
| `GET` | `/api/employees` | List active employees (paginated) | Bearer Token |
| `POST` | `/api/face/register` | Register 128D biometric face embedding | Bearer Token |
| `POST` | `/api/face/verify` | Verify real-time face frame against DB | Bearer Token |
| `POST` | `/api/punch` | Perform biometric Punch In or Punch Out | Bearer Token |
| `POST` | `/api/attendance/punch-in` | Execute Punch In with face verification | Bearer Token |
| `POST` | `/api/attendance/punch-out` | Execute Punch Out with face verification | Bearer Token |
| `GET` | `/api/dashboard` | Fetch KPI stats and today's attendance | Bearer Token |
| `GET` | `/api/dashboard/charts` | Fetch weekly trend analytics & stats | Bearer Token |
| `GET` | `/api/attendance/history` | Retrieve historical attendance records | Bearer Token |
| `GET` | `/api/attendance/calendar` | Retrieve monthly attendance grid | Bearer Token |
| `GET` | `/api/attendance/date/:dateStr` | Retrieve attendance record for date | Bearer Token |
| `GET` | `/api/requests` | List leave & correction requests | Bearer Token |
| `POST` | `/api/requests` | Submit new attendance request | Bearer Token |
| `PUT` | `/api/manager/requests/:id/action` | Approve or reject request | Bearer Token |
| `GET` | `/api/notifications` | Fetch employee notifications | Bearer Token |
| `PUT` | `/api/notifications/read-all` | Mark all notifications as read | Bearer Token |
| `GET` | `/api/reports/export` | Download CSV, XLSX, or PDF report | Bearer Token |

---

## 15. AUTHENTICATION

1. **Registration**: Employee enters name, badge ID, email, phone, department, designation, and PIN.
2. **Login**: Credentials verified against `employees` table using `bcrypt` PIN hash comparison.
3. **JWT Issue**: Server responds with signed JWT token stored securely in `AsyncStorage` (Web) or `SecureStore` (Android).
4. **Session Auto-Validation**: On app startup, `validateSession()` queries `/api/auth/me`. If valid, the user automatically enters `EmployeeDashboard`.
5. **Protected APIs**: HTTP requests include `Authorization: Bearer <token>` header.

---

## 16. FACE RECOGNITION

1. **Feature Extraction Engine (`app/face_engine.py`)**:
   - Resizes captured frame to standard `64x64`.
   - Computes multi-channel RGB histograms (96 features).
   - Computes spatial grid sub-region means and standard deviations (32 features).
   - Constructs a normalized 128-dimensional floating-point vector.
2. **Face Registration**:
   - Base64 image captured via live webcam or Android camera.
   - Vector stored as JSON in `face_registrations` table.
3. **Face Verification**:
   - Captured frame vector compared against employee's registered vector using **Cosine Similarity**:
     $$\text{Similarity} = \frac{\mathbf{A} \cdot \mathbf{B}}{\|\mathbf{A}\| \|\mathbf{B}\|}$$
   - Match threshold set to $\ge 60\%$ confidence.

---

## 17. ATTENDANCE LOGIC

- **Punch In Rules**:
  - Requires real camera capture & face embedding match.
  - Punch In time recorded as server ISO timestamp.
  - If Punch In occurs after shift grace time (`09:15 AM`), status marked as `LATE`.
  - Duplicate Punch In on the same calendar day is rejected by backend.
- **Punch Out Rules**:
  - Requires face verification.
  - Matches today's active Punch In record.
  - Total working hours calculated automatically: $\text{Punch Out} - \text{Punch In}$.
- **Everyday Punch Support**: Punch In and Punch Out operate on every calendar day without hardcoded weekday blocks.

---

## 18. ATTENDANCE CALENDAR

- **Monthly Grid**: Queries `/api/attendance/calendar?month=X&year=Y`.
- **Date Lookup**: Tapping any calendar day (e.g. `2026-08-10`) fetches real DB records via `/api/attendance/date/2026-08-10`.
- **Display Details**: Date, day label, Punch In time, Punch Out time, total working hours, status (`ON TIME`, `LATE`, `ABSENT`), location, and remarks.

---

## 19. REQUEST WORKFLOW

1. Employee selects request type (`Leave`, `Early Exit`, `Missed Punch In`, `Correction`).
2. Request payload submitted to `/api/requests` and saved to `attendance_requests`.
3. HR/Manager reviews request via `/api/manager/requests/:id/action`.
4. Employee receives notification upon decision update.

---

## 20. NOTIFICATIONS

- System logs alerts for Punch In, Punch Out, request approvals, and late arrivals.
- Unread badge counter updates dynamically.
- Tapping "Mark All Read" triggers `PUT /api/notifications/read-all`.

---

## 21. SECURITY

- **Password Hashing**: PINs hashed with SHA-256 / `bcrypt` salt.
- **Environment Isolation**: Database credentials strictly maintained inside `backend/.env`.
- **Prepared SQL Statements**: All database operations use parameterized queries (`$1`, `$2` or `?`) preventing SQL injection.
- **Cleartext Traffic Control**: Android cleartext traffic restricted to explicitly allowed development host IPs via `network_security_config.xml`.

---

## 22. ERROR HANDLING

- **Camera Failures**: Helpful user feedback displayed if camera permission is denied or video feed fails.
- **Biometric Mismatch**: Friendly error message: *"Face biometric verification failed. Please position your face inside the reticle."*
- **Network Outages**: Retry logic and offline queueing mechanism (`syncOfflinePunches()`) for temporary connectivity drops.

---

## 23. TESTING

Automated test script `backend/test_all_endpoints.js` validates complete system functionality:

```bash
cd backend
node test_all_endpoints.js
```

### Verified Test Cases
- Health API & DB connectivity
- Employee registration & login
- Profile retrieval & JWT validation
- Face registration & embedding verification
- Dashboard KPI calculations
- Punch In & duplicate punch prevention
- Punch Out & working hours calculation
- Calendar date query & history logs
- Request submission & manager approval
- Notifications sync & logout

---

## 24. TROUBLESHOOTING

### 1. Android Cannot Connect to Backend
- **Cause**: Using `http://localhost:8000` inside Android emulator or device.
- **Solution**: Configure your computer's local LAN IP (e.g., `http://172.20.10.3:8000`) in `attendance-apk/src/config/api.ts`.

### 2. PostgreSQL Connection Error
- **Cause**: Invalid DSN options or credentials in `backend/.env`.
- **Solution**: Ensure `DATABASE_URL` matches your Supabase connection string.

### 3. Camera Feed Blank on Web
- **Cause**: Browser permissions blocking camera access.
- **Solution**: Ensure HTTPS or `localhost` context and grant camera permission in browser settings.

---

## 25. PRODUCTION DEPLOYMENT

- **Web Application**: Deploy compiled `dist` folder to Vercel, Netlify, or AWS S3.
- **Backend API**: Host `server.js` or `main.py` on Render, Railway, AWS EC2, or DigitalOcean with HTTPS.
- **Database**: Production PostgreSQL instance hosted on Supabase Cloud.
- **Android APK**: Sign `app-release.apk` with keytool/apksigner for Google Play Store distribution.

---

## 26. VERSION INFORMATION

- **Node.js**: `v18+` / `v22+`
- **Python**: `3.13.1`
- **React**: `19.2.3`
- **Expo**: `57.0.10`
- **Capacitor**: `6.2.0`
- **FastAPI**: `0.100+`
- **Express**: `4.19.2`
- **PostgreSQL**: `15+` (Supabase)

---

## 27. CURRENT STATUS

| Feature | Status | Notes |
|---|:---:|---|
| **Web Application** | ✅ Completed | Fully responsive on desktop & mobile browsers. |
| **Authentication** | ✅ Completed | JWT & PIN authentication. |
| **Face Registration** | ✅ Completed | 128D feature vector stored in PostgreSQL. |
| **Face Verification** | ✅ Completed | Real-time cosine similarity verification. |
| **Punch In** | ✅ Completed | Real-time face-verified Punch In. |
| **Punch Out** | ✅ Completed | Real-time face-verified Punch Out & hours calculation. |
| **Attendance** | ✅ Completed | Live DB records & status tracking. |
| **Calendar** | ✅ Completed | Interactive monthly calendar & date details. |
| **Requests** | ✅ Completed | Leave & correction requests with manager approval. |
| **Notifications** | ✅ Completed | System alerts & unread badge counters. |
| **Android APK** | ✅ Completed | Native Android APK (`app-debug.apk` & `app-release.apk`). |

---

## 28. FUTURE ENHANCEMENTS

- **GPS Geofencing Validation**: Configurable office radius validation.
- **Push Notifications**: Firebase Cloud Messaging (FCM) integration for Android.
- **Liveness Detection**: Infrared/blink detection for advanced anti-spoofing.
- **AI Voice Assistant**: Voice-activated attendance status queries.

---

## 29. CONTRIBUTING

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/NewFeature`).
3. Commit changes (`git commit -m 'Add NewFeature'`).
4. Push to the branch (`git push origin feature/NewFeature`).
5. Open a Pull Request.

---

## 30. LICENSE

License: Not specified.