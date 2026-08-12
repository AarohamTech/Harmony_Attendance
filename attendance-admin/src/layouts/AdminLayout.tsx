import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

export const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#faf8ff] flex flex-col font-sans relative overflow-x-hidden">
      {/* Harmony Decorative Soft Background Orbs */}
      <div className="fixed top-[-60px] left-[-60px] w-72 h-72 rounded-full bg-[#dbe1ff]/40 blur-3xl pointer-events-none z-0" />
      <div className="fixed bottom-[-80px] right-[-80px] w-96 h-96 rounded-full bg-[#d0e1fb]/40 blur-3xl pointer-events-none z-0" />

      {/* Main Navigation Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 z-10 relative">
        <Header onMenuToggle={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
