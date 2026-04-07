import React, { useState, useEffect } from 'react';
import { socket, connectSocket, disconnectSocket } from '../utils/socket';
import { useKiosk } from '../context/KioskContext';
import { useAuth } from '../context/AuthContext';

const MOCK_ORDERS = [
  {
    id: 'demo-1',
    table_number: 'T-04',
    status: 'pending',
    created_at: new Date().toISOString(),
    items: [
      { name: 'Chicken Biryani', quantity: 2, price: 320 },
      { name: 'Garlic Naan', quantity: 3, price: 45 },
      { name: 'Paneer Butter Masala', quantity: 1, price: 280 }
    ]
  },
  {
    id: 'demo-2',
    table_number: 'T-12',
    status: 'preparing',
    created_at: new Date(Date.now() - 600000).toISOString(), // 10 mins ago
    items: [
      { name: 'Veg Hakka Noodles', quantity: 1, price: 210 },
      { name: 'Chilli Chicken', quantity: 1, price: 260 },
      { name: 'Coke (500ml)', quantity: 2, price: 60 }
    ]
  },
  {
    id: 'demo-3',
    table_number: 'T-07',
    status: 'pending',
    created_at: new Date(Date.now() - 300000).toISOString(), // 5 mins ago
    items: [
      { name: 'Masala Dosa', quantity: 3, price: 120 },
      { name: 'Filter Coffee', quantity: 3, price: 40 }
    ]
  }
];

