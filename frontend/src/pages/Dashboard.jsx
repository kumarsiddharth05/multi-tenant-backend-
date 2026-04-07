import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, loading } = useAuth();

  if (loading) return <div className="h-screen bg-white flex items-center justify-center text-black font-bold tracking-widest uppercase">Initializing...</div>;
  if (!user) return null; // AuthProvider handles redirect

  return (
    <div className="h-screen w-full bg-white flex flex-col transition-colors duration-500 overflow-hidden">
      <Header onMenuClick={() => setIsSidebarOpen(true)} />
      
      <div className="flex flex-1 pt-16 h-full overflow-hidden relative">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <main className="flex-1 md:pl-64 transition-all duration-300 h-full overflow-y-auto overflow-x-hidden relative">
          <div className="min-h-full pb-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
