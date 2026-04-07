import React, { useState, useEffect } from 'react';
import DietaryIcon from '../components/DietaryIcon';

const COLORS = [
  '#0F172A', '#4285F4', '#EA4335', '#34A853',
  '#A142F4', '#00C4B4', '#FF69B4', '#FF7A30',
];

const isLightColor = (hex) => ['#00C4B4', '#FF69B4'].includes(hex);

const getBgTint = (hex) => {
  const tints = {
    '#0F172A': '#F1F5F9', '#4285F4': '#EEF4FF', '#EA4335': '#FEF2F2',
    '#34A853': '#ECFDF5', '#A142F4': '#FAF5FF', '#00C4B4': '#F0FDFA',
    '#FF69B4': '#FFF0F6', '#FF7A30': '#FFF7ED',
  };
  return tints[hex] || '#F8FAFC';
};

const MenuManage = () => {
  /* ── Categories ── */
  const [categories, setCategories] = useState(() => {
    const s = localStorage.getItem('app_categories');
    if (s) {
      let parsed = JSON.parse(s);
      // Auto-migrate legacy colors
      parsed = parsed.map(c => (c.color === '#FBBC05' || c.color === '#3B82F6' || c.color === '#22D3EE') ? { ...c, color: '#0F172A' } : c);
      // Migration: Update Starters to Purple
      parsed = parsed.map(c => (c.name === 'Starters' && c.color === '#0F172A') ? { ...c, color: '#A142F4' } : c);
      return parsed;
    }
    return [
      { id: 1, name: 'Starters', color: '#A142F4' },
      { id: 2, name: 'Main Course', color: '#4285F4' },
      { id: 3, name: 'Breads', color: '#34A853' },
      { id: 4, name: 'Rice & Biryani', color: '#EA4335' },
      { id: 5, name: 'Beverages', color: '#A142F4' },
    ];
  });
  const [activeCatId, setActiveCatId] = useState(categories[0]?.id || 1);
  const [isAddCatOpen, setIsAddCatOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  /* ── Items ── */
  const [items, setItems] = useState(() => {
    const s = localStorage.getItem('app_items');
    if (s) return JSON.parse(s);
    return [
      { id: 1, categoryId: 1, name: 'Chicken Tikka', description: 'Tender chicken marinated and grilled', price: 220, isVeg: false, isAvailable: true, protein: '25g', calories: '300kcal', image: '', isSpicy: true },
      { id: 2, categoryId: 1, name: 'Chilli Chicken', description: 'Indo-Chinese style spicy fried chicken', price: 240, isVeg: false, isAvailable: true, protein: '22g', calories: '350kcal', image: '', isSpicy: true },
      { id: 3, categoryId: 1, name: 'Paneer Tikka', description: 'Cottage cheese grilled in tandoor', price: 180, isVeg: true, isAvailable: true, protein: '15g', calories: '280kcal', image: '', isSpicy: false },
      { id: 4, categoryId: 1, name: 'Veg Spring Rolls', description: 'Crispy rolls stuffed with fresh veggies', price: 150, isVeg: true, isAvailable: true, protein: '5g', calories: '180kcal', image: '', isSpicy: false },
      { id: 5, categoryId: 3, name: 'Butter Naan', description: 'Soft bread baked in tandoor with butter', price: 40, isVeg: true, isAvailable: true, protein: '4g', calories: '120kcal', image: '', isSpicy: false },
    ];
  });

  /* ── Discount State ── */
  const [discounts, setDiscounts] = useState(() => {
    const s = localStorage.getItem('app_settings_discounts');
    if (s) {
      const parsed = JSON.parse(s);
      return { ...parsed, globalActive: parsed.globalActive ?? false };
    }
    return { globalPercent: '', globalActive: false, categoryDiscounts: [], itemDiscounts: [] };
  });

  const [isDiscountOpen, setIsDiscountOpen] = useState(false);
  const [discountTab, setDiscountTab] = useState('global'); // 'global', 'category', 'item'
  const [newCatDiscount, setNewCatDiscount] = useState({ categoryName: '', percent: '' });
  const [newItemDiscount, setNewItemDiscount] = useState({ itemName: '', percent: '' });

  // Sync to local storage
  useEffect(() => localStorage.setItem('app_categories', JSON.stringify(categories)), [categories]);
  useEffect(() => localStorage.setItem('app_items', JSON.stringify(items)), [items]);
  useEffect(() => localStorage.setItem('app_settings_discounts', JSON.stringify(discounts)), [discounts]);

  /* ── Item Modal ── */
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [itemForm, setItemForm] = useState({ name: '', description: '', price: '', isVeg: true, image: '', protein: '', calories: '', isSpicy: false });

  const activeCat = categories.find(c => c.id === activeCatId);
  const displayedItems = items.filter(i => i.categoryId === activeCatId);

  /* ── Calculate Applied Discount ── */
  const getItemDiscount = (item) => {
    // 1. Item Level
    const itemD = discounts.itemDiscounts.find(d => d.itemName === item.name);
    if (itemD) return Number(itemD.percent);
    // 2. Category Level
    const cat = categories.find(c => c.id === item.categoryId);
    if (cat) {
      const catD = discounts.categoryDiscounts.find(c => c.categoryName === cat.name);
      if (catD) return Number(catD.percent);
    }
    // 3. Global Level
    if (discounts.globalActive && discounts.globalPercent) return Number(discounts.globalPercent);
    return 0; // No discount
  };

  /* ── Handlers ── */
  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const used = categories.map(c => c.color);
    const avail = COLORS.filter(c => !used.includes(c));
    const color = avail.length > 0 ? avail[Math.floor(Math.random() * avail.length)] : COLORS[Math.floor(Math.random() * COLORS.length)];
    const nc = { id: Date.now(), name: newCatName.trim(), color };
    setCategories([...categories, nc]);
    setNewCatName(''); setIsAddCatOpen(false); setActiveCatId(nc.id);
  };

  const handleDeleteCategory = (id) => {
    if (!window.confirm('Delete category? All items inside will be lost.')) return;
    setCategories(categories.filter(c => c.id !== id));
    setItems(items.filter(i => i.categoryId !== id));
    if (activeCatId === id) {
      const rem = categories.filter(c => c.id !== id);
      if (rem.length > 0) setActiveCatId(rem[0].id);
    }
  };

  const handleOpenItemModal = (item = null) => {
    if (item) { setEditingItemId(item.id); setItemForm({ ...item, price: item.price.toString() }); }
    else { setEditingItemId(null); setItemForm({ name: '', description: '', price: '', isVeg: true, image: '', protein: '', calories: '', isSpicy: false }); }
    setIsItemModalOpen(true);
  };

  const handleSaveItem = () => {
    if (!itemForm.name.trim() || !itemForm.price) return;
    if (editingItemId) { setItems(items.map(i => i.id === editingItemId ? { ...i, ...itemForm, price: parseFloat(itemForm.price) } : i)); }
    else { setItems([...items, { id: Date.now(), categoryId: activeCatId, ...itemForm, price: parseFloat(itemForm.price), isAvailable: true }]); }
    setIsItemModalOpen(false);
  };

  const handleDeleteItem = (id) => { if (window.confirm('Delete this item?')) setItems(items.filter(i => i.id !== id)); };
  const toggleItemAvailability = (id) => setItems(items.map(i => i.id === id ? { ...i, isAvailable: !i.isAvailable } : i));

  /* ── Discount Modals Handlers ── */
  const addCatDiscount = () => {
    if (!newCatDiscount.categoryName || !newCatDiscount.percent) return;
    setDiscounts(prev => ({
      ...prev,
      categoryDiscounts: [
        ...prev.categoryDiscounts.filter(c => c.categoryName !== newCatDiscount.categoryName),
        { categoryName: newCatDiscount.categoryName, percent: newCatDiscount.percent }
      ]
    }));
    setNewCatDiscount({ categoryName: '', percent: '' });
  };
  const removeCatDiscount = (name) => setDiscounts(prev => ({ ...prev, categoryDiscounts: prev.categoryDiscounts.filter(c => c.categoryName !== name) }));

  const addItemDiscount = () => {
    if (!newItemDiscount.itemName || !newItemDiscount.percent) return;
    setDiscounts(prev => ({
      ...prev,
      itemDiscounts: [
        ...prev.itemDiscounts.filter(i => i.itemName !== newItemDiscount.itemName),
        { itemName: newItemDiscount.itemName, percent: newItemDiscount.percent }
      ]
    }));
    setNewItemDiscount({ itemName: '', percent: '' });
  };
  const removeItemDiscount = (name) => setDiscounts(prev => ({ ...prev, itemDiscounts: prev.itemDiscounts.filter(i => i.itemName !== name) }));

  // Check if any discounts are active system-wide
  const hasAnyDiscounts = (discounts.globalActive && discounts.globalPercent) || discounts.categoryDiscounts.length > 0 || discounts.itemDiscounts.length > 0;

  const [hoveredItemId, setHoveredItemId] = useState(null);
  const [pressedBtnId, setPressedBtnId] = useState(null);

  /* ── Render ── */
  return (
    <div className="p-4 sm:p-6 md:p-10 space-y-6 bg-white min-h-full relative">

      {/* ── Header & Discounts Set ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b-[4px] border-black pb-5 gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-black uppercase tracking-widest leading-none">Menu Management</h1>
          <p className="text-black font-black uppercase tracking-widest mt-2 text-xs border-l-[3px] border-[#FBBC05] pl-3">Manage categories, items, and offers</p>
        </div>
        {/* Modern Discount Button */}
        <button
          onClick={() => setIsDiscountOpen(true)}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl border-[3px] border-black font-black uppercase tracking-widest text-sm transition-all hover:-translate-y-1 ${hasAnyDiscounts
            ? 'bg-[#34A853] text-white shadow-[4px_4px_0px_#1a7a3f] active:shadow-none active:translate-y-1 active:translate-x-1'
            : 'bg-white text-black shadow-[4px_4px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 active:translate-x-1'
            }`}
        >
          <span className="text-xl leading-none">🏷️</span>
          {hasAnyDiscounts ? 'Manage Offers' : 'Add Discounts'}
        </button>
      </div>

      {/* ── Category Pills ── */}
      <div className="flex items-center gap-3 flex-wrap">
        {categories.map((cat) => {
          const isActive = activeCatId === cat.id;
          const lightText = isLightColor(cat.color);
          return (
            <div key={cat.id} className="relative group">
              <button
                onClick={() => setActiveCatId(cat.id)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-[3px] border-black font-black text-sm uppercase tracking-widest transition-all duration-200"
                style={
                  isActive
                    ? { backgroundColor: cat.color, color: lightText ? '#000' : '#fff', boxShadow: 'none', transform: 'translate(3px,3px)' }
                    : { backgroundColor: '#fff', color: '#000', boxShadow: `4px 4px 0px ${cat.color}` }
                }
              >
                <span className="w-2.5 h-2.5 rounded-full shrink-0 border-[1.5px] border-black/20"
                  style={{ backgroundColor: isActive ? (lightText ? '#000' : '#fff') : cat.color }} />
                {cat.name}
              </button>
              {categories.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id); }}
                  className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-white border-[2px] border-black rounded-full hidden group-hover:flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-[#EA4335] hover:text-white text-[#EA4335] transition-all z-10"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          );
        })}

        {/* Add Category — just "+" */}
        <button
          onClick={() => setIsAddCatOpen(true)}
          className="w-11 h-11 rounded-xl border-[3px] border-black bg-white font-black text-2xl flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:rotate-90 hover:bg-[#FBBC05] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all duration-200 leading-none"
          title="Add Category"
        >+</button>
      </div>

      {/* ── Items Section ── */}
      <div className="space-y-4">
        {/* Subheader */}
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-5 h-5 rounded-full border-[2px] border-black shrink-0" style={{ backgroundColor: activeCat?.color }} />
            <h2 className="text-2xl font-black text-black uppercase tracking-widest leading-none">{activeCat?.name || 'Items'}</h2>
            <span
              className="text-xs font-black uppercase tracking-widest text-black bg-white border-[2px] border-black rounded-full px-2 py-0.5"
              style={{ boxShadow: `2px 2px 0px ${activeCat?.color || '#000'}` }}
            >{displayedItems.length} items</span>
          </div>
          <button
            onClick={() => handleOpenItemModal()}
            className="flex items-center gap-1.5 px-4 py-2 bg-white text-black border-[3px] border-black rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-200 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none"
            style={{ boxShadow: `4px 4px 0px ${activeCat?.color || '#000'}` }}
          >
            <span className="text-xl leading-none font-black">+</span> Add Item
          </button>
        </div>

        {/* Empty */}
        {displayedItems.length === 0 ? (
          <div className="w-full h-52 border-[3px] border-black border-dashed rounded-[24px] flex flex-col items-center justify-center bg-white gap-2">
            <svg className="w-8 h-8 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6h18M3 12h18M3 18h18" />
            </svg>
            <span className="font-black uppercase tracking-widest opacity-40">No items available in this category</span>
          </div>
        ) : (
          /* ── Compact Vertical Grid ── */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5 pb-8 items-stretch">
            {displayedItems.map((item) => {
              const isHovered = hoveredItemId === item.id;
              const catColor = activeCat?.color || '#000';
              const tint = getBgTint(catColor);
              const discountPercent = getItemDiscount(item);
              const hasDiscount = discountPercent > 0;
              const finalPrice = hasDiscount ? Math.round(item.price * (1 - discountPercent / 100)) : item.price;

              return (
                <div key={item.id} className="relative group h-[340px]">
                  <div
                    onMouseEnter={() => setHoveredItemId(item.id)}
                    onMouseLeave={() => setHoveredItemId(null)}
                    style={{
                      backgroundColor: tint,
                      borderColor: '#000',
                      boxShadow: isHovered ? 'none' : `4px 4px 0px ${catColor}`,
                      transform: isHovered ? 'translate(2px,2px)' : 'none',
                    }}
                    className="relative flex flex-col rounded-[20px] border-[2.5px] transition-all duration-200 overflow-hidden h-full"
                  >
                    {/* Dot grid overlay */}
                    <div
                      className="absolute inset-0 pointer-events-none z-0 opacity-[0.06]"
                      style={{ backgroundImage: 'radial-gradient(#000 1.2px, transparent 1.2px)', backgroundSize: '10px 10px' }}
                    />

                    {/* Decorative Glowing Blob */}
                    <div
                      className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full blur-2xl opacity-15 pointer-events-none transition-transform group-hover:scale-150 duration-500 z-0"
                      style={{ backgroundColor: catColor }}
                    />

                    {/* Top Image Section */}
                    <div className="relative z-10 w-full h-[130px] border-b-[2.5px] shrink-0 bg-white border-black">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-8 h-8 opacity-15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}

                      {/* Price Badge Over Image */}
                      <div className="absolute top-2.5 right-2.5 bg-white text-black font-black text-sm px-3 py-1.5 rounded-md border-[2.5px] border-black shadow-[3.5px_3.5px_0px_rgba(0,0,0,1)] leading-none tracking-widest z-20">
                        {hasDiscount ? (
                          <div className="flex items-center gap-1.5">
                            <span className="line-through opacity-40 text-[10px]">₹{item.price}</span>
                            <span>₹{finalPrice}</span>
                          </div>
                        ) : (
                          <span>₹{finalPrice}</span>
                        )}
                      </div>

                      {/* Discount Badge */}
                      {hasDiscount && (
                        <div className="absolute top-2.5 left-2.5 bg-[#EA4335] text-white text-xs font-black uppercase tracking-widest px-2 py-1 rounded-md border-[2.5px] border-black shadow-[3.5px_3.5px_0px_rgba(0,0,0,1)] -rotate-3 z-20">
                          {discountPercent}% OFF
                        </div>
                      )}
                    </div>

                    {/* Content Vertical Splitting */}
                    <div className="relative z-10 flex flex-col flex-1 p-3 gap-2 justify-between min-h-0">

                      {/* Top Row: Title + Details Container */}
                      <div className="flex flex-col gap-1.5">
                        {/* Title and Badges */}
                        <div className="flex items-start gap-3 flex-wrap min-w-0 items-center">
                          <DietaryIcon isVeg={item.isVeg} size={28} />
                          <h3 className="font-black text-xl leading-tight text-black flex-1 break-words uppercase tracking-tighter">{item.name}</h3>
                          {item.isSpicy && <span className="text-xl shrink-0 -mt-1">🌶️</span>}
                        </div>

                        {/* Description - Scrollable if too long */}
                        {item.description && (
                          <p className="text-xs font-black text-black leading-snug line-clamp-3 uppercase tracking-widest pl-8 overflow-y-auto">
                            {item.description}
                          </p>
                        )}

                          <div className="flex gap-2 mt-1.5 pl-6 flex-wrap">
                            {item.protein && <span className="text-[10px] font-black uppercase px-2 py-1 border-[2.5px] border-black bg-white rounded-md flex items-center gap-1.5 shadow-[2px_2px_0px_rgba(0,0,0,1)] leading-none"><span>💪</span> <span className="text-black">{item.protein}</span></span>}
                            {item.calories && <span className="text-[10px] font-black uppercase px-2 py-1 border-[2.5px] border-black bg-white rounded-md flex items-center gap-1.5 shadow-[2px_2px_0px_rgba(0,0,0,1)] leading-none"><span>🔥</span> <span className="text-black">{item.calories}</span></span>}
                          </div>
                      </div>

                      {/* Bottom Row: Availability vs Actions */}
                      <div className="flex justify-between items-center mt-1 pt-3 border-t-[1.5px] border-black/10 shrink-0">

                        {/* Full Availability Toggle */}
                        <button
                          onClick={() => toggleItemAvailability(item.id)}
                          className="flex items-center gap-2 group p-1 rounded-lg transition-colors -ml-1 border-[2px] border-transparent"
                        >
                          <div className={`w-12 h-6 rounded-full border-[2.5px] border-black relative transition-colors duration-200 shrink-0 ${item.isAvailable ? 'bg-[#34A853]' : 'bg-[#EA4335]'}`}>
                            <div className={`absolute top-[1.5px] w-4 h-4 bg-white border-[2px] border-black rounded-full transition-transform duration-200 ${item.isAvailable ? 'translate-x-[24px]' : 'translate-x-[1.5px]'}`} />
                          </div>
                          <span className={`text-xs font-black uppercase tracking-widest ${item.isAvailable ? 'text-[#34A853]' : 'text-[#EA4335]'}`}>
                            {item.isAvailable ? 'Available' : 'Unavailable'}
                          </span>
                        </button>

                        {/* Edit Button (Bottom Right) */}
                        <div className="flex gap-1.5">
                          <button
                            onPointerDown={() => setPressedBtnId(`edit-${item.id}`)}
                            onPointerUp={() => setPressedBtnId(null)}
                            onPointerLeave={() => setPressedBtnId(null)}
                            onClick={() => handleOpenItemModal(item)}
                            className="w-10 h-10 rounded-full flex items-center justify-center bg-white border-[2.5px] border-black hover:-translate-y-0.5 active:translate-y-0 transition-all text-[#4285F4]"
                          >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Item Delete Cross (Top-Right Corner) */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id); }}
                    className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-white border-[2px] border-black rounded-full hidden group-hover:flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-[#EA4335] hover:text-white text-[#EA4335] transition-all z-30"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Set / Edit Discount Modal ── */}
      {isDiscountOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white border-[4px] border-black rounded-[28px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">

            <div className="flex justify-between items-center border-b-[4px] border-black p-5 bg-[#ECFDF5] shrink-0">
              <div>
                <h3 className="text-2xl font-black tracking-widest uppercase text-[#1a7a3f] flex items-center gap-2"><span className="text-3xl">🏷️</span> Set Discounts</h3>
                <p className="text-xs font-bold text-black/50 uppercase tracking-widest mt-1">Configure global, category, or item specific offers</p>
              </div>
              <button onClick={() => setIsDiscountOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-xl border-[3px] border-black bg-white font-black text-xl hover:scale-110 active:scale-95 transition-transform shadow-[4px_4px_0px_#1a7a3f]">✕</button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b-[4px] border-black shrink-0 bg-gray-50">
              {['global', 'category', 'item'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setDiscountTab(tab)}
                  className={`flex-1 py-4 font-black uppercase tracking-widest text-sm border-r-[4px] border-black last:border-r-0 transition-colors ${discountTab === tab ? 'bg-[#34A853] text-white' : 'bg-transparent text-black hover:bg-gray-200'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto bg-white flex-1 space-y-6">

              {discountTab === 'global' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="font-black text-lg uppercase tracking-widest text-black">Menu-wide Discount</h4>
                      <p className="text-[10px] font-black text-black opacity-40 uppercase tracking-widest">Apply a flat % off to all items</p>
                    </div>

                    {/* Global Toggle */}
                    <div
                      className="flex items-center gap-2 cursor-pointer mt-1"
                      onClick={() => setDiscounts({ ...discounts, globalActive: !discounts.globalActive })}
                    >
                      <span className={`text-xs font-black uppercase tracking-widest ${discounts.globalActive ? 'text-[#34A853]' : 'text-gray-400'}`}>
                        {discounts.globalActive ? 'ON' : 'OFF'}
                      </span>
                      <div className={`w-10 h-5 rounded-full border-[2px] border-black relative transition-colors duration-200 shrink-0 ${discounts.globalActive ? 'bg-[#34A853]' : 'bg-gray-200'}`}>
                        <div className={`absolute top-[1.5px] w-3.5 h-3.5 bg-white border-[2px] border-black rounded-full transition-transform duration-200 ${discounts.globalActive ? 'translate-x-[20px]' : 'translate-x-[1.5px]'}`} />
                      </div>
                    </div>
                  </div>

                  <div className={`flex items-center gap-4 p-6 border-[3px] border-black rounded-xl border-dashed transition-all ${discounts.globalActive ? 'bg-[#ECFDF5]' : 'bg-gray-50 opacity-60'}`}>
                    <input
                      type="number" min="0" max="100" placeholder="0"
                      disabled={!discounts.globalActive}
                      value={discounts.globalPercent} onChange={e => setDiscounts({ ...discounts, globalPercent: e.target.value })}
                      className="w-24 px-3 py-4 text-center font-black text-3xl border-[3px] border-black rounded-xl focus:outline-none focus:shadow-[4px_4px_0px_#34A853] transition-shadow disabled:bg-gray-200 disabled:cursor-not-allowed"
                    />
                    <div>
                      <div className={`font-black text-3xl leading-none ${discounts.globalActive ? 'text-[#34A853]' : 'text-gray-400'}`}>% OFF</div>
                      <div className="text-black font-black text-xs uppercase tracking-widest mt-1">Global Rate</div>
                    </div>
                  </div>
                </div>
              )}

              {discountTab === 'category' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-black text-lg uppercase tracking-widest text-black">Category Specific</h4>
                    <p className="text-[10px] font-black text-black opacity-40 uppercase tracking-widest">Discounts for selected menu sections</p>
                  </div>

                  <div className="flex gap-4">
                    <select
                      value={newCatDiscount.categoryName} onChange={e => setNewCatDiscount({ ...newCatDiscount, categoryName: e.target.value })}
                      className="flex-1 px-4 py-3 bg-white border-[3px] border-black font-black uppercase tracking-widest text-sm rounded-xl focus:outline-none focus:shadow-[4px_4px_0px_#34A853]"
                    >
                      <option value="" disabled>Select Category...</option>
                      {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                    <input
                      type="number" placeholder="%" value={newCatDiscount.percent} onChange={e => setNewCatDiscount({ ...newCatDiscount, percent: e.target.value })}
                      className="w-20 text-center font-black text-xl border-[3px] border-black rounded-xl focus:outline-none focus:shadow-[4px_4px_0px_#34A853]"
                    />
                    <button onClick={addCatDiscount} className="px-6 border-[3px] border-black rounded-xl bg-black text-white font-black hover:bg-[#34A853] hover:text-black shadow-[4px_4px_0px_#34A853] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all">Add</button>
                  </div>

                  <div className="space-y-2">
                    {discounts.categoryDiscounts.map((d, i) => (
                      <div key={i} className="flex justify-between items-center p-3 border-[3px] border-black rounded-xl bg-[#ECFDF5]">
                        <span className="font-black uppercase tracking-widest text-sm">{d.categoryName}</span>
                        <div className="flex items-center gap-4">
                          <span className="font-black text-lg text-[#34A853]">{d.percent}% OFF</span>
                          <button onClick={() => removeCatDiscount(d.categoryName)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border-[2px] border-black text-[#EA4335] hover:scale-110 font-bold transition-transform">✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {discountTab === 'item' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-black text-lg uppercase tracking-widest text-black">Item Specific</h4>
                    <p className="text-[10px] font-black text-black opacity-40 uppercase tracking-widest">Flash sale specific dishes</p>
                  </div>

                  <div className="flex gap-4">
                    <select
                      value={newItemDiscount.itemName} onChange={e => setNewItemDiscount({ ...newItemDiscount, itemName: e.target.value })}
                      className="flex-1 px-4 py-3 bg-white border-[3px] border-black font-black uppercase tracking-widest text-sm rounded-xl focus:outline-none focus:shadow-[4px_4px_0px_#34A853]"
                    >
                      <option value="" disabled>Select Item...</option>
                      {items.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                    <input
                      type="number" placeholder="%" value={newItemDiscount.percent} onChange={e => setNewItemDiscount({ ...newItemDiscount, percent: e.target.value })}
                      className="w-20 text-center font-black text-xl border-[3px] border-black rounded-xl focus:outline-none focus:shadow-[4px_4px_0px_#34A853]"
                    />
                    <button onClick={addItemDiscount} className="px-6 border-[3px] border-black rounded-xl bg-black text-white font-black hover:bg-[#34A853] hover:text-black shadow-[4px_4px_0px_#34A853] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all">Add</button>
                  </div>

                  <div className="space-y-2">
                    {discounts.itemDiscounts.map((d, i) => (
                      <div key={i} className="flex justify-between items-center p-3 border-[3px] border-black rounded-xl bg-[#ECFDF5]">
                        <span className="font-black uppercase tracking-widest text-sm">{d.itemName}</span>
                        <div className="flex items-center gap-4">
                          <span className="font-black text-lg text-[#34A853]">{d.percent}% OFF</span>
                          <button onClick={() => removeItemDiscount(d.itemName)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border-[2px] border-black text-[#EA4335] hover:scale-110 font-bold transition-transform">✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* ── Add Category Modal ── */}
      {isAddCatOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white border-[4px] border-black rounded-[28px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center border-b-[3px] border-black p-5 bg-[#FFFBEB]">
              <h3 className="text-xl font-black tracking-widest uppercase">Add Category</h3>
              <button onClick={() => setIsAddCatOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-xl border-[3px] border-black bg-white font-black text-xl hover:scale-110 transition-transform shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">✕</button>
            </div>
            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-widest">Category Name</label>
                <input
                  type="text" value={newCatName} onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g., Starters, Mains, Beverages"
                  className="w-full px-4 py-4 border-[3px] border-black rounded-xl font-black focus:outline-none focus:shadow-[4px_4px_0px_0px_#3B82F6] transition-all text-lg"
                  autoFocus onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                />
              </div>
              <button onClick={handleAddCategory} className="w-full bg-[#3B82F6] text-black py-4 border-[3px] border-black rounded-xl font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all text-lg">
                Save Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add / Edit Item Modal ── */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white border-[4px] border-black rounded-[28px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-xl flex flex-col max-h-[90vh] overflow-hidden">
            <div
              className="flex justify-between items-center border-b-[4px] border-black p-5 shrink-0"
              style={{ backgroundColor: activeCat?.color || '#0F172A' }}
            >
              <h3 className="text-2xl font-black tracking-widest uppercase" style={{ color: isLightColor(activeCat?.color || '#0F172A') ? '#000' : '#fff' }}>
                {editingItemId ? 'Edit Dish' : 'Add Dish'}
              </h3>
              <button
                onClick={() => setIsItemModalOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-xl border-[3px] border-black bg-white font-black text-xl hover:scale-110 transition-transform shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black"
              >✕</button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {[
                { label: 'Item Name', key: 'name', type: 'text', placeholder: 'Menu display name' },
                { label: 'Description', key: 'description', type: 'textarea', placeholder: 'Short appetizing description' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key} className="space-y-2">
                  <label className="block text-xs font-black uppercase tracking-widest">{label}</label>
                  {type === 'textarea'
                    ? <textarea rows="2" value={itemForm[key]} onChange={(e) => setItemForm({ ...itemForm, [key]: e.target.value })} placeholder={placeholder}
                      className="w-full px-4 py-3 border-[3px] border-black rounded-xl text-base font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_#4285F4] transition-shadow resize-none" />
                    : <input type="text" value={itemForm[key]} onChange={(e) => setItemForm({ ...itemForm, [key]: e.target.value })} placeholder={placeholder}
                      className="w-full px-4 py-3 border-[3px] border-black rounded-xl text-base font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_#4285F4] transition-shadow" />
                  }
                </div>
              ))}

              <div className="flex flex-col sm:flex-row gap-5">
                <div className="space-y-2 flex-1">
                  <label className="block text-xs font-black uppercase tracking-widest">Price (₹)</label>
                  <input type="number" value={itemForm.price} onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })} placeholder="0.00"
                    className="w-full px-4 py-3 border-[3px] border-black rounded-xl text-xl font-black focus:outline-none focus:shadow-[4px_4px_0px_0px_#4285F4] transition-shadow" />
                </div>
                <div className="space-y-2 flex-1">
                  <label className="block text-xs font-black uppercase tracking-widest">Filters</label>
                  <div className="flex items-center gap-4 h-[55px] border-[3px] border-black rounded-xl px-4 bg-gray-50 flex-wrap">
                    {/* Veg toggle */}
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => setItemForm({ ...itemForm, isVeg: !itemForm.isVeg })}>
                      <div className="flex items-center justify-center w-10 h-6 bg-white border-[2px] border-black rounded-lg transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5">
                        <DietaryIcon isVeg={itemForm.isVeg} size={16} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: itemForm.isVeg ? '#34A853' : '#EA4335' }}>
                        {itemForm.isVeg ? 'Veg' : 'N-Veg'}
                      </span>
                    </div>
                    <div className="w-[3px] h-6 bg-black/15 shrink-0" />
                    <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setItemForm({ ...itemForm, isSpicy: !itemForm.isSpicy })}>
                      <div className={`w-6 h-6 border-[2px] border-black rounded-md flex items-center justify-center shrink-0 transition-colors ${itemForm.isSpicy ? 'bg-[#EA4335]' : 'bg-white'}`}>
                        {itemForm.isSpicy && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest">🌶️</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-5">
                {['protein', 'calories'].map((key) => (
                  <div key={key} className="space-y-2 flex-1">
                    <label className="block text-xs font-black uppercase tracking-widest capitalize">{key}</label>
                    <input type="text" placeholder={key === 'protein' ? 'e.g. 25g' : 'e.g. 300kcal'} value={itemForm[key]}
                      onChange={(e) => setItemForm({ ...itemForm, [key]: e.target.value })}
                      className="w-full px-4 py-3 border-[3px] border-black rounded-xl text-sm font-bold focus:outline-none focus:shadow-[4px_4px_0px_#4285F4] transition-shadow" />
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-widest">Image URL (Optional)</label>
                <input type="text" value={itemForm.image} onChange={(e) => setItemForm({ ...itemForm, image: e.target.value })} placeholder="https://source.unsplash.com/..."
                  className="w-full px-4 py-3 border-[3px] border-black rounded-xl text-sm font-bold focus:outline-none focus:shadow-[4px_4px_0px_#4285F4] transition-shadow" />
              </div>
            </div>

            <div className="p-6 border-t-[4px] border-black bg-gray-50 shrink-0">
              <button
                onClick={handleSaveItem}
                className="w-full bg-black text-white py-4 border-[4px] border-black rounded-xl font-black uppercase tracking-widest shadow-[4px_4px_0px_#000] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all text-lg"
                style={{
                  backgroundColor: activeCat?.color || '#0F172A',
                  color: isLightColor(activeCat?.color || '#0F172A') ? '#000' : '#fff',
                  boxShadow: `4px 4px 0px #000`
                }}
              >
                {editingItemId ? 'Update Dish' : 'Add Dish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManage;
