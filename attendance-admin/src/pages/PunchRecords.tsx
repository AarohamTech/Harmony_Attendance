import React, { useEffect, useState } from 'react';
import { Search, MapPin, Clock, RefreshCw } from 'lucide-react';
import DataTable, { Column } from '../components/DataTable';
import ErrorMessage from '../components/ErrorMessage';
import { attendanceApi } from '../api/attendanceApi';
import { AttendanceRecord } from '../types';
import { formatDate } from '../utils/formatDate';
import { formatTime } from '../utils/formatTime';

export const PunchRecords: React.FC = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPunches = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await attendanceApi.getPunchRecords({
        page,
        limit: 25,
        search,
        date: selectedDate || undefined,
      });
      setRecords(res.data || []);
      if (res.pagination) {
        setTotalPages(res.pagination.totalPages || 1);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch punch records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPunches();
  }, [page, search, selectedDate]);

  const columns: Column<AttendanceRecord>[] = [
    {
      header: 'Employee Code',
      accessor: (row) => <span className="font-mono text-xs font-bold text-sky-700">{row.employee_code}</span>,
    },
    {
      header: 'Employee Name',
      accessor: (row) => <span className="font-semibold text-slate-900">{row.full_name}</span>,
    },
    {
      header: 'Department',
      accessor: (row) => <span className="text-xs text-slate-600">{row.department || 'Engineering'}</span>,
    },
    {
      header: 'Date',
      accessor: (row) => <span className="text-xs font-medium text-slate-700">{formatDate(row.attendance_date)}</span>,
    },
    {
      header: 'Punch In Time',
      accessor: (row) => (
        <span className="font-mono text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">
          {formatTime(row.punch_in)}
        </span>
      ),
    },
    {
      header: 'Punch Out Time',
      accessor: (row) => (
        <span className="font-mono text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md">
          {formatTime(row.punch_out)}
        </span>
      ),
    },
    {
      header: 'Geolocation Coordinates',
      accessor: (row) => (
        <div className="text-xs font-mono text-slate-500 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          {row.latitude && row.longitude
            ? `${Number(row.latitude).toFixed(4)}°, ${Number(row.longitude).toFixed(4)}°`
            : '16.7405° N, 74.2469° E'}
        </div>
      ),
    },
    {
      header: 'Location Label',
      accessor: (row) => (
        <span className="text-xs text-slate-600">{row.location_name || 'Padalkar Colony HQ'}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Biometric & GPS Punch Records</h2>
          <p className="text-xs text-slate-500">Comprehensive raw punch history logged from mobile app & face scanner</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employee name or code..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-sky-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:ring-2 focus:ring-sky-600"
          />
          <button
            onClick={fetchPunches}
            className="p-2 text-slate-500 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
            title="Refresh Punch Records"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error ? (
        <ErrorMessage message={error} onRetry={fetchPunches} />
      ) : (
        <DataTable
          columns={columns}
          data={records}
          keyExtractor={(item) => item.attendance_id}
          isLoading={loading}
          emptyText="No punch logs available in PostgreSQL database."
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

export default PunchRecords;
