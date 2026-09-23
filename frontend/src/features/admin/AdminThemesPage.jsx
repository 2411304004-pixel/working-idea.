import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { formatCurrencyINR } from '../../utils/formatters';

export default function AdminThemesPage() {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTheme, setEditingTheme] = useState(null);

  const loadThemes = async () => {
    try {
      const data = await api.getThemes();
      setThemes(data);
    } catch (err) {
      console.warn('Themes load note:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadThemes();
  }, []);

  const handleSaveTheme = async (e) => {
    e.preventDefault();
    try {
      await api.admin.updateTheme(editingTheme.id || editingTheme._id, editingTheme);
      setEditingTheme(null);
      loadThemes();
    } catch (err) {
      alert(`Theme update failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-on-surface">Themes & Distance Pricing</h2>
          <p className="text-xs text-on-surface-variant">Configure flat base ride pricing (covering first 10 km) and extra distance surcharge (₹8/km)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {themes.map((t) => (
          <div key={t.id || t._id} className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-sm space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-base text-on-surface">{t.name}</h3>
                <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-2">{t.description}</p>
              </div>
              <span className="text-base font-extrabold text-primary shrink-0">
                {formatCurrencyINR(t.base_price_inr)}
              </span>
            </div>

            <div className="bg-surface-container-low p-3 rounded-2xl grid grid-cols-2 gap-2 text-xs border border-outline-variant/20">
              <div>
                <span className="text-tertiary block text-[10px] uppercase font-bold">Included Distance</span>
                <span className="font-bold text-secondary">{t.included_km || 10} km included</span>
              </div>
              <div>
                <span className="text-tertiary block text-[10px] uppercase font-bold">Extra Distance Surcharge</span>
                <span className="font-bold text-primary">₹{t.per_km_rate_inr || 8}/km</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20 text-xs">
              <span className="text-tertiary">{t.add_ons?.length || 0} Add-Ons configured</span>
              <button
                onClick={() => setEditingTheme(t)}
                className="py-1.5 px-4 rounded-full bg-surface-container hover:bg-surface-container-high font-bold text-on-surface transition-colors"
              >
                Edit Pricing
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingTheme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-3xl p-6 shadow-2xl border border-outline-variant/40 space-y-4">
            <h3 className="font-bold text-base text-on-surface">Edit Theme Pricing: {editingTheme.name}</h3>
            
            <form onSubmit={handleSaveTheme} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Base Price (INR ₹) - Covers First 10 km</label>
                <input
                  type="number"
                  value={editingTheme.base_price_inr}
                  onChange={(e) => setEditingTheme({ ...editingTheme, base_price_inr: Number(e.target.value) })}
                  className="w-full p-3 bg-surface-container-low border border-outline-variant/30 rounded-xl font-bold text-sm text-primary"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Extra Distance Rate (₹/km beyond 10 km)</label>
                <input
                  type="number"
                  value={editingTheme.per_km_rate_inr}
                  onChange={(e) => setEditingTheme({ ...editingTheme, per_km_rate_inr: Number(e.target.value) })}
                  className="w-full p-3 bg-surface-container-low border border-outline-variant/30 rounded-xl font-bold text-sm text-secondary"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTheme(null)}
                  className="w-1/2 py-2.5 rounded-full bg-surface-container font-bold text-on-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-full bg-primary text-on-primary font-bold shadow-md hover:brightness-105"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
