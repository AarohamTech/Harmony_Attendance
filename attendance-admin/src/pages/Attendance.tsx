import React, { useEffect, useState } from 'react';
import { Search, Filter, RefreshCw, Calendar as CalendarIcon, Clock } from 'lucide-react';
import DataTable, { Column } from '../components/DataTable';
import ErrorMessage from '../components/ErrorMessage';
import { attendanceApi } from '../api/attendanceApi';
import { departmentApi } from '../api/departmentApi';
import { AttendanceRecord, Department } from '../types';
import { formatDate, formatDay } from '../utils/formatDate';
import { formatTime } from '../utils/formatTime';

export const Attendance: React.FC = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAttendance = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await attendanceApi.getAttendanceRecords({
        page,
        limit: 25,
        search,
        date: selectedDate || undefined,
        department: selectedDept || undefined,
        status: selectedStatus || undefined,
      });
      setRecords(res.data || []);
      if (res.pagination) {
        setTotalPages(res.pagination.totalPages || 1);
      }
    } catch (err: any) {
      setError(err.message || 'Unable to fetch attendance logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    departmentApi.getDepartments().then(setDepartments).catch(() => {});
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [page, search, selectedDate, selectedDept, selectedStatus]);

  const columns: Column<AttendanceRecord>[] = [
    {
      header: 'Employee',
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-xs">
            {row.full_name?.charAt(0) || 'E'}
          </div>
          <div>
            <div className="font-semibold text-slate-900">{row.full_name}</div>
            <div className="text-xs text-sky-700 font-mono">{row.employee_code}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Department',
      accessor: (row) => <span className="text-xs font-medium text-slate-600">{row.department || 'Engineering'}</span>,
    },
    {
      header: 'Date & Day',
      accessor: (row) => (
        <div>
          <div className="font-semibold text-slate-800">{formatDate(row.attendance_date)}</div>
          <div className="text-[11px] text-slate-400 font-medium">{formatDay(row.attendance_date)}</div>
        </div>
      ),
    },
    {
      header: 'Punch In',
      accessor: (row) => (
        <span className="font-mono text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
          {formatTime(row.punch_in)}
        </span>
      ),
    },
    {
      header: 'Punch Out',
      accessor: (row) => (
        <span className="font-mono text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100">
          {formatTime(row.punch_out)}
        </span>
      ),
    },
    {
      header: 'Working Hours',
      accessor: (row) => (
        <span className="font-mono text-xs font-medium text-slate-700">{row.working_hours || '--:--'}</span>
      ),
    },
    {
      header: 'Status',
      accessor: (row) => {
        const st = (row.attendance_status || 'Present').toUpperCase();
        let bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        if (st.includes('LATE')) bg = 'bg-amber-50 text-amber-700 border-amber-200';
        if (st.includes('ABSENT')) bg = 'bg-rose-50 text-rose-700 border-rose-200';
        if (st.includes('LEAVE')) bg = 'bg-purple-50 text-purple-700 border-purple-200';

        return (
          <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border ${bg}`}>
            {row.attendance_status}
          </span>
        );
      },
    },
    {
      header: 'Location / Remarks',
      accessor: (row) => (
        <div className="text-xs text-slate-500 max-w-xs truncate">
          {row.location_name || row.remarks || 'Padalkar Colony HQ'}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Attendance Log Management</h2>
          <p className="text-xs text-slate-500">Real-time attendance logs filtered by employee, date, and status</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-xs">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employee name or code..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-sky-600 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:ring-2 focus:ring-sky-600"
          />

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.department_id} value={d.department_name}>
                {d.department_name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
          >
            <option value="">All Statuses</option>
            <option value="Present">Present</option>
            <option value="Late">Late</option>
            <option value="Absent">Absent</option>
            <option value="On Leave">On Leave</option>
            <option value="Half Day">Half Day</option>
          </select>

          <button
            onClick={fetchAttendance}
            className="p-2 text-slate-500 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
            title="Refresh Attendance Table"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Table */}
      {error ? (
        <ErrorMessage message={error} onRetry={fetchAttendance} />
      ) : (
        <DataTable
          columns={columns}
          data={records}
          keyExtractor={(item) => item.attendance_id}
          isLoading={loading}
          emptyText="No attendance logs found for the selected criteria."
          pagination={{
            page,
            totalPages,
            onPageChange: (p) => setPage(p),
          }}
        />
      )}
    </div>
  );
};

export default Attendance;
