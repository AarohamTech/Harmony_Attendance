import React, { useEffect, useState } from 'react';
import { UserCheck, Plus, Edit2, Trash2, Search, RefreshCw, ShieldCheck, Users, Mail, Phone } from 'lucide-react';
import DataTable, { Column } from '../components/DataTable';
import Modal from '../components/Modal';
import ErrorMessage from '../components/ErrorMessage';
import { managerApi } from '../api/managerApi';
import { departmentApi } from '../api/departmentApi';
import { Manager, Department } from '../types';

export const Managers: React.FC = () => {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingManager, setEditingManager] = useState<Manager | null>(null);
  const [formData, setFormData] = useState({
    employee_code: '',
    full_name: '',
    email: '',
    phone: '',
    department: 'Engineering',
    designation: 'Department Manager',
    role: 'Manager',
    status: 'Active',
    password: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchManagers = async () => {
    setLoading(true);
    setError(null);
    try {
      const [mgrData, deptData] = await Promise.all([
        managerApi.getManagers(),
        departmentApi.getDepartments().catch(() => []),
      ]);
      setManagers(Array.isArray(mgrData) ? mgrData : []);
      setDepartments(Array.isArray(deptData) ? deptData : []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch managers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  const handleOpenAddModal = () => {
    setEditingManager(null);
    setFormData({
      employee_code: `MGR${Math.floor(100 + Math.random() * 900)}`,
      full_name: '',
      email: '',
      phone: '',
      department: departments[0]?.department_name || 'Engineering',
      designation: 'Engineering Manager',
      role: 'Manager',
      status: 'Active',
      password: '1234',
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (m: Manager) => {
    setEditingManager(m);
    setFormData({
      employee_code: m.employee_code,
      full_name: m.full_name,
      email: m.email,
      phone: m.phone || '',
      department: m.department || 'Engineering',
      designation: m.designation || 'Manager',
      role: m.role || 'Manager',
      status: m.status || 'Active',
      password: '',
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employee_code || !formData.full_name || !formData.email) {
      setModalError('Manager Code, Full Name, and Email are required.');
      return;
    }

    setSubmitting(true);
    setModalError(null);
    try {
      if (editingManager) {
        await managerApi.updateManager(editingManager.employee_id, formData);
      } else {
        await managerApi.createManager(formData);
      }
      setIsModalOpen(false);
      fetchManagers();
    } catch (err: any) {
      setModalError(err.response?.data?.message || err.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (m: Manager) => {
    if (confirm(`Are you sure you want to remove manager rights for ${m.full_name}?`)) {
      try {
        await managerApi.deleteManager(m.employee_id);
        fetchManagers();
      } catch (err: any) {
        alert(err.message || 'Failed to remove manager.');
      }
    }
  };

  const filteredManagers = managers.filter(
    (m) =>
      m.full_name.toLowerCase().includes(search.toLowerCase()) ||
      m.employee_code.toLowerCase().includes(search.toLowerCase()) ||
      (m.department && m.department.toLowerCase().includes(search.toLowerCase()))
  );

  const columns: Column<Manager>[] = [
    {
      header: 'Manager Name',
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#2563eb] text-white font-extrabold flex items-center justify-center text-xs shadow-xs">
            {row.full_name?.charAt(0) || 'M'}
          </div>
          <div>
            <div className="font-extrabold text-[#191b23] text-sm">{row.full_name}</div>
            <div className="text-[11px] font-semibold text-[#434655]">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Code & Role',
      accessor: (row) => (
        <div>
          <span className="font-mono text-xs font-bold text-[#2563eb] bg-[#ededf9] px-2 py-0.5 rounded-md">
            {row.employee_code}
          </span>
          <div className="mt-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
              <ShieldCheck className="w-3 h-3" />
              {row.role || 'Manager'}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Assigned Department',
      accessor: (row) => (
        <span className="text-xs font-bold text-[#191b23] bg-slate-100 px-3 py-1 rounded-full">
          {row.department || 'Engineering'}
        </span>
      ),
    },
    {
      header: 'Managed Team Count',
      accessor: (row) => (
        <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60 max-w-fit">
          <Users className="w-3.5 h-3.5" />
          <span>{row.team_count || 1} Direct Reports</span>
        </div>
      ),
    },
    {
      header: 'Contact Phone',
      accessor: (row) => <span className="text-xs font-mono text-[#434655]">{row.phone || '--'}</span>,
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenEditModal(row)}
            className="p-1.5 text-slate-500 hover:text-[#2563eb] hover:bg-[#ededf9] rounded-xl transition-colors"
            title="Edit Manager & Department Assignment"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            title="Remove Manager"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#191b23] tracking-tight">Manager & Team Leaders</h2>
          <p className="text-xs font-semibold text-[#434655]">Manage department managers, team assignments, and supervisory roles</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-extrabold text-xs rounded-full shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Manager</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-[#c3c6d7]/70 p-4 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search manager name, code, or department..."
            className="w-full pl-10 pr-4 py-2 bg-[#faf8ff] border border-[#c3c6d7] rounded-full text-xs text-[#191b23] focus:outline-none focus:border-[#2563eb]"
          />
        </div>
        <button
          onClick={fetchManagers}
          className="p-2 text-slate-500 hover:text-[#2563eb] bg-[#faf8ff] hover:bg-[#ededf9] border border-[#c3c6d7] rounded-xl transition-colors"
          title="Refresh Managers"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {error ? (
        <ErrorMessage message={error} onRetry={fetchManagers} />
      ) : (
        <DataTable
          columns={columns}
          data={filteredManagers}
          keyExtractor={(item) => item.employee_id}
          isLoading={loading}
          emptyText="No managers registered in system."
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingManager ? 'Edit Manager Details' : 'Add New Department Manager'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {modalError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl">
              {modalError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-[#434655] uppercase mb-1.5">Full Name</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="e.g. Robert Vance"
                className="w-full px-4 py-2.5 bg-[#faf8ff] border border-[#c3c6d7] rounded-xl text-sm text-[#191b23] focus:outline-none focus:border-[#2563eb]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-[#434655] uppercase mb-1.5">Manager Code</label>
              <input
                type="text"
                value={formData.employee_code}
                onChange={(e) => setFormData({ ...formData, employee_code: e.target.value })}
                placeholder="MGR101"
                className="w-full px-4 py-2.5 bg-[#faf8ff] border border-[#c3c6d7] rounded-xl text-sm text-[#191b23] focus:outline-none focus:border-[#2563eb]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-[#434655] uppercase mb-1.5">Work Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="robert@company.com"
                className="w-full px-4 py-2.5 bg-[#faf8ff] border border-[#c3c6d7] rounded-xl text-sm text-[#191b23] focus:outline-none focus:border-[#2563eb]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-[#434655] uppercase mb-1.5">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 9876543210"
                className="w-full px-4 py-2.5 bg-[#faf8ff] border border-[#c3c6d7] rounded-xl text-sm text-[#191b23] focus:outline-none focus:border-[#2563eb]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-[#434655] uppercase mb-1.5">Assigned Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#faf8ff] border border-[#c3c6d7] rounded-xl text-sm text-[#191b23] focus:outline-none focus:border-[#2563eb]"
              >
                {departments.map((d) => (
                  <option key={d.department_id} value={d.department_name}>
                    {d.department_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-extrabold text-[#434655] uppercase mb-1.5">Role Authorization</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#faf8ff] border border-[#c3c6d7] rounded-xl text-sm text-[#191b23] focus:outline-none focus:border-[#2563eb]"
              >
                <option value="Manager">Manager</option>
                <option value="HR">HR Administrator</option>
                <option value="Admin">System Admin</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 border border-[#c3c6d7] text-[#434655] text-xs font-bold rounded-full hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-extrabold rounded-full shadow-sm"
            >
              {submitting ? 'Saving Manager...' : editingManager ? 'Update Manager' : 'Save Manager'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Managers;
