import React, { useState, useEffect } from 'react';
import { socket, connectSocket, disconnectSocket } from '../utils/socket';

const BillingManage = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState(null);
  const [filterTab, setFilterTab] = useState('active'); // active, all
  const [viewState, setViewState] = useState('none'); // none, actions, invoice

  // Settings
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('app_settings_profile');
    if (saved) return JSON.parse(saved);
    return { name: 'Tasty Spice Restaurant', address: '123 MG Road, Mumbai', phone: '4556553', gstin: '545413523' };
  });

  const [billingInfo, setBillingInfo] = useState(() => {
    const saved = localStorage.getItem('app_settings_billing');
    if (saved) return JSON.parse(saved);
    return { gst: 18, serviceCharge: 0, billPrefix: 'INV-', startNumber: 100, autoReset: false, thankYouMessage: 'Thank You! Please Visit Again!' };
  });

  const loadSamples = () => {
    const newSamples = [
      { id: `S1-${Date.now()}`, table_number: '14', status: 'completed', items: [{ name: 'Chicken Biryani', price: 350, quantity: 2 }, { name: 'Coke', price: 60, quantity: 2 }] },
      { id: `S2-${Date.now()}`, table_number: '05', status: 'completed', items: [{ name: 'Paneer Butter Masala', price: 280, quantity: 1 }, { name: 'Butter Naan', price: 45, quantity: 3 }] },
      { id: `S3-${Date.now()}`, table_number: '99', status: 'paid', payment_mode: 'UPI', items: [{ name: 'Hakka Noodles', price: 210, quantity: 1 }, { name: 'Chilli Chicken', price: 260, quantity: 1 }] },
      { id: `S4-${Date.now()}`, table_number: '07', status: 'completed', items: [{ name: 'Masala Dosa', price: 120, quantity: 3 }, { name: 'Filter Coffee', price: 40, quantity: 3 }] },
      { id: `S5-${Date.now()}`, table_number: '12', status: 'completed', items: [{ name: 'Veg Pizza (Large)', price: 450, quantity: 1 }, { name: 'Garlic Bread', price: 150, quantity: 1 }] },
      { id: `S6-${Date.now()}`, table_number: '03', status: 'completed', items: [{ name: 'Mutton Rogan Josh', price: 480, quantity: 1 }, { name: 'Steam Rice', price: 120, quantity: 1 }] },
      { id: `S7-${Date.now()}`, table_number: '21', status: 'paid', payment_mode: 'Cash', items: [{ name: 'Ice Cream Sundae', price: 180, quantity: 2 }] },
      { id: `S8-${Date.now()}`, table_number: '08', status: 'completed', items: [{ name: 'Tandoori Platter', price: 550, quantity: 1 }, { name: 'Fresh Lime Soda', price: 80, quantity: 4 }] }
    ];
    setBills(prev => [...newSamples, ...prev]);
  };

  // 1. Initial Fetch
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const result = await response.json();

        if (response.ok && result.data?.length > 0) {
          const completedOrders = result.data.filter(o => o.status === 'completed' || o.status === 'paid');
          setBills(completedOrders);

          if (result.tenantKey) {
            connectSocket(result.tenantKey);
          }
        } else {
          // If no live data, load samples for better UI feedback
          loadSamples();
        }
      } catch (err) {
        console.error('Fetch error:', err);
        loadSamples();
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
    const handleOrderUpdated = (updatedOrder) => {
      setBills(prev => {
        if (updatedOrder.status === 'completed' || updatedOrder.status === 'paid') {
          const exists = prev.find(b => b.id === updatedOrder.id);
          if (exists) {
            return prev.map(b => b.id === updatedOrder.id ? updatedOrder : b);
          } else {
            return [updatedOrder, ...prev];
          }
        } else if (updatedOrder.status === 'rejected') {
          if (selectedBill?.id === updatedOrder.id) setSelectedBill(null);
          return prev.filter(b => b.id !== updatedOrder.id);
        }
        return prev;
      });
    };

    socket.on('order_updated', handleOrderUpdated);
    return () => {
      socket.off('order_updated', handleOrderUpdated);
    };
  }, [selectedBill]);

  const calculateSubtotal = (itemsString) => {
    try {
      const items = Array.isArray(itemsString) ? itemsString : JSON.parse(itemsString || '[]');
      return items.reduce((acc, item) => {
        const p = Number(item.price) || 0;
        const q = Number(item.quantity) || 1;
        return acc + (p * q);
      }, 0);
    } catch (e) {
      return 0;
    }
  };

  const handlePayment = async (method) => {
    if (!selectedBill) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/dashboard/orders/${selectedBill.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'paid', payment_mode: method })
      });

      if (response.ok) {
        setBills(prev => prev.map(b => b.id === selectedBill.id ? { ...b, status: 'paid', payment_mode: method } : b));
        setViewState('none');
        setSelectedBill(null);
      }
    } catch (e) {
      console.error(e);
      setBills(prev => prev.map(b => b.id === selectedBill.id ? { ...b, status: 'paid', payment_mode: method } : b));
      setViewState('none');
      setSelectedBill(null);
    }
  };

  const handlePrint = () => {
    if (!selectedBill) return;
    const items = Array.isArray(selectedBill.items)
      ? selectedBill.items
      : JSON.parse(selectedBill.items || '[]');

    const subtotal = calculateSubtotal(selectedBill.items);
    const gstAmt = (subtotal * billingInfo.gst) / 100;
    const scAmt = (subtotal * (Number(billingInfo.serviceCharge) || 0)) / 100;
    const grandTotal = calculateTotal(subtotal);

    const itemRows = items.map(item => `
      <tr>
        <td style="padding:4px 0;">${item.name}</td>
        <td style="padding:4px 0; text-align:center;">${item.quantity || 1}</td>
        <td style="padding:4px 0; text-align:right;">${item.price}</td>
        <td style="padding:4px 0; text-align:right;">&#8377;${item.price * (item.quantity || 1)}</td>
      </tr>`).join('');

    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Bill - ${billingInfo.billPrefix}${Number(billingInfo.startNumber) + selectedBill.displayId}</title>
        <style>
          @page { margin: 5mm; size: 80mm auto; }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Courier New', Courier, monospace;
            font-size: 14px;
            width: 100%;
            max-width: 520px;
            margin: 0 auto;
            padding: 24px 28px;
            color: #000;
            background: #fff;
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .name { font-size: 22px; font-weight: bold; letter-spacing: 2px; margin-bottom: 6px; text-transform: uppercase; }
          .sub-info { font-size: 13px; margin-bottom: 2px; }
          .divider { border: none; border-top: 1px dashed #000; margin: 10px 0; }
          .divider-solid { border: none; border-top: 2px solid #000; margin: 10px 0; }
          table { width: 100%; border-collapse: collapse; }
          th { font-size: 12px; text-transform: uppercase; border-bottom: 2px solid #000; padding: 6px 4px; text-align: left; }
          th:not(:first-child) { text-align: right; }
          td { font-size: 14px; vertical-align: top; padding: 5px 4px; }
          td:not(:first-child) { text-align: right; }
          .total-row td { font-weight: bold; padding-top: 6px; font-size: 14px; }
          .grand-total td { font-size: 18px; font-weight: bold; padding-top: 8px; }
          .thanks { text-align:center; margin-top: 16px; font-style: italic; font-size: 13px; }
          .meta { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 5px; }
          .print-btn {
            display: block;
            width: 100%;
            padding: 12px;
            margin-top: 20px;
            background: #000;
            color: #fff;
            border: none;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            font-weight: bold;
            letter-spacing: 2px;
            text-transform: uppercase;
            cursor: pointer;
          }
          .print-btn:hover { background: #333; }
          @media print {
            .print-btn { display: none !important; }
            body { padding: 0; font-size: 11px; max-width: 80mm; }
            .name { font-size: 14px; }
            .sub-info { font-size: 10px; }
            th { font-size: 9px; }
            td { font-size: 10px; }
            .total-row td { font-size: 10px; }
            .grand-total td { font-size: 13px; }
            .meta { font-size: 10px; }
          }
        </style>
      </head>
      <body>
        <div class="center">
          <div class="name">${profile.name}</div>
          <div class="sub-info">${profile.address}</div>
          <div class="sub-info">Ph: ${profile.phone} &nbsp;|&nbsp; GSTIN: ${profile.gstin}</div>
        </div>
        <hr class="divider-solid">
        <div class="meta">
          <span><strong>Bill No:</strong> ${billingInfo.billPrefix}${Number(billingInfo.startNumber) + selectedBill.displayId}</span>
          <span><strong>Table:</strong> ${selectedBill.table_number}</span>
        </div>
        <div class="meta"><span><strong>Date:</strong> ${new Date().toLocaleString()}</span></div>
        <hr class="divider">
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Amt</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>
        <hr class="divider">
        <table>
          <tr class="total-row"><td>Subtotal</td><td>&#8377;${subtotal.toFixed(2)}</td></tr>
          ${Number(billingInfo.serviceCharge) > 0 ? `<tr class="total-row"><td>Service Chg. (${billingInfo.serviceCharge}%)</td><td>&#8377;${scAmt.toFixed(2)}</td></tr>` : ''}
          <tr class="total-row"><td>GST (${billingInfo.gst}%)</td><td>&#8377;${gstAmt.toFixed(2)}</td></tr>
        </table>
        <hr class="divider-solid">
        <table>
          <tr class="grand-total"><td>GRAND TOTAL</td><td>&#8377;${grandTotal.toFixed(2)}</td></tr>
        </table>
        <div class="thanks">${billingInfo.thankYouMessage}</div>
        <button class="print-btn" onclick="window.print()">&#128438; Print Receipt</button>
      </body>
      </html>`;


    const win = window.open('', '_blank', 'width=620,height=800,toolbar=0,scrollbars=1,status=0,resizable=1');
    win.document.write(content);
    win.document.close();
    win.focus();
    win.print();
    win.onafterprint = () => win.close();
  };

  const calculateTotal = (sub) => {
    const gstAmount = (sub * (billingInfo.gst / 100));
    const scAmount = (sub * (Number(billingInfo.serviceCharge) || 0)) / 100;
    return sub + gstAmount + scAmount;
  };

  return (
    <div 
      className="p-4 sm:p-6 md:px-10 space-y-8 bg-white min-h-full print-wrapper flex flex-col items-center"
      onClick={() => {
        if (selectedBill) {
          setSelectedBill(null);
          setViewState('none');
        }
      }}
    >
      <div className="w-full max-w-[1400px] pb-10" onClick={(e) => e.stopPropagation()}>
        {/* ── Standardized Header ── */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl sm:text-4xl font-black text-black uppercase tracking-widest leading-none">
              Billing
            </h1>
            
            {/* Load Samples Button (Standardized) */}
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

          <div className="flex gap-4">
            <button 
              onClick={() => {
                setFilterTab('active');
                setViewState('none');
                setSelectedBill(null);
              }} 
              className={`
                whitespace-nowrap px-8 py-3 font-black uppercase text-xs tracking-[0.2em] 
                border-[3px] rounded-full transition-all duration-200
                ${filterTab === 'active' 
                  ? 'translate-x-1 translate-y-1 shadow-none bg-[#FEF2F2] border-[#EA4335]' 
                  : 'bg-white border-black hover:-translate-y-1 shadow-[4px_4px_0px_0px_#EA4335]'
                }
                text-black
              `}
            >
              Active ({bills.filter(b => b.status === 'completed').length})
            </button>
            <button 
              onClick={() => {
                setFilterTab('all');
                setViewState('none');
                setSelectedBill(null);
              }} 
              className={`
                whitespace-nowrap px-8 py-3 font-black uppercase text-xs tracking-[0.2em] 
                border-[3px] rounded-full transition-all duration-200
                ${filterTab === 'all' 
                  ? 'translate-x-1 translate-y-1 shadow-none bg-[#EFF6FF] border-[#4285F4]' 
                  : 'bg-white border-black hover:-translate-y-1 shadow-[4px_4px_0px_0px_#4285F4]'
                }
                text-black
              `}
            >
              All Bills ({bills.length})
            </button>
          </div>
        </div>

        <div className="border-b-[3px] border-black mb-8"></div>

        <div className="flex flex-col lg:flex-row gap-10 items-start">

          {/* Left Column: Active Bills */}
          <div className="w-full lg:w-[400px] flex flex-col shrink-0 no-print sticky top-6 h-[calc(100vh-10rem)]">

            {/* Scrollable list frame */}
            <div className="flex-1 overflow-y-auto space-y-3 px-1.5 pt-1.5 pb-8 custom-scrollbar rounded-2xl bg-white">
              {(() => {
                const displayedBills = filterTab === 'active' ? bills.filter(b => b.status === 'completed') : bills;
                if (loading) return <p className="p-4 text-black font-black tracking-widest uppercase text-[9px]">Fetching bills...</p>;
                if (displayedBills.length === 0) return (
                  <div className="m-4 p-8 border-[3px] border-black border-dashed rounded-2xl flex items-center justify-center bg-white">
                      <p className="text-[9px] font-black uppercase tracking-[0.2em]">No {filterTab === 'active' ? 'Active ' : ''}Bills</p>
                  </div>
                );
                return displayedBills.map(bill => {
                  const displayId = bills.findIndex(b => b.id === bill.id) !== -1 ? bills.length - bills.findIndex(b => b.id === bill.id) : 0;
                  const isSelected = selectedBill?.id === bill.id;
                  const subtotal = calculateSubtotal(bill.items);
                  
                  return (
                    <div
                      key={bill.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (selectedBill?.id === bill.id) {
                          setSelectedBill(null);
                          setViewState('none');
                        } else {
                          setSelectedBill({ ...bill, displayId });
                          setViewState('actions');
                        }
                      }}
                      className={`
                        relative p-5 rounded-2xl border-[2px] border-black transition-all cursor-pointer group overflow-hidden mb-3
                        ${isSelected 
                          ? 'translate-x-1 translate-y-1 bg-[#f9f9f9] shadow-none' 
                          : 'bg-white hover:-translate-y-1 shadow-[4px_4px_0px_#4285F4] hover:shadow-[6px_6px_0px_#4285F4]'
                        }
                      `}
                      style={isSelected ? { backgroundColor: '#f9f9f9' } : {}}
                    >
                       {/* Background Bloom (Blob) for Card - Subtler Blue theme */}
                       <div className={`
                         absolute -right-6 -bottom-6 w-32 h-32 rounded-full blur-[18px] pointer-events-none transition-all duration-500
                         ${isSelected ? 'opacity-30 scale-125' : 'opacity-[0.08] group-hover:opacity-[0.15] group-hover:scale-110'}
                         bg-[#4285F4]
                       `} />

                       {/* Dot grid decoration */}
                       <div className="absolute inset-0 pointer-events-none opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#000 1.2px, transparent 1.2px)', backgroundSize: '12px 12px' }} />
                       
                       {/* Context blur on selection */}
                       <div className={`relative z-10 flex justify-between items-center transition-all duration-300 ${isSelected && viewState === 'actions' ? 'blur-md opacity-20 scale-95' : ''}`}>
                        <div>
                          <h3 className="text-black font-black text-base transition-colors leading-none tracking-tight">Order #{displayId}</h3>
                          <p className="text-black font-black uppercase tracking-[0.2em] text-[10px] mt-1.5 opacity-60">Table {bill.table_number}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-black font-black text-base leading-none mb-1.5 tracking-tight">₹{subtotal}</p>
                          <div className={`
                            px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border-[2px] border-black
                            ${isSelected ? 'bg-black text-white' : (bill.status === 'paid' ? 'bg-[#ECFDF5] text-[#34A853]' : 'bg-[#FEF2F2] text-[#EA4335]')}
                          `}>
                            {bill.status === 'paid' ? 'PAID' : 'UNPAID'}
                          </div>
                        </div>
                      </div>

                      {/* Action Overlay (TINY COMPACT CIRCLES) */}
                      {isSelected && viewState === 'actions' && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center p-4">
                          <div className="flex gap-4 animate-in fade-in zoom-in duration-300">
                             {/* View Bill */}
                             <button
                               onClick={(e) => { e.stopPropagation(); setViewState('invoice'); }}
                               className="w-10 h-10 rounded-full bg-white border-[2.5px] border-black flex items-center justify-center text-lg shadow-[3px_3px_0px_#000] transition-all hover:scale-110 active:translate-x-1 active:translate-y-1 active:shadow-none"
                               title="View Bill"
                             >
                               👁️
                             </button>
                             {/* Cash */}
                             <button
                               onClick={(e) => { e.stopPropagation(); handlePayment('Cash'); }}
                               className="w-10 h-10 rounded-full bg-white border-[2.5px] border-black flex items-center justify-center text-lg shadow-[3px_3px_0px_#16A34A] transition-all hover:scale-110 active:translate-x-1 active:translate-y-1 active:shadow-none"
                               title="Cash"
                             >
                               <span className="text-[#16A34A] font-black">₹</span>
                             </button>
                             {/* UPI */}
                             <button
                               onClick={(e) => { e.stopPropagation(); handlePayment('UPI'); }}
                               className="w-10 h-10 rounded-full bg-white border-[2.5px] border-black flex items-center justify-center text-lg shadow-[3px_3px_0px_#9333EA] transition-all hover:scale-110 active:translate-x-1 active:translate-y-1 active:shadow-none"
                               title="UPI"
                             >
                                <svg className="w-5 h-5 text-[#9333EA]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect>
                                  <rect x="3" y="14" width="7" height="7"></rect><path d="M14 14h3v3h-3zM18 18h3v3h-3z"></path>
                                </svg>
                             </button>
                             {/* Card */}
                             <button
                               onClick={(e) => { e.stopPropagation(); handlePayment('Card'); }}
                               className="w-10 h-10 rounded-full bg-white border-[2.5px] border-black flex items-center justify-center text-lg shadow-[3px_3px_0px_#2563EB] transition-all hover:scale-110 active:translate-x-1 active:translate-y-1 active:shadow-none"
                               title="Card"
                             >
                               <svg className="w-5 h-5 text-[#2563EB]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                 <rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line>
                               </svg>
                             </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })
              })()}
            </div>
          </div>

          {/* Right Column: Balanced Invoice Viewer */}
          <div className="flex-1 w-full lg:max-w-none no-print self-stretch min-h-[600px] lg:h-[calc(100vh-10rem)]">
            <div className="h-full rounded-[32px] bg-white border-[3px] border-black shadow-[12px_12px_0px_#A855F7] overflow-hidden relative flex flex-col group">
              {/* Decorative Dot Grid - Purple Theme (Synchronized) */}
              <div className="absolute inset-0 opacity-[0.2] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#A855F7 1.2px, transparent 1.2px)', backgroundSize: '16px 16px' }} />
              
              {/* Decorative Bloom effect (Blob) - Purple (Synchronized) */}
              <div className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full blur-[110px] opacity-20 pointer-events-none transition-all duration-700 group-hover:scale-110 bg-[#A855F7]" />

              {/* Framework Header with Integrated Change Bill */}
              <div className="relative z-10 flex justify-between items-center p-8 pb-4 shrink-0 transition-all">
                {viewState === 'invoice' && (
                  <>
                    <div className="bg-[#A855F7] border-[3px] border-black px-6 py-2 shadow-[4px_4px_0px_#000] -rotate-1 hover:rotate-0 transition-transform">
                      <h3 className="font-black text-xl uppercase italic tracking-wider text-white">
                        Invoice Preview
                      </h3>
                    </div>
                    
                    <button 
                      onClick={() => { setViewState('actions'); }}
                      className="px-6 py-2.5 bg-white text-black border-[3px] border-black rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-[0px_6px_0px_0px_#A855F7] hover:-translate-y-1 active:translate-y-1 active:shadow-none active:bg-[#FAF5FF] transition-all"
                    >
                      ← Change Bill
                    </button>
                  </>
                )}
              </div>

              {/* Context Render based on viewState */}
              <div className="relative z-10 flex-1 flex flex-col overflow-hidden min-h-0">
                {viewState === 'none' ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-10 opacity-30">
                    <div className="w-14 h-14 border-[3px] border-black border-dashed flex items-center justify-center mb-6 bg-white rounded-2xl">
                      <svg className="w-7 h-7 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                      </svg>
                    </div>
                    <p className="text-sm font-black uppercase text-black tracking-widest">Select a bill to start</p>
                  </div>
                ) : viewState === 'actions' ? (
                  /* Placeholder when card actions are active */
                  <div className="flex-1 flex flex-col items-center justify-center p-10 animate-pulse">
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Select action on bill card</p>
                  </div>
                ) : (
                  /* Invoice View Stage */
                  <div className="flex-1 flex flex-col p-8 pt-0 overflow-hidden">
                    {/* Controls Placeholder (Button moved to header) */}
                    <div className="mb-4" />

                    {/* Scrollable Receipt Area */}
                    <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar mb-6 flex justify-center">
                      <div className="w-full max-w-[420px] h-fit p-10 border-[3.5px] border-black bg-white shadow-[10px_10px_0px_rgba(0,0,0,0.05)] flex flex-col bill-print-area relative">
                        {/* Dot pattern inside paper too? No, keep it clean like receipt */}
                        
                        {/* Receipt Inner Header */}
                        <div className="text-center border-b-[3.5px] border-black pb-6 mb-6">
                          <h2 className="text-2xl font-black text-black uppercase tracking-tight leading-none mb-2">{profile.name}</h2>
                          <p className="text-[10px] font-bold text-black uppercase leading-tight">{profile.address}</p>
                          <p className="text-[10px] font-bold text-black uppercase mt-1">GSTIN: {profile.gstin}</p>
                        </div>

                        {/* Order Meta */}
                        <div className="flex justify-between items-end mb-6 border-b-[3px] border-black pb-4 text-[11px] font-black uppercase">
                          <div>
                            <p>Bill: {billingInfo.billPrefix}{Number(billingInfo.startNumber) + selectedBill.displayId}</p>
                            <p className="opacity-50 mt-1">{new Date().toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p>Table: {selectedBill.table_number}</p>
                          </div>
                        </div>

                        {/* Items */}
                        <div className="mb-6 space-y-4">
                          {(() => {
                            const items = Array.isArray(selectedBill.items) ? selectedBill.items : JSON.parse(selectedBill.items || '[]');
                            return items.map((item, idx) => {
                              const p = Number(item.price) || 0;
                              const q = Number(item.quantity) || 1;
                              return (
                                <div key={idx} className="flex justify-between items-start">
                                  <p className="text-xs font-black uppercase flex-1 pr-4 leading-tight">{item.name}</p>
                                  <div className="flex gap-4 w-28 justify-between shrink-0 font-black">
                                    <p className="text-[11px] opacity-40">{q}x</p>
                                    <p className="text-xs text-right w-full tracking-tighter">₹{p * q}</p>
                                  </div>
                                </div>
                              );
                            });
                          })()}
                        </div>

                        {/* Totals */}
                        <div className="border-t-[3px] border-black pt-4 space-y-2 mt-auto">
                          <div className="flex justify-between font-black text-[11px] uppercase">
                            <p>Subtotal</p>
                            <p>₹{calculateSubtotal(selectedBill.items).toFixed(0)}</p>
                          </div>
                          {Number(billingInfo.serviceCharge) > 0 && (
                            <div className="flex justify-between font-black text-[11px] uppercase">
                              <p>Service ({billingInfo.serviceCharge}%)</p>
                              <p>+₹{((calculateSubtotal(selectedBill.items) * Number(billingInfo.serviceCharge)) / 100).toFixed(0)}</p>
                            </div>
                          )}
                          <div className="flex justify-between font-black text-[11px] uppercase pb-4">
                            <p>GST ({billingInfo.gst}%)</p>
                            <p>+₹{((calculateSubtotal(selectedBill.items) * billingInfo.gst) / 100).toFixed(0)}</p>
                          </div>
                          <div className="flex justify-between pt-4 items-center border-t-[3px] border-black">
                            <p className="text-lg font-black uppercase italic">Total</p>
                            <p className="text-2xl font-black bg-black text-white px-3 py-1 border-[2px] border-black tracking-tighter">
                              ₹{calculateTotal(calculateSubtotal(selectedBill.items)).toFixed(0)}
                            </p>
                          </div>
                        </div>

                        <p className="text-center mt-8 text-[11px] font-black uppercase leading-tight italic opacity-40">{billingInfo.thankYouMessage}</p>
                      </div>
                    </div>

                    {/* Bottom Balanced Control */}
                    <div className="shrink-0 flex justify-center py-6">
                      <button 
                         onClick={handlePrint}
                         className="flex items-center gap-3 px-12 py-4 bg-white text-black border-[3px] border-black rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-[0px_6px_0px_0px_#A855F7] hover:-translate-y-1 active:translate-y-1 active:shadow-none active:bg-[#FAF5FF] transition-all group"
                      >
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                          <polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" />
                        </svg>
                        Download Invoice
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingManage;

