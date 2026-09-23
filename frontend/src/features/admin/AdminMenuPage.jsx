import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { formatCurrencyINR } from '../../utils/formatters';

export default function AdminMenuPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMenu = async () => {
    try {
      const data = await api.getMenu();
      setItems(data);
    } catch (err) {
      console.warn('Admin menu note:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenu();
  }, []);

  const handleToggleAvailable = async (item) => {
    try {
      await api.admin.updateMenuItem(item.id || item._id, {
        ...item,
        is_available: !item.is_available
      });
      loadMenu();
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-on-surface">Menu Items & Pricing</h2>
          <p className="text-xs text-on-surface-variant">Manage artisanal drink and patisserie offerings for pre-orders</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.id || item._id} className="bg-surface-container-lowest p-4 rounded-3xl border border-outline-variant/30 shadow-sm flex flex-col justify-between space-y-3">
            <div className="flex gap-3">
              <img src={item.image_url} alt={item.name} className="w-16 h-16 rounded-xl object-cover bg-surface-container shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-tertiary uppercase">{item.category}</span>
                <h4 className="font-bold text-sm text-on-surface truncate">{item.name}</h4>
                <p className="text-xs font-extrabold text-primary mt-0.5">{formatCurrencyINR(item.price_inr)}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20 text-xs">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                item.is_available ? 'bg-secondary/15 text-secondary' : 'bg-tertiary/20 text-tertiary'
              }`}>
                {item.is_available ? 'Available' : 'Sold Out'}
              </span>

              <button
                onClick={() => handleToggleAvailable(item)}
                className="py-1 px-3 rounded-full bg-surface-container hover:bg-surface-container-high text-xs font-bold text-on-surface"
              >
                Toggle
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
