import React, { createContext, useContext, useState, useEffect } from 'react';

const KioskContext = createContext();

export const KioskProvider = ({ children }) => {
  const [isKioskMode, setIsKioskMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('app_kiosk_locked');
    if (saved === 'true') {
      setIsKioskMode(true);
    }
  }, []);

  const enterKioskMode = () => {
    setIsKioskMode(true);
    localStorage.setItem('app_kiosk_locked', 'true');
  };

  const exitKioskMode = () => {
    setIsKioskMode(false);
    localStorage.setItem('app_kiosk_locked', 'false');
  };

  return (
    <KioskContext.Provider value={{ isKioskMode, enterKioskMode, exitKioskMode }}>
      {children}
    </KioskContext.Provider>
  );
};

export const useKiosk = () => useContext(KioskContext);
