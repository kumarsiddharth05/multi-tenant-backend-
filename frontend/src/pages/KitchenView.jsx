import React, { useState, useEffect } from 'react';
import { socket, connectSocket, disconnectSocket } from '../utils/socket';

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
          // Filter only non-completed/non-rejected for the UI if needed, 
          // but for now showing everything currently active.
          const activeOrders = result.data.filter(o => o.status === 'pending' || o.status === 'preparing' || o.status === 'ready');
          setOrders(activeOrders);
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
        // If status is completed or rejected, remove from active list if desired
        if (updatedOrder.status === 'completed' || updatedOrder.status === 'rejected') {
          return prev.filter(o => o.id !== updatedOrder.id);
        }
        return prev.map(o => o.id === updatedOrder.id ? { ...o, status: updatedOrder.status } : o);
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

  if (loading) return (
    <div className="p-10 text-center font-black tracking-widest uppercase font-['Space_Grotesk'] text-black">
      Loading Kitchen...
    </div>
  );

  return (
    <div className="p-4 sm:p-6 md:p-10 space-y-6 bg-gray-50 min-h-full font-['Space_Grotesk']">

      {/* ── Header ── */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <h2 className="text-3xl sm:text-4xl font-black text-black uppercase tracking-tighter leading-none">
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

        {/* Active Status Capsule */}
        <div className="flex items-center gap-3 border-[3px] border-black bg-white px-5 py-2.5 rounded-full shadow-[4px_4px_0px_0px_#FBBC05]">
          <div className="relative flex h-3 w-3 flex-shrink-0">
            <span className="animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] absolute inline-flex h-full w-full rounded-full bg-[#34A853] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-full w-full bg-[#34A853] border border-black shadow-[0_0_8px_rgba(52,168,83,0.8)]"></span>
          </div>
          <span className="text-black text-xs font-black uppercase tracking-widest">LIVE KITCHEN</span>
        </div>
      </div>

      {/* ── Order Cards Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {orders.map((order) => {
          const statusConfig = {
            pending:   { label: 'Pending',   color: '#FBBC05', shadow: '#FBBC05' },
            preparing: { label: 'Preparing', color: '#4285F4', shadow: '#4285F4' },
            ready:     { label: 'Ready',     color: '#34A853', shadow: '#34A853' },
          };
          const st = statusConfig[order.status] || { label: order.status, color: '#94A3B8', shadow: '#94A3B8' };
          const items = Array.isArray(order.items) ? order.items : JSON.parse(order.items || '[]');
          const total = items.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);

          return (
            <div
              key={order.id}
              className="bg-white border-[3px] border-black rounded-[28px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 flex flex-col overflow-hidden"
            >
              {/* Card Header */}
              <div className="flex justify-between items-start px-5 pt-5 pb-4 border-b-[2px] border-black">
                <div>
                  <span className="block text-black text-[10px] font-black uppercase tracking-widest mb-0.5">Table</span>
                  <h3 className="text-3xl font-black text-black leading-none">{order.table_number}</h3>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {/* Time Badge */}
                  <span className="text-black font-black text-[10px] uppercase tracking-widest bg-white px-3 py-1 rounded-full border-[2px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                    {formatOrderTime(order.created_at)}
                  </span>
                </div>
              </div>

              {/* Order ID sub-row */}
              <div className="px-5 py-2 bg-gray-50 border-b-[2px] border-black">
                <span className="text-[10px] font-black uppercase tracking-widest text-black">
                  Order <span className="text-black">#{order.id.slice(0, 8)}</span>
                </span>
              </div>

              {/* Items List */}
              <div className="flex-1 px-5 py-4">
                <ul className="space-y-2.5">
                  {items.map((item, i) => (
                    <li key={i} className="flex justify-between items-center text-black pb-2 border-b-[1px] border-dashed border-gray-200 last:border-0">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="text-black font-black text-[10px] w-6 h-6 flex items-center justify-center rounded-full border-[2px] border-black bg-white leading-none shrink-0"
                        >
                          x{item.quantity || 1}
                        </span>
                        <span className="font-bold text-sm leading-tight text-black">{item.name}</span>
                      </div>
                      <span className="text-black font-black text-sm shrink-0 pl-2">₹{item.price * (item.quantity || 1)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Total Row */}
              <div className="flex justify-between items-center px-5 py-3 bg-gray-50 border-t-[2px] border-black">
                <span className="font-black uppercase tracking-widest text-[10px] text-black">Total</span>
                <span className="text-black font-black text-xl">₹{total}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-0 border-t-[2px] border-black rounded-b-[25px] overflow-hidden">
                <button
                  onClick={() => updateStatus(order.id, 'completed')}
                  className="flex-1 bg-[#34A853] text-white font-black text-[11px] py-3.5 uppercase tracking-widest transition-all duration-150 hover:brightness-110 active:brightness-90 flex justify-center items-center gap-1.5 border-r-[2px] border-black"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Accept
                </button>
                <button
                  onClick={() => updateStatus(order.id, 'rejected')}
                  className="flex-1 bg-[#EA4335] text-white font-black text-[11px] py-3.5 uppercase tracking-widest transition-all duration-150 hover:brightness-110 active:brightness-90 flex justify-center items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                  Reject
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {orders.length === 0 && !loading && (
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
