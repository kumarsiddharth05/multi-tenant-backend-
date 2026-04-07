import React, { useState, useEffect } from 'react';
import { socket, connectSocket, disconnectSocket } from '../utils/socket';

const BillingManage = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState(null);

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

  // 1. Initial Fetch
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const result = await response.json();

        if (response.ok) {
          const completedOrders = result.data.filter(o => o.status === 'completed');
          setBills(completedOrders);

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
    const handleOrderUpdated = (updatedOrder) => {
      setBills(prev => {
        if (updatedOrder.status === 'completed') {
          if (!prev.find(b => b.id === updatedOrder.id)) {
            return [updatedOrder, ...prev];
          }
        } else if (updatedOrder.status === 'paid' || updatedOrder.status === 'rejected') {
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
      return items.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
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
        setBills(prev => prev.filter(b => b.id !== selectedBill.id));
        setSelectedBill(null);
      }
    } catch (e) {
      console.error(e);
      setBills(prev => prev.filter(b => b.id !== selectedBill.id));
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
    <div className="p-4 sm:p-6 md:px-10 space-y-8 bg-white min-h-full font-['Space_Grotesk'] print-wrapper flex flex-col items-center">

      <div className="w-full max-w-[1400px] pb-10">
        {/* Header */}
        <div className="border-b-[4px] border-black pb-8 no-print mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-black uppercase tracking-tighter leading-none mb-3">Billing</h1>
          <p className="text-black font-black text-[10px] tracking-[0.2em] uppercase">Settlement and Payment Processing</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 items-start">

          {/* Left Column: Active Bills */}
          <div className="w-full lg:w-[400px] flex flex-col shrink-0 no-print sticky top-6 h-[calc(100vh-2rem)]">
            <div className="flex items-center gap-3 bg-white border-[3px] border-black p-4 rounded-2xl shadow-[4px_4px_0px_#000] mb-6 relative overflow-hidden group">
               {/* Dot grid decoration */}
               <div className="absolute inset-0 pointer-events-none opacity-10" style={{ backgroundImage: 'radial-gradient(#000 1.2px, transparent 1.2px)', backgroundSize: '12px 12px' }} />
               <h2 className="text-lg font-black text-black uppercase tracking-widest leading-none relative z-10">
                Active Bills
              </h2>
              <span className="ml-auto bg-black text-white font-black text-xs px-3 py-1 rounded-full relative z-10">{bills.length}</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 px-1 pt-1 pb-6 custom-scrollbar pr-2">
              {loading ? (
                <p className="text-black font-black tracking-widest uppercase text-[9px]">Fetching bills...</p>
              ) : bills.length === 0 ? (
                <div className="p-8 border-[3px] border-black border-dashed rounded-2xl flex items-center justify-center bg-white">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em]">No Active Bills</p>
                </div>
              ) : (
                bills.map((bill, index) => {
                  const displayId = bills.length - index;
                  const isSelected = selectedBill?.id === bill.id;
                  const subtotal = calculateSubtotal(bill.items);
                  
                  return (
                    <div
                      key={bill.id}
                      onClick={() => setSelectedBill({ ...bill, displayId })}
                      className={`
                        relative p-5 rounded-2xl border-[3px] border-black transition-all cursor-pointer group overflow-hidden
                        ${isSelected 
                          ? 'bg-[#EEF4FF] translate-x-1 translate-y-1 shadow-none border-[#4285F4]' 
                          : 'bg-white shadow-[4px_4px_0px_#000] hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#000]'
                        }
                      `}
                    >
                       {/* Dot grid decoration */}
                       <div className="absolute inset-0 pointer-events-none opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#000 1.2px, transparent 1.2px)', backgroundSize: '12px 12px' }} />
                       
                       {/* Decorative Ellipse (Blob) */}
                       <div 
                         className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full blur-2xl opacity-10 pointer-events-none transition-transform group-hover:scale-150 duration-500"
                         style={{ backgroundColor: isSelected ? '#4285F4' : '#000' }}
                       />

                      <div className="relative z-10 flex justify-between items-center">
                        <div>
                          <h3 className="text-black font-black text-lg transition-colors leading-none tracking-tight">Order #{displayId}</h3>
                          <p className="text-black font-black uppercase tracking-[0.2em] text-[9px] mt-1.5">Table {bill.table_number}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-black font-black text-lg leading-none mb-1.5 tracking-tight">₹{subtotal}</p>
                          <div className={`
                            px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border-[2px] border-black
                            ${isSelected ? 'bg-[#4285F4] text-white' : 'bg-[#FEF2F2] text-[#EA4335]'}
                          `}>
                            UNPAID
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Right Column: Invoice Viewer */}
          <div className="flex-1 w-full lg:max-w-none no-print">
            {!selectedBill ? (
              <div className="flex flex-col items-center justify-center border-[3px] border-dashed border-black rounded-[24px] bg-[#f8f8f8] no-print p-10 min-h-[400px]">
                <div className="w-12 h-12 border-[3px] border-black flex items-center justify-center mb-4 bg-white rounded-xl">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                  </svg>
                </div>
                <p className="text-sm font-black uppercase text-black text-center">Select an active bill to generate invoice</p>
              </div>
            ) : (
              <div className="flex flex-col gap-6 no-print w-full items-center">
                {/* The Invoice Sheet */}
                <div className="w-full flex justify-center">
                  <div className="w-full max-w-[400px] h-fit p-6 sm:p-8 border-[3px] border-black bg-white shadow-[4px_4px_0px_#000] rounded-none flex flex-col bill-print-area">
                    {/* Invoice Header */}
                    <div className="text-center border-b-[3px] border-black pb-4 mb-4">
                      <h2 className="text-3xl font-black text-black uppercase tracking-tight">{profile.name}</h2>
                      <p className="text-black font-bold text-xs uppercase mt-2">{profile.address}</p>
                      <p className="text-black font-bold text-xs uppercase">Phone: {profile.phone}</p>
                      <p className="text-black font-bold text-xs uppercase">GSTIN: {profile.gstin}</p>
                    </div>

                    {/* Receipt Context */}
                    <div className="flex justify-between items-end mb-6 border-b-[3px] border-black pb-4">
                      <div>
                        <p className="text-black font-bold text-sm uppercase">Bill No: {billingInfo.billPrefix}{Number(billingInfo.startNumber) + selectedBill.displayId}</p>
                        <p className="text-black font-bold text-sm uppercase mt-1">Date: {new Date().toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-black font-bold text-sm uppercase">Table: {selectedBill.table_number}</p>
                      </div>
                    </div>

                    {/* Items Grid */}
                    <div className="mb-6 flex-1">
                      <div className="flex justify-between pb-2 border-b-[3px] border-black mb-4">
                        <p className="font-black text-sm uppercase">Item</p>
                        <div className="flex gap-4 w-32 justify-between">
                          <p className="font-black text-sm uppercase">Qty</p>
                          <p className="font-black text-sm uppercase text-right w-full">Amount</p>
                        </div>
                      </div>
                      
                      {(() => {
                        const items = Array.isArray(selectedBill.items) ? selectedBill.items : JSON.parse(selectedBill.items || '[]');
                        return items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-start py-2">
                            <p className="text-sm font-bold text-black uppercase pr-4">{item.name}</p>
                            <div className="flex gap-4 w-32 justify-between shrink-0">
                              <p className="text-sm font-bold text-black text-center">{item.quantity || 1}</p>
                              <p className="text-sm font-bold text-black text-right w-full">₹{item.price * (item.quantity || 1)}</p>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>

                    {/* Totals Frame */}
                    <div className="border-t-[3px] border-black pt-4 space-y-2 mt-auto">
                      <div className="flex justify-between font-bold">
                        <p className="text-sm uppercase">Subtotal</p>
                        <p className="text-sm">₹{calculateSubtotal(selectedBill.items).toFixed(2)}</p>
                      </div>
                      
                      {Number(billingInfo.serviceCharge) > 0 && (
                        <div className="flex justify-between font-bold">
                          <p className="text-sm uppercase">Service Chg. ({billingInfo.serviceCharge}%)</p>
                          <p className="text-sm">₹{((calculateSubtotal(selectedBill.items) * Number(billingInfo.serviceCharge)) / 100).toFixed(2)}</p>
                        </div>
                      )}

                      <div className="flex justify-between font-bold pb-4 border-b-[3px] border-black">
                        <p className="text-sm uppercase">Tax / GST ({billingInfo.gst}%)</p>
                        <p className="text-sm">₹{((calculateSubtotal(selectedBill.items) * billingInfo.gst) / 100).toFixed(2)}</p>
                      </div>
                      <div className="flex justify-between pt-2 items-center">
                        <p className="text-xl font-black uppercase">Grand Total</p>
                        <p className="text-2xl font-black bg-black text-white px-3 py-1 border-[2px] border-black">₹{calculateTotal(calculateSubtotal(selectedBill.items)).toFixed(2)}</p>
                      </div>
                    </div>
                    
                    <div className="text-center mt-8 border-t-[3px] border-black pt-4">
                         <p className="text-black font-bold text-sm uppercase italic">{billingInfo.thankYouMessage}</p>
                    </div>
                  </div>
                </div>

                {/* Billing Action Panel */}
                <div className="flex justify-center w-full mt-4 pb-10">
                  <div className="w-full max-w-[400px]">
                    <button 
                      id="print-bill-btn"
                      className="w-full py-4 mb-4 bg-black border-[3px] border-black rounded-xl font-black uppercase tracking-widest text-white shadow-[4px_4px_0px_#A855F7] hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#A855F7] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3 group"
                      onClick={handlePrint}
                    >
                      <svg className="w-6 h-6 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="6 9 6 2 18 2 18 9"></polyline>
                        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                        <rect x="6" y="14" width="12" height="8"></rect>
                      </svg>
                      <span className="text-sm">Download / Print Bill</span>
                    </button>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <button 
                        onClick={() => handlePayment('Cash')}
                        className="flex flex-col items-center justify-center py-5 bg-[#F0FDF4] border-[3px] border-black rounded-xl shadow-[4px_4px_0px_#16A34A] hover:-translate-y-1 hover:shadow-[6px_6px_0px_#16A34A] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all group"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 mb-2 group-hover:scale-110 group-hover:rotate-3 transition-transform"><path d="M6 3h12M6 8h12M6 13h3c2.667 0 4-1.333 4-4s-1.333-4-4-4M9 13l4.5 8"></path></svg>
                        <span className="font-black text-sm uppercase text-black">Cash</span>
                      </button>

                      <button 
                        onClick={() => handlePayment('UPI')}
                        className="flex flex-col items-center justify-center py-5 bg-[#FAF5FF] border-[3px] border-black rounded-xl shadow-[4px_4px_0px_#9333EA] hover:-translate-y-1 hover:shadow-[6px_6px_0px_#9333EA] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all group"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="#9333EA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 mb-2 group-hover:scale-110 group-hover:-rotate-3 transition-transform"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h1v1h-1zM18 14h1v1h-1zM14 18h1v1h-1zM18 18h1v1h-1zM16 16h1v1h-1z"/></svg>
                        <span className="font-black text-sm uppercase text-black">UPI</span>
                      </button>

                      <button 
                        onClick={() => handlePayment('Card')}
                        className="flex flex-col items-center justify-center py-5 bg-[#EFF6FF] border-[3px] border-black rounded-xl shadow-[4px_4px_0px_#2563EB] hover:-translate-y-1 hover:shadow-[6px_6px_0px_#2563EB] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all group"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 mb-2 group-hover:scale-110 group-hover:rotate-3 transition-transform"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
                        <span className="font-black text-sm uppercase text-black">Card</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* no page-level print CSS needed — printing handled in popup window */}
    </div>
  );
};

export default BillingManage;

