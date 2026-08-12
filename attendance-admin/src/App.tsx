import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import OfficeLocations from './pages/OfficeLocations';
import Notifications from './pages/Notifications';
import Reports from './pages/Reports';
import AdminUsers from './pages/AdminUsers';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
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
            <Route path="missed-punch-requests" element={<MissedPunchRequests />} />
            <Route path="departments" element={<Departments />} />
            <Route path="offices" element={<OfficeLocations />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="reports" element={<Reports />} />
            <Route path="admin-users" element={<AdminUsers />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Root Fallback */}
          <Route path="*" element={<Navigate to="/admin/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
