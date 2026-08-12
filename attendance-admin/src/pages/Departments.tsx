import React, { useEffect, useState } from 'react';
import { Building2, Plus, Edit2, Trash2, Users } from 'lucide-react';
import DataTable, { Column } from '../components/DataTable';
import Modal from '../components/Modal';
import ErrorMessage from '../components/ErrorMessage';
import { departmentApi } from '../api/departmentApi';
import { Department } from '../types';

export const Departments: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deptName, setDeptName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDepartments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await departmentApi.getDepartments();
      setDepartments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch departments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleOpenAddModal = () => {
    setEditingDept(null);
    setDeptName('');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (d: Department) => {
    setEditingDept(d);
    setDeptName(d.department_name);
    setDescription(d.description || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim()) return;

    setSubmitting(true);
    try {
      if (editingDept) {
        await departmentApi.updateDepartment(editingDept.department_id, {
          department_name: deptName,
          description,
        });
      } else {
        await departmentApi.createDepartment({
          department_name: deptName,
          description,
        });
      }
      setIsModalOpen(false);
      fetchDepartments();
    } catch (err: any) {
      alert(err.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (d: Department) => {
    if (confirm(`Are you sure you want to delete department "${d.department_name}"?`)) {
      try {
        await departmentApi.deleteDepartment(d.department_id);
        fetchDepartments();
      } catch (err: any) {
        alert(err.message || 'Failed to delete department.');
      }
    }
  };

  const columns: Column<Department>[] = [
    {
      header: 'Department Name',
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-slate-900">{row.department_name}</div>
            <div className="text-xs text-slate-400">{row.description || 'Enterprise Division'}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Active Staff Count',
      accessor: (row) => (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 font-semibold text-slate-800 rounded-full text-xs">
          <Users className="w-3.5 h-3.5 text-slate-500" />
          {row.employee_count || 0} Staff
        </span>
      ),
    },
    {
      header: 'Department Manager',
      accessor: (row) => <span className="text-xs font-medium text-slate-700">{row.manager_name || 'N/A'}</span>,
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenEditModal(row)}
            className="p-1.5 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-lg"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Department Management</h2>
          <p className="text-xs text-slate-500">Manage organizational departments and department managers</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-sm shadow-md"
        >
          <Plus className="w-4 h-4" /> Add Department
        </button>
      </div>

      {error ? (
        <ErrorMessage message={error} onRetry={fetchDepartments} />
      ) : (
        <DataTable
          columns={columns}
          data={departments}
          keyExtractor={(item) => item.department_id}
          isLoading={loading}
          emptyText="No departments found in PostgreSQL database."
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDept ? 'Edit Department' : 'Add New Department'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Department Name</label>
            <input
              type="text"
              value={deptName}
              onChange={(e) => setDeptName(e.target.value)}
              placeholder="e.g. Quality Assurance"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of department responsibilities..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              rows={3}
            />
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
              {submitting ? 'Saving...' : editingDept ? 'Save Changes' : 'Create Department'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Departments;
