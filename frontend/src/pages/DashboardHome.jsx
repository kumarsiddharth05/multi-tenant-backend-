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
      <NeoCard padding="px-5 py-4" shadowColor="#34A853" className="z-50 bg-white">
        <p className="text-[10px] font-black text-black opacity-50 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-black text-black">₹{payload[0].value.toLocaleString()}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <div className="w-2 h-2 rounded-full bg-[#34A853]"></div>
          <p className="text-[10px] font-bold text-[#34A853] uppercase tracking-widest">Revenue</p>
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
      <circle cx={cx} cy={cy} r={3} fill="#34A853" />
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
    { rank: 5, name: 'Masala Coke', sold: 1, revenue: '₹50', color: '#F97316', bg: '#FFF7ED' },
  ];

  const periodColors = {
    'Today': { active: '#EA4335', bg: '#FEF2F2' },
    'This Week': { active: '#34A853', bg: '#F0FDF4' },
    'This Month': { active: '#4285F4', bg: '#EFF6FF' },
  };

  return (
    <div className="p-4 sm:p-6 md:p-10 space-y-8 bg-white min-h-full font-['Space_Grotesk']">

      {/* ── Header ── */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl sm:text-5xl font-black text-black tracking-tighter uppercase leading-none mb-3">
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
            bg="#FAF5FF"
            className="shadow-[4px_4px_0px_0px_black] hover:shadow-[6px_6px_0px_0px_black]"
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
            bg="#FFF7ED"
            className="shadow-[4px_4px_0px_0px_black] hover:shadow-[6px_6px_0px_0px_black]"
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
                  : 'bg-white border-black shadow-[4px_4px_0px_0px_black] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_black]'
                }
              `}
              style={{
                backgroundColor: isActive ? col.bg : 'white',
                color: 'black',
                borderColor: isActive ? col.active : 'black'
              }}
            >
              {p}
            </button>
          );
        })}
      </div>

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard label={`${period === 'Today' ? "Today's" : period} Revenue`} value={currentData.revenue} color="#34A853" bg="#F0FDF4" icon={<DollarIcon />} />
        <MetricCard label={`${period === 'Today' ? "Today's" : period} Orders`} value={currentData.orders} color="#4285F4" bg="#EFF6FF" icon={<BoxIcon />} />
        <MetricCard label="Active Orders" value={activeOrders} color="#F97316" bg="#FFF7ED" icon={<ActivityIcon />} />
        <MetricCard label="Occupancy" value={tablesOccupancy} color="#EA4335" bg="#FEF2F2" icon={<UsersIcon />} />
      </div>

      {/* ── Chart + Top Items ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Chart Column */}
        <div className="lg:col-span-2">
          <NeoCard padding="p-6 sm:p-10" className="h-full flex flex-col gap-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                <h3 className="font-black text-2xl uppercase tracking-tighter leading-none text-black">{period === 'Today' ? "Today's" : period} Revenue</h3>
                <div className="flex items-center gap-3 mt-2">
                  <div className="w-2 h-2 rounded-full bg-[#EA4335] animate-pulse"></div>
                  <p className="text-black font-black text-[10px] uppercase tracking-[0.2em]">Live Performance Data</p>
                </div>
              </div>

              <div className="bg-[#F0FDF4] border-[3px] border-black rounded-full px-5 py-2 font-black text-black uppercase tracking-widest text-xs shadow-[4px_4px_0px_#34A853]">
                Total: {currentData.revenue}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Total Orders', value: currentData.orders, color: '#4285F4', bg: '#EFF6FF' },
                { label: 'Peak Revenue', value: `₹${Math.max(...currentData.chartData.map(d => d.value)).toLocaleString()}`, color: '#34A853', bg: '#F0FDF4' },
                { label: 'Avg / Transaction', value: `₹${Math.round(currentData.chartData.reduce((s, d) => s + d.value, 0) / (currentData.chartData.filter(d => d.value > 0).length || 1)).toLocaleString()}`, color: '#F97316', bg: '#FFF7ED' },
              ].map((s, i) => (
                <div key={i} className="border-[3px] border-black rounded-[24px] p-4 group transition-all" style={{ backgroundColor: s.bg }}>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-black mb-2">{s.label}</p>
                  <p className="font-black text-xl text-black leading-none">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="h-[250px] w-full -mx-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={currentData.chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34A853" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#34A853" stopOpacity={0} />
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
                    stroke="#34A853"
                    strokeWidth={4}
                    fill="url(#revenueGradient)"
                    dot={<CustomDot />}
                    activeDot={{ r: 8, fill: '#34A853', stroke: 'black', strokeWidth: 3 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </NeoCard>
        </div>

        {/* Top Items Column */}
        <NeoCard padding="p-6 sm:p-10" className="flex flex-col gap-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-black text-2xl uppercase tracking-tighter">Trending</h3>
            <div className="w-10 h-10 bg-black border-[2px] border-black rounded-full flex items-center justify-center text-white shadow-[3px_3px_0px_#34A853]">
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

          <div className="space-y-4 flex-1">
            {topItems.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-4 bg-white border-[3px] border-black rounded-[24px] px-5 py-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-[5px_5px_0px_0px_black] group cursor-default"
              >
                <div
                  className="w-10 h-10 flex items-center justify-center text-black font-black text-sm border-[3px] border-black rounded-full shrink-0"
                  style={{ backgroundColor: item.bg, borderColor: item.color }}
                >
                  {item.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-base text-black truncate tracking-tight">{item.name}</h4>
                  <p className="text-[10px] font-black text-black uppercase tracking-[0.2em] mt-1">{item.sold} items sold</p>
                </div>
                <span className="font-black text-base text-black shrink-0">{item.revenue}</span>
              </div>
            ))}
          </div>
        </NeoCard>

      </div>
    </div>
  );
};

// ── Metric Card ──
const MetricCard = ({ label, value, color, bg, icon }) => (
  <NeoCard
    interactive
    shadowColor={color}
    bg={bg}
    padding="p-6"
    className="min-h-[140px] flex flex-col justify-between overflow-hidden relative group"
    style={{ borderColor: color }}
  >
    {/* Dot grid decoration */}
    <div
      className="absolute inset-0 pointer-events-none opacity-10"
      style={{
        backgroundImage: 'radial-gradient(#000 1.2px, transparent 1.2px)',
        backgroundSize: '12px 12px',
      }}
    />

    {/* Decorative Ellipse (Blob) */}
    <div
      className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl opacity-20 pointer-events-none transition-transform group-hover:scale-150 duration-500"
      style={{ backgroundColor: color }}
    />

    <div
      className="relative z-10 w-10 h-10 border-[3px] rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
      style={{ backgroundColor: 'white', borderColor: color, boxShadow: `3px 3px 0px 0px ${color}` }}
    >
      <div className="scale-75">
        {icon}
      </div>
    </div>

    <div className="relative z-10 mt-4">
      <p className="text-[9px] font-black uppercase text-black mb-1 tracking-[0.2em]">{label}</p>
      <h3 className="text-3xl font-black text-black tracking-tighter leading-none">{value}</h3>
    </div>
  </NeoCard>
);

// ── Icons ── (Thicker strokes for Neo-Brutalism)
const DollarIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3.5" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;
const BoxIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3.5" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>;
const ActivityIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3.5" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>;
const UsersIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3.5" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;

export default DashboardHome;
