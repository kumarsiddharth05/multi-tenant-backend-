import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const QRCodesManage = () => {
  const [tables, setTables] = useState([]);
  const { tenantKey } = useAuth();
  const [activeKey, setActiveKey] = useState('demo-restaurant');

  useEffect(() => {
    // 1. Read from localStorage for Tables Manage connection
    const saved = localStorage.getItem('app_tables');
    if (saved) {
      setTables(JSON.parse(saved));
    }
    
    // 2. Establish dynamic tenant key
    const finalKey = tenantKey || localStorage.getItem('tenant_key') || 'demo-restaurant';
    setActiveKey(finalKey);
    
    // 3. Listen for storage changes
    const handleStorageChange = (e) => {
      if (e.key === 'app_tables') {
        setTables(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [tenantKey]);

  const generateCustomerURL = (tableName) => {
    const origin = window.location.origin;
    return `${origin}/${activeKey}/table/${tableName}`;
  };

  const constructQRImageURL = (tableName) => {
    const url = generateCustomerURL(tableName);
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(url)}&margin=10`;
  };

  const handleTest = (tableName) => {
    const url = generateCustomerURL(tableName);
    window.open(url, '_blank');
  };

  const handlePrintAll = () => {
    window.print();
  };

  const handlePrintSingle = (tableId) => {
    const style = document.createElement('style');
    // Hide absolutely everything except the specific card, and center it
    style.innerHTML = `@media print { 
      body * { visibility: hidden !important; } 
      #qr-card-${tableId}, #qr-card-${tableId} * { visibility: visible !important; } 
      #qr-card-${tableId} { 
        position: fixed; 
        left: 50%; 
        top: 50%; 
        transform: translate(-50%, -50%) scale(1.5) !important; 
        display: flex !important;
        background-color: #0f172a !important;
        -webkit-print-color-adjust: exact;
        break-inside: avoid;
        page-break-inside: avoid;
      } 
    }`;
    document.head.appendChild(style);
    window.print();
    document.head.removeChild(style);
  };

  const COLORS = ['#3B82F6', '#EA4335', '#34A853', '#A142F4', '#00C4B4', '#FF69B4', '#FF7A30'];

  return (
    <div className="p-6 md:p-10 space-y-10 bg-white min-h-full relative print-wrapper">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b-[4px] border-black pb-6 no-print">
        <div>
          <h1 className="text-4xl font-black text-black uppercase tracking-widest">QR Codes & Tables</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest mt-2 text-sm">Generate and print QR codes for your tables</p>
        </div>

        <div>
          <button 
            onClick={handlePrintAll}
            style={{ '--btn-color': '#A855F7', backgroundColor: 'white' }}
            className="relative flex items-center gap-3 p-1.5 font-black uppercase tracking-widest transition-all duration-150 border-[3px] border-black rounded-full group cursor-pointer shadow-[4px_4px_0px_0px_var(--btn-color)] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_0px_var(--btn-color)] active:translate-x-1 active:translate-y-1 active:shadow-none pr-5 text-black overflow-hidden"
          >
             <div 
               className="relative z-10 w-12 h-12 border-[2.5px] border-inherit rounded-full flex items-center justify-center shrink-0 transition-colors text-white"
               style={{ backgroundColor: '#A142F4' }}
             >
               <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
             </div>
             <span className="relative z-10 text-xs sm:text-sm font-black drop-shadow-sm mt-px">
               Print All
             </span>
          </button>
        </div>
      </div>

      {/* Tables Grid */}
      {tables.length === 0 ? (
        <div className="w-full h-64 border-[4px] border-black border-dashed flex items-center justify-center bg-gray-50 text-gray-400 font-black uppercase tracking-widest no-print rounded-[28px]">
          No Tables Have Been Created
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-20 print-grid">
          {tables.map((table, index) => {
            const cardColor = COLORS[index % COLORS.length];
            return (
            <div 
              key={table.id}
              id={`qr-card-${table.id}`}
              className="bg-[#0f172a] text-white border-[4px] border-black p-8 flex flex-col items-center gap-5 transition-transform hover:-translate-y-2 hover:-translate-x-2 rounded-[36px] group"
              style={{ boxShadow: `8px 8px 0px 0px ${cardColor}` }}
            >
              <div className="text-center w-full">
                <h3 className="text-3xl font-black flex items-center justify-center gap-2 pb-2" style={{ color: cardColor }}>
                  <span className="text-white opacity-40">#</span> {table.name}
                </h3>
              </div>

              {/* QR Image Container (Rounded) */}
              <div className="bg-white border-[4px] border-black p-2 w-full max-w-[200px] aspect-square flex items-center justify-center rounded-3xl transition-transform group-hover:scale-105" style={{ boxShadow: `4px 4px 0px #000` }}>
                <img 
                  src={constructQRImageURL(table.name)} 
                  alt={`QR for Table ${table.name}`}
                  className="w-full h-full object-contain pointer-events-none rounded-2xl"
                  crossOrigin="anonymous"
                />
              </div>

              {/* Action Buttons (Hidden on Print) */}
              <div className="flex w-full gap-3 mt-4 no-print">
                <button 
                  onClick={() => handleTest(table.name)}
                  className="flex-1 bg-white text-black font-black py-3 rounded-xl border-[3px] border-black uppercase tracking-widest text-xs outline-none hover:bg-gray-200 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all shadow-[3px_3px_0px_#000]"
                >
                  Test Link
                </button>
                <button 
                  onClick={() => handlePrintSingle(table.id)}
                  className="flex-1 text-white font-black py-3 rounded-xl border-[3px] border-black uppercase tracking-widest text-xs outline-none hover:brightness-110 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex justify-center items-center gap-1.5 shadow-[3px_3px_0px_#000]"
                  style={{ backgroundColor: cardColor }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                  Save
                </button>
              </div>
            </div>
            );
          })}
        </div>
      )}

      {/* Global Print Styles explicitly formatting rigorous PDF grid */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { margin: 15mm; size: a4 portrait; }
          body {
            background-color: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          aside, header, nav { 
            display: none !important; 
          }
          .print-wrapper {
             overflow: visible !important;
             height: auto !important;
             padding: 0 !important;
             margin: 0 !important;
          }
          .print-grid {
             display: flex !important;
             flex-wrap: wrap !important;
             gap: 20px !important;
             justify-content: flex-start !important;
             padding-bottom: 0 !important;
          }
          .print-grid > div {
             width: calc(33.33% - 14px) !important;
             box-sizing: border-box !important;
             background-color: #0f172a !important;
             border: 4px solid black !important;
             border-radius: 28px !important;
             box-shadow: none !important;
             transform: none !important;
             /* Ensure it never breaks in half */
             page-break-inside: avoid !important;
             break-inside: avoid !important;
             -webkit-column-break-inside: avoid !important;
             margin-bottom: 5px !important;
             padding: 20px !important; /* Slightly smaller padding for print to fit 3x3 nicely */
          }
          .print-grid > div h3 {
             font-size: 24px !important;
          }
        }
      `}} />
    </div>
  );
};

export default QRCodesManage;
