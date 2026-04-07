import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';

const Header = ({ onMenuClick }) => {
  const { user } = useAuth();

  const [profileName, setProfileName] = useState(() => {
    const saved = localStorage.getItem('app_settings_profile');
    if (saved) {
      try { return JSON.parse(saved).name; } catch (e) {}
    }
    return user?.restaurantName || "ScanBite";
  });

  useEffect(() => {
    const handleUpdate = () => {
      const saved = localStorage.getItem('app_settings_profile');
      if (saved) {
        try { setProfileName(JSON.parse(saved).name); } catch (e) {}
      }
    };
    window.addEventListener('profileUpdated', handleUpdate);
    return () => window.removeEventListener('profileUpdated', handleUpdate);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b-[2px] border-black z-50 flex items-center justify-between px-4 lg:px-8">
      <div className="flex items-center gap-4">
        {/* Brutalist Logo */}
        <div className="w-10 h-10 bg-[#FF6B6B] border-[2px] border-slate-800 flex items-center justify-center shadow-[1px_1px_0px_0px_rgba(30,41,59,1)]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="none" strokeLinejoin="miter">
            <rect x="3" y="3" width="18" height="18"></rect>
            <path d="M3 9h18"></path>
            <path d="M9 21V9"></path>
          </svg>
        </div>

        <div className="flex items-center gap-3">
          <h1 className="text-black font-black text-lg md:text-xl tracking-widest uppercase">
            {profileName}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Live Menu Preview Link */}
        {user?.tenantKey && (
          <a
            href={`/${user.tenantKey}/table/DEMO-1`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-[#FBBC05] border-[2px] border-black text-black font-black text-[10px] uppercase tracking-widest shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all rounded-full hidden sm:flex"
            title="View Your Public Digital Menu"
          >
            <span className="text-sm">🍽️</span>
            <span>Live Menu</span>
          </a>
        )}

        {/* Mobile Hamburger */}
        <button
          onClick={onMenuClick}
          className="md:hidden w-10 h-10 flex items-center justify-center bg-[#FF6B6B] border-[2px] border-slate-800 transition-all duration-150 shadow-[3px_3px_0px_0px_rgba(30,41,59,1)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
          aria-label="Toggle Menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="none" strokeLinejoin="miter">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;
