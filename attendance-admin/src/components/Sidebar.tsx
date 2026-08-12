import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Clock,
  FileSpreadsheet,
  Building2,
  MapPin,
  Bell,
  BarChart3,
  UserCheck,
  Settings,
  User,
  LogOut,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/employees', label: 'Employees', icon: Users },
  { path: '/admin/attendance', label: 'Attendance', icon: CalendarCheck },
  { path: '/admin/punch-records', label: 'Punch Records', icon: Clock },
  { path: '/admin/leave-requests', label: 'Leave Requests', icon: FileSpreadsheet },
  { path: '/admin/missed-punch-requests', label: 'Missed Punches', icon: Clock },
  { path: '/admin/departments', label: 'Departments', icon: Building2 },
  { path: '/admin/offices', label: 'Office Locations', icon: MapPin },
  { path: '/admin/notifications', label: 'Notifications', icon: Bell },
  { path: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { path: '/admin/admin-users', label: 'Admin Users', icon: UserCheck },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
  { path: '/admin/profile', label: 'Profile', icon: User },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { logout, user } = useAuth();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="flex items-center justify-between h-16 px-6 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white">Harmony AI</h1>
              <p className="text-[10px] uppercase font-bold tracking-widest text-sky-400">Admin Portal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User quick badge */}
        <div className="p-4 mx-3 my-3 bg-slate-800/60 rounded-xl border border-slate-700/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
            {user?.full_name?.charAt(0) || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.full_name || 'Admin User'}</p>
            <p className="text-[11px] text-sky-300 truncate">{user?.designation || user?.department || 'Administrator'}</p>
          </div>
        </div>

        {/* Navigation scroll section */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1 custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-sm font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer logout button */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60">
          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors border border-rose-500/20"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
