import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { useBooking } from '../../context/BookingContext';
import { formatCurrencyINR } from '../../utils/formatters';

export default function MenuPreOrderStep() {
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState('All Items');
  const [loading, setLoading] = useState(true);
  const { menuItems, updateMenuItemQuantity, pricing } = useBooking();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadMenu() {
      try {
        const data = await api.getMenu();
        setItems(data);
      } catch (err) {
        console.error('Failed to load menu items:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMenu();
  }, []);

  const categories = [
    'All Items',
    'Coffee & Beverages',
    'Cold Brew & Tonics',
    'Bakery & Desserts',
    'Celebration Platters'
  ];

  const filteredItems = items.filter(i => {
    if (category === 'All Items') return true;
    return i.category === category;
  });

  const getItemQuantity = (id) => {
    const found = menuItems.find(m => m.item_id === id);
    return found ? found.quantity : 0;
  };

  return (
    <div className="w-full pt-20 pb-24 bg-surface min-h-screen">
      <div className="max-w-[1200px] mx-auto px-gutter-desktop">
        
        {/* Progress Header */}
        <div className="py-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-on-primary text-xs font-bold">3</span>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Step 3 of 5: Menu & Pre-Order</span>
            </div>
            <span className="text-xs text-secondary font-bold flex items-center gap-1 bg-secondary-container/40 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
              Caravan Ready
            </span>
          </div>

          <div className="w-full bg-surface-container-high rounded-full h-1.5 overflow-hidden">
            <div className="bg-primary h-1.5 rounded-full transition-all duration-500" style={{ width: '60%' }}></div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div>
              <h1 className="text-3xl font-extrabold text-on-surface">Artisanal Barista Bar</h1>
              <p className="text-sm text-on-surface-variant mt-0.5">Pre-order seasonal single-origins, warm pastries, and celebratory boards ahead of arrival.</p>
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="pb-6 overflow-x-auto no-scrollbar flex gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold shrink-0 transition-all ${
                category === cat
                  ? 'bg-on-surface text-surface shadow-sm'
                  : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high border border-outline-variant/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 2-Column Menu Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Menu Items Grid */}
          <div className="lg:col-span-7 space-y-4">
            {filteredItems.map((item) => {
              const qty = getItemQuantity(item.id || item._id);
              return (
                <div
                  key={item.id || item._id}
                  className="bg-surface-container-lowest rounded-2xl p-4 sm:p-5 border border-outline-variant/30 shadow-sm flex flex-col sm:flex-row gap-4 justify-between transition-all hover:border-outline-variant"
                >
                  <div className="flex gap-4 flex-1">
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-surface-container shrink-0">
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col justify-between flex-1">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-base text-on-surface">{item.name}</h3>
                          <span className="font-bold text-base text-primary shrink-0">
                            {formatCurrencyINR(item.price_inr)}
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant line-clamp-2 mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.tags?.map((t, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-surface-container text-on-surface-variant">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex sm:flex-col items-center justify-between sm:justify-center gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-outline-variant/20">
                    <div className="flex items-center bg-surface-container-high rounded-full p-1 shadow-xs">
                      <button
                        onClick={() => updateMenuItemQuantity(item, -1)}
                        disabled={qty <= 0}
                        className="w-7 h-7 rounded-full bg-surface-container-lowest disabled:opacity-30 text-on-surface flex items-center justify-center hover:bg-surface-variant active:scale-90 transition-transform text-sm font-bold"
                      >
                        -
                      </button>
                      <span className="px-3 min-w-[28px] text-center font-bold text-xs text-on-surface">
                        {qty}
                      </span>
                      <button
                        onClick={() => updateMenuItemQuantity(item, 1)}
                        className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center hover:bg-primary-container active:scale-90 transition-transform shadow-xs text-sm font-bold"
                      >
                        +
                      </button>
                    </div>

                    {qty > 0 && (
                      <span className="text-[11px] font-bold text-secondary">
                        {formatCurrencyINR(qty * item.price_inr)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Summary Sidebar */}
          <div className="lg:col-span-5 space-y-6 sticky top-24">
            <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-sm space-y-5">
              <h3 className="font-bold text-lg text-on-surface">Pre-Order Cart</h3>

              {menuItems.length === 0 ? (
                <div className="p-4 rounded-2xl bg-surface-container-low text-center text-xs text-on-surface-variant">
                  No drinks or pastries added yet. Tap + on any item to pre-order for your journey!
                </div>
              ) : (
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {menuItems.map((m) => (
                    <div key={m.item_id} className="flex items-center justify-between text-xs p-2 rounded-xl bg-surface-container-low">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-[10px]">
                          {m.quantity}×
                        </span>
                        <span className="font-bold text-on-surface truncate max-w-[150px]">{m.name}</span>
                      </div>
                      <span className="font-bold text-primary">
                        {formatCurrencyINR(m.quantity * m.price_at_booking)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-3 border-t border-outline-variant/30 space-y-2 text-xs">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Menu Subtotal</span>
                  <span className="font-bold text-on-surface">{formatCurrencyINR(pricing.menu_total_inr)}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Total With Theme & Route</span>
                  <span className="font-bold text-primary text-base">{formatCurrencyINR(pricing.total_inr)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => navigate('/booking/theme')}
                  className="w-1/3 py-3 rounded-full bg-surface-container hover:bg-surface-container-high font-bold text-xs text-on-surface transition-all"
                >
                  ← Back
                </button>
                <button
                  onClick={() => navigate('/booking/slots')}
                  className="w-2/3 py-3 rounded-full bg-primary text-on-primary font-bold text-xs shadow-md hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Step 4: Vehicle & Slots</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
