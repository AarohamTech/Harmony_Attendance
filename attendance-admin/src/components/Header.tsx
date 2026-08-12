import React from 'react';
import { Menu, Bell, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onMenuToggle: () => void;
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle, title = 'Admin Dashboard' }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 px-4 lg:px-8 py-3.5 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg lg:text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
          <p className="text-xs text-slate-500 hidden sm:block">Harmony AI Attendance Enterprise Management</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Notification Bell Shortcut */}
        <button
          onClick={() => navigate('/admin/notifications')}
          className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
        </button>

        <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

        {/* Profile Menu Badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/profile')}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
              {user?.full_name?.charAt(0) || 'A'}
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-semibold text-slate-800 leading-tight">{user?.full_name || 'Admin'}</p>
              <p className="text-[10px] font-medium text-slate-500">{user?.designation || 'Administrator'}</p>
            </div>
          </button>

          <button
            onClick={logout}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
