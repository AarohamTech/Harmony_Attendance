import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Calendar,
  FileSpreadsheet,
  Zap,
  TrendingUp,
  RefreshCw,
  UserPlus,
  CheckCircle2,
  FileText,
  Building,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import StatCard from '../components/StatCard';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { attendanceApi } from '../api/attendanceApi';
import { leaveApi } from '../api/leaveApi';
import { DashboardStats, DashboardCharts, AttendanceRecord, AttendanceRequest } from '../types';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [charts, setCharts] = useState<DashboardCharts | null>(null);
  const [recentAttendance, setRecentAttendance] = useState<AttendanceRecord[]>([]);
  const [pendingRequests, setPendingRequests] = useState<AttendanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, chartsData, attendanceData, requestsData] = await Promise.all([
        attendanceApi.getDashboardStats(),
        attendanceApi.getDashboardCharts(),
        attendanceApi.getAttendanceRecords({ limit: 5 }),
        leaveApi.getLeaveRequests({ status: 'Pending' }),
      ]);
      setStats(statsData);
      setCharts(chartsData);
      setRecentAttendance(Array.isArray(attendanceData) ? attendanceData.slice(0, 5) : []);
      setPendingRequests(Array.isArray(requestsData) ? requestsData.slice(0, 5) : []);
    } catch (err: any) {
      setError(err.message || 'Unable to connect to attendance server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <Loading text="Loading Harmony AI Attendance statistics..." />;
  }

  if (error || !stats) {
    return <ErrorMessage message={error || 'Failed to fetch dashboard overview data.'} onRetry={fetchDashboardData} />;
  }

  const attendanceRate = stats.totalEmployees > 0
    ? Math.round((stats.presentToday / stats.totalEmployees) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="bg-[#2563eb] rounded-3xl p-6 lg:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white border border-white/30 text-xs font-extrabold tracking-wide">
            <ShieldCheck className="w-3.5 h-3.5" />
            Harmony AI Attendance Admin
          </div>
          <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight">Enterprise HR & Biometric Operations</h2>
          <p className="text-xs lg:text-sm text-blue-100 max-w-xl font-medium">
            Real-time biometric attendance metrics, leave approvals, and employee records directly synced with PostgreSQL backend.
          </p>
        </div>
        <div className="z-10 flex items-center gap-3 shrink-0">
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white text-xs font-bold rounded-full border border-white/20 transition-all shadow-xs"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Quick Action Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => navigate('/admin/employees')}
          className="p-4 bg-white border border-[#c3c6d7]/70 rounded-2xl shadow-xs hover:shadow-md hover:border-[#2563eb] transition-all flex items-center gap-3 text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563eb] flex items-center justify-center shrink-0 group-hover:bg-[#2563eb] group-hover:text-white transition-colors">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-extrabold text-[#191b23]">Add Employee</p>
            <p className="text-[10px] font-semibold text-[#434655]">Register staff</p>
          </div>
        </button>

        <button
          onClick={() => navigate('/admin/leave-requests')}
          className="p-4 bg-white border border-[#c3c6d7]/70 rounded-2xl shadow-xs hover:shadow-md hover:border-[#2563eb] transition-all flex items-center gap-3 text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-colors">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-extrabold text-[#191b23]">Approve Leaves</p>
            <p className="text-[10px] font-semibold text-[#434655]">{stats.pendingLeaveRequests} pending</p>
          </div>
        </button>

        <button
          onClick={() => navigate('/admin/attendance')}
          className="p-4 bg-white border border-[#c3c6d7]/70 rounded-2xl shadow-xs hover:shadow-md hover:border-[#2563eb] transition-all flex items-center gap-3 text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-extrabold text-[#191b23]">Today Log</p>
            <p className="text-[10px] font-semibold text-[#434655]">{stats.presentToday} present</p>
          </div>
        </button>

        <button
          onClick={() => navigate('/admin/reports')}
          className="p-4 bg-white border border-[#c3c6d7]/70 rounded-2xl shadow-xs hover:shadow-md hover:border-[#2563eb] transition-all flex items-center gap-3 text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-extrabold text-[#191b23]">Export Reports</p>
            <p className="text-[10px] font-semibold text-[#434655]">Monthly stats</p>
          </div>
        </button>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Staff"
          value={stats.totalEmployees}
          icon={Users}
          color="blue"
          subtitle="Registered active staff"
          onClick={() => navigate('/admin/employees')}
        />
        <StatCard
          title="Present Today"
          value={stats.presentToday}
          icon={UserCheck}
          color="emerald"
          trend={`${attendanceRate}% turn-out`}
          onClick={() => navigate('/admin/attendance')}
        />
        <StatCard
          title="Absent Today"
          value={stats.absentToday}
          icon={UserX}
          color="rose"
          subtitle="Not punched in today"
          onClick={() => navigate('/admin/attendance')}
        />
        <StatCard
          title="Late Arrivals"
          value={stats.lateToday}
          icon={Clock}
          color="amber"
          subtitle="Punched after grace time"
          onClick={() => navigate('/admin/attendance')}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard
          title="On Leave Today"
          value={stats.onLeaveToday}
          icon={Calendar}
          color="purple"
          subtitle="Approved leave instances"
          onClick={() => navigate('/admin/leave-requests')}
        />
        <StatCard
          title="Pending Requests"
          value={stats.pendingLeaveRequests}
          icon={FileSpreadsheet}
          color="indigo"
          subtitle="Awaiting manager review"
          onClick={() => navigate('/admin/leave-requests')}
        />
        <StatCard
          title="Currently Punched In"
          value={stats.currentlyPunchedIn}
          icon={TrendingUp}
          color="sky"
          subtitle="Active on shift right now"
          onClick={() => navigate('/admin/attendance')}
        />
      </div>

      {/* Analytics Charts & Trends */}
      {charts && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly Attendance Trend */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-[#c3c6d7]/70 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-extrabold text-[#191b23]">7-Day Attendance Trend</h3>
                <p className="text-xs font-semibold text-[#434655]">Daily breakdown of present vs absent active staff</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-[#ededf9] text-[#2563eb] rounded-full">
                Last 7 Days
              </span>
            </div>

            <div className="space-y-4">
              {charts.attendance_trend?.labels?.map((label, idx) => {
                const presentCount = charts.attendance_trend.present[idx] || 0;
                const absentCount = charts.attendance_trend.absent[idx] || 0;
                const total = Math.max(1, presentCount + absentCount);
                const percent = Math.round((presentCount / total) * 100);

                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-[#191b23] font-bold w-12">{label}</span>
                      <div className="flex items-center gap-3 text-[#434655]">
                        <span className="text-emerald-600 font-bold">{presentCount} Present</span>
                        <span className="text-slate-300">|</span>
                        <span className="text-rose-600 font-bold">{absentCount} Absent</span>
                        <span className="font-extrabold text-[#2563eb] w-10 text-right">{percent}%</span>
                      </div>
                    </div>
                    <div className="w-full h-3 bg-[#ededf9] rounded-full overflow-hidden flex">
                      <div
                        className="bg-emerald-500 h-full transition-all duration-500 rounded-l-full"
                        style={{ width: `${percent}%` }}
                      />
                      <div
                        className="bg-rose-400 h-full transition-all duration-500 rounded-r-full"
                        style={{ width: `${100 - percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Leave Summary */}
          <div className="bg-white rounded-3xl p-6 border border-[#c3c6d7]/70 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-base font-extrabold text-[#191b23] mb-1">Leave Requests Summary</h3>
              <p className="text-xs font-semibold text-[#434655] mb-6">Status breakdown of submitted applications</p>

              <div className="space-y-3.5">
                <div className="flex items-center justify-between p-4 bg-amber-50 rounded-2xl border border-amber-200/60">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-xs font-extrabold text-amber-900">Pending Approval</span>
                  </div>
                  <span className="text-lg font-extrabold text-amber-950">
                    {charts.leave_statistics?.pending || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-200/60">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-xs font-extrabold text-emerald-900">Approved</span>
                  </div>
                  <span className="text-lg font-extrabold text-emerald-950">
                    {charts.leave_statistics?.approved || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-rose-50 rounded-2xl border border-rose-200/60">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-rose-500" />
                    <span className="text-xs font-extrabold text-rose-900">Rejected</span>
                  </div>
                  <span className="text-lg font-extrabold text-rose-950">
                    {charts.leave_statistics?.rejected || 0}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/admin/leave-requests')}
              className="mt-6 w-full py-2.5 px-4 bg-[#ededf9] hover:bg-[#2563eb] hover:text-white text-[#2563eb] font-extrabold text-xs rounded-full transition-all flex items-center justify-center gap-2"
            >
              <span>Manage Leave Requests</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Recent Attendance Activity & Pending Requests Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Attendance Logs */}
        <div className="bg-white rounded-3xl p-6 border border-[#c3c6d7]/70 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-extrabold text-[#191b23]">Recent Attendance Activity</h3>
              <p className="text-xs font-semibold text-[#434655]">Latest employee punch events</p>
            </div>
            <button
              onClick={() => navigate('/admin/attendance')}
              className="text-xs font-bold text-[#2563eb] hover:underline"
            >
              View All
            </button>
          </div>

          {recentAttendance.length === 0 ? (
            <p className="text-xs font-semibold text-[#434655] py-8 text-center">No recent attendance records found.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentAttendance.map((rec) => (
                <div key={rec.attendance_id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#2563eb]/10 text-[#2563eb] font-extrabold flex items-center justify-center text-xs">
                      {rec.full_name?.charAt(0) || 'E'}
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-[#191b23]">{rec.full_name}</p>
                      <p className="text-[10px] font-semibold text-[#434655]">
                        {rec.employee_code} • {rec.department || 'Staff'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      rec.attendance_status === 'Present' ? 'bg-emerald-50 text-emerald-700' :
                      rec.attendance_status === 'Late' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {rec.attendance_status}
                    </span>
                    <p className="text-[10px] font-semibold text-[#434655] mt-0.5">
                      {rec.punch_in ? new Date(rec.punch_in).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Requests List */}
        <div className="bg-white rounded-3xl p-6 border border-[#c3c6d7]/70 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-extrabold text-[#191b23]">Pending Leave & Missed Punches</h3>
              <p className="text-xs font-semibold text-[#434655]">Applications awaiting administrative review</p>
            </div>
            <button
              onClick={() => navigate('/admin/leave-requests')}
              className="text-xs font-bold text-[#2563eb] hover:underline"
            >
              View All
            </button>
          </div>

          {pendingRequests.length === 0 ? (
            <p className="text-xs font-semibold text-[#434655] py-8 text-center">No pending requests at this time.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {pendingRequests.map((req) => (
                <div key={req.request_id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-extrabold text-[#191b23]">{req.employee_name || `Employee #${req.employee_id}`}</p>
                    <p className="text-[10px] font-semibold text-[#434655]">
                      {req.request_type} • {req.request_date ? String(req.request_date).slice(0, 10) : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/admin/leave-requests')}
                    className="px-3 py-1 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-extrabold text-[11px] rounded-full transition-all"
                  >
                    Review
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
