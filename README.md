# Harmony AI Attendance

### Secure Biometric 

Harmony AI Attendance is a secure biometric employee attendance and HR management platform designed to manage employee registration, authentication, attendance, punch-in/punch-out, leave requests, missed-punch requests, notifications, profiles, and AI-assisted employee services through a modern web and mobile application.

---

## 1. PROJECT OVERVIEW

The **Harmony AI Attendance System** is an enterprise-grade biometric HR management and attendance tracking solution built for modern organizations. The system eliminates proxy clocking (buddy punching) through real-time facial feature extraction and cosine similarity verification.

### System Purpose & Objectives
- **Automated Attendance Verification**: Enforce face-matching camera capture during Punch In and Punch Out workflows.
- **Cross-Platform Accessibility**: Operate seamlessly across Web browsers (desktop & mobile) and native Android devices.
- **Workforce Management**: Support employee profile creation, shift tracking, working hours computation, and office location mapping.
- **Request Workflows**: Provide structured employee request handling for leave applications, missed punch corrections, and early exit justifications with real-time manager approvals.
- **Cloud Data Persistence**: Store system records securely in a PostgreSQL cloud database (Supabase) with SQLite fallback capabilities.

---

## 2. KEY FEATURES

### Authentication
- **Employee Login**: Authenticate via Employee Code / Email and Password / PIN.
- **Credential Hashing**: Password/PIN security enforced using `bcrypt` salting and hashing algorithms.
- **JWT Token Management**: Secure token-based session handling with persistent client-side storage (`AsyncStorage` / `SecureStore`).
- **Account Registration**: Self-service registration with employee details, designation, department, shift timing, and PIN creation.
- **Forgot Password**: Password/PIN reset flow for credential recovery.

### Employee Management
- **Profile Hub**: View personal information, employee code, department, role, shift start/end times, and weekly off days.
- **Profile Updates**: Update email, phone number, department, and designation.
- **Profile Photo**: Avatar display with direct photo upload and update capability.
- **Face Biometric Registration**: Guided registration process capturing facial imagery to generate persistent 128-dimensional biometric embeddings.

### Attendance
- **Biometric Punch In**: Real-time camera feed capture with face matching verification against stored database embeddings. Automated late status tracking (`ON TIME` vs `LATE`).
- **Biometric Punch Out**: Face-verified clock-out with automatic calculation of total working hours (`HHh MMm`).
- **Attendance History & Log**: Filterable attendance history displaying daily clocking logs, status badges, working hours, and location data.
- **Interactive Calendar View**: Monthly grid navigation allowing date selection to inspect punch records for any given day.
- **Location Tracking**: Geo-location latitude/longitude recording for punch events.

### Leave Management
- **Leave Request**: Submit leave applications specifying request date, leave type, and detailed justification.
- **Leave History & Status**: Track real-time status of leave requests (`Pending`, `Approved`, `Rejected`).
- **Manager Approval**: Manager interface for reviewing and taking action on employee leave applications.

### Missed Punch
- **Missed Punch Request**: Submit corrections for forgotten punch-in or punch-out events with date, target time, and explanation.
- **Request History**: Monitor missed punch request approval states.

### Notifications
- **Real-Time Alerts**: Receive immediate notifications for punch events, request approvals, request rejections, and late alerts.
- **Read/Unread Tracking**: Visual unread status indicators with one-click "Mark All as Read" action.

### AI Assistant
- **Biometric AI Engine**: Integrated 128-dimensional facial feature extraction engine processing luminance distribution, multi-channel RGB color histograms, and spatial frequency moments.
- **Verification Confidence**: Returns numerical match confidence percentage for every biometric attempt.

### Dashboard
- **KPI Summary Cards**: Real-time stats display for Present days, Late arrivals, Leave counts, and Missed punches.
- **Today's Status Banner**: Dynamic state display reflecting current punch state (Not Punched, Punched In, Punched Out).
- **Quick Action Hub**: Instant access to Punch In, Punch Out, Face Registration, and Request submission.
- **Weekly Trend Charts**: Attendance activity summary visualization.

---

## 3. TECHNOLOGY STACK