const KitchenView = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tenantKey, setTenantKey] = useState(null);
  const { isKioskMode, enterKioskMode, exitKioskMode } = useKiosk();
  const { logout } = useAuth();
  const [filterTab, setFilterTab] = useState('active'); // 'active', 'rejected', 'all'

  // 1. Initial Fetch
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/dashboard', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        
        if (response.ok) {
          // Fetch all orders
          setOrders(result.data);
          setTenantKey(result.tenantKey);
          
          // Connect Socket
          if (result.tenantKey) {
            connectSocket(result.tenantKey);
          }
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    return () => {
      disconnectSocket();
    };
  }, []);

  // 2. Socket Listeners
  useEffect(() => {
    const handleNewOrder = (newOrder) => {
      setOrders(prev => [newOrder, ...prev]);
    };

    const handleOrderUpdated = (updatedOrder) => {
      setOrders(prev => {
        const exists = prev.find(o => o.id === updatedOrder.id);
        if (exists) {
          return prev.map(o => o.id === updatedOrder.id ? { ...o, status: updatedOrder.status } : o);
        } else {
          return [updatedOrder, ...prev];
        }
      });
    };

    socket.on('new_order', handleNewOrder);
    socket.on('order_updated', handleOrderUpdated);

    return () => {
      socket.off('new_order', handleNewOrder);
      socket.off('order_updated', handleOrderUpdated);
    };
  }, []);

  const updateStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/dashboard/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) {
        alert('Failed to update status');
      }
      // Note: The UI updates via the socket event 'order_updated' emitted by the backend
    } catch (err) {
      console.error('Update error:', err);
    }
  };

  const loadSamples = () => {
    setOrders(prev => [...MOCK_ORDERS, ...prev]);
  };

  const formatOrderTime = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now - created;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const hrs = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hrs} hr ${mins} min ago`;
  };

  const getUrgencyTheme = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMins = Math.floor((now - created) / 60000);

    if (diffMins < 5) return { color: '#4285F4', bg: '#EFF6FF', shadow: '#4285F4', label: 'NEW' };
    if (diffMins < 15) return { color: '#F59E0B', bg: '#FFF7ED', shadow: '#F59E0B', label: 'WAITING' };
    return { color: '#EA4335', bg: '#FEF2F2', shadow: '#EA4335', label: 'CRITICAL' };
  };

  if (loading) return (
    <div className="p-10 text-center font-black tracking-widest uppercase text-black">
      Loading Kitchen...
    </div>
  );

  const displayedOrders = orders.filter(o => {
    if (filterTab === 'active') return ['pending', 'preparing', 'ready'].includes(o.status);
    if (filterTab === 'rejected') return o.status === 'rejected';
    return true; // 'all'
  });

  return (
    <div className="p-4 sm:p-6 md:p-10 space-y-6 bg-gray-50 min-h-full">

      {/* ── Header ── */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <h2 className="text-3xl sm:text-4xl font-black text-black uppercase tracking-widest leading-none">
            Kitchen View
          </h2>

          {/* Load Samples Button */}
          <button
            onClick={loadSamples}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-black border-[3px] border-black rounded-full font-black text-[11px] uppercase tracking-widest shadow-[4px_4px_0px_0px_#4285F4] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#4285F4] active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <path d="M12 5v14M5 12l7 7 7-7"/>
            </svg>
            Load Samples
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 border-[3px] border-black bg-white px-5 py-2.5 rounded-full shadow-[4px_4px_0px_0px_#FBBC05]">
            <div className="relative flex h-3 w-3 flex-shrink-0">
              <span className="animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] absolute inline-flex h-full w-full rounded-full bg-[#34A853] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-full w-full bg-[#34A853] border border-black shadow-[0_0_8px_rgba(52,168,83,0.8)]"></span>
            </div>
            <span className="text-black text-xs font-black uppercase tracking-widest">LIVE KITCHEN</span>
          </div>
          
          {!isKioskMode ? (
            <button
              onClick={enterKioskMode}
              className="px-5 py-2.5 bg-white text-black border-[3px] border-black rounded-full font-black text-[11px] uppercase tracking-widest hover:-translate-y-0.5 shadow-[4px_4px_0px_0px_#EA4335] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
            >
              Lock Kiosk
            </button>
          ) : (
            <button
              onClick={() => {
                exitKioskMode();
                logout();
              }}
              className="px-5 py-2.5 bg-white text-black border-[3px] border-black rounded-full font-black text-[11px] uppercase tracking-widest hover:-translate-y-0.5 shadow-[4px_4px_0px_0px_#34A853] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
            >
              Unlock Kiosk
            </button>
          )}
        </div>
      </div>

      {/* ── Filtering Tabs ── */}
      <div className="flex gap-4 border-b-[3px] border-black pb-4 mb-4">
        <button 
          onClick={() => setFilterTab('active')} 
          className={`px-6 py-2 rounded-xl font-black uppercase tracking-widest text-sm border-[3px] border-black transition-all ${filterTab === 'active' ? 'bg-black text-white shadow-none translate-x-1 translate-y-1' : 'bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1'}`}
        >
          Accepted (Active)
        </button>
        <button 
          onClick={() => setFilterTab('rejected')} 
          className={`px-6 py-2 rounded-xl font-black uppercase tracking-widest text-sm border-[3px] border-black transition-all ${filterTab === 'rejected' ? 'bg-[#EA4335] text-white shadow-none translate-x-1 translate-y-1' : 'bg-white text-[#EA4335] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1'}`}
        >
          Rejected
        </button>
        <button 
          onClick={() => setFilterTab('all')} 
          className={`px-6 py-2 rounded-xl font-black uppercase tracking-widest text-sm border-[3px] border-black transition-all ${filterTab === 'all' ? 'bg-[#4285F4] text-white shadow-none translate-x-1 translate-y-1' : 'bg-white text-[#4285F4] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1'}`}
        >
          All Orders
        </button>
      </div>

      {/* ── Order Cards Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-stretch">
        {displayedOrders.map((order) => {
          const ut = getUrgencyTheme(order.created_at);
          const items = Array.isArray(order.items) ? order.items : JSON.parse(order.items || '[]');
          const total = items.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);

          return (
            <div
              key={order.id}
              className={`
                bg-white border-[3px] border-black rounded-[32px] transition-all duration-300 flex flex-col overflow-hidden min-h-[420px] relative group
                ${ut.label === 'CRITICAL' ? 'animate-in fade-in zoom-in' : ''}
              `}
              style={{
                boxShadow: `8px 8px 0px 0px ${ut.shadow}`,
              }}
            >
              {/* Background Bloom (Blob) - Urgency Color */}
              <div 
                className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full blur-[100px] opacity-20 pointer-events-none transition-all duration-700 group-hover:scale-110"
                style={{ backgroundColor: ut.color }}
              />
              
              {/* Dot Grid Layer */}
              <div 
                className="absolute inset-0 opacity-[0.1] pointer-events-none" 
                style={{ backgroundImage: `radial-gradient(${ut.color} 1.2px, transparent 1.2px)`, backgroundSize: '16px 16px' }} 
              />

              {/* Card Header - High Visibility */}
              <div className="relative z-10 flex justify-between items-start px-6 pt-6 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span 
                      className="text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full border-[1.5px] border-black flex items-center justify-center text-black"
                      style={{ backgroundColor: ut.bg, borderColor: ut.color }}
                    >
                      {ut.label}
                    </span>
                  </div>
                  <h3 className="text-4xl font-black text-black leading-none tracking-tighter">
                    {order.table_number}
                  </h3>
                </div>
                <div className="flex flex-col items-end gap-2">
                   <div 
                     className="px-3 py-1.5 rounded-xl border-[2px] border-black font-black text-[10px] uppercase tracking-widest bg-white shadow-[4px_4px_0px_0px_black] group-hover:-translate-y-1 transition-transform"
                   >
                     {formatOrderTime(order.created_at)}
                   </div>
                </div>
              </div>

              {/* Order ID strip - Compact */}
              <div className="relative z-10 px-6 py-2 bg-black/5 border-y-[2px] border-black flex justify-between items-center backdrop-blur-sm">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black">
                  Order <span className="text-black">#{order.id.slice(0, 8)}</span>
                </span>
              </div>

              {/* Items List - High Contrast (No Scrolling) */}
              <div className="relative z-10 flex-1 px-6 py-4">
                <ul className="space-y-3">
                  {items.map((item, i) => (
                    <li key={i} className="flex justify-between items-start text-black group/item">
                      <div className="flex items-center gap-3">
                        <span
                          className="text-black font-black text-[10px] w-7 h-7 flex items-center justify-center rounded-full border-[2px] border-black bg-white shrink-0 shadow-[2px_2px_0px_0px_black] group-hover/item:scale-110 transition-transform"
                        >
                          x{item.quantity || 1}
                        </span>
                        <div className="flex flex-col">
                          <span className="font-black text-[15px] leading-none text-black uppercase tracking-tight">{item.name}</span>
                          <span className="text-[9px] font-black text-black uppercase mt-1">₹{item.price} each</span>
                        </div>
                      </div>
                      <span className="text-black font-black text-[14px] shrink-0 pt-1 tracking-tighter">₹{item.price * (item.quantity || 1)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Footer Area - Pushed to bottom */}
              <div className="mt-auto relative z-10">
                {/* Total Row */}
                <div className="flex justify-between items-center px-6 py-3 bg-white border-t-[2px] border-black">
                  <span className="font-black uppercase tracking-[0.2em] text-[10px] text-black italic">Total Bill</span>
                  <span className="text-black font-black text-2xl tracking-tighter italic">₹{total}</span>
                </div>

                {/* Action Buttons - Optimized height */}
                <div className="flex p-4 pt-0 gap-3">
                  <button
                    onClick={() => updateStatus(order.id, 'completed')}
                    className="flex-1 bg-[#34A853] text-white font-black text-[11px] py-4 rounded-2xl border-[3px] border-black uppercase tracking-[0.2em] shadow-[0px_6px_0px_0px_black] hover:shadow-none hover:translate-y-1 transition-all flex justify-center items-center gap-2 group"
                  >
                    <svg className="w-4 h-4 transition-transform group-hover:scale-125" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Accept
                  </button>
                  <button
                    onClick={() => updateStatus(order.id, 'rejected')}
                    className="flex-1 bg-white text-[#EA4335] font-black text-[11px] py-4 rounded-2xl border-[3px] border-[#EA4335] uppercase tracking-[0.2em] shadow-[0px_6px_0px_0px_#EA4335] hover:shadow-none hover:translate-y-1 transition-all flex justify-center items-center gap-2 group"
                  >
                    <svg className="w-4 h-4 transition-transform group-hover:scale-125" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                    Reject
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {displayedOrders.length === 0 && !loading && (
        <div className="h-64 flex flex-col items-center justify-center border-[3px] border-black border-dashed rounded-[28px] bg-white text-gray-400 gap-3">
          <svg className="w-10 h-10 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 3c-1.2 0-2.4.6-3 1.7A3.6 3.6 0 0 0 4.6 9c-1 .8-1.7 2-1.6 3.4.1 2 1.6 3.6 3.6 3.6h10.8c2 0 3.5-1.6 3.6-3.6.1-1.4-.6-2.6-1.6-3.4A3.6 3.6 0 0 0 15 4.7 3.5 3.5 0 0 0 12 3Z"/>
            <path d="M6 16v4a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-4"/>
          </svg>
          <span className="font-black uppercase tracking-widest text-sm">No Pending Orders</span>
          <span className="text-[11px] font-bold uppercase tracking-wider opacity-60">Kitchen is all caught up!</span>
        </div>
      )}
    </div>
  );
};

export default KitchenView;
