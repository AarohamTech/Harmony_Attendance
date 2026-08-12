import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, ShieldAlert } from 'lucide-react';
import { authApi } from '../api/authApi';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await authApi.forgotPassword(email);
      setMessage(res.message || 'Password reset request submitted successfully.');
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-br from-slate-900 via-sky-950 to-indigo-950 p-6 text-white text-center">
          <Link
            to="/admin/login"
            className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 mb-3 float-left"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
          <div className="clear-both" />
          <div className="w-12 h-12 rounded-2xl bg-sky-600 flex items-center justify-center mx-auto mb-2 shadow-md">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold">Reset Password</h1>
          <p className="text-xs text-sky-300 mt-0.5">Admin Account Password Recovery</p>
        </div>

        <div className="p-6">
          {message ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-emerald-900 mb-1">Request Received</h3>
              <p className="text-xs text-emerald-700 leading-relaxed mb-4">{message}</p>
              <Link
                to="/admin/login"
                className="inline-block px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl"
              >
                Return to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <p className="text-xs text-slate-600 leading-relaxed">
                Enter your registered admin email address. We will verify your account and send password recovery details.
              </p>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Registered Work Email
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@company.com"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-600 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-sm shadow-md transition-all"
              >
                {loading ? 'Sending Request...' : 'Send Password Reset Request'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