| Category | Technology | Version | Purpose |
|---|---|---|---|
| **Frontend Framework** | React | `19.2.3` | UI Component Framework |
| **Mobile & Web Engine** | React Native / React Native Web | `0.86.2` / `0.21.2` | Cross-platform core runtime |
| **App Platform** | Expo | `~57.0.10` | Web & Mobile application bundler |
| **Styling** | NativeWind / CSS | `^4.2.6` | Tailwind-inspired mobile styling |
| **Navigation** | React Navigation (Stack & Tabs) | `^7.10.18` / `^7.18.14` | Navigation routing & tab bar |
| **Mobile Container** | Capacitor (Android) | `^6.2.0` | Native Android bridge & plugin wrapper |
| **Native Plugins** | `@capacitor/camera`, `@capacitor/preferences` | `^6.1.0` / `^6.0.0` | Native device hardware APIs |
| **Primary Backend** | Node.js / Express | `^4.19.2` | REST API service on Port 8000 |
| **Secondary Backend** | Python / FastAPI | `>=0.100.0` | Analytics & document export service on Port 8002 |
| **Primary Database** | PostgreSQL (Supabase) | `pg ^8.12.0` | Cloud database persistence |
| **Secondary Database** | SQLite | Built-in / SQLAlchemy | Embedded fallback database |
| **Authentication** | JWT (`jsonwebtoken` / `pyjwt`), `bcrypt` | `^9.0.2` / `^5.1.1` | Token auth & PIN encryption |
| **Image Processing** | `jpeg-js`, `pngjs`, Pillow, NumPy | `^0.4.4` / `^7.0.0` | Image array decoding & matrix computation |
| **Document Export** | CSV, Excel (`openpyxl`), PDF (`reportlab`) | `>=3.1.0` / `>=4.0.0` | Report generation utilities |

---

## 4. SYSTEM ARCHITECTURE

```mermaid
flowchart TB
    subgraph Clients["Client Layer"]
        A["Expo Web Application\n(Port 8081)"]
        B["Capacitor Native Android Application\n(com.harmony.aiattendance)"]
    end

    subgraph ServiceLayer["Application Service Layer"]
        C["Root Unified Server Launcher\n(start-all.js)"]
    end

    subgraph BackendLayer["Backend REST APIs"]
        D["Node.js Express Server\n(Port 8000)\nserver.js"]
        E["Python FastAPI Server\n(Port 8002)\nmain.py"]
    end

    subgraph CoreServices["Backend Engines"]
        F["Biometric Face Engine\n(128D Cosine Similarity)"]
        G["JWT Auth & Security"]
        H["Report Generation\n(CSV / XLSX / PDF)"]
    end

    subgraph DataLayer["Database Persistence"]
        I[("Supabase PostgreSQL\nCloud Database")]
        J[("SQLite Local DB\n(attendance.db)")]
    end

    A -->|HTTP / REST API| D
    B -->|HTTP / Native Camera API| D
    C -->|Spawns & Monitors| D
    C -->|Spawns & Monitors| A
    D -->|Executes| F
    D -->|Validates| G
    D -->|Queries / Writes| I
    E -->|Generates| H
    E -->|Queries / Writes| J
```

---

## 5. PROJECT STRUCTURE

```text
F:\Attendence
│
├── attendance-frontend/            # Main Web & Expo Frontend Application
│   ├── api/
│   │   └── client.ts               # API Client, HTTP requests, Storage management
│   ├── assets/                     # Application visual assets and icons
│   ├── components/
│   ├── screens/
│   ├── theme/                      # Design tokens & color theme manager
│   ├── App.tsx                     # Main App Component & Stack Navigation setup
│   ├── app.json                    # Expo project configuration
│   ├── metro.config.js             # Metro bundler web configuration
│   └── package.json                # App dependencies & run scripts
│
├── attendance-backend/             # Primary Express & Python Backend Directory
│   ├── api/                        # Server API endpoints
│   ├── config/                     # Supabase & DB connection pool
│   ├── controllers/                # Request handlers
│   ├── database/                   # Schema migrations & SQL
│   ├── middleware/                 # Auth & error handling middleware
│   ├── routes/                     # Express router definitions
│   ├── services/                   # Face verification & business logic
│   ├── server.js                   # Node.js Express server entrypoint
│   └── package.json
│   ├── controllers/
│   │   ├── attendanceController.js
│   │   ├── authController.js
│   │   ├── employeeController.js
│   │   ├── faceController.js
│   │   ├── managerController.js
│   │   ├── notificationController.js
│   │   └── requestController.js
│   ├── database/
│   │   └── schema.sql              # Supabase PostgreSQL database schema definition
│   ├── middleware/
│   │   ├── authMiddleware.js       # JWT validation middleware
│   │   └── errorMiddleware.js      # Global error handling middleware
│   ├── routes/
│   │   ├── attendanceRoutes.js
│   │   ├── authRoutes.js
│   │   ├── employeeRoutes.js
│   │   ├── faceRoutes.js
│   │   ├── managerRoutes.js
│   │   ├── notificationRoutes.js
│   │   └── requestRoutes.js
│   ├── main.py                     # Python FastAPI server entry point (Port 8002)
│   ├── server.js                   # Node.js Express server entry point (Port 8000)
│   ├── package.json
│   ├── requirements.txt
│   ├── test_all_endpoints.js       # Express endpoint verification script
│   └── test_face_extractor.js      # Biometric face engine test script
│
├── copy_dist.js                    # Asset syncing utility script
├── run_backend.bat                 # Windows batch script for backend launcher
├── run_frontend.bat                # Windows batch script for frontend launcher
├── start-all.js                    # Unified single-command launcher script
└── README.md                       # Project documentation
```

