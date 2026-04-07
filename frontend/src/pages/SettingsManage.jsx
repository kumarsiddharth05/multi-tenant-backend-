import React, { useState, useEffect } from 'react';

// Flat Toggle for Billing and other simple boolean switches
const ToggleSwitch = ({ checked, onChange, label }) => (
  <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onChange(!checked)}>
    <div className={`w-12 h-6 rounded-full border-[3px] border-black relative transition-colors duration-200 ${checked ? 'bg-[#34A853]' : 'bg-gray-200'}`}>
      <div className={`absolute top-0.5 w-4 h-4 bg-white border-[2px] border-black rounded-full transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-0.5'}`} />
    </div>
    {label && <span className="text-xs font-black uppercase tracking-widest text-black">{label}</span>}
  </div>
);

const SettingsManage = () => {
  // ── Sync from Menu ──
  const [menuCats, setMenuCats] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  
  useEffect(() => {
    const localCats = localStorage.getItem('app_categories');
    const localItems = localStorage.getItem('app_items');
    if (localCats) setMenuCats(JSON.parse(localCats));
    if (localItems) setMenuItems(JSON.parse(localItems));
  }, []);

  // ── Restaurant Profile ──
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('app_settings_profile');
    if (saved) return JSON.parse(saved);
    return {
      name: 'Tasty Spice Restaurant',
      address: '123 MG Road, Mumbai',
      phone: '4556553',
      gstin: '545413523',
    };
  });

  // ── Billing & Invoicing ──
  const [billing, setBilling] = useState(() => {
    const saved = localStorage.getItem('app_settings_billing');
    if (saved) return JSON.parse(saved);
    return {
      gst: 18,
      serviceCharge: 0,
      billPrefix: 'INV-',
      startNumber: 100,
      autoReset: false,
      thankYouMessage: 'Thank You! Please Visit Again!',
    };
  });

  // ── Save States ──
  const [profileSaved, setProfileSaved] = useState(false);
  const [billingSaved, setBillingSaved] = useState(false);

  const handleSaveProfile = () => {
    localStorage.setItem('app_settings_profile', JSON.stringify(profile));
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
    window.dispatchEvent(new Event('profileUpdated'));
  };

  const handleSaveBilling = () => {
    localStorage.setItem('app_settings_billing', JSON.stringify(billing));
    setBillingSaved(true);
    setTimeout(() => setBillingSaved(false), 2000);
  };

  const inputClass = "w-full px-4 py-3 bg-white border-[3px] border-black rounded-xl text-black font-bold focus:outline-none focus:border-[#4285F4] focus:-translate-y-1 focus:shadow-[4px_4px_0px_0px_#4285F4] transition-all placeholder-gray-400";
  const labelClass = "block text-xs font-black uppercase tracking-widest text-black mb-1";

  // Reusable styling for the Apply Offer buttons to make it deeply satisfying
  const getApplyBtnClass = (isSaved) => {
    return `w-full py-4 mt-auto rounded-xl font-black uppercase border-[4px] border-black transition-all flex items-center justify-center gap-2 group overflow-hidden ${
      isSaved 
      ? 'bg-[#34A853] text-black shadow-none translate-x-1.5 translate-y-1.5 tracking-[0.2em] opacity-90'
      : 'bg-black text-white hover:bg-white hover:text-black shadow-[6px_6px_0px_0px_#34A853] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[10px_10px_0px_0px_#34A853] active:translate-x-1.5 active:translate-y-1.5 active:shadow-none tracking-widest'
    }`;
  };

  return (
    <div className="p-6 md:p-10 space-y-10 bg-gray-50 min-h-full relative">

      <div className="border-b-[4px] border-black pb-6">
        <h1 className="text-4xl font-black text-black uppercase tracking-widest">Setting</h1>
        <p className="text-black font-bold uppercase tracking-widest mt-2 text-sm">Manage your profile and billing preference</p>
      </div>

      {/* ── Two Column Grid: Profile + Billing ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* ════════════ Restaurant Profile Card ════════════ */}
        <div className="bg-white rounded-[32px] border-[4px] border-black shadow-[8px_8px_0px_0px_#4285F4] p-8 space-y-8 relative overflow-hidden group hover:shadow-[12px_12px_0px_0px_#4285F4] transition-shadow duration-300">
          <div className="absolute inset-0 opacity-[0.2] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4285F4 2px, transparent 2px)', backgroundSize: '24px 24px' }}></div>
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#4285F4] opacity-[0.15] rounded-full blur-[80px] group-hover:scale-125 transition-transform duration-700 pointer-events-none z-0"></div>

          <div className="flex items-center relative z-10">
             <h2 className="text-xl sm:text-2xl font-black text-black uppercase tracking-widest bg-[#4285F4] text-white px-4 py-1 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-2">
                Restaurant Profile
             </h2>
          </div>

          <div className="space-y-6 relative z-10">
            <div>
              <label className={labelClass}>Restaurant Name</label>
              <input type="text" className={inputClass} value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
            </div>

            <div>
              <label className={labelClass}>Address</label>
              <textarea rows="2" className={`${inputClass} resize-none`} value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Phone Number</label>
                <input type="text" className={inputClass} value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} />
              </div>
              <div>
                <label className={labelClass}>GSTIN</label>
                <input type="text" className={inputClass} value={profile.gstin} onChange={e => setProfile({...profile, gstin: e.target.value})} />
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveProfile}
            className={`relative z-10 w-full py-4 rounded-xl font-black uppercase tracking-widest border-[4px] border-black transition-all flex items-center justify-center gap-2 text-sm ${
              profileSaved
                ? 'bg-[#4285F4] text-white shadow-none translate-x-1.5 translate-y-1.5 tracking-[0.2em]'
                : 'bg-white text-black hover:-translate-y-1 hover:-translate-x-1 shadow-[6px_6px_0px_0px_#4285F4] hover:shadow-[10px_10px_0px_0px_#4285F4] active:translate-x-1.5 active:translate-y-1.5 active:shadow-none'
            }`}
          >
            {profileSaved ? '✓ Saved!' : 'Save Profile'}
          </button>
        </div>

        {/* ════════════ Billing & Invoicing Card ════════════ */}
        <div className="bg-white rounded-[32px] border-[4px] border-black shadow-[8px_8px_0px_0px_#A855F7] p-8 space-y-8 relative overflow-hidden group hover:shadow-[12px_12px_0px_0px_#A855F7] transition-shadow duration-300">
          <div className="absolute inset-0 opacity-[0.2] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#A855F7 2px, transparent 2px)', backgroundSize: '24px 24px' }}></div>
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#A855F7] opacity-[0.15] rounded-full blur-[80px] group-hover:scale-125 transition-transform duration-700 pointer-events-none z-0"></div>

          <div className="relative z-10 flex items-start">
             <h2 className="text-xl sm:text-2xl font-black text-black uppercase tracking-widest bg-[#A855F7] text-white px-4 py-1 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-2">
                Billing & Invoicing
             </h2>
          </div>

          <div className="space-y-6 relative z-10">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>GST (%)</label>
                <input type="text" className={inputClass.replace('#4285F4', '#A855F7')} value={billing.gst} onChange={e => setBilling({...billing, gst: e.target.value})} />
              </div>
              <div>
                <label className={labelClass}>Service Charge (%)</label>
                <input type="text" className={inputClass.replace('#4285F4', '#A855F7')} value={billing.serviceCharge} onChange={e => setBilling({...billing, serviceCharge: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Bill Prefix</label>
                <input type="text" className={inputClass.replace('#4285F4', '#A855F7')} value={billing.billPrefix} onChange={e => setBilling({...billing, billPrefix: e.target.value})} />
              </div>
              <div>
                <label className={labelClass}>Start Number</label>
                <input type="text" className={inputClass.replace('#4285F4', '#A855F7')} value={billing.startNumber} onChange={e => setBilling({...billing, startNumber: e.target.value})} />
              </div>
            </div>

            <div className="flex justify-between items-center bg-white px-5 py-4 rounded-xl border-[3px] border-black">
              <div>
                <p className="text-black font-black text-sm uppercase tracking-widest">Auto-reset daily</p>
                <p className="text-black/60 text-[10px] font-bold mt-1 uppercase">Reset bill numbers to 1 every day</p>
              </div>
              <ToggleSwitch checked={billing.autoReset} onChange={v => setBilling({...billing, autoReset: v})} />
            </div>

            <div>
              <label className={labelClass}>Thank You Message</label>
              <textarea rows="2" className={`${inputClass.replace('#4285F4', '#A855F7')} resize-none`} value={billing.thankYouMessage} onChange={e => setBilling({...billing, thankYouMessage: e.target.value})} />
            </div>
          </div>

          <button
            onClick={handleSaveBilling}
            className={`relative z-10 w-full py-4 rounded-xl font-black uppercase tracking-widest border-[4px] border-black transition-all flex items-center justify-center gap-2 text-sm ${
              billingSaved
                ? 'bg-[#A855F7] text-white shadow-none translate-x-1.5 translate-y-1.5 tracking-[0.2em]'
                : 'bg-white text-black hover:-translate-y-1 hover:-translate-x-1 shadow-[6px_6px_0px_0px_#A855F7] hover:shadow-[10px_10px_0px_0px_#A855F7] active:translate-x-1.5 active:translate-y-1.5 active:shadow-none'
            }`}
          >
            {billingSaved ? '✓ Saved!' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsManage;
