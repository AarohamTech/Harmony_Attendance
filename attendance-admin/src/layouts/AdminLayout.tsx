import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

export const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header onMenuToggle={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
