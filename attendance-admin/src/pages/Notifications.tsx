import React, { useEffect, useState } from 'react';
import { Bell, CheckCheck, RefreshCw, Send, Plus, Megaphone } from 'lucide-react';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import Modal from '../components/Modal';
import { notificationApi } from '../api/notificationApi';
import { employeeApi } from '../api/employeeApi';
import { NotificationItem, Employee } from '../types';
import { formatDate } from '../utils/formatDate';

export const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Send Notification Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetEmployeeId, setTargetEmployeeId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [notifType, setNotifType] = useState('SYSTEM');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await notificationApi.getNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    employeeApi.getEmployees({ limit: 100 }).then(res => setEmployees(res.data || [])).catch(() => {});
  }, []);

  const handleMarkRead = async (id: number) => {
    try {
      await notificationApi.markRead(id);
      fetchNotifications();
    } catch (e) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      fetchNotifications();
    } catch (e) {}
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setModalError('Title and message content are required.');
      return;
    }

    setSubmitting(true);
    setModalError(null);
    try {
      await notificationApi.sendNotification({
        employee_id: targetEmployeeId ? parseInt(targetEmployeeId, 10) : undefined,
        title,
        message,
        notification_type: notifType,
      });
      setIsModalOpen(false);
      setTitle('');
      setMessage('');
      fetchNotifications();
    } catch (err: any) {
      setModalError(err.response?.data?.message || err.message || 'Failed to send notification.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#191b23] tracking-tight">System & Admin Notifications</h2>
          <p className="text-xs font-semibold text-[#434655]">Real-time leave request alerts, biometric events, and system notices</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-extrabold rounded-full shadow-sm transition-all"
          >
            <Send className="w-4 h-4" /> Send Announcement
          </button>
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white border border-[#c3c6d7] text-xs font-bold text-[#191b23] hover:bg-[#ededf9] rounded-full shadow-xs transition-colors"
          >
            <CheckCheck className="w-4 h-4 text-[#2563eb]" /> Mark All Read
          </button>
          <button
            onClick={fetchNotifications}
            className="p-2.5 bg-white border border-[#c3c6d7] text-slate-600 hover:bg-[#ededf9] rounded-xl transition-colors"
            title="Refresh Notifications"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <Loading text="Loading notifications..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchNotifications} />
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#c3c6d7]/70 text-[#434655] shadow-xs">
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-base font-extrabold text-[#191b23]">No System Notifications</p>
          <p className="text-xs font-semibold text-[#434655]">All caught up! New system notifications will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.notification_id}
              onClick={() => !notif.is_read && handleMarkRead(notif.notification_id)}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 cursor-pointer ${
                notif.is_read
                  ? 'bg-white border-[#c3c6d7]/70 text-[#434655]'
                  : 'bg-[#ededf9]/70 border-[#2563eb]/40 text-[#191b23] shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                    notif.is_read ? 'bg-slate-100 text-slate-500' : 'bg-[#2563eb] text-white'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-[#191b23]">{notif.title}</h4>
                  <p className="text-xs font-semibold text-[#434655] mt-0.5">{notif.message}</p>
                  <span className="text-[10px] text-slate-400 font-bold block mt-1">
                    {formatDate(notif.created_at)}
                  </span>
                </div>
              </div>

              {!notif.is_read && (
                <span className="w-2.5 h-2.5 bg-[#2563eb] rounded-full shrink-0 mt-2 ring-4 ring-blue-100" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Broadcast Announcement Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Broadcast System Notification / Announcement"
      >
        <form onSubmit={handleSendNotification} className="space-y-4">
          {modalError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl">
              {modalError}
            </div>
          )}

          <div>
            <label className="block text-xs font-extrabold text-[#434655] uppercase mb-1.5">Recipient Employee</label>
            <select
              value={targetEmployeeId}
              onChange={(e) => setTargetEmployeeId(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#faf8ff] border border-[#c3c6d7] rounded-xl text-sm text-[#191b23] focus:outline-none focus:border-[#2563eb]"
            >
              <option value="">Broadcast to ALL Active Employees</option>
              {employees.map((emp) => (
                <option key={emp.employee_id} value={emp.employee_id}>
                  {emp.full_name} ({emp.employee_code}) - {emp.department}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-[#434655] uppercase mb-1.5">Notification Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Holiday Notice: Independence Day Celebration"
              className="w-full px-4 py-2.5 bg-[#faf8ff] border border-[#c3c6d7] rounded-xl text-sm text-[#191b23] focus:outline-none focus:border-[#2563eb]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-[#434655] uppercase mb-1.5">Message Content</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter announcement text to be delivered to employee portals..."
              className="w-full p-3.5 bg-[#faf8ff] border border-[#c3c6d7] rounded-xl text-xs font-medium text-[#191b23] focus:outline-none focus:border-[#2563eb]"
              rows={4}
              required
            />
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
              className="px-6 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-extrabold rounded-full shadow-sm flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Sending Notice...' : 'Send Notification'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Notifications;
