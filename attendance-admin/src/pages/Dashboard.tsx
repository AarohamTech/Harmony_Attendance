import React, { useEffect, useState } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Calendar,
  FileSpreadsheet,
  Zap,
  TrendingUp,
  Building,
  RefreshCw,
} from 'lucide-react';
import StatCard from '../components/StatCard';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { attendanceApi } from '../api/attendanceApi';
import { DashboardStats, DashboardCharts } from '../types';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [charts, setCharts] = useState<DashboardCharts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, chartsData] = await Promise.all([
        attendanceApi.getDashboardStats(),
        attendanceApi.getDashboardCharts(),
      ]);
      setStats(statsData);
      setCharts(chartsData);
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
    return <Loading text="Fetching live statistics from Supabase PostgreSQL..." />;
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
      <div className="bg-gradient-to-r from-slate-900 via-sky-900 to-indigo-900 rounded-3xl p-6 lg:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5 text-sky-400" />
            Live Enterprise Overview
          </div>
          <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight">Enterprise HR & Attendance Operations</h2>
          <p className="text-sm text-slate-300 max-w-xl">
            Real-time biometric attendance metrics, leave approvals, and employee records directly synced with Supabase PostgreSQL.
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="z-10 shrink-0 flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/20 transition-all backdrop-blur-xs"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Stats
        </button>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Employees"
          value={stats.totalEmployees}
          icon={Users}
          color="blue"
          subtitle="Active workforce count"
        />
        <StatCard
          title="Present Today"
          value={stats.presentToday}
          icon={UserCheck}
          color="emerald"
          trend={`${attendanceRate}% turn-out`}
        />
        <StatCard
          title="Absent Today"
          value={stats.absentToday}
          icon={UserX}
          color="rose"
          subtitle="Not punched in today"
        />
        <StatCard
          title="Late Arrivals"
          value={stats.lateToday}
          icon={Clock}
          color="amber"
          subtitle="Punched after grace time"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard
          title="On Leave Today"
          value={stats.onLeaveToday}
          icon={Calendar}
          color="purple"
          subtitle="Approved leave instances"
        />
        <StatCard
          title="Pending Requests"
          value={stats.pendingLeaveRequests}
          icon={FileSpreadsheet}
          color="indigo"
          subtitle="Awaiting manager review"
        />
        <StatCard
          title="Currently Punched In"
          value={stats.currentlyPunchedIn}
          icon={TrendingUp}
          color="sky"
          subtitle="Active on shift right now"
        />
      </div>

      {/* Analytics Charts & Progress */}
      {charts && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly Attendance Trend Chart */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">7-Day Attendance Trend</h3>
                <p className="text-xs text-slate-500">Daily breakdown of present vs absent active staff</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-sky-50 text-sky-700 rounded-lg">
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
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-slate-700 font-semibold w-12">{label}</span>
                      <div className="flex items-center gap-3 text-slate-500">
                        <span className="text-emerald-600 font-medium">{presentCount} Present</span>
                        <span className="text-slate-400">|</span>
                        <span className="text-rose-600 font-medium">{absentCount} Absent</span>
                        <span className="font-bold text-slate-800 w-10 text-right">{percent}%</span>
                      </div>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                      <div
                        className="bg-emerald-500 h-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                      <div
                        className="bg-rose-400 h-full transition-all duration-500"
                        style={{ width: `${100 - percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Leave Request Status Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Leave Requests Summary</h3>
              <p className="text-xs text-slate-500 mb-6">Status of all leave applications submitted in system</p>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3.5 bg-amber-50 rounded-2xl border border-amber-100">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-xs font-semibold text-amber-900">Pending Approval</span>
                  </div>
                  <span className="text-base font-bold text-amber-950">
                    {charts.leave_statistics?.pending || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-xs font-semibold text-emerald-900">Approved</span>
                  </div>
                  <span className="text-base font-bold text-emerald-950">
                    {charts.leave_statistics?.approved || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-rose-50 rounded-2xl border border-rose-100">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-rose-500" />
                    <span className="text-xs font-semibold text-rose-900">Rejected</span>
                  </div>
                  <span className="text-base font-bold text-rose-950">
                    {charts.leave_statistics?.rejected || 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-center">
              <span className="text-xs font-medium text-slate-500">
                Synced automatically with PostgreSQL database
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
