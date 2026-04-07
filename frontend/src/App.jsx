import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Order from './pages/Order';
import Login from './pages/Login';
import DashboardLayout from './pages/Dashboard';
import DashboardHome from './pages/DashboardHome';
import KitchenView from './pages/KitchenView';
import MenuManage from './pages/MenuManage';
import TablesManage from './pages/TablesManage';
import QRCodesManage from './pages/QRCodesManage';
import BillingManage from './pages/BillingManage';
import SettingsManage from './pages/SettingsManage';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-screen bg-[#020617] flex items-center justify-center text-white font-bold tracking-widest uppercase">Validating...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/:tenant_key/table/:table_number" element={<Order />} />
          
          {/* Dashboard Nested Routes */}
          <Route path="/dashboard" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
            <Route index element={<DashboardHome />} />
            <Route path="kitchen" element={<KitchenView />} />
            <Route path="menu" element={<MenuManage />} />
            <Route path="tables" element={<TablesManage />} />
            <Route path="qr" element={<QRCodesManage />} />
            <Route path="billing" element={<BillingManage />} />
            <Route path="settings" element={<SettingsManage />} />
            <Route path="*" element={<div className="p-10 text-white font-bold text-center">Section Under Development</div>} />
          </Route>

          {/* Reset root to login */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="*" element={<div className="h-screen flex items-center justify-center p-10 text-center font-bold text-xl text-gray-500 bg-gray-50 uppercase tracking-widest">404: Path Not Found</div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