---

## 6. APPLICATION MODULES

- **Authentication Module**: Login with email/code, account registration with shift selection, password recovery, and JWT token refresh.
- **Face Registration Module**: Live camera feed capture with multi-angle positional feedback to generate reference biometric feature vectors.
- **Dashboard Module**: Quick stats overview (present/late/leave counts), current punch status indicator, quick action shortcuts, and weekly activity summary.
- **Attendance Module**: Face-verified Punch In, Punch Out, daily working hours calculation, and location logging.
- **Attendance History & Calendar Module**: Filterable history list and interactive month grid to inspect past attendance entries by date.
- **Leave & Request Module**: Application interface for submitting leave requests and missed-punch adjustments with status tracking.
- **Manager Approval Module**: Administrative interface to review, approve, or reject employee attendance requests.
- **Notification Module**: Real-time alert list with read/unread state management.
- **Profile Module**: Personal info viewer, profile photo uploader, and account detail editor.

---

## 7. ATTENDANCE WORKFLOW

```mermaid
flowchart TD
    A["Employee Registration\n(Name, Code, Email, PIN)"] --> B["Face Registration\n(Capture live photo)"]
    B --> C["Extract 128D Vector &\nSave to Database"]
    C --> D["Employee Login\n(JWT Authentication)"]
    D --> E["Dashboard"]
    E --> F{"Punch Action"}
    F -->|Punch In| G["Face Capture Screen"]
    F -->|Punch Out| H["Face Capture Screen"]
    G --> I["Cosine Similarity Verification\n(Threshold >= 0.65)"]
    H --> I
    I -->|Verification Succeeded| J["Create / Update Attendance Record"]
    I -->|Verification Failed| K["Display Error &\nDeny Punch"]
    J --> L["Calculate Hours & Late Status"]
    L --> M["Update Dashboard & History"]
```

---

## 8. FACE RECOGNITION

The project implements a custom biometric feature extraction and cosine similarity verification engine (`backend/services/faceService.js` and `backend/app/face_engine.py`).

### Feature Extraction Pipeline
1. **Frame Capture & Decoding**: Accepts base64 image strings from Expo Camera or Capacitor Camera, decoding JPEG/PNG byte streams into raw RGBA pixel arrays.
2. **Spatial Resampling**: Normalizes input frames to a standard $64 \times 64$ grid matrix.
3. **Multi-Channel Color Histograms**: Computes 32-bin histograms for Red, Green, and Blue channels ($32 \times 3 = 96$ features).
4. **Spatial Luminance Moments**: Divides the $64 \times 64$ matrix into a $4 \times 4$ sub-region grid (16 tiles). Computes mean luminance ($\mu$) and standard deviation ($\sigma$) for each sub-region ($16 \times 2 = 32$ features).
5. **Vector Normalization**: Concatenates histograms and spatial moments into a 128-dimensional vector, applying $L_2$ Euclidean normalization:
   $$\hat{\mathbf{v}} = \frac{\mathbf{v}}{\|\mathbf{v}\|_2}$$
6. **Vector Storage**: Stores normalized 128D floating-point arrays as JSON strings in the `face_registrations` table keyed by `employee_id`.

