import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Building,
  Briefcase,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  FileText,
} from 'lucide-react';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { employeeApi } from '../api/employeeApi';
import { Employee, AttendanceRecord, AttendanceRequest } from '../types';
import { formatDate } from '../utils/formatDate';
import { formatTime } from '../utils/formatTime';

export const EmployeeDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [leaveHistory, setLeaveHistory] = useState<AttendanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await employeeApi.getEmployeeById(id);
      setEmployee(res.employee);
      setAttendanceHistory(res.attendance_history || []);
      setLeaveHistory(res.leave_history || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load employee details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  if (loading) return <Loading text="Loading employee profile and records..." />;
  if (error || !employee) return <ErrorMessage message={error || 'Employee not found'} onRetry={fetchDetails} />;

  return (
    <div className="space-y-6">
      {/* Header back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/employees')}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Employee List
        </button>

        <span className="text-xs font-semibold text-slate-400">
          ID #{employee.employee_id} • Added {formatDate(employee.created_at)}
        </span>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-slate-900 text-white font-bold text-2xl flex items-center justify-center shadow-md">
            {employee.full_name?.charAt(0) || 'E'}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-slate-900">{employee.full_name}</h2>
              <span className="font-mono text-xs font-bold px-2.5 py-1 bg-sky-50 text-sky-700 rounded-md border border-sky-200">
                {employee.employee_code}
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-600">
              {employee.designation || 'Employee'} • {employee.department || 'Engineering'}
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> {employee.email}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> {employee.phone || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <span
            className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
              employee.status === 'Active'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
          >
            ● {employee.status || 'Active'}
          </span>
        </div>
      </div>

      {/* Grid Specs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-400 tracking-wider">
            <Building className="w-4 h-4 text-sky-600" /> Department & Office
          </div>
          <div>
            <p className="text-xs text-slate-500">Department</p>
            <p className="text-sm font-semibold text-slate-800">{employee.department || 'Engineering'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Assigned Office Location</p>
            <p className="text-sm font-semibold text-slate-800">{employee.office_name || 'Padalkar Colony HQ'}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-400 tracking-wider">
            <Clock className="w-4 h-4 text-amber-600" /> Shift & Timing
          </div>
          <div>
            <p className="text-xs text-slate-500">Shift Timing</p>
            <p className="text-sm font-semibold text-slate-800">
              {formatTime(employee.shift_start)} - {formatTime(employee.shift_end)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Weekly Off Day</p>
            <p className="text-sm font-semibold text-slate-800">{employee.weekly_off || 'Sunday'}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-400 tracking-wider">
            <CheckCircle className="w-4 h-4 text-emerald-600" /> Account Status
          </div>
          <div>
            <p className="text-xs text-slate-500">Current Status</p>
            <p className="text-sm font-semibold text-slate-800">{employee.status || 'Active'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Date Registered</p>
            <p className="text-sm font-semibold text-slate-800">{formatDate(employee.created_at)}</p>
          </div>
        </div>
      </div>

      {/* Attendance History */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-4">Recent Biometric Attendance Records</h3>
        {attendanceHistory.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No attendance logs found for this employee.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 font-semibold uppercase text-slate-500">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Punch In</th>
                  <th className="p-3">Punch Out</th>
                  <th className="p-3">Working Hours</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendanceHistory.map((att) => (
                  <tr key={att.attendance_id} className="hover:bg-slate-50/70">
                    <td className="p-3 font-semibold text-slate-900">{formatDate(att.attendance_date)}</td>
                    <td className="p-3 font-mono text-emerald-700">{formatTime(att.punch_in)}</td>
                    <td className="p-3 font-mono text-indigo-700">{formatTime(att.punch_out)}</td>
                    <td className="p-3">{att.working_hours || '--'}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-slate-100 text-slate-700">
                        {att.attendance_status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">{att.location_name || 'Office Campus'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Leave History */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-4">Leave & Attendance Requests History</h3>
        {leaveHistory.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No leave requests submitted by this employee.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 font-semibold uppercase text-slate-500">
                <tr>
                  <th className="p-3">Type</th>
                  <th className="p-3">Target Date</th>
                  <th className="p-3">Reason</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Manager Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaveHistory.map((req) => (
                  <tr key={req.request_id} className="hover:bg-slate-50/70">
                    <td className="p-3 font-semibold text-slate-900">{req.request_type}</td>
                    <td className="p-3">{formatDate(req.request_date)}</td>
                    <td className="p-3 text-slate-600 max-w-xs truncate">{req.reason}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          req.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700'
                            : req.status === 'Rejected'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">{req.manager_remark || '--'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDetails;
