import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedKey = localStorage.getItem('tenant_key');
    if (token) {
      try {
        const userData = parseToken(token);
        setUser(userData);
      } catch (e) {
        console.error('Invalid token', e);
        localStorage.removeItem('token');
        localStorage.removeItem('tenant_key');
      }
    }
    setLoading(false);
  }, []);

  const parseToken = (token) => {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    const userData = JSON.parse(jsonPayload);
    userData.restaurantName = userData.tenantId?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    // Expose tenantKey (derived from tenantId or explicitly in token)
    userData.tenantKey = userData.tenantId; 
    return userData;
  };

  const login = (token) => {
    const userData = parseToken(token);
    localStorage.setItem('token', token);
    localStorage.setItem('tenant_key', userData.tenantId);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('tenant_key');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, tenantKey: user?.tenantKey }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
