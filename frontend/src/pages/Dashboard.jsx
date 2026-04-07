import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { useKiosk } from '../context/KioskContext';

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, loading } = useAuth();
  const { isKioskMode } = useKiosk();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isKioskMode && location.pathname !== '/dashboard/kitchen') {
      navigate('/dashboard/kitchen', { replace: true });
    }
  }, [isKioskMode, location.pathname, navigate]);

  // Back button prevention in kiosk mode
  useEffect(() => {
    if (isKioskMode) {
      window.history.pushState(null, '', window.location.href);
      const handlePopState = () => {
        window.history.pushState(null, '', window.location.href);
      };
      window.addEventListener('popstate', handlePopState);
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isKioskMode, location.pathname]);

  if (loading) return <div className="h-screen bg-white flex items-center justify-center text-black font-bold tracking-widest uppercase">Initializing...</div>;
  if (!user) return null; // AuthProvider handles redirect

  if (isKioskMode) {
    return (
      <div className="h-screen w-full bg-[#f8f9fa] flex flex-col overflow-hidden relative">
        <main className="flex-1 h-full overflow-y-auto overflow-x-hidden relative">
          <div className="min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-white flex flex-col transition-colors duration-500 overflow-hidden">
      <Header onMenuClick={() => setIsSidebarOpen(true)} />
      
      <div className="flex flex-1 pt-[72px] h-full overflow-hidden relative">
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
