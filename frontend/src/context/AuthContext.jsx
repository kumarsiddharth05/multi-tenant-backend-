import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const userData = JSON.parse(jsonPayload);
        // Derive restaurant name from tenant_key (ideally this comes from the JWT or an API)
        userData.restaurantName = userData.tenantId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '); 
        // Wait, the user said "Raju Sweets" in the mockup. 
        // I'll try to find a better way to get the name later, but for now I'll use a derived one.
        setUser(userData);
      } catch (e) {
        console.error('Invalid token', e);
        localStorage.removeItem('token');
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
    return userData;
  };

  const login = (token) => {
    localStorage.setItem('token', token);
    setUser(parseToken(token));
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
