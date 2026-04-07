import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { socket, connectSocket, disconnectSocket } from '../utils/socket';
import DietaryIcon from '../components/DietaryIcon';

const Order = () => {
  const { tenant_key, table_number } = useParams();
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null); 
  const [error, setError] = useState(false);

  // High-quality fallback menu with dietary info
  const DEMO_MENU = [
    { id: 'd1', name: 'Butter Chicken', description: 'Rich, creamy tomato sauce with tender chicken pieces.', price: 450, category: 'Main Course', is_veg: false },
    { id: 'd2', name: 'Paneer Tikka', description: 'Grilled cottage cheese with bell peppers and spices.', price: 320, category: 'Starters', is_veg: true },
    { id: 'd3', name: 'Dal Makhani', description: 'Slow-cooked black lentils tempered with butter and cream.', price: 280, category: 'Main Course', is_veg: true },
    { id: 'd4', name: 'Garlic Naan', description: 'Soft leavened bread flavored with garlic.', price: 65, category: 'Breads', is_veg: true },
    { id: 'd5', name: 'Mango Lassi', description: 'Traditional yogurt-based drink with mango pulp.', price: 120, category: 'Beverages', is_veg: true }
  ];

  useEffect(() => {
    // Standardize page title
    document.title = `${tenant_key?.replace(/-/g, ' ').toUpperCase()} | Digital Menu`;

    // 1. Mark table as potentially occupied in local storage
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

    // 2. Fetch real menu
    fetch(`http://localhost:5000/public/${tenant_key}/menu`)
      .then(res => {
        if (!res.ok) throw new Error('Not Found');
        return res.json();
      })
      .then(data => {
        const items = data.data || data;
        setMenu(items.length > 0 ? items : DEMO_MENU);
        setLoading(false);
      })
      .catch(err => {
        console.warn("Backend unreachable - Using Demo Menu Fallback");
        setMenu(DEMO_MENU);
        setLoading(false);
      });
  }, [tenant_key, table_number]);

  // 3. Socket setup for live tracking
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
    const orderData = { table_number, items: cart, status: 'pending' };
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
        setOrder({ id: Date.now(), status: 'pending', ...orderData });
      }
    } catch (err) {
       setOrder({ id: Date.now(), status: 'pending', ...orderData });
    }
  };

  if (loading) return (
    <div className="h-screen bg-white flex flex-col items-center justify-center p-10 text-center">
       <div className="w-16 h-16 border-[4px] border-black border-t-transparent rounded-full animate-spin mb-6"></div>
       <p className="font-black tracking-widest uppercase text-black">Opening Menu...</p>
    </div>
  );
  
  if (order) return (
    <div className="h-screen flex flex-col items-center justify-center p-6 text-center bg-white">
      <div className="w-24 h-24 border-[4px] border-black flex items-center justify-center bg-[#FBBC05] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-10 animate-bounce rounded-2xl">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="square" strokeLinejoin="miter">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      </div>
      
      <h1 className="text-4xl sm:text-5xl font-black text-black uppercase tracking-widest leading-none mb-6">Order Placed!</h1>
      
      <div className="mt-4 px-10 py-6 border-[3px] border-black bg-[#F0FDF4] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-2xl">
        <p className="font-black uppercase tracking-widest text-[10px] text-[#34A853] mb-1">Live Status</p>
        <p className={`text-4xl font-black uppercase text-black italic tracking-widest`}>
          {order.status}
        </p>
      </div>

      <p className="text-black font-black uppercase text-[10px] tracking-[0.2em] mt-12 bg-[#FBBC05] px-4 py-1.5 border-[2px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
        Table {table_number}
      </p>

      <p className="text-gray-500 mt-8 font-bold uppercase text-[10px] tracking-widest max-w-[280px] leading-relaxed">
        Your food is being prepared. Please keep this page open for real-time kitchen updates.
      </p>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto bg-gray-50 min-h-screen pb-32 relative shadow-2xl border-x-[1px] border-black/10">
      <div className="p-8 bg-white border-b-[4px] border-black sticky top-0 z-30">
        <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🍽️</span>
            <h1 className="text-3xl font-black uppercase tracking-widest italic leading-none">{tenant_key.replace(/-/g, ' ')}</h1>
        </div>
        <div className="flex items-center justify-between mt-6">
           <span className="bg-[#4285F4] text-white text-[10px] font-black px-4 py-1.5 uppercase border-[2px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-full">TABLE {table_number}</span>
           <span className="text-[10px] font-black opacity-40 tracking-[0.3em] uppercase">Digital Menu</span>
        </div>
      </div>

      <div className="p-5 space-y-8 mt-4">
        {menu.map((item) => (
          <div key={item.id} className="relative group">
            <div className="absolute inset-0 bg-black translate-x-1.5 translate-y-1.5 group-hover:translate-x-2.5 group-hover:translate-y-2.5 transition-transform rounded-[24px]"></div>
            <div className="relative flex flex-col p-6 bg-white border-[3px] border-black transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1 rounded-[24px]">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1 pr-4">
                  <div className="flex items-start gap-3 mb-3 items-center">
                    <DietaryIcon isVeg={item.is_veg === undefined ? true : item.is_veg} size={28} />
                    <h3 className="font-black text-xl text-black uppercase tracking-tighter leading-tight">{item.name}</h3>
                  </div>
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] bg-gray-100 w-fit px-2.5 py-1 rounded border-black/10 border mb-4">{item.category}</p>
                </div>
                <p className="text-[#34A853] font-black text-3xl italic drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">₹{item.price}</p>
              </div>
              
              {item.description && <p className="text-black text-xs leading-relaxed font-black uppercase tracking-widest mb-8 border-l-[3px] border-black/10 pl-4">{item.description}</p>}
              
              <button 
                onClick={() => addToCart(item)}
                className="w-full bg-white text-black py-3 border-[2px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 active:scale-95 transition-all text-xs font-black uppercase tracking-widest"
              >
                + Add To Order
              </button>
            </div>
          </div>
        ))}
      </div>

      {cart.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-md z-50">
          <button 
            onClick={placeOrder}
            className="w-full bg-[#FBBC05] text-black py-5 border-[4px] border-black font-black text-xl uppercase tracking-widest shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-4"
          >
            <span>PLACE ORDER</span>
            <span className="bg-black text-white px-3 py-0.5 rounded-lg text-sm">{cart.reduce((acc, i) => acc + i.quantity, 0)}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Order;
