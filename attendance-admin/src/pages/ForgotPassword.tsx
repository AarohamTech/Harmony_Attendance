import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
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
    <div className="min-h-screen bg-[#faf8ff] flex items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
      {/* Harmony Background Orbs */}
      <div className="absolute top-[-60px] left-[-60px] w-80 h-80 rounded-full bg-[#dbe1ff]/60 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-80px] right-[-80px] w-96 h-96 rounded-full bg-[#d0e1fb]/60 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-[#c3c6d7] p-8 z-10 relative">
        <Link
          to="/admin/login"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2563eb] hover:underline mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Sign In
        </Link>

        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#2563eb] text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-blue-500/20">
            <Mail className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#191b23] tracking-tight">Reset Admin Password</h1>
          <p className="text-xs font-semibold text-[#434655] mt-1">Admin Account Password Recovery</p>
        </div>

        {message ? (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-3xl text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
            <h3 className="text-base font-extrabold text-emerald-900 mb-1">Request Submitted</h3>
            <p className="text-xs font-semibold text-emerald-700 leading-relaxed mb-4">{message}</p>
            <Link
              to="/admin/login"
              className="inline-block px-5 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-extrabold rounded-full transition-all"
            >
              Return to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-extrabold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <p className="text-xs font-semibold text-[#434655] leading-relaxed">
              Enter your registered work email or employee code. We will process your account password recovery.
            </p>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[#434655] mb-1.5">
                Work Email / Employee Code
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@company.com"
                  className="w-full pl-10 pr-4 py-3 bg-[#faf8ff] border border-[#c3c6d7] rounded-xl text-sm text-[#191b23] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb] transition-all font-medium"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-extrabold rounded-full text-sm shadow-md transition-all mt-2"
            >
              {loading ? 'Sending Request...' : 'Send Password Reset Request'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
