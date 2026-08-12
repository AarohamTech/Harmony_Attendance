import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import EmployeeDetails from './pages/EmployeeDetails';
import Attendance from './pages/Attendance';
import PunchRecords from './pages/PunchRecords';
import LeaveRequests from './pages/LeaveRequests';
import MissedPunchRequests from './pages/MissedPunchRequests';
import Departments from './pages/Departments';
import Managers from './pages/Managers';
import Holidays from './pages/Holidays';
import OfficeLocations from './pages/OfficeLocations';
import Notifications from './pages/Notifications';
import Reports from './pages/Reports';
import AdminUsers from './pages/AdminUsers';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

const RedirectWithQuery: React.FC<{ to: string }> = ({ to }) => {
  const location = useLocation();
  return <Navigate to={`${to}${location.search}`} replace />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Top-level Root Redirect */}
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

          {/* Non-/admin route aliases for direct navigation compatibility */}
          <Route path="/login" element={<RedirectWithQuery to="/admin/login" />} />
          <Route path="/register" element={<RedirectWithQuery to="/admin/register" />} />
          <Route path="/forgot-password" element={<RedirectWithQuery to="/admin/forgot-password" />} />
          <Route path="/dashboard" element={<RedirectWithQuery to="/admin/dashboard" />} />
          <Route path="/employees" element={<RedirectWithQuery to="/admin/employees" />} />
          <Route path="/employees/:id" element={<RedirectWithQuery to="/admin/employees/:id" />} />
          <Route path="/attendance" element={<RedirectWithQuery to="/admin/attendance" />} />
          <Route path="/punch-records" element={<RedirectWithQuery to="/admin/punch-records" />} />
          <Route path="/leave-requests" element={<RedirectWithQuery to="/admin/leave-requests" />} />
          <Route path="/attendance-requests" element={<RedirectWithQuery to="/admin/attendance-requests" />} />
          <Route path="/missed-punch-requests" element={<RedirectWithQuery to="/admin/attendance-requests" />} />
          <Route path="/departments" element={<RedirectWithQuery to="/admin/departments" />} />
          <Route path="/managers" element={<RedirectWithQuery to="/admin/managers" />} />
          <Route path="/holidays" element={<RedirectWithQuery to="/admin/holidays" />} />
          <Route path="/locations" element={<RedirectWithQuery to="/admin/locations" />} />
          <Route path="/offices" element={<RedirectWithQuery to="/admin/locations" />} />
          <Route path="/notifications" element={<RedirectWithQuery to="/admin/notifications" />} />
          <Route path="/reports" element={<RedirectWithQuery to="/admin/reports" />} />
          <Route path="/admin-users" element={<RedirectWithQuery to="/admin/managers" />} />
          <Route path="/profile" element={<RedirectWithQuery to="/admin/profile" />} />
          <Route path="/settings" element={<RedirectWithQuery to="/admin/settings" />} />

          {/* Primary Public Auth Routes */}
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/register" element={<Register />} />
          <Route path="/admin/forgot-password" element={<ForgotPassword />} />

          {/* Protected Admin HRMS Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="employees" element={<Employees />} />
            <Route path="employees/:id" element={<EmployeeDetails />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="punch-records" element={<PunchRecords />} />
            <Route path="leave-requests" element={<LeaveRequests />} />
            <Route path="attendance-requests" element={<MissedPunchRequests />} />
            <Route path="missed-punch-requests" element={<MissedPunchRequests />} />
            <Route path="departments" element={<Departments />} />
            <Route path="managers" element={<Managers />} />
            <Route path="holidays" element={<Holidays />} />
            <Route path="locations" element={<OfficeLocations />} />
            <Route path="offices" element={<OfficeLocations />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="reports" element={<Reports />} />
            <Route path="admin-users" element={<AdminUsers />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Root Fallback */}
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
