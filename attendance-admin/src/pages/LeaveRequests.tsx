import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Clock, MessageSquare, RefreshCw } from 'lucide-react';
import DataTable, { Column } from '../components/DataTable';
import Modal from '../components/Modal';
import ErrorMessage from '../components/ErrorMessage';
import { leaveApi } from '../api/leaveApi';
import { AttendanceRequest } from '../types';
import { formatDate } from '../utils/formatDate';

export const LeaveRequests: React.FC = () => {
  const [requests, setRequests] = useState<AttendanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState('');
  const [selectedReq, setSelectedReq] = useState<AttendanceRequest | null>(null);
  const [actionType, setActionType] = useState<'Approved' | 'Rejected' | null>(null);
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await leaveApi.getLeaveRequests(statusFilter || undefined);
      setRequests(data);
    } catch (err: any) {
      setError(err.message || 'Unable to fetch leave requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const handleOpenAction = (req: AttendanceRequest, type: 'Approved' | 'Rejected') => {
    setSelectedReq(req);
    setActionType(type);
    setRemarks('');
  };

  const handleConfirmAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq || !actionType) return;
    if (actionType === 'Rejected' && !remarks.trim()) {
      alert('Please provide a reason for rejecting the request.');
      return;
    }

    setSubmitting(true);
    try {
      await leaveApi.processAction(selectedReq.request_id, actionType, remarks);
      setSelectedReq(null);
      setActionType(null);
      fetchRequests();
    } catch (err: any) {
      alert(err.message || 'Action failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const columns: Column<AttendanceRequest>[] = [
    {
      header: 'Employee Name',
      accessor: (row) => (
        <div>
          <div className="font-semibold text-slate-900">{row.employee_name || `Employee #${row.employee_id}`}</div>
          <div className="text-xs text-sky-700 font-mono">{row.employee_code || '--'}</div>
        </div>
      ),
    },
    {
      header: 'Department',
      accessor: (row) => <span className="text-xs font-medium text-slate-600">{row.department || 'Engineering'}</span>,
    },
    {
      header: 'Leave Type / Request',
      accessor: (row) => (
        <span className="font-medium text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg text-xs">
          {row.request_type}
        </span>
      ),
    },
    {
      header: 'Target Date',
      accessor: (row) => <span className="text-xs font-semibold text-slate-800">{formatDate(row.request_date)}</span>,
    },
    {
      header: 'Reason',
      accessor: (row) => (
        <span className="text-xs text-slate-600 max-w-xs block truncate" title={row.reason}>
          {row.reason}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (row) => {
        let bg = 'bg-amber-50 text-amber-700 border-amber-200';
        if (row.status === 'Approved') bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        if (row.status === 'Rejected') bg = 'bg-rose-50 text-rose-700 border-rose-200';
        return (
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${bg}`}>
            {row.status}
          </span>
        );
      },
    },
    {
      header: 'Submitted On',
      accessor: (row) => <span className="text-xs text-slate-400">{formatDate(row.created_at)}</span>,
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          {row.status === 'Pending' ? (
            <>
              <button
                onClick={() => handleOpenAction(row, 'Approved')}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs"
              >
                Approve
              </button>
              <button
                onClick={() => handleOpenAction(row, 'Rejected')}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs"
              >
                Reject
              </button>
            </>
          ) : (
            <span className="text-xs text-slate-400 italic">
              {row.manager_remark ? `Remark: ${row.manager_remark}` : 'Processed'}
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Leave Requests Approval</h2>
          <p className="text-xs text-slate-500">Review, approve, or reject employee leave and permission requests</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-500">Filter by Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
          >
            <option value="">All Requests</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <button
          onClick={fetchRequests}
          className="p-2 text-slate-500 hover:text-slate-900 bg-slate-50 border border-slate-200 rounded-xl transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {error ? (
        <ErrorMessage message={error} onRetry={fetchRequests} />
      ) : (
        <DataTable
          columns={columns}
          data={requests}
          keyExtractor={(item) => item.request_id}
          isLoading={loading}
          emptyText="No leave requests found in PostgreSQL."
        />
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={!!selectedReq}
        onClose={() => setSelectedReq(null)}
        title={`${actionType === 'Approved' ? 'Approve' : 'Reject'} Leave Request`}
        maxWidth="md"
      >
        {selectedReq && (
          <form onSubmit={handleConfirmAction} className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl space-y-2 border border-slate-200 text-xs">
              <p>
                <strong className="text-slate-700">Employee:</strong> {selectedReq.employee_name} ({selectedReq.employee_code})
              </p>
              <p>
                <strong className="text-slate-700">Type:</strong> {selectedReq.request_type}
              </p>
              <p>
                <strong className="text-slate-700">Date:</strong> {formatDate(selectedReq.request_date)}
              </p>
              <p>
                <strong className="text-slate-700">Reason:</strong> {selectedReq.reason}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Admin Manager Remark {actionType === 'Rejected' && <span className="text-rose-600">* (Required)</span>}
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder={actionType === 'Rejected' ? 'State reason for rejection...' : 'Optional approval notes...'}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                rows={3}
                required={actionType === 'Rejected'}
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedReq(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className={`px-5 py-2 text-white text-xs font-semibold rounded-xl shadow-xs ${
                  actionType === 'Approved' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {submitting ? 'Updating Database...' : `Confirm ${actionType}`}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default LeaveRequests;
