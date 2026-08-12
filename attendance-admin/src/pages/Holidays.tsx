import React, { useEffect, useState } from 'react';
import { Calendar, Plus, Edit2, Trash2, Search, RefreshCw } from 'lucide-react';
import DataTable, { Column } from '../components/DataTable';
import Modal from '../components/Modal';
import ErrorMessage from '../components/ErrorMessage';
import { holidayApi } from '../api/holidayApi';
import { Holiday } from '../types';
import { formatDate, formatDay } from '../utils/formatDate';

export const Holidays: React.FC = () => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [formData, setFormData] = useState({
    holiday_name: '',
    holiday_date: '',
    holiday_type: 'National',
  });
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchHolidays = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await holidayApi.getHolidays();
      setHolidays(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Failed to load company holidays.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const handleOpenAddModal = () => {
    setEditingHoliday(null);
    setFormData({
      holiday_name: '',
      holiday_date: new Date().toISOString().slice(0, 10),
      holiday_type: 'National',
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (h: Holiday) => {
    setEditingHoliday(h);
    setFormData({
      holiday_name: h.holiday_name,
      holiday_date: h.holiday_date ? String(h.holiday_date).slice(0, 10) : '',
      holiday_type: h.holiday_type || 'National',
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.holiday_name || !formData.holiday_date) {
      setModalError('Holiday name and date are required.');
      return;
    }

    setSubmitting(true);
    setModalError(null);
    try {
      if (editingHoliday) {
        await holidayApi.updateHoliday(editingHoliday.holiday_id, formData);
      } else {
        await holidayApi.createHoliday(formData);
      }
      setIsModalOpen(false);
      fetchHolidays();
    } catch (err: any) {
      setModalError(err.response?.data?.message || err.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (h: Holiday) => {
    if (confirm(`Are you sure you want to delete holiday "${h.holiday_name}"?`)) {
      try {
        await holidayApi.deleteHoliday(h.holiday_id);
        fetchHolidays();
      } catch (err: any) {
        alert(err.message || 'Failed to delete holiday.');
      }
    }
  };

  const filteredHolidays = holidays.filter((h) =>
    h.holiday_name.toLowerCase().includes(search.toLowerCase()) ||
    (h.holiday_type && h.holiday_type.toLowerCase().includes(search.toLowerCase()))
  );

  const columns: Column<Holiday>[] = [
    {
      header: 'Holiday Name',
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-2xl bg-[#2563eb]/10 text-[#2563eb] font-bold flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <div className="font-extrabold text-[#191b23] text-sm">{row.holiday_name}</div>
            <div className="text-[11px] font-semibold text-[#434655]">{row.holiday_type || 'National'}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Date & Day',
      accessor: (row) => (
        <div>
          <div className="font-extrabold text-[#191b23] text-sm">{formatDate(row.holiday_date)}</div>
          <div className="text-[11px] font-bold text-[#2563eb]">{formatDay(row.holiday_date)}</div>
        </div>
      ),
    },
    {
      header: 'Type Badge',
      accessor: (row) => {
        const t = row.holiday_type || 'National';
        let bg = 'bg-blue-50 text-blue-700 border-blue-200';
        if (t === 'Public' || t === 'National') bg = 'bg-purple-50 text-purple-700 border-purple-200';
        if (t === 'Optional') bg = 'bg-amber-50 text-amber-700 border-amber-200';

        return (
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold border ${bg}`}>
            {t}
          </span>
        );
      },
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenEditModal(row)}
            className="p-1.5 text-slate-500 hover:text-[#2563eb] hover:bg-[#ededf9] rounded-xl transition-colors"
            title="Edit Holiday"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            title="Delete Holiday"
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
          <h2 className="text-xl font-extrabold text-[#191b23] tracking-tight">Company Holidays</h2>
          <p className="text-xs font-semibold text-[#434655]">Manage official holidays and non-working days</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-extrabold text-xs rounded-full shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Holiday</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-[#c3c6d7]/70 p-4 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search holiday name or type..."
            className="w-full pl-10 pr-4 py-2 bg-[#faf8ff] border border-[#c3c6d7] rounded-full text-xs text-[#191b23] focus:outline-none focus:border-[#2563eb]"
          />
        </div>
        <button
          onClick={fetchHolidays}
          className="p-2 text-slate-500 hover:text-[#2563eb] bg-[#faf8ff] hover:bg-[#ededf9] border border-[#c3c6d7] rounded-xl transition-colors"
          title="Refresh List"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {error ? (
        <ErrorMessage message={error} onRetry={fetchHolidays} />
      ) : (
        <DataTable
          columns={columns}
          data={filteredHolidays}
          keyExtractor={(item) => item.holiday_id}
          isLoading={loading}
          emptyText="No company holidays configured."
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingHoliday ? 'Edit Company Holiday' : 'Add New Company Holiday'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {modalError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl">
              {modalError}
            </div>
          )}

          <div>
            <label className="block text-xs font-extrabold text-[#434655] uppercase mb-1.5">Holiday Name</label>
            <input
              type="text"
              value={formData.holiday_name}
              onChange={(e) => setFormData({ ...formData, holiday_name: e.target.value })}
              placeholder="e.g. Independence Day, Diwali, Christmas"
              className="w-full px-4 py-2.5 bg-[#faf8ff] border border-[#c3c6d7] rounded-xl text-sm text-[#191b23] focus:outline-none focus:border-[#2563eb]"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-[#434655] uppercase mb-1.5">Holiday Date</label>
              <input
                type="date"
                value={formData.holiday_date}
                onChange={(e) => setFormData({ ...formData, holiday_date: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#faf8ff] border border-[#c3c6d7] rounded-xl text-sm text-[#191b23] focus:outline-none focus:border-[#2563eb]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-[#434655] uppercase mb-1.5">Holiday Type</label>
              <select
                value={formData.holiday_type}
                onChange={(e) => setFormData({ ...formData, holiday_type: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#faf8ff] border border-[#c3c6d7] rounded-xl text-sm text-[#191b23] focus:outline-none focus:border-[#2563eb]"
              >
                <option value="National">National Holiday</option>
                <option value="Public">Public Holiday</option>
                <option value="Festival">Festival Holiday</option>
                <option value="Optional">Optional Holiday</option>
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
              {submitting ? 'Saving...' : editingHoliday ? 'Update Holiday' : 'Save Holiday'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Holidays;
