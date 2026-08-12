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
      await authApi.registerEmployee({
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
    <div className="min-h-screen bg-[#faf8ff] flex items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
      {/* Harmony Decorative Orbs */}
      <div className="absolute top-[-60px] left-[-60px] w-80 h-80 rounded-full bg-[#dbe1ff]/60 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-80px] right-[-80px] w-96 h-96 rounded-full bg-[#d0e1fb]/60 blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-[#c3c6d7] p-8 z-10 relative my-8">
        <Link
          to="/admin/login"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2563eb] hover:underline mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Sign In
        </Link>

        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#2563eb] text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-blue-500/20">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#191b23] tracking-tight">Employee Account Registration</h1>
          <p className="text-xs font-semibold text-[#434655] mt-1">Public Self-Registration (Role: Employee)</p>
        </div>

        {success ? (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-3xl text-center">
            <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-xs">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-emerald-900 mb-1">Registration Successful!</h3>
            <p className="text-xs font-semibold text-emerald-700">
              Your employee account has been created in Supabase database. Redirecting to login...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-extrabold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-[#434655] uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="e.g. Sarah Connor"
                  className="w-full px-3.5 py-2.5 bg-[#faf8ff] border border-[#c3c6d7] rounded-xl text-sm text-[#191b23] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] font-medium"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-[#434655] uppercase mb-1">Employee Code</label>
                <input
                  type="text"
                  name="employee_code"
                  value={formData.employee_code}
                  onChange={handleChange}
                  placeholder="e.g. EMP201"
                  className="w-full px-3.5 py-2.5 bg-[#faf8ff] border border-[#c3c6d7] rounded-xl text-sm text-[#191b23] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] font-medium"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-[#434655] uppercase mb-1">Work Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="sarah@company.com"
                  className="w-full px-3.5 py-2.5 bg-[#faf8ff] border border-[#c3c6d7] rounded-xl text-sm text-[#191b23] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] font-medium"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-[#434655] uppercase mb-1">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 9876543210"
                  className="w-full px-3.5 py-2.5 bg-[#faf8ff] border border-[#c3c6d7] rounded-xl text-sm text-[#191b23] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-[#434655] uppercase mb-1">Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-[#faf8ff] border border-[#c3c6d7] rounded-xl text-sm text-[#191b23] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-[#434655] uppercase mb-1">Designation</label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-[#faf8ff] border border-[#c3c6d7] rounded-xl text-sm text-[#191b23] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-[#434655] uppercase mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-[#faf8ff] border border-[#c3c6d7] rounded-xl text-sm text-[#191b23] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] font-medium"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-[#434655] uppercase mb-1">Confirm Password</label>
                <input
                  type="password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-[#faf8ff] border border-[#c3c6d7] rounded-xl text-sm text-[#191b23] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] font-medium"
                  required
                />
              </div>
            </div>

            <div className="p-3 bg-[#ededf9] border border-[#c3c6d7]/60 rounded-2xl text-[#434655] text-xs font-semibold">
              Note: Self-registration assigns role <strong>Employee</strong>. Administrative roles (Admin, HR, Manager) must be assigned by an existing Admin in the Admin Dashboard.
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-extrabold rounded-full text-sm shadow-md transition-all mt-4"
            >
              {loading ? 'Registering Account...' : 'Register Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;
