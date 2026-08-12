import React, { useEffect, useState } from 'react';
import { Clock, RefreshCw } from 'lucide-react';
import DataTable, { Column } from '../components/DataTable';
import Modal from '../components/Modal';
import ErrorMessage from '../components/ErrorMessage';
import { missedPunchApi } from '../api/missedPunchApi';
import { AttendanceRequest } from '../types';
import { formatDate } from '../utils/formatDate';

export const MissedPunchRequests: React.FC = () => {
  const [requests, setRequests] = useState<AttendanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedReq, setSelectedReq] = useState<AttendanceRequest | null>(null);
  const [actionType, setActionType] = useState<'Approved' | 'Rejected' | null>(null);
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await missedPunchApi.getMissedPunchRequests();
      setRequests(data);
    } catch (err: any) {
      setError(err.message || 'Unable to fetch missed punch requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleOpenAction = (req: AttendanceRequest, type: 'Approved' | 'Rejected') => {
    setSelectedReq(req);
    setActionType(type);
    setRemarks('');
  };

  const handleConfirmAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq || !actionType) return;
    if (actionType === 'Rejected' && !remarks.trim()) {
      alert('Rejection remark is required.');
      return;
    }

    setSubmitting(true);
    try {
      await missedPunchApi.processAction(selectedReq.request_id, actionType, remarks);
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
      header: 'Employee',
      accessor: (row) => (
        <div>
          <div className="font-semibold text-slate-900">{row.employee_name || `ID #${row.employee_id}`}</div>
          <div className="text-xs text-sky-700 font-mono">{row.employee_code || '--'}</div>
        </div>
      ),
    },
    {
      header: 'Request Type',
      accessor: (row) => (
        <span className="font-medium text-slate-800 bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-md text-xs">
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
      accessor: (row) => <span className="text-xs text-slate-600 truncate max-w-xs block">{row.reason}</span>,
    },
    {
      header: 'Status',
      accessor: (row) => {
        let bg = 'bg-amber-50 text-amber-700 border-amber-200';
        if (row.status === 'Approved') bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        if (row.status === 'Rejected') bg = 'bg-rose-50 text-rose-700 border-rose-200';
        return <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${bg}`}>{row.status}</span>;
      },
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          {row.status === 'Pending' ? (
            <>
              <button
                onClick={() => handleOpenAction(row, 'Approved')}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-2xs"
              >
                Approve & Update
              </button>
              <button
                onClick={() => handleOpenAction(row, 'Rejected')}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-2xs"
              >
                Reject
              </button>
            </>
          ) : (
            <span className="text-xs text-slate-400 italic">Processed</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Missed Punch & Attendance Corrections</h2>
          <p className="text-xs text-slate-500">Approve employee missed punch requests to update attendance records in PostgreSQL</p>
        </div>
        <button
          onClick={fetchRequests}
          className="p-2 text-slate-500 hover:text-slate-900 bg-white border border-slate-200 rounded-xl shadow-xs"
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
          emptyText="No missed punch or correction requests found."
        />
      )}

      <Modal
        isOpen={!!selectedReq}
        onClose={() => setSelectedReq(null)}
        title={`${actionType === 'Approved' ? 'Approve' : 'Reject'} Attendance Correction`}
      >
        {selectedReq && (
          <form onSubmit={handleConfirmAction} className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl space-y-1 text-xs border border-slate-200">
              <p><strong>Employee:</strong> {selectedReq.employee_name}</p>
              <p><strong>Correction Date:</strong> {formatDate(selectedReq.request_date)}</p>
              <p><strong>Reason:</strong> {selectedReq.reason}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Admin Remarks
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Notes regarding attendance record update..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                rows={3}
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
                className={`px-5 py-2 text-white text-xs font-semibold rounded-xl ${
                  actionType === 'Approved' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {submitting ? 'Updating Record...' : `Confirm ${actionType}`}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default MissedPunchRequests;
