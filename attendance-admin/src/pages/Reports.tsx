import React, { useEffect, useState } from 'react';
import { Download, Printer, Filter, FileSpreadsheet, RefreshCw } from 'lucide-react';
import DataTable, { Column } from '../components/DataTable';
import ErrorMessage from '../components/ErrorMessage';
import { reportsApi } from '../api/reportsApi';
import { departmentApi } from '../api/departmentApi';
import { Department } from '../types';
import { formatDate } from '../utils/formatDate';
import { formatTime } from '../utils/formatTime';

export const Reports: React.FC = () => {
  const [reportType, setReportType] = useState('daily');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [department, setDepartment] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);

  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReportData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await reportsApi.getReportData({
        report_type: reportType,
        start_date: startDate,
        end_date: endDate,
        department: department || undefined,
      });
      setRecords(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to generate report data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    departmentApi.getDepartments().then(setDepartments).catch(() => {});
  }, []);

  useEffect(() => {
    fetchReportData();
  }, [reportType, startDate, endDate, department]);

  const handleExportCSV = async () => {
    try {
      const blob = await reportsApi.exportReport('csv');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance_report_${reportType}_${startDate}_to_${endDate}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      alert('Failed to export CSV report.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const columns: Column<any>[] = [
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
      accessor: (row) => <span className="text-xs text-slate-700 font-medium">{formatDate(row.attendance_date)}</span>,
    },
    {
      header: 'Punch In',
      accessor: (row) => <span className="font-mono text-xs text-emerald-700">{formatTime(row.punch_in)}</span>,
    },
    {
      header: 'Punch Out',
      accessor: (row) => <span className="font-mono text-xs text-indigo-700">{formatTime(row.punch_out)}</span>,
    },
    {
      header: 'Working Hours',
      accessor: (row) => <span className="font-mono text-xs font-semibold">{row.working_hours || '--:--'}</span>,
    },
    {
      header: 'Status',
      accessor: (row) => (
        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 border">
          {row.attendance_status || 'Present'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Attendance & HR Analytics Reports</h2>
          <p className="text-xs text-slate-500">Generate, view, print, and export official PostgreSQL attendance reports</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs shadow-sm transition-all"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl text-xs shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" /> Print Report
          </button>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Report Category</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
            >
              <option value="daily">Daily Attendance Report</option>
              <option value="monthly">Monthly Summary Report</option>
              <option value="late">Late Arrival Audit</option>
              <option value="leave">Leave & Absence Report</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">To Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.department_id} value={d.department_name}>
                  {d.department_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      {error ? (
        <ErrorMessage message={error} onRetry={fetchReportData} />
      ) : (
        <DataTable
          columns={columns}
          data={records}
          keyExtractor={(item) => `${item.employee_code}-${item.attendance_date}`}
          isLoading={loading}
          emptyText="No matching attendance records found for this report filter."
        />
      )}
    </div>
  );
};

export default Reports;
