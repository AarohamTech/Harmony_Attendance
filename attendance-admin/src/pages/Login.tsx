import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, Sparkles, ShieldAlert } from 'lucide-react';
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

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

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
        setError('Access denied. Administrator privileges are required to enter the HRMS portal.');
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
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Top Header */}
        <div className="bg-gradient-to-br from-slate-900 via-sky-950 to-indigo-950 p-8 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg ring-4 ring-white/10">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Harmony AI Attendance</h1>
          <p className="text-xs uppercase tracking-widest font-semibold text-sky-400 mt-1">
            Secure HRMS Admin Portal
          </p>
        </div>

        {/* Login Form */}
        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Admin Email / Employee Code
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={credential}
                  onChange={(e) => setCredential(e.target.value)}
                  placeholder="alice@company.com or EMP101"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Password / PIN
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-transparent transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-sky-500 border-slate-300"
                />
                Remember me
              </label>
              <Link
                to="/admin/forgot-password"
                className="font-semibold text-sky-600 hover:text-sky-700 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-semibold rounded-xl text-sm shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </div>
              ) : (
                'Sign In to Admin Portal'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Need a new Admin / Manager account?{' '}
              <Link to="/admin/register" className="font-semibold text-sky-600 hover:underline">
                Request Registration
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
