# Harmony AI Attendance - Admin HRMS Dashboard

Enterprise Admin Dashboard frontend for Harmony AI Attendance System. Completely decoupled frontend built with React, TypeScript, Vite, React Router, and Tailwind CSS.

## Features

- **Admin Login & Authentication**: Secure JWT authentication with strict Admin/HR/Manager role enforcement.
- **Admin Registration & Account Recovery**: Registration form with role specification and forgot password flow.
- **Real-Time Dashboard**: Live PostgreSQL-backed statistics (Total Staff, Present, Absent, Late, On Leave, Pending Approvals, Punch In status) and 7-day attendance trend charts.
- **Employee Management**: Complete CRUD operations for employees with status activation/deactivation, details page, and modal creation.
- **Attendance & Punch Logs**: Filterable live attendance logs and GPS/Biometric punch history records.
- **Leave & Missed Punch Approvals**: Approve or reject employee requests with rejection remarks and automated employee notification triggers.
- **Department & Office Premises**: Manage organizational departments and GPS geofence radiuses for office locations.
- **Reports & Data Export**: Dynamic CSV export and printable official attendance summary reports.
- **System Settings**: Configurable company settings, shift times, grace period, and weekly off rules persisted directly to Supabase PostgreSQL.

---

## Folder Structure

```
attendance-admin/
├── src/
│   ├── api/                # Axios API services for all backend routes
│   │   ├── client.ts
│   │   ├── authApi.ts
│   │   ├── employeeApi.ts
│   │   ├── attendanceApi.ts
│   │   ├── leaveApi.ts
│   │   ├── missedPunchApi.ts
│   │   ├── departmentApi.ts
│   │   ├── officeApi.ts
│   │   ├── notificationApi.ts
│   │   ├── reportsApi.ts
│   │   └── settingsApi.ts
│   ├── components/         # Reusable UI components
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── StatCard.tsx
│   │   ├── DataTable.tsx
│   │   ├── Modal.tsx
│   │   ├── Loading.tsx
│   │   ├── ErrorMessage.tsx
│   │   └── ProtectedRoute.tsx
│   ├── context/            # Authentication Context Provider
│   │   └── AuthContext.tsx
│   ├── layouts/            # Main Admin Page Layout
│   │   └── AdminLayout.tsx
│   ├── pages/              # Admin Application Pages
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── ForgotPassword.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Employees.tsx
│   │   ├── EmployeeDetails.tsx
│   │   ├── Attendance.tsx
│   │   ├── PunchRecords.tsx
│   │   ├── LeaveRequests.tsx
│   │   ├── MissedPunchRequests.tsx
│   │   ├── Departments.tsx
│   │   ├── OfficeLocations.tsx
│   │   ├── Notifications.tsx
│   │   ├── Reports.tsx
│   │   ├── AdminUsers.tsx
│   │   ├── Profile.tsx
│   │   └── Settings.tsx
│   ├── types/              # TypeScript interface definitions
│   │   └── index.ts
│   ├── utils/              # Helper utilities
│   │   ├── auth.ts
│   │   ├── formatDate.ts
│   │   └── formatTime.ts
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── .env
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=https://harmony-attendance-backend.vercel.app
VITE_API_URL=https://harmony-attendance-backend.vercel.app
```

---

## Installation & Local Development

1. Navigate to the admin folder:
   ```bash
   cd attendance-admin
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

---

## Production Build & Verification

To verify and create a production build:

```bash
npm run build
npm run preview
```

---

## Vercel Deployment

Deploy as a standalone project on Vercel:

1. Import repository on Vercel.
2. Set Root Directory to `attendance-admin`.
3. Add Environment Variable:
   - `VITE_API_BASE_URL` = `https://harmony-attendance-backend.vercel.app`
4. Deploy! Production URL: `https://harmony-attendance-admin.vercel.app`