### Verification Logic
Verification compares a live capture vector ($\mathbf{A}$) against the stored reference vector ($\mathbf{B}$) using **Cosine Similarity**:
$$\text{Cosine Similarity} = \frac{\mathbf{A} \cdot \mathbf{B}}{\|\mathbf{A}\| \|\mathbf{B}\|}$$

- **Match Threshold**: Default threshold set to `0.65` (configurable via `FACE_MATCH_THRESHOLD`).
- **Confidence Output**: Scores $\ge 0.65$ map to a confidence rating between 65.0% and 99.9%, authorizing the attendance punch. Scores below $0.65$ reject the attempt.

---

## 9. API

### Base URL
- Node.js Express Backend: `http://localhost:8000`
- Python FastAPI Backend: `http://localhost:8002`

### Key Endpoints Table

| Method | Endpoint | Purpose | Auth Required |
|---|---|---|---|
| `GET` | `/api/health` | Service and database health check | No |
| `POST` | `/api/auth/register` | Register new employee account | No |
| `POST` | `/api/auth/login` | Authenticate employee & return JWT | No |
| `POST` | `/api/auth/logout` | Invalidate authenticated session | Yes |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes |
| `GET` | `/api/employees/profile` | Retrieve profile information | Yes |
| `PUT` | `/api/employees/profile` | Update profile information | Yes |
| `GET` | `/api/employees` | List registered employees | Yes |
| `POST` | `/api/face/register` | Register 128D face embedding | Yes |
| `POST` | `/api/face/verify` | Verify live face capture frame | Yes |
| `GET` | `/api/face` | Retrieve employee face registration status | Yes |
| `POST` | `/api/punch` | Unified biometric Punch In / Punch Out | Yes |
| `POST` | `/api/attendance/punch-in` | Biometric Punch In | Yes |
| `POST` | `/api/attendance/punch-out` | Biometric Punch Out | Yes |
| `GET` | `/api/attendance/today` | Retrieve today's punch record | Yes |
| `GET` | `/api/attendance/history` | Retrieve attendance history logs | Yes |
| `GET` | `/api/attendance/calendar` | Retrieve monthly attendance calendar grid | Yes |
| `GET` | `/api/attendance/date/:date` | Retrieve attendance record for specific date | Yes |
| `GET` | `/api/dashboard` | Fetch dashboard KPI summaries | Yes |
| `GET` | `/api/dashboard/charts` | Fetch weekly trend analytics | Yes |
| `GET` | `/api/requests` | List leave & missed-punch requests | Yes |
| `POST` | `/api/requests` | Submit new leave or missed punch request | Yes |
| `GET` | `/api/manager/requests` | List pending requests for manager review | Yes (Manager) |
| `POST` | `/api/manager/requests/:id/action` | Approve or reject employee request | Yes (Manager) |
| `GET` | `/api/notifications` | Retrieve employee notifications | Yes |
| `PUT` | `/api/notifications/read-all` | Mark all notifications as read | Yes |
| `GET` | `/api/reports/export` | Export attendance report (CSV / XLSX / PDF) | Yes |

---

## 10. ENVIRONMENT CONFIGURATION

To run the project, configure environment variables in your `.env` files. **Never commit production credentials or secret keys to version control.**

### Backend Environment Variables (`backend/.env`)
```env
# Server Port
PORT=8000

# Supabase PostgreSQL Connection String
DATABASE_URL=postgresql://your_db_user:your_db_password@your_db_host:5432/your_db_name

# Authentication JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# Biometric Verification Threshold (Default: 0.65)
FACE_MATCH_THRESHOLD=0.65
```

### Frontend Environment Variables (`attendance-frontend/.env`)
```env
# API Base URL for Web Application
EXPO_PUBLIC_API_URL=http://localhost:8000
```

---

## 11. INSTALLATION

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **Python**: `v3.10` or higher (if running FastAPI backend)
- **Android Studio & SDK**: (Optional, for Android APK builds)

### 1. Root Setup
```bash
cd F:\Attendence
npm install
```

### 2. Frontend Setup
```bash
cd F:\Attendence\attendance-frontend
npm install
```

### 3. Primary Node Backend Setup
```bash
cd F:\Attendence\attendance-backend
npm install
```

### 4. Optional Python Backend Setup
```bash
cd F:\Attendence\attendance-backend
pip install -r requirements.txt
```

