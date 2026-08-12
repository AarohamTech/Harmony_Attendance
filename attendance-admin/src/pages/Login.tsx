import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/authApi';
import { isAdminUser } from '../utils/auth';

export const Login: React.FC = () => {
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isExpired = new URLSearchParams(location.search).get('expired') === '1';

  useEffect(() => {
    if (isAuthenticated && !isExpired) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, isExpired, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credential || !password) {
      setError('Please fill in both email/employee code and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await authApi.login(credential, password);
      const token = res.token || res.access_token;
      const user = res.employee;

      if (!token || !user) {
        throw new Error('Invalid server authentication response.');
      }

      if (!isAdminUser(user)) {
        setError('Access denied. Administrator privileges (Admin, HR, or Manager) are required to enter.');
        setLoading(false);
        return;
      }

      login(token, user);
      const from = (location.state as any)?.from?.pathname || '/admin/dashboard';
      navigate(from, { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Unable to connect to attendance server.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8ff] flex items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
      {/* Harmony Background Orbs */}
      <div className="absolute top-[-60px] left-[-60px] w-80 h-80 rounded-full bg-[#dbe1ff]/60 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-80px] right-[-80px] w-96 h-96 rounded-full bg-[#d0e1fb]/60 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-[#c3c6d7] p-8 z-10 relative">
        {/* Logo & Heading */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-[#2563eb] text-white flex items-center justify-center mx-auto mb-4 shadow-md shadow-blue-500/20">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#191b23] tracking-tight">Harmony AI Attendance</h1>
          <p className="text-xs font-semibold text-[#434655] mt-1">
            Secure Biometric & Cloud HRMS Portal
          </p>
        </div>

        {/* Error / Notification Banner */}
        {(error || isExpired) && (
          <div className={`mb-6 p-4 rounded-2xl text-xs font-extrabold flex items-start gap-2.5 ${
            error ? 'bg-rose-50 border border-rose-200 text-rose-700' : 'bg-amber-50 border border-amber-200 text-amber-800'
          }`}>
            <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${error ? 'text-rose-600' : 'text-amber-600'}`} />
            <span>{error || 'Your session has expired. Please sign in again to continue.'}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-[#434655] mb-1.5">
              Employee Code or Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={credential}
                onChange={(e) => setCredential(e.target.value)}
                placeholder="e.g. EMP101 or alice@company.com"
                className="w-full pl-10 pr-4 py-3 bg-[#faf8ff] border border-[#c3c6d7] rounded-xl text-sm text-[#191b23] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition-all font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-[#434655] mb-1.5">
              Password or PIN
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••••••• (Default: 1234)"
                className="w-full pl-10 pr-10 py-3 bg-[#faf8ff] border border-[#c3c6d7] rounded-xl text-sm text-[#191b23] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition-all font-medium"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 text-[#434655] font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded text-[#2563eb] focus:ring-[#2563eb] border-[#c3c6d7]"
              />
              Remember me
            </label>
            <Link
              to="/admin/forgot-password"
              className="font-bold text-[#2563eb] hover:underline"
            >
              Forgot Password / PIN?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-[#2563eb] hover:bg-[#1d4ed8] active:bg-blue-800 text-white font-extrabold rounded-full text-sm shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Authenticating Admin...</span>
              </div>
            ) : (
              <span>Sign In to Admin Portal</span>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          <p className="text-xs font-semibold text-[#434655]">
            Don&apos;t have an admin account?{' '}
            <Link to="/admin/register" className="font-bold text-[#2563eb] hover:underline">
              Register Admin Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
