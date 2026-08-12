import React, { useEffect, useState } from 'react';
import { Menu, Bell, User, LogOut, Clock, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { notificationApi } from '../api/notificationApi';

interface HeaderProps {
  onMenuToggle: () => void;
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle, title = 'Admin Portal' }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const datePart = now.toLocaleDateString('en-IN', {
        timeZone: 'Asia/Kolkata',
        weekday: 'short',
        day: '2-digit',
        month: 'short',
      });
      const timePart = now.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      setCurrentTimeStr(`${datePart} • ${timePart} IST`);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const notifs = await notificationApi.getNotifications();
        if (Array.isArray(notifs)) {
          const unread = notifs.filter((n) => !n.is_read).length;
          setUnreadCount(unread);
        }
      } catch (e) {
        // Silently handle error
      }
    };
    fetchNotifications();
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#c3c6d7] px-4 lg:px-8 py-3.5 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg lg:text-xl font-extrabold text-[#191b23] tracking-tight">{title}</h1>
          <p className="text-xs font-semibold text-[#434655] hidden sm:block">Harmony AI Attendance Enterprise Management</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Live IST Clock Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-[#2563eb]/10 text-[#2563eb] rounded-full text-xs font-bold border border-[#2563eb]/20">
          <Clock className="w-3.5 h-3.5" />
          <span>{currentTimeStr}</span>
        </div>

        {/* Global Search Shortcut */}
        <div className="hidden lg:flex items-center relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search employee, ID, request..."
            onFocus={() => navigate('/admin/employees')}
            className="pl-9 pr-4 py-1.5 bg-[#faf8ff] border border-[#c3c6d7] rounded-full text-xs text-[#191b23] w-56 focus:w-64 focus:outline-none focus:border-[#2563eb] transition-all placeholder-slate-400 font-medium"
          />
        </div>

        {/* Notification Bell */}
        <button
          onClick={() => navigate('/admin/notifications')}
          className="relative p-2.5 rounded-2xl bg-[#ededf9] text-[#2563eb] hover:bg-[#2563eb] hover:text-white transition-colors"
          title="System Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white rounded-full text-[10px] font-extrabold flex items-center justify-center border-2 border-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        <div className="h-6 w-px bg-[#c3c6d7] mx-1 hidden sm:block" />

        {/* Profile Menu Badge */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/admin/profile')}
            className="flex items-center gap-2.5 p-1 rounded-2xl hover:bg-[#ededf9]/70 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-full bg-[#2563eb] text-white font-extrabold flex items-center justify-center text-xs shadow-xs">
              {user?.full_name?.charAt(0) || 'A'}
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-extrabold text-[#191b23] leading-tight">{user?.full_name || 'Admin User'}</p>
              <p className="text-[10px] font-bold text-[#2563eb]">{user?.role || 'Administrator'}</p>
            </div>
          </button>

          <button
            onClick={logout}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
