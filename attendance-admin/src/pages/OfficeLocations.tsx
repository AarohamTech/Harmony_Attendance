import React, { useEffect, useState } from 'react';
import { MapPin, Plus, Edit2, Trash2, ShieldCheck } from 'lucide-react';
import DataTable, { Column } from '../components/DataTable';
import Modal from '../components/Modal';
import ErrorMessage from '../components/ErrorMessage';
import { officeApi } from '../api/officeApi';
import { OfficeLocation } from '../types';

export const OfficeLocations: React.FC = () => {
  const [offices, setOffices] = useState<OfficeLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffice, setEditingOffice] = useState<OfficeLocation | null>(null);
  const [formData, setFormData] = useState({
    office_name: '',
    address: '',
    latitude: 16.740572,
    longitude: 74.246919,
    allowed_radius: 300,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchOffices = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await officeApi.getOffices();
      setOffices(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch office locations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffices();
  }, []);

  const handleOpenAddModal = () => {
    setEditingOffice(null);
    setFormData({
      office_name: '',
      address: '',
      latitude: 16.740572,
      longitude: 74.246919,
      allowed_radius: 300,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (off: OfficeLocation) => {
    setEditingOffice(off);
    setFormData({
      office_name: off.office_name,
      address: off.address || '',
      latitude: off.latitude,
      longitude: off.longitude,
      allowed_radius: off.allowed_radius,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.office_name.trim()) return;

    setSubmitting(true);
    try {
      if (editingOffice) {
        await officeApi.updateOffice(editingOffice.office_id, formData);
      } else {
        await officeApi.createOffice(formData);
      }
      setIsModalOpen(false);
      fetchOffices();
    } catch (err: any) {
      alert(err.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (off: OfficeLocation) => {
    if (confirm(`Delete office location "${off.office_name}"?`)) {
      try {
        await officeApi.deleteOffice(off.office_id);
        fetchOffices();
      } catch (err: any) {
        alert(err.message || 'Failed to delete office location.');
      }
    }
  };

  const columns: Column<OfficeLocation>[] = [
    {
      header: 'Office Name',
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-slate-900">{row.office_name}</div>
            <div className="text-xs text-slate-400 max-w-xs truncate">{row.address || 'Campus Campus'}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Geofence Radius',
      accessor: (row) => (
        <span className="font-mono text-xs font-semibold px-2.5 py-1 bg-sky-50 text-sky-700 rounded-lg border border-sky-200">
          {row.allowed_radius} meters
        </span>
      ),
    },
    {
      header: 'Coordinates',
      accessor: (row) => (
        <div className="font-mono text-xs text-slate-600">
          {Number(row.latitude).toFixed(6)}° N, {Number(row.longitude).toFixed(6)}° E
        </div>
      ),
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
          <h2 className="text-xl font-bold text-slate-900">GPS Geo-fencing & Offices</h2>
          <p className="text-xs text-slate-500">Configure geofenced office premises for location-based biometric punches</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-sm shadow-md"
        >
          <Plus className="w-4 h-4" /> Add Office Premises
        </button>
      </div>

      {error ? (
        <ErrorMessage message={error} onRetry={fetchOffices} />
      ) : (
        <DataTable
          columns={columns}
          data={offices}
          keyExtractor={(item) => item.office_id}
          isLoading={loading}
          emptyText="No office locations found in PostgreSQL database."
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingOffice ? 'Edit Office Location' : 'Register New Office Location'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Office Premises Name</label>
            <input
              type="text"
              value={formData.office_name}
              onChange={(e) => setFormData({ ...formData, office_name: e.target.value })}
              placeholder="e.g. Padalkar Colony HQ"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Street Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. Padalkar Colony, Campus Road"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Geofence Radius Limit (Meters)
            </label>
            <input
              type="number"
              value={formData.allowed_radius}
              onChange={(e) => setFormData({ ...formData, allowed_radius: parseInt(e.target.value, 10) })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
              required
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
              {submitting ? 'Saving...' : editingOffice ? 'Save Office Location' : 'Create Location'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default OfficeLocations;