---

## 12. RUNNING THE PROJECT

### Unified Startup (Recommended)
You can launch both the Node.js Express backend and the Expo Web application simultaneously using the unified launcher:

```bash
cd F:\Attendence
npm run dev
```

Or execute the Windows launcher script:
```cmd
run_backend.bat
```
and
```cmd
run_frontend.bat
```

### Individual Service Launch

#### 1. Node.js Express Backend (Port 8000)
```bash
cd F:\Attendence\backend
npm run dev
```
- Expected URL: `http://localhost:8000`

#### 2. Expo Web Frontend (Port 8081)
```bash
cd F:\Attendence\attendance-frontend
npm run dev
```
- Expected URL: `http://localhost:8081`

#### 3. Python FastAPI Analytics Backend (Optional - Port 8002)
```bash
cd F:\Attendence\attendance-backend
python -m uvicorn main:app --host 0.0.0.0 --port 8002 --reload
```
- Expected URL: `http://localhost:8002`

---

## 13. HEALTH CHECK

Verify backend server and database status:

```bash
curl http://localhost:8000/api/health
```

### Expected Response
```json
{
  "success": true,
  "message": "Database connection is working cleanly",
  "timestamp": "2026-08-11T14:45:58.000Z"
}
```

---

## 14. WEB APPLICATION

- **Framework**: Built with Expo Web and React Native Web.
- **Browser Compatibility**: Supported on modern evergreen browsers including Chrome, Edge, Firefox, and Safari.
- **Responsive Layout**: Designed for seamless transition across desktop displays, laptops, tablets, and mobile web viewports.
- **Custom Touch & Scroll CSS**: Clamps viewport height and enables `-webkit-overflow-scrolling: touch` for natural touch momentum scrolling on mobile browsers.
- **Navigation**: Managed via React Navigation Stack and bottom tab components.

---

## 15. ANDROID APPLICATION

The native Android version is located in `attendance-apk/`.

### Android Build Steps
1. Navigate to the APK directory:
   ```bash
   cd F:\Attendence\attendance-apk
   ```
2. Sync compiled assets to native Android container:
   ```bash
   npm run cap:sync
   ```
3. Build Debug APK:
   ```bash
   npm run build:apk:debug
   ```
   *Output APK location*: `attendance-apk/android/app/build/outputs/apk/debug/app-debug.apk`

4. Build Release APK:
   ```bash
   npm run build:apk:release
   ```
   *Output APK location*: `attendance-apk/android/app/build/outputs/apk/release/app-release.apk`

---

## 16. CAPACITOR

Capacitor (`@capacitor/core` version `6.2.0`) encapsulates the web client inside a native Android container.

### Configured Plugins & Capabilities
- **`@capacitor/camera`**: Enables hardware camera access for real-time face registration and punch verification.
- **`@capacitor/preferences`**: Provides persistent key-value storage for authentication state.
- **Network Security Configuration**: Configured in `AndroidManifest.xml` and `network_security_config.xml` to support production HTTPS communication with `https://harmony-attendance-backend.vercel.app`.
- **Package Identifier**: `com.harmony.aiattendance`

---

## 17. DATABASE

The application uses **Supabase PostgreSQL** as its primary cloud database.

### Schema Entities (`backend/database/schema.sql`)
- **`employees`**: Core employee table storing `employee_code`, `full_name`, `email`, hashed `password`, `department`, `designation`, `shift_start`, `shift_end`, and `status`.
- **`face_registrations`**: Stores stringified 128D face embedding JSON vectors linked to `employee_id`.
- **`attendance`**: Daily attendance entries containing `attendance_date`, `punch_in`, `punch_out`, `working_hours`, `attendance_status`, latitude/longitude, and remarks.
- **`attendance_requests`**: Requests for leave, missed punches, and corrections with approval status.
- **`notifications`**: System alerts and request notifications with `is_read` status.
- **`office_locations`**: Geo-fencing office location coordinates and allowed radius.
- **`managers` & `manager_actions`**: Manager directory and request processing logs.
- **`login_sessions`**: Active JWT login session registry.
- **`holidays`**: Public holiday calendar records.

---

## 18. SECURITY

