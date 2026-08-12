import React, { useEffect, useState } from 'react';
import { Settings as SettingsIcon, Save, CheckCircle2 } from 'lucide-react';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { settingsApi } from '../api/settingsApi';
import { CompanySettings } from '../types';

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<CompanySettings>({
    company_name: 'Harmony AI Attendance',
    shift_start: '09:00:00',
    shift_end: '18:00:00',
    grace_period_mins: 15,
    weekly_off: 'Sunday',
    leave_policy_days: 24,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await settingsApi.getSettings();
      if (data) {
        setSettings(data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      await settingsApi.updateSettings(settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading text="Loading company configuration from PostgreSQL..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchSettings} />;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">System & Attendance Rules</h2>
          <p className="text-xs text-slate-500">Configure global shift timings, grace periods, and leave rules</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Company settings updated and saved to PostgreSQL!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">
              Organization Details
            </h3>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Company / Organization Name</label>
              <input
                type="text"
                value={settings.company_name}
                onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                required
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">
              Default Shift & Grace Rules
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Shift Start Time</label>
                <input
                  type="time"
                  value={settings.shift_start}
                  onChange={(e) => setSettings({ ...settings, shift_start: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Shift End Time</label>
                <input
                  type="time"
                  value={settings.shift_end}
                  onChange={(e) => setSettings({ ...settings, shift_end: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Grace Period (Minutes)
                </label>
                <input
                  type="number"
                  value={settings.grace_period_mins}
                  onChange={(e) => setSettings({ ...settings, grace_period_mins: parseInt(e.target.value, 10) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">
              Leave & Calendar Settings
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Standard Weekly Off</label>
                <select
                  value={settings.weekly_off}
                  onChange={(e) => setSettings({ ...settings, weekly_off: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                >
                  <option value="Sunday">Sunday</option>
                  <option value="Saturday">Saturday</option>
                  <option value="Monday">Monday</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Annual Paid Leave Quota (Days)
                </label>
                <input
                  type="number"
                  value={settings.leave_policy_days}
                  onChange={(e) => setSettings({ ...settings, leave_policy_days: parseInt(e.target.value, 10) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  required
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-xs shadow-md transition-all"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving Configuration...' : 'Save Settings to PostgreSQL'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
