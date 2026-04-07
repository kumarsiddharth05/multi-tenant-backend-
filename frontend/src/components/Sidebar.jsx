import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const links = [
    {
      name: 'Home',
      path: '/dashboard',
      color: '#4285F4',
      bgTint: '#EEF4FF',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      )
    },
    {
      name: 'Kitchen View',
      path: '/dashboard/kitchen',
      color: '#EA4335',
      bgTint: '#FEF2F2',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3c-1.2 0-2.4.6-3 1.7A3.6 3.6 0 0 0 4.6 9c-1 .8-1.7 2-1.6 3.4.1 2 1.6 3.6 3.6 3.6h10.8c2 0 3.5-1.6 3.6-3.6.1-1.4-.6-2.6-1.6-3.4A3.6 3.6 0 0 0 15 4.7 3.5 3.5 0 0 0 12 3Z"/>
          <path d="M6 16v4a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-4"/>
        </svg>
      )
    },
    {
      name: 'Menu',
      path: '/dashboard/menu',
      color: '#FBBC05',
      bgTint: '#FFFBEB',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18M3 12h18M3 18h18" />
          <circle cx="7" cy="6" r="1.5" fill="currentColor" />
          <circle cx="7" cy="12" r="1.5" fill="currentColor" />
          <circle cx="7" cy="18" r="1.5" fill="currentColor" />
        </svg>
      )
    },
    {
      name: 'Tables',
      path: '/dashboard/tables',
      color: '#A855F7',
      bgTint: '#FAF5FF',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
        </svg>
      )
    },
    {
      name: 'QR Codes',
      path: '/dashboard/qr',
      color: '#10B981',
      bgTint: '#ECFDF5',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="5" height="5" rx="1"/>
          <rect x="16" y="3" width="5" height="5" rx="1"/>
          <rect x="3" y="16" width="5" height="5" rx="1"/>
          <path d="M21 16h-3a2 2 0 0 0-2 2v3"/>
          <path d="M21 21v.01"/>
          <path d="M12 7v3a2 2 0 0 1-2 2H7"/>
          <path d="M3 12h.01"/>
          <path d="M12 3h.01"/>
          <path d="M12 16v.01"/>
          <path d="M16 12h1"/>
          <path d="M21 12v.01"/>
          <path d="M12 21v-1"/>
        </svg>
      )
    },
    {
      name: 'Billing',
      path: '/dashboard/billing',
      color: '#F97316',
      bgTint: '#FFF7ED',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="M2 10h20M7 15h.01M11 15h2" />
        </svg>
      )
    },
    {
      name: 'Settings',
      path: '/dashboard/settings',
      color: '#94A3B8',
      bgTint: '#F8FAFC',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1V15a2 2 0 0 1-2-2 2 2 0 0 1 2-2v-.09A1.65 1.65 0 0 0 5 8.6a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2v.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      )
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] md:hidden transition-all duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar / Drawer */}
      <aside className={`
        fixed top-0 bottom-0 left-0 w-64 bg-white border-r-[2px] border-black z-[70] transition-transform duration-300 transform overflow-hidden
        md:translate-x-0 md:h-[calc(100vh-64px)] md:top-16
        ${isOpen ? 'translate-x-0 shadow-[4px_0_0_0_rgba(0,0,0,1)]' : '-translate-x-full'}
      `}>





        {/* ── Nav content (above decorations) ── */}
        <div className="relative z-10 flex flex-col h-full pt-8 pb-4">
          <nav className="flex-1 px-4 space-y-4 overflow-y-auto custom-scrollbar pt-2">
            {links.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                end={link.path === '/dashboard'}
                onClick={onClose}
                className={({ isActive }) => `
                  relative flex items-center gap-3 p-1.5 font-black uppercase tracking-widest transition-all duration-150 border-[3px] rounded-full group cursor-pointer overflow-hidden
                  ${isActive
                    ? 'translate-x-1 translate-y-1 shadow-none'
                    : 'shadow-[4px_4px_0px_0px_var(--btn-color)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_var(--btn-color)] active:translate-x-1 active:translate-y-1 active:shadow-none border-black'
                  }
                `}
                style={({ isActive }) => ({
                  '--btn-color': link.color,
                  borderColor: isActive ? link.color : '#000',
                  backgroundColor: link.bgTint,
                })}
              >
                {({ isActive }) => (
                  <>
                    {/* Dot grid clipped to capsule */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
                        backgroundSize: '10px 10px',
                        opacity: 0.06,
                      }}
                    />
                    {/* Icon circle */}
                    <div
                      className="relative z-10 w-10 h-10 border-[2px] rounded-full flex items-center justify-center shrink-0 transition-colors text-black"
                      style={{
                        borderColor: isActive ? link.color : '#000',
                        backgroundColor: link.bgTint,
                      }}
                    >
                      <div className="w-4 h-4 flex-shrink-0">
                        {link.icon}
                      </div>
                    </div>
                    <span className="relative z-10 text-xs sm:text-sm font-black mt-px truncate text-black">
                      {link.name}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="px-4 mt-6 mb-6">
            <button
              id="logout-button"
              onClick={logout}
              style={{ '--btn-color': '#EA4335', backgroundColor: '#FEF2F2' }}
              className="w-full relative flex items-center gap-3 p-1.5 font-black uppercase tracking-widest transition-all duration-150 border-[3px] border-black rounded-full group cursor-pointer overflow-hidden shadow-[4px_4px_0px_0px_var(--btn-color)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_var(--btn-color)] active:translate-x-1 active:translate-y-1 active:shadow-none active:border-[#EA4335]"
            >
              {/* Dot grid */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '10px 10px', opacity: 0.06 }}
              />
              <div className="relative z-10 w-10 h-10 border-[2px] border-[#EA4335] rounded-full flex items-center justify-center shrink-0 bg-[#FEF2F2] text-black">
                <div className="w-4 h-4 flex-shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5V5h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </div>
              </div>
              <span className="relative z-10 text-xs sm:text-sm font-black mt-px text-black">
                Logout
              </span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