- **JWT Authentication**: Secured route protection using Bearer JWT tokens.
- **PIN/Password Encryption**: Credentials hashed using `bcrypt` before storage.
- **Parameterized SQL Queries**: All database interactions use prepared statements (`$1`, `$2`) to prevent SQL injection vulnerabilities.
- **CORS Configuration**: Restricts API origin access to verified web and mobile domains.
- **Protected API Middleware**: Middleware validates token signatures before granting access to employee or manager resources.

---

## 19. ERROR HANDLING

- **Biometric Mismatch Handling**: Provides user error messages when facial confidence scores fall below threshold.
- **Camera Fallback**: Friendly user interface messaging when camera access permissions are blocked.
- **Network Errors**: Error alert handling for lost API connectivity or server unavailability.
- **Validation**: Schema-level input validation on authentication and request submission endpoints.

---

## 20. RESPONSIVE DESIGN

- **Cross-Platform Layouts**: Card and grid components adapt seamlessly to viewports ranging from small mobile screens to 4K desktop displays.
- **Viewport Height Clamping**: Custom CSS rules (`#root`, React Native Web containers) prevent layout clipping and unwanted document scrollbars on web browsers.
- **Touch-Friendly Controls**: Interactive elements designed for touch targets meeting standard accessibility guidelines.

---

## 21. TESTING

Application logic and endpoint validation are performed using verification test scripts:

### Running Express API Test Suite
```bash
cd F:\Attendence\backend
node test_all_endpoints.js
```

### Running Face Engine Test Suite
```bash
cd F:\Attendence\backend
node test_face_extractor.js
```

*Note: Application testing is currently performed through test script execution and manual end-to-end user verification.*

---

## 22. BUILD / DEPLOYMENT

### Production Web Build
```bash
cd F:\Attendence\attendance-frontend
npx expo export --platform web
```
The compiled web static files are placed in `attendance-frontend/dist/`.


### Synchronizing Dist to Capacitor APK Container
```bash
node copy_dist.js
cd attendance-frontend/attendance-apk
npx cap sync android
```

### Building Android APK Output
```bash
# Debug APK
npm run build:apk:debug

# Release APK
npm run build:apk:release
```
APKs generated in `attendance-frontend/attendance-apk/android/app/build/outputs/apk/`.

---

## 22. TESTING PROCEDURES

1. **Auth Login**: Test login with valid credentials (e.g. `EMP101` / `1234`).
2. **Account Registration**: Complete enrollment form and verify user is saved to Supabase DB.
3. **Network Failure Simulation**: Disconnect network and verify clean error message: `"Unable to connect to attendance server. Please check your internet connection and try again."`
4. **Biometric Face Capture**: Test camera capture and face verification.
5. **Dashboard & Requests**: Verify attendance history rendering and request creation.

---

## 23. TROUBLESHOOTING

### 1. Port 8000 / 8081 Already in Use
Running `npm start` from root automatically terminates lingering process listeners on ports 8000 and 8081.

### 2. Android App Cannot Connect to Backend API
- **Issue**: API returns `500 Database connection error`.
- **Solution**: Verify that `DATABASE_URL` in `backend/.env` is correctly populated with your Supabase PostgreSQL connection URI and that your IP is allowed.

---

## 24. DEVELOPMENT GUIDELINES

- **Do Not Commit Secrets**: Keep `.env` files out of git repositories.
- **Centralized API Config**: Perform all API requests using `attendance-frontend/api/client.ts`.
- **Database Integrity**: Execute database migrations cleanly through `attendance-backend/database/schema.sql`.
- **Maintain UI Consistency**: Reuse existing component patterns from `attendance-frontend/components/` and color tokens in `theme/ThemeContext.tsx`.

---

## 25. ROADMAP

The following features represent planned future enhancements:
- **Advanced Anti-Spoofing & Liveness Detection**: Infrared and blink detection algorithms.
- **Firebase Push Notifications (FCM)**: Native mobile push notifications for request approvals.
- **Role-Based Admin Management Portal**: Dedicated administrative portal for HR managers.
- **Advanced Analytics & Reporting Dashboard**: Visual attendance heatmaps and export scheduling.
- **Automated CI/CD Workflows**: GitHub Actions pipeline for continuous integration and automated APK compilation.

---

## 26. CONTRIBUTING

1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Commit your changes: `git commit -m "Add new feature"`
3. Test your changes locally.
4. Push to your branch: `git push origin feature/your-feature-name`
5. Open a Pull Request.

---

## 27. LICENSE

License information has not yet been specified.
