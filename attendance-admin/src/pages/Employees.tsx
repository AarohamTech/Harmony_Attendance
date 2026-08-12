import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus,
  Search,
  Eye,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Filter,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import DataTable, { Column } from '../components/DataTable';
import Modal from '../components/Modal';
import ErrorMessage from '../components/ErrorMessage';
import { employeeApi } from '../api/employeeApi';
import { departmentApi } from '../api/departmentApi';
import { officeApi } from '../api/officeApi';
import { Employee, Department, OfficeLocation } from '../types';
import { formatDate } from '../utils/formatDate';

export const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [offices, setOffices] = useState<OfficeLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    employee_code: '',
    full_name: '',
    email: '',
    phone: '',
    department: 'Engineering',
    designation: 'Developer',
    role: 'Employee',
    office_id: '',
    shift_start: '09:00:00',
    shift_end: '18:00:00',
    weekly_off: 'Sunday',
    status: 'Active',
    password: '',
  });

  const navigate = useNavigate();

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await employeeApi.getEmployees({
        page,
        limit: 20,
        search,
        department: selectedDept,
        status: selectedStatus,
      });
      setEmployees(res.data || []);
      if (res.pagination) {
        setTotalPages(res.pagination.totalPages || 1);
      }
    } catch (err: any) {
      setError(err.message || 'Unable to fetch employees.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFiltersData = async () => {
    try {
      const [deptRes, officeRes] = await Promise.all([
        departmentApi.getDepartments(),
        officeApi.getOffices(),
      ]);
      setDepartments(deptRes);
      setOffices(officeRes);
    } catch (e) {
      // ignore filter loading errors
    }
  };

  useEffect(() => {
    fetchFiltersData();
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [page, search, selectedDept, selectedStatus]);

  const handleOpenAddModal = () => {
    setEditingEmployee(null);
    setFormData({
      employee_code: `EMP${Math.floor(1000 + Math.random() * 9000)}`,
      full_name: '',
      email: '',
      phone: '',
      department: departments[0]?.department_name || 'Engineering',
      designation: 'Software Engineer',
      role: 'Employee',
      office_id: offices[0]?.office_id ? String(offices[0].office_id) : '',
      shift_start: '09:00:00',
      shift_end: '18:00:00',
      weekly_off: 'Sunday',
      status: 'Active',
      password: '1234',
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({
      employee_code: emp.employee_code,
      full_name: emp.full_name,
      email: emp.email,
      phone: emp.phone || '',
      department: emp.department || 'Engineering',
      designation: emp.designation || 'Employee',
      role: emp.role || 'Employee',
      office_id: emp.office_id ? String(emp.office_id) : '',
      shift_start: emp.shift_start || '09:00:00',
      shift_end: emp.shift_end || '18:00:00',
      weekly_off: emp.weekly_off || 'Sunday',
      status: emp.status || 'Active',
      password: '',
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employee_code || !formData.full_name || !formData.email) {
      setModalError('Employee Code, Name, and Email are required.');
      return;
    }

    setSubmitting(true);
    setModalError(null);

    try {
      if (editingEmployee) {
        await employeeApi.updateEmployee(editingEmployee.employee_id, {
          ...formData,
          office_id: formData.office_id ? parseInt(formData.office_id, 10) : undefined,
        });
      } else {
        await employeeApi.createEmployee({
          ...formData,
          office_id: formData.office_id ? parseInt(formData.office_id, 10) : undefined,
        });
      }
      setIsModalOpen(false);
      fetchEmployees();
    } catch (err: any) {
      setModalError(err.response?.data?.message || err.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (emp: Employee) => {
    const nextStatus = emp.status === 'Active' ? 'Inactive' : 'Active';
    if (confirm(`Are you sure you want to change status of ${emp.full_name} to ${nextStatus}?`)) {
      try {
        await employeeApi.toggleStatus(emp.employee_id, nextStatus as any);
        fetchEmployees();
      } catch (err: any) {
        alert(err.message || 'Failed to update status.');
      }
    }
  };

  const handleDelete = async (emp: Employee) => {
    if (confirm(`Are you sure you want to permanently delete employee ${emp.full_name} (${emp.employee_code})?`)) {
      try {
        await employeeApi.deleteEmployee(emp.employee_id);
        fetchEmployees();
      } catch (err: any) {
        alert(err.message || 'Failed to delete employee.');
      }
    }
  };

  const columns: Column<Employee>[] = [
    {
      header: 'Employee Code',
      accessor: (row) => (
        <span className="font-mono font-bold text-sky-700 bg-sky-50 px-2 py-1 rounded-md text-xs">
          {row.employee_code}
        </span>
      ),
    },
    {
      header: 'Name',
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-xs">
            {row.full_name?.charAt(0) || 'E'}
          </div>
          <div>
            <div className="font-semibold text-slate-900">{row.full_name}</div>
            <div className="text-xs text-slate-400">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Role',
      accessor: (row) => {
        const role = row.role || 'Employee';
        let style = 'bg-slate-100 text-slate-700 border-slate-200';
        if (role === 'Admin') style = 'bg-indigo-50 text-indigo-700 border-indigo-200';
        else if (role === 'HR') style = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        else if (role === 'Manager') style = 'bg-amber-50 text-amber-700 border-amber-200';

        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${style}`}>
            <ShieldCheck className="w-3 h-3" />
            {role}
          </span>
        );
      },
    },
    {
      header: 'Department',
      accessor: (row) => <span className="font-medium text-slate-700">{row.department || 'Engineering'}</span>,
    },
    {
      header: 'Designation',
      accessor: (row) => <span className="text-slate-600 text-xs">{row.designation || 'Staff'}</span>,
    },
    {
      header: 'Phone',
      accessor: (row) => <span className="text-slate-600 text-xs font-mono">{row.phone || '--'}</span>,
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
          {row.status === 'Active' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
          {row.status || 'Active'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/admin/employees/${row.employee_id}`)}
            className="p-1.5 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenEditModal(row)}
            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Edit Employee & Role"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleToggleStatus(row)}
            className={`p-1.5 rounded-lg transition-colors ${
              row.status === 'Active'
                ? 'text-slate-600 hover:text-amber-600 hover:bg-amber-50'
                : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50'
            }`}
            title={row.status === 'Active' ? 'Deactivate' : 'Activate'}
          >
            {row.status === 'Active' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Delete Employee"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Employee Directory</h2>
          <p className="text-xs text-slate-500">Manage company staff, role permissions, and access privileges</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-sm shadow-md transition-all shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          Add Employee
        </button>
      </div>

      {/* Filters bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, code or email..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-sky-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium shrink-0">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </div>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:ring-2 focus:ring-sky-600 focus:outline-none"
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
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:ring-2 focus:ring-sky-600 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <button
            onClick={fetchEmployees}
            className="p-2 text-slate-500 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
            title="Refresh Table"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Table */}
      {error ? (
        <ErrorMessage message={error} onRetry={fetchEmployees} />
      ) : (
        <DataTable
          columns={columns}
          data={employees}
          keyExtractor={(item) => item.employee_id}
          isLoading={loading}
          emptyText="No employee records found in PostgreSQL."
          pagination={{
            page,
            totalPages,
            onPageChange: (p) => setPage(p),
          }}
        />
      )}

      {/* Create / Edit Employee Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEmployee ? 'Edit Employee & Role Permissions' : 'Register New Employee'}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveEmployee} className="space-y-4">
          {modalError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
              {modalError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Employee Code</label>
              <input
                type="text"
                value={formData.employee_code}
                onChange={(e) => setFormData({ ...formData, employee_code: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Full Name</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">App Role (Permission)</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-sky-600"
              >
                <option value="Employee">Employee</option>
                <option value="Admin">Admin</option>
                <option value="HR">HR</option>
                <option value="Manager">Manager</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              >
                {departments.map((d) => (
                  <option key={d.department_id} value={d.department_name}>
                    {d.department_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Job Designation</label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Shift Start</label>
              <input
                type="time"
                value={formData.shift_start}
                onChange={(e) => setFormData({ ...formData, shift_start: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Shift End</label>
              <input
                type="time"
                value={formData.shift_end}
                onChange={(e) => setFormData({ ...formData, shift_end: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Weekly Off</label>
              <select
                value={formData.weekly_off}
                onChange={(e) => setFormData({ ...formData, weekly_off: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              >
                <option value="Sunday">Sunday</option>
                <option value="Saturday">Saturday</option>
                <option value="Monday">Monday</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
              Password {editingEmployee && '(Leave blank to keep unchanged)'}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={editingEmployee ? '••••••••' : 'Default password'}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl shadow-xs"
            >
              {submitting ? 'Saving to Database...' : editingEmployee ? 'Save Changes' : 'Create Employee'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Employees;
