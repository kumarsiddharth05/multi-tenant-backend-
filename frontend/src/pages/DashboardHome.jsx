import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { NeoCard } from '../components/ui/NeoCard';
import { NeoButton } from '../components/ui/NeoButton';
import { NeoBadge } from '../components/ui/NeoBadge';

// Premium area chart tooltip
const AreaTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <NeoCard padding="px-4 py-3" shadowColor="#6366F1" className="z-50 bg-white border-[2.5px] border-black">
        <div className="flex flex-col gap-0.5">
          <p className="text-[10px] font-black text-black uppercase tracking-widest leading-tight">{label}</p>
          <p className="text-xl font-black text-black leading-tight">₹{payload[0].value.toLocaleString()}</p>
        </div>
      </NeoCard>
    );
  }
  return null;
};

// Custom dot for the line
const CustomDot = (props) => {
  const { cx, cy, value } = props;
  if (!value) return null;
  return (
    <g>
      <circle cx={cx} cy={cy} r={6} fill="white" stroke="black" strokeWidth={3} />
      <circle cx={cx} cy={cy} r={3} fill="#6366F1" />
    </g>
  );
};

const DashboardHome = () => {
  const { user } = useAuth();
  const [period, setPeriod] = useState('Today');

  const dataMap = {
    'Today': {
      revenue: '₹640', orders: '2',
      chartData: [
        { label: '8 AM', value: 0 },
        { label: '10 AM', value: 120 },
        { label: '12 PM', value: 340 },
        { label: '2 PM', value: 180 },
        { label: '4 PM', value: 0 },
        { label: '6 PM', value: 0 },
      ]
    },
    'This Week': {
      revenue: '₹14,560', orders: '84',
      chartData: [
        { label: 'Sun', value: 2100 },
        { label: 'Mon', value: 1800 },
        { label: 'Tue', value: 1500 },
        { label: 'Wed', value: 1900 },
        { label: 'Thu', value: 2400 },
        { label: 'Fri', value: 3200 },
        { label: 'Sat', value: 1660 },
      ]
    },
    'This Month': {
      revenue: '₹58,420', orders: '342',
      chartData: Array.from({ length: 30 }, (_, i) => ({
        label: `${i + 1}`,
        value: Math.floor(Math.random() * 3000) + 500
      }))
    }
  };

  const currentData = dataMap[period];

  const handlePrint = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(`Revenue Sheet`, 14, 22);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated at: ${new Date().toLocaleString()}`, 14, 30);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    const safeRevenue = currentData.revenue.replace('₹', 'Rs. ');
    doc.text(`Total Revenue: ${safeRevenue}`, 14, 42);
    doc.text(`Total Orders: ${currentData.orders}`, 14, 48);
    const tableColumn = ['Date & Time', 'Payment Mode', 'Order Value'];
    const numOrders = parseInt(currentData.orders.replace(/,/g, ''), 10) || 0;
    const paymentModes = ['UPI', 'Card', 'Cash'];
    const tableRows = [];
    for (let i = 0; i < numOrders; i++) {
      const mode = paymentModes[Math.floor(Math.random() * paymentModes.length)];
      const msInPeriod = period === 'Today' ? 86400000 : (period === 'This Week' ? 604800000 : 2592000000);
      const orderDate = new Date(Date.now() - Math.floor(Math.random() * msInPeriod));
      tableRows.push([orderDate.toLocaleString(), mode, `Rs. ${Math.floor(Math.random() * 800) + 100}`]);
    }
    tableRows.sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
    autoTable(doc, {
      head: [tableColumn], body: tableRows, startY: 55, theme: 'grid',
      headStyles: { fillColor: [52, 168, 83], textColor: 255, fontStyle: 'bold', lineWidth: 0.5, lineColor: 0 },
      bodyStyles: { textColor: 0, lineWidth: 0.5, lineColor: 0 },
      styles: { fontSize: 10, halign: 'center' },
    });
    doc.save(`Revenue_Sheet_${Date.now()}.pdf`);
  };

  const handleRefresh = () => window.location.reload();

  const activeOrders = '1';
  const tablesOccupancy = '1 / 65';

  const topItems = [
    { rank: 1, name: 'Chicken Tikka', sold: 6, revenue: '₹1320', color: '#4285F4', bg: '#EEF4FF' },
    { rank: 2, name: 'Paneer Tikka', sold: 3, revenue: '₹540', color: '#EA4335', bg: '#FEF2F2' },
    { rank: 3, name: 'Chilli Chicken', sold: 3, revenue: '₹720', color: '#10B981', bg: '#ECFDF5' },
    { rank: 4, name: 'Veg Spring Rolls', sold: 1, revenue: '₹150', color: '#A855F7', bg: '#FAF5FF' },
    { rank: 5, name: 'Coke', sold: 1, revenue: '₹50', color: '#F97316', bg: '#FFF7ED' },
    { rank: 6, name: 'Butter Chicken', sold: 12, revenue: '₹2640', color: '#34A853', bg: '#F0FDF4' },
    { rank: 7, name: 'Garlic Naan', sold: 25, revenue: '₹1250', color: '#4285F4', bg: '#EFF6FF' },
    { rank: 8, name: 'Dal Makhani', sold: 8, revenue: '₹1920', color: '#EA4335', bg: '#FEF2F2' },
    { rank: 9, name: 'Mutton Rogan Josh', sold: 4, revenue: '₹1560', color: '#F97316', bg: '#FFF7ED' },
    { rank: 10, name: 'Lassi', sold: 15, revenue: '₹900', color: '#A855F7', bg: '#FAF5FF' },
    { rank: 11, name: 'Gulab Jamun', sold: 20, revenue: '₹600', color: '#10B981', bg: '#ECFDF5' },
    { rank: 12, name: 'Veg Biryani', sold: 5, revenue: '₹1100', color: '#4285F4', bg: '#EEF4FF' },
  ];

  const periodColors = {
    'Today': { active: '#EA4335', bg: '#FEF2F2', shadow: '#EA4335' },
    'This Week': { active: '#34A853', bg: '#F0FDF4', shadow: '#34A853' },
    'This Month': { active: '#4285F4', bg: '#EFF6FF', shadow: '#4285F4' },
  };

  return (
    <>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #000;
          border-radius: 10px;
          border: 2px solid transparent;
          background-clip: content-box;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #333;
        }
      `}</style>
      <div className="p-4 sm:p-6 md:p-10 space-y-8 bg-white min-h-full">

        {/* ── Header ── */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl sm:text-5xl font-black text-black tracking-widest uppercase leading-none mb-3">
              Dashboard
            </h1>
            <p className="text-black font-black text-[10px] tracking-[0.2em] uppercase border-l-[4px] border-black pl-4">
              Real-time performance analytics
            </p>
          </div>

          <div className="flex items-center gap-4 flex-wrap print:hidden">
            <NeoButton
              onClick={handlePrint}
              color="#A855F7"
              bg="white"
              borderColor="black"
              showDots={false}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span>Download PDF</span>
            </NeoButton>

            <NeoButton
              onClick={handleRefresh}
              color="#F97316"
              bg="white"
              borderColor="black"
              showDots={false}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <polyline points="23 4 23 10 17 10"></polyline>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
              </svg>
              <span>Refresh</span>
            </NeoButton>
          </div>
        </div>

        {/* ── Period Switcher ── */}
        <div className="flex gap-4 w-full overflow-x-auto pb-4 pt-4 -mt-4 custom-scrollbar">
          {['Today', 'This Week', 'This Month'].map((p) => {
            const col = periodColors[p];
            const isActive = period === p;
            return (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`
                whitespace-nowrap px-8 py-3 font-black uppercase text-xs tracking-[0.2em] 
                border-[3px] rounded-full transition-all duration-200
                ${isActive
                    ? 'translate-x-1 translate-y-1 shadow-none border-black'
                    : 'bg-white border-black hover:-translate-y-1'
                  }
              `}
                style={{
                  backgroundColor: isActive ? col.bg : 'white',
                  color: 'black',
                  borderColor: isActive ? col.active : 'black',
                  boxShadow: isActive ? 'none' : `4px 4px 0px 0px ${col.shadow}`
                }}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* ── Metric Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard label={`${period === 'Today' ? "Today's" : period} Revenue`} value={currentData.revenue} color="#34A853" bg="white" icon={<DollarIcon />} />
          <MetricCard label={`${period === 'Today' ? "Today's" : period} Orders`} value={currentData.orders} color="#4285F4" bg="white" icon={<BoxIcon />} />
          <MetricCard label="Active Orders" value={activeOrders} color="#F97316" bg="white" icon={<ActivityIcon />} />
          <MetricCard label="Occupancy" value={tablesOccupancy} color="#EA4335" bg="white" icon={<UsersIcon />} />
        </div>

        {/* ── Chart + Top Items ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Chart Column */}
          <div className="lg:col-span-2">
            <NeoCard padding="p-6 sm:p-8" shadowColor="#6366F1" className="h-full flex flex-col gap-6 bg-white overflow-hidden relative group" style={{ borderColor: '#6366F1' }}>
              {/* Dot grid decoration - Subtler & High Fidelity */}
              <div
                className="absolute inset-0 pointer-events-none opacity-[0.20]"
                style={{
                  backgroundImage: 'radial-gradient(#6366F1 1.2px, transparent 1.2px)',
                  backgroundSize: '12px 12px',
                }}
              />
              {/* Decorative Bloom (Blob) */}
              <div
                className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full blur-[80px] opacity-25 pointer-events-none transition-all duration-700 group-hover:scale-110"
                style={{ backgroundColor: '#6366F1' }}
              />

              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="font-black text-xl uppercase tracking-tighter leading-none text-black">{period === 'Today' ? "Today's" : period} Revenue</h3>
                </div>

                <div className="bg-white border-[3px] border-black rounded-full px-4 py-1.5 font-black text-black uppercase tracking-widest text-[10px] shadow-[3px_3px_0px_#6366F1]">
                  TOTAL: {currentData.revenue}
                </div>
              </div>

              <div className="relative z-10 flex flex-wrap gap-3">
                {[
                  { label: 'Total Orders', value: currentData.orders, color: '#6366F1' },
                  { label: 'Peak Revenue', value: `₹${Math.max(...currentData.chartData.map(d => d.value)).toLocaleString()}`, color: '#6366F1' },
                  { label: 'Avg / Trans', value: `₹${Math.round(currentData.chartData.reduce((s, d) => s + d.value, 0) / (currentData.chartData.filter(d => d.value > 0).length || 1)).toLocaleString()}`, color: '#6366F1' },
                ].map((s, i) => (
                  <div 
                    key={i} 
                    className="flex flex-col border-[2.5px] border-black rounded-full px-7 py-2.5 bg-white transition-all duration-200 hover:-translate-y-1 shadow-[4px_4px_0px_0px_#6366F1] hover:shadow-[6px_6px_0px_0px_#6366F1] active:translate-y-0 active:shadow-none cursor-default group"
                  >
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-black leading-none mb-1">{s.label}</p>
                    <p className="font-black text-base text-black leading-none">{s.value}</p>
                  </div>
                ))}
              </div>

              <div className="relative z-10 h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={currentData.chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="8 8" stroke="#000" strokeOpacity={0.05} vertical={false} />
                    <XAxis
                      dataKey="label"
                      interval={period === 'This Month' ? 6 : 0}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#000', fontWeight: '900', fontSize: 10 }}
                      tickMargin={15}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#000', fontWeight: '900', fontSize: 10 }}
                      width={40}
                    />
                    <Tooltip content={<AreaTooltip />} cursor={{ stroke: 'black', strokeWidth: 3, strokeDasharray: '8 8' }} />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#6366F1"
                      strokeWidth={4}
                      fill="url(#revenueGradient)"
                      dot={<CustomDot />}
                      activeDot={{ r: 8, fill: '#6366F1', stroke: 'black', strokeWidth: 3 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </NeoCard>
          </div>

          <NeoCard padding="p-6 sm:p-8" shadowColor="#EA4335" className="h-full flex flex-col gap-4 bg-white overflow-hidden relative group" style={{ borderColor: '#EA4335' }}>
            {/* Dynamic Colorful Dot Grid - Subtler & High Fidelity */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.20]"
              style={{
                backgroundImage: 'radial-gradient(#EA4335 1.2px, transparent 1.2px)',
                backgroundSize: '12px 12px',
              }}
            />
            {/* Bloom effect */}
            <div
              className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full blur-[80px] opacity-25 pointer-events-none"
              style={{ backgroundColor: '#EA4335' }}
            />

            <div className="relative z-10 flex justify-between items-center mb-0.5">
              <h3 className="font-black text-xl uppercase tracking-tighter text-black">Trending</h3>
              <div className="w-10 h-10 bg-black border-[2px] border-black rounded-full flex items-center justify-center text-white shadow-[3px_3px_0px_#EA4335]">
                <style>{`
                @keyframes trendingMove {
                  0%, 100% { transform: translate(0, 0); }
                  50% { transform: translate(2px, -2px); }
                }
                .animate-trending {
                  animation: trendingMove 1.5s ease-in-out infinite;
                }
              `}</style>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-trending"
                >
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
              </div>
            </div>

            <div className="relative z-10 space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[350px]">
              {topItems.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-white border-[2.5px] border-black rounded-full px-5 py-2.5 transition-all duration-200 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_black] group cursor-default shadow-[3px_3px_0px_0px_rgba(0,0,0,0.05)]"
                >
                  <div
                    className="w-9 h-9 flex items-center justify-center text-white font-black text-sm border-[2.5px] border-black rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: item.color }}
                  >
                    {item.rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-sm text-black truncate tracking-tight">{item.name}</h4>
                    <p className="text-[9px] font-black text-black uppercase tracking-[0.2em] mt-0.5">{item.sold} items sold</p>
                  </div>
                  <span className="font-black text-sm text-black shrink-0">{item.revenue}</span>
                </div>
              ))}
            </div>
          </NeoCard>

        </div>
      </div>
    </>
  );
};

// ── Metric Card ──
const MetricCard = ({ label, value, color, bg, icon }) => (
  <NeoCard
    interactive
    shadowColor={color}
    bg={bg}
    padding="px-6 py-5"
    className="min-h-[135px] flex flex-col justify-center overflow-hidden relative group"
    style={{ borderColor: color }}
  >
    {/* Dynamic Colorful Dot Grid - High Fidelity & Clearer Visibility */}
    <div
      className="absolute inset-0 pointer-events-none opacity-[0.18]"
      style={{
        backgroundImage: `radial-gradient(${color} 1px, transparent 1px)`,
        backgroundSize: '10px 10px',
      }}
    />

    {/* Modern Dynamic Icon - Top Right Corner */}
    <div
      className="absolute top-5 right-5 z-20 w-11 h-11 border-[3px] rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3"
      style={{ 
        backgroundColor: 'white', 
        borderColor: color, 
        boxShadow: `4px 4px 0px 0px ${color}` 
      }}
    >
      <div className="scale-[0.85] text-black">
        {icon}
      </div>
    </div>

    {/* Decorative Ellipse for Visual Depth */}
    <div
      className="absolute -right-4 -bottom-4 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none transition-transform group-hover:scale-125 duration-700"
      style={{ backgroundColor: color }}
    />

    {/* Primary Text Content */}
    <div className="relative z-10 space-y-1.5 mt-2">
      <div className="inline-block px-2.5 py-1.5 bg-black/5 backdrop-blur-sm border-l-[3.5px] border-black mb-1">
        <p className="text-xs font-black uppercase text-black tracking-[0.25em] leading-none">{label}</p>
      </div>
      <h3 className="text-5xl font-black text-black tracking-tighter leading-none pr-10">{value}</h3>
    </div>
  </NeoCard>
);

// ── Icons ── (Thicker strokes for Neo-Brutalism)
const DollarIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3.5" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;
const BoxIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3.5" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>;
const ActivityIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3.5" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>;
const UsersIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3.5" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;

export default DashboardHome;
