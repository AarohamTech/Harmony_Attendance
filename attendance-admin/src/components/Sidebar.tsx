import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  FileSpreadsheet,
  Clock,
  Building2,
  UserCheck,
  Calendar,
  MapPin,
  Bell,
  BarChart3,
  Settings,
  User,
  LogOut,
  X,
  ShieldCheck,
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
  { path: '/admin/leave-requests', label: 'Leave Requests', icon: FileSpreadsheet },
  { path: '/admin/attendance-requests', label: 'Missed Punch Requests', icon: Clock },
  { path: '/admin/departments', label: 'Departments', icon: Building2 },
  { path: '/admin/managers', label: 'Managers', icon: UserCheck },
  { path: '/admin/holidays', label: 'Holidays', icon: Calendar },
  { path: '/admin/locations', label: 'Office Locations', icon: MapPin },
  { path: '/admin/notifications', label: 'Notifications', icon: Bell },
  { path: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { logout, user } = useAuth();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-[#c3c6d7] text-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="flex items-center justify-between h-20 px-6 bg-white border-b border-[#c3c6d7]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2563eb] flex items-center justify-center text-white shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-[#191b23] leading-tight">
                Harmony <span className="text-[#2563eb]">AI</span>
              </h1>
              <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#2563eb]/10 text-[#2563eb] rounded-full mt-0.5">
                Admin Portal
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 lg:hidden transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User quick badge */}
        <div className="p-3 mx-4 my-3 bg-[#ededf9]/70 border border-[#c3c6d7]/60 rounded-2xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#2563eb] text-white font-extrabold flex items-center justify-center text-sm shadow-xs shrink-0">
            {user?.full_name?.charAt(0) || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-extrabold text-[#191b23] truncate">{user?.full_name || 'Administrator'}</p>
            <p className="text-[11px] font-semibold text-[#434655] truncate">{user?.role || 'Admin'} • {user?.department || 'HRMS'}</p>
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
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-[#2563eb] text-white shadow-md font-extrabold'
                      : 'text-[#434655] hover:text-[#191b23] hover:bg-[#ededf9]/70'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Admin Profile & Logout buttons */}
        <div className="p-3 border-t border-[#c3c6d7]/60 bg-white space-y-1">
          <NavLink
            to="/admin/profile"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-[#2563eb] text-white shadow-md font-extrabold'
                  : 'text-[#434655] hover:text-[#191b23] hover:bg-[#ededf9]/70'
              }`
            }
          >
            <User className="w-4 h-4 shrink-0" />
            <span className="truncate">Admin Profile</span>
          </NavLink>

          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-2xl transition-colors border border-rose-200/60"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
