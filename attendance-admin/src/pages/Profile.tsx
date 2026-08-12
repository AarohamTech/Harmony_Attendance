import React, { useState } from 'react';
import { User, Mail, Phone, Building, Key, CheckCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { employeeApi } from '../api/employeeApi';

export const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [designation, setDesignation] = useState(user?.designation || '');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (password && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await employeeApi.updateEmployee(user.employee_id, {
        full_name: fullName,
        phone,
        department,
        designation,
        password: password || undefined,
      });

      if (res.data) {
        updateUser(res.data);
      }
      setMessage('Profile updated successfully!');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Admin Account Profile</h2>
        <p className="text-xs text-slate-500">Manage your administrative profile and security credentials</p>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-sky-600 text-white font-bold text-xl flex items-center justify-center shadow-md">
            {user?.full_name?.charAt(0) || 'A'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">{user?.full_name}</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                {user?.designation || 'Administrator'}
              </span>
            </div>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">Code: {user?.employee_code}</p>
          </div>
        </div>

        {message && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Designation</label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>

          <hr className="my-6 border-slate-100" />

          <h4 className="text-sm font-bold text-slate-800">Change Admin Password</h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-xs shadow-md transition-all"
            >
              {loading ? 'Saving Profile...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
