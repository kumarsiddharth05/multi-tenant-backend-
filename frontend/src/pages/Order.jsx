import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { socket, connectSocket, disconnectSocket } from '../utils/socket';

const Order = () => {
  const { tenant_key, table_number } = useParams();
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null); // Full order object after placement
  const [error, setError] = useState(false);

  // 1. Fetch Menu on Load
  useEffect(() => {
    // Intercept to instantly mark this table as occupied on the dashboard when scanned!
    const saved = localStorage.getItem('app_tables');
    if (saved) {
      const tables = JSON.parse(saved).map(t => 
        (String(t.name).toUpperCase() === String(table_number).toUpperCase()) 
          ? { ...t, status: 'occupied' } 
          : t
      );
      localStorage.setItem('app_tables', JSON.stringify(tables));
      window.dispatchEvent(new Event('storage'));
    }

    fetch(`http://localhost:5000/public/${tenant_key}/menu`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Restaurant Not Found');
        }
        return res.json();
      })
      .then(data => {
        setMenu(data.data || data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching menu:", err);
        setError(true);
        setLoading(false);
      });
  }, [tenant_key]);

  // 2. Socket setup for live tracking
  useEffect(() => {
    if (order) {
      connectSocket(tenant_key);
      
      const handleStatusUpdate = (updatedOrder) => {
        if (updatedOrder.id === order.id) {
          setOrder(prev => ({ ...prev, status: updatedOrder.status }));
        }
      };

      socket.on('order_updated', handleStatusUpdate);

      return () => {
        socket.off('order_updated', handleStatusUpdate);
      };
    }
  }, [order, tenant_key]);

  const addToCart = (item) => {
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
      setCart(cart.map(c => c.id === item.id ? { ...c, quantity: (c.quantity || 1) + 1 } : c));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const placeOrder = async () => {
    const orderData = {
      table_number, // Backend normalizes this to tableNumber
      items: cart,
      status: 'pending'
    };

    try {
      const response = await fetch(`http://localhost:5000/public/${tenant_key}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      const result = await response.json();
      if (response.ok) {
        setOrder(result);
      } else {
        alert("Order failed: " + (result.error?.message || "Please try again."));
      }
    } catch (err) {
      alert("Order failed. Please try again.");
    }
  };

  if (loading) return <div className="p-10 text-center font-black tracking-widest uppercase h-screen flex items-center justify-center bg-white">Loading Menu...</div>;
  if (error) return <div className="p-10 text-center text-red-500 font-bold text-xl h-screen flex items-center justify-center bg-white">Restaurant Not Found</div>;
  
  if (order) return (
    <div className="h-screen flex flex-col items-center justify-center p-6 text-center bg-white">
      <div className="w-20 h-20 border-[3px] border-slate-800 flex items-center justify-center bg-[#FBBC05] shadow-[4px_4px_0px_0px_rgba(30,41,59,1)] mb-8 animate-bounce">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      </div>
      
      <h1 className="text-4xl font-black text-black uppercase tracking-tighter">Order Placed!</h1>
      <div className="mt-6 px-6 py-3 border-[2px] border-slate-800 bg-gray-50 shadow-[4px_4px_0px_0px_rgba(30,41,59,1)]">
        <p className="font-black uppercase tracking-widest text-sm">Status</p>
        <p className={`text-2xl font-black uppercase ${order.status === 'rejected' ? 'text-red-500' : 'text-[#34A853]'}`}>
          {order.status}
        </p>
      </div>
      <p className="text-gray-500 mt-8 font-bold uppercase text-xs tracking-widest max-w-[250px]">
        Your food is being prepared for Table {table_number}. Please keep this page open for live updates.
      </p>
      
      {order.status === 'rejected' && (
        <button 
          onClick={() => setOrder(null)}
          className="mt-10 px-8 py-3 bg-black text-white font-black uppercase tracking-widest border-[2px] border-black hover:bg-white hover:text-black transition-all"
        >
          Try Again
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-24 relative shadow-2xl font-['Space_Grotesk']">
      {/* Header */}
      <div className="p-8 bg-black text-white border-b-[4px] border-slate-800">
        <h1 className="text-3xl font-black uppercase tracking-tighter italic">{tenant_key.replace(/-/g, ' ')}</h1>
        <div className="mt-2 flex items-center gap-2">
           <span className="bg-[#FBBC05] text-black text-[10px] font-black px-2 py-0.5 uppercase border-[2px] border-slate-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">TABLE {table_number}</span>
           <span className="text-xs font-bold opacity-70 tracking-widest uppercase">Digital Menu</span>
        </div>
      </div>

      {/* Menu List */}
      <div className="p-4 space-y-6 mt-4">
        {menu.map((item) => (
          <div key={item.id} className="group relative">
            <div className="absolute inset-0 bg-black translate-x-1 translate-y-1 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform"></div>
            <div className="relative flex justify-between items-center p-5 bg-white border-[2px] border-black transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1">
              <div className="flex-1 pr-4">
                <h3 className="font-black text-xl text-black uppercase tracking-tight">{item.name}</h3>
                {item.description && <p className="text-gray-500 text-sm mt-1 leading-none font-bold uppercase tracking-tight">{item.description}</p>}
                <p className="text-black font-black text-lg mt-3 italic underline decoration-[#FBBC05] decoration-4 underline-offset-4">₹{item.price}</p>
              </div>
              <button 
                onClick={() => addToCart(item)}
                className="bg-[#34A853] text-white p-3 border-[2px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 active:scale-95 transition-all text-xs font-black uppercase tracking-widest whitespace-nowrap"
              >
                + Add
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Checkout Button */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-sm border-t-[4px] border-black max-w-md mx-auto z-50">
          <button 
            onClick={placeOrder}
            className="w-full bg-[#FBBC05] text-black py-4 border-[3px] border-black font-black text-xl uppercase tracking-tighter shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
          >
            ORDER NOW ({cart.reduce((acc, i) => acc + i.quantity, 0)} ITEMS)
          </button>
        </div>
      )}
    </div>
  );
};

export default Order;
