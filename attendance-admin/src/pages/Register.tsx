import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-react';
import { authApi } from '../api/authApi';

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    employee_code: '',
    email: '',
    phone: '',
    department: 'Engineering',
    designation: 'Software Developer',
    password: '',
    confirm_password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match.');
      return;
    }
    if (formData.password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Public registration ALWAYS creates role = 'Employee'
      await authApi.registerAdmin({
        full_name: formData.full_name,
        name: formData.full_name,
        employee_code: formData.employee_code,
        employeeId: formData.employee_code,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        designation: formData.designation,
        role: 'Employee',
        password: formData.password,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/login');
      }, 2500);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8">
        <div className="bg-gradient-to-br from-slate-900 via-sky-950 to-indigo-950 p-6 text-white text-center">
          <Link
            to="/admin/login"
            className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 mb-3 float-left"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
          <div className="clear-both" />
          <div className="w-12 h-12 rounded-2xl bg-sky-600 flex items-center justify-center mx-auto mb-2 shadow-md">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold">Employee Account Registration</h1>
          <p className="text-xs text-sky-300 mt-0.5">Public Self-Registration (Role: Employee)</p>
        </div>

        <div className="p-6">
          {success ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
              <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-emerald-900 mb-1">Registration Successful!</h3>
              <p className="text-sm text-emerald-700">
                Your employee account has been created. Redirecting to login page...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="e.g. Sarah Connor"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-600 focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Employee Code</label>
                  <input
                    type="text"
                    name="employee_code"
                    value={formData.employee_code}
                    onChange={handleChange}
                    placeholder="e.g. EMP201"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-600 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Work Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="sarah@company.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-600 focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 9876543210"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Department</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Designation</label>
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-600 focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Confirm Password</label>
                  <input
                    type="password"
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-600 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-sky-800 text-xs">
                Note: Public registration assigns role <strong>Employee</strong>. Administrative roles (Admin, HR, Manager) can only be granted by an existing Admin.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-sm shadow-md transition-all mt-4"
              >
                {loading ? 'Registering Account...' : 'Register Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
