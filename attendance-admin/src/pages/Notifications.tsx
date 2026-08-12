import React, { useEffect, useState } from 'react';
import { Bell, CheckCheck, RefreshCw } from 'lucide-react';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { notificationApi } from '../api/notificationApi';
import { NotificationItem } from '../types';
import { formatDate } from '../utils/formatDate';

export const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await notificationApi.getNotifications();
      setNotifications(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">System & Admin Notifications</h2>
          <p className="text-xs text-slate-500">Real-time leave request alerts, biometric events, and system notices</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl shadow-xs"
          >
            <CheckCheck className="w-4 h-4 text-sky-600" /> Mark All as Read
          </button>
          <button
            onClick={fetchNotifications}
            className="p-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl"
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
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-500">
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-base font-semibold text-slate-700">No Notifications</p>
          <p className="text-xs text-slate-400">All caught up! New system notifications will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.notification_id}
              onClick={() => !notif.is_read && handleMarkRead(notif.notification_id)}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 cursor-pointer ${
                notif.is_read
                  ? 'bg-white border-slate-200 text-slate-600'
                  : 'bg-sky-50/60 border-sky-200 text-slate-900 shadow-2xs'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                    notif.is_read ? 'bg-slate-100 text-slate-500' : 'bg-sky-600 text-white'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{notif.title}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">{notif.message}</p>
                  <span className="text-[10px] text-slate-400 font-medium block mt-1">
                    {formatDate(notif.created_at)}
                  </span>
                </div>
              </div>

              {!notif.is_read && (
                <span className="w-2.5 h-2.5 bg-sky-600 rounded-full shrink-0 mt-2 ring-4 ring-sky-100" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
