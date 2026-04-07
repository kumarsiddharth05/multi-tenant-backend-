import React, { useState } from 'react';

const TablesManage = () => {
  const [seats, setSeats] = useState(() => {
    const saved = localStorage.getItem('app_tables');
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, name: '55', status: 'occupied' },
      { id: 2, name: 'A1', status: 'vacant' },
      { id: 3, name: 'A10', status: 'vacant' },
      { id: 4, name: 'A2', status: 'vacant' },
      { id: 5, name: 'A3', status: 'vacant' },
      { id: 6, name: 'A4', status: 'vacant' },
      { id: 7, name: 'A5', status: 'vacant' },
      { id: 8, name: 'A6', status: 'vacant' },
      { id: 9, name: 'A7', status: 'vacant' },
      { id: 10, name: 'A8', status: 'vacant' },
      { id: 11, name: 'A9', status: 'vacant' },
      { id: 12, name: 'B1', status: 'vacant' },
      { id: 13, name: 'B10', status: 'vacant' },
      { id: 14, name: 'B2', status: 'vacant' },
      { id: 15, name: 'B3', status: 'vacant' },
    ];
  });

  React.useEffect(() => {
    localStorage.setItem('app_tables', JSON.stringify(seats));
  }, [seats]);

  const [filter, setFilter] = useState('all'); // 'all', 'vacant', 'occupied'
  
  // Add Seat Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newSeatName, setNewSeatName] = useState('');

  // Derived Stats
  const totalSeats = seats.length;
  const occupiedSeats = seats.filter(s => s.status === 'occupied').length;
  const freeSeats = totalSeats - occupiedSeats;

  const displayedSeats = seats.filter(s => {
    if (filter === 'all') return true;
    return s.status === filter;
  });

  const handleAddSeat = () => {
    if (!newSeatName.trim()) return;
    setSeats([...seats, { id: Date.now(), name: newSeatName.trim().toUpperCase(), status: 'vacant' }]);
    setNewSeatName('');
    setIsAddOpen(false);
  };

  // Allow toggling for testing purposes
  const toggleSeatStatus = (id) => {
    setSeats(seats.map(s => s.id === id ? { ...s, status: s.status === 'vacant' ? 'occupied' : 'vacant' } : s));
  };

  const handleDeleteSeat = (id, seatName) => {
    if (window.confirm(`Are you sure you want to remove seat ${seatName}?`)) {
      setSeats(seats.filter(s => s.id !== id));
    }
  };

  const getFilterClass = (btnFilter) => {
    const isActive = filter === btnFilter;
    return `px-6 py-2 rounded-xl font-black uppercase tracking-widest text-sm border-[3px] border-black transition-all ${
      isActive 
      ? 'bg-black text-white shadow-none translate-x-1 translate-y-1' 
      : 'bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
    }`;
  };

  return (
    <div className="p-6 md:p-10 space-y-10 bg-white min-h-full relative font-['Space_Grotesk']">
      
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b-[4px] border-black pb-6">
        <div>
          <h1 className="text-4xl font-black text-black uppercase tracking-widest tracking-tighter">Table Management</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest mt-2 text-sm">Monitor and manage seating capacity</p>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex gap-6 text-center">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-black text-[#4285F4]">{freeSeats}</span>
              <span className="text-xs font-black uppercase tracking-widest text-gray-400">Free</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-black text-[#EA4335]">{occupiedSeats}</span>
              <span className="text-xs font-black uppercase tracking-widest text-gray-400">Occupied</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-black text-black">{totalSeats}</span>
              <span className="text-xs font-black uppercase tracking-widest text-gray-400">Total</span>
            </div>
          </div>
          <button 
            onClick={() => setIsAddOpen(true)}
            className="bg-white text-black px-6 py-4 rounded-xl border-[4px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black uppercase tracking-widest hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center gap-2"
          >
            <span className="text-xl leading-none">+</span> Add Seats
          </button>
        </div>
      </div>

      {/* Filter Strip */}
      <div className="flex gap-4">
        <button onClick={() => setFilter('all')} className={getFilterClass('all')}>
          All
        </button>
        <button onClick={() => setFilter('vacant')} className={getFilterClass('vacant')}>
          Vacant ({freeSeats})
        </button>
        <button onClick={() => setFilter('occupied')} className={getFilterClass('occupied')}>
          Occupied ({occupiedSeats})
        </button>
      </div>

      {/* Grid Section */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 pb-20">
        {displayedSeats.map((seat) => {
          const isVacant = seat.status === 'vacant';
          const colorMain = isVacant ? '#4285F4' : '#EA4335'; // Blue for Vacant, Red for Occupied
          
          return (
            <div 
              key={seat.id}
              onClick={() => toggleSeatStatus(seat.id)}
              className={`relative aspect-square flex flex-col items-center justify-center p-4 border-[4px] rounded-[24px] bg-white transition-all duration-200 cursor-pointer group flex-shrink-0
                ${isVacant ? 'shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1.5 hover:translate-y-1.5' : 'shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-x-1.5 translate-y-1.5 bg-gray-50 opacity-80 hover:opacity-100'}
              `}
              style={{ borderColor: colorMain }}
            >
              {/* Blinking Red Dot for Occupied */}
              {!isVacant && (
                <div className="absolute top-3 right-3 w-3 h-3 bg-[#EA4335] rounded-full animate-[ping_1.5s_ease-in-out_infinite]"></div>
              )}
              {!isVacant && (
                <div className="absolute top-3 right-3 w-3 h-3 bg-[#EA4335] rounded-full border border-white"></div>
              )}

              {/* Remove Seat Button */}
              <button
                onClick={(e) => { e.stopPropagation(); handleDeleteSeat(seat.id, seat.name); }}
                className="absolute top-2 left-2 w-7 h-7 bg-white border-[2px] border-black rounded-lg hidden group-hover:flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-[#EA4335] hover:text-white text-[#EA4335] hover:scale-110 active:scale-95 transition-all z-10"
                title="Remove Seat"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>

              {/* Central Details */}
              <div className="flex flex-col items-center space-y-3">
                <span className="text-4xl font-black" style={{ color: colorMain }}>
                  {seat.name}
                </span>

                {/* People Logo SVG */}
                <svg className="w-8 h-8 transition-transform group-hover:scale-110" style={{ color: colorMain }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>

                {/* Status Capsule */}
                <div 
                  className="px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px] border-[2px] border-black text-white"
                  style={{ backgroundColor: colorMain }}
                >
                  {seat.status}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Seat Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white border-[4px] border-black rounded-[28px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-sm animate-[bounce_0.3s_ease-out] overflow-hidden">
            <div className="flex justify-between items-center border-b-[4px] border-black p-5 bg-gray-50">
              <h3 className="text-xl font-black tracking-widest uppercase">Add Seat</h3>
              <button 
                onClick={() => setIsAddOpen(false)} 
                className="w-10 h-10 flex items-center justify-center rounded-xl border-[3px] border-black bg-white font-black text-xl hover:scale-110 active:scale-95 transition-transform shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >✕</button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-black uppercase tracking-widest">Seat Name</label>
                <input 
                  type="text" 
                  value={newSeatName}
                  onChange={(e) => setNewSeatName(e.target.value)}
                  placeholder="e.g., T1, A5, BOOTH-2"
                  className="w-full px-4 py-3 border-[3px] border-black font-bold focus:outline-none focus:ring-4 focus:ring-[#FBBC05] transition-all uppercase"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSeat()}
                />
              </div>

              <button 
                onClick={handleAddSeat}
                className="w-full bg-[#0F172A] text-white py-4 rounded-xl border-[4px] border-black font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all text-lg"
              >
                Save Seat
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TablesManage;
