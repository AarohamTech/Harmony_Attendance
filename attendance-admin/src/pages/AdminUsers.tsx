import React, { useEffect, useState } from 'react';
import { ShieldCheck, UserPlus, Key, Edit2, CheckCircle, XCircle } from 'lucide-react';
import DataTable, { Column } from '../components/DataTable';
import Modal from '../components/Modal';
import ErrorMessage from '../components/ErrorMessage';
import { employeeApi } from '../api/employeeApi';
import { Employee } from '../types';
import { formatDate } from '../utils/formatDate';

export const AdminUsers: React.FC = () => {
  const [adminUsers, setAdminUsers] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Employee | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const [formData, setFormData] = useState({
    employee_code: '',
    full_name: '',
    email: '',
    phone: '',
    department: 'Management',
    designation: 'Admin',
    password: '',
  });

  const [submitting, setSubmitting] = useState(false);

  const fetchAdminUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await employeeApi.getAdminUsers();
      setAdminUsers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch admin users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminUsers();
  }, []);

  const handleOpenAddModal = () => {
    setFormData({
      employee_code: `ADM${Math.floor(100 + Math.random() * 900)}`,
      full_name: '',
      email: '',
      phone: '',
      department: 'Management',
      designation: 'Admin',
      password: '1234',
    });
    setIsModalOpen(true);
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await employeeApi.createEmployee({
        ...formData,
        status: 'Active',
      });
      setIsModalOpen(false);
      fetchAdminUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to create admin user.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenResetPassword = (user: Employee) => {
    setSelectedUser(user);
    setNewPassword('1234');
    setIsResetModalOpen(true);
  };

  const handleConfirmResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !newPassword) return;

    setSubmitting(true);
    try {
      await employeeApi.updateEmployee(selectedUser.employee_id, {
        password: newPassword,
      });
      setIsResetModalOpen(false);
      alert(`Password for ${selectedUser.full_name} has been reset successfully.`);
    } catch (err: any) {
      alert(err.message || 'Password reset failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const columns: Column<Employee>[] = [
    {
      header: 'Admin Name',
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {row.full_name?.charAt(0) || 'A'}
          </div>
          <div>
            <div className="font-bold text-slate-900">{row.full_name}</div>
            <div className="text-xs text-slate-400">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Employee Code',
      accessor: (row) => <span className="font-mono text-xs font-bold text-sky-700">{row.employee_code}</span>,
    },
    {
      header: 'Department / Role',
      accessor: (row) => (
        <div>
          <span className="font-semibold text-slate-800 text-xs block">{row.designation || 'Administrator'}</span>
          <span className="text-[11px] text-slate-400">{row.department || 'Management'}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (row) => (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
            row.status === 'Active'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {row.status || 'Active'}
        </span>
      ),
    },
    {
      header: 'Created On',
      accessor: (row) => <span className="text-xs text-slate-500">{formatDate(row.created_at)}</span>,
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenResetPassword(row)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 rounded-xl text-xs font-semibold"
          >
            <Key className="w-3.5 h-3.5" /> Reset Password
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Admin User Management</h2>
          <p className="text-xs text-slate-500">Manage administrator accounts, roles, and security access</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-sm shadow-md"
        >
          <UserPlus className="w-4 h-4" /> Add Admin User
        </button>
      </div>

      {error ? (
        <ErrorMessage message={error} onRetry={fetchAdminUsers} />
      ) : (
        <DataTable
          columns={columns}
          data={adminUsers}
          keyExtractor={(item) => item.employee_id}
          isLoading={loading}
          emptyText="No admin accounts found."
        />
      )}

      {/* Add Admin Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Administrator User">
        <form onSubmit={handleCreateAdmin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Employee Code</label>
            <input
              type="text"
              value={formData.employee_code}
              onChange={(e) => setFormData({ ...formData, employee_code: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="e.g. John Doe"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@company.com"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Designation</label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl shadow-xs"
            >
              {submitting ? 'Creating...' : 'Create Admin User'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)} title="Reset Admin Password">
        {selectedUser && (
          <form onSubmit={handleConfirmResetPassword} className="space-y-4">
            <p className="text-xs text-slate-600">
              Resetting password for <strong>{selectedUser.full_name}</strong> ({selectedUser.email}).
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">New Password</label>
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl"
              >
                {submitting ? 'Resetting...' : 'Update Password'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default AdminUsers;
