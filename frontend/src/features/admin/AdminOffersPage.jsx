import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { formatCurrencyINR } from '../../utils/formatters';

export default function AdminOffersPage() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newOffer, setNewOffer] = useState({
    code: '',
    title: '',
    description: '',
    discount_type: 'flat',
    value: 500,
    valid_to: '2026-12-31',
    applicable_theme_ids: [],
    is_active: true
  });

  const loadOffers = async () => {
    try {
      const data = await api.getOffers();
      setOffers(data);
    } catch (err) {
      console.warn('Offers note:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffers();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.admin.createOffer({
        ...newOffer,
        code: newOffer.code.toUpperCase().trim(),
        value: Number(newOffer.value)
      });
      setShowAdd(false);
      loadOffers();
    } catch (err) {
      alert(`Offer creation failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-on-surface">Promotions & Offers</h2>
          <p className="text-xs text-on-surface-variant">Manage promo codes and discount vouchers in INR</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="py-2.5 px-5 rounded-full bg-primary text-on-primary text-xs font-bold shadow-xs hover:brightness-105"
        >
          + Add New Promo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {offers.map((o) => (
          <div key={o.id || o._id} className="bg-surface-container-lowest p-5 rounded-3xl border border-outline-variant/30 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-extrabold text-primary bg-primary/10 px-3 py-1 rounded-xl">
                {o.code}
              </span>
              <span className="text-xs font-bold text-secondary">
                {o.discount_type === 'flat' ? `Flat ₹${o.value} Off` : `${o.value}% Off`}
              </span>
            </div>

            <div>
              <h4 className="font-bold text-sm text-on-surface">{o.title}</h4>
              <p className="text-xs text-on-surface-variant mt-0.5">{o.description}</p>
            </div>

            <div className="flex items-center justify-between text-[11px] text-tertiary pt-2 border-t border-outline-variant/20">
              <span>Used {o.times_used || 0} times</span>
              <span>Valid to: {o.valid_to}</span>
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-3xl p-6 shadow-2xl border border-outline-variant/40 space-y-4">
            <h3 className="font-bold text-base text-on-surface">Create New Promo Code</h3>
            
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Promo Code (e.g. MONSOON20)</label>
                <input
                  type="text"
                  required
                  value={newOffer.code}
                  onChange={(e) => setNewOffer({ ...newOffer, code: e.target.value })}
                  className="w-full p-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl uppercase font-bold"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Campaign Title</label>
                <input
                  type="text"
                  required
                  value={newOffer.title}
                  onChange={(e) => setNewOffer({ ...newOffer, title: e.target.value })}
                  className="w-full p-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">Discount Type</label>
                  <select
                    value={newOffer.discount_type}
                    onChange={(e) => setNewOffer({ ...newOffer, discount_type: e.target.value })}
                    className="w-full p-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl"
                  >
                    <option value="flat">Flat ₹ Discount</option>
                    <option value="percentage">Percentage (%)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1">Value ({newOffer.discount_type === 'flat' ? '₹' : '%'})</label>
                  <input
                    type="number"
                    required
                    value={newOffer.value}
                    onChange={(e) => setNewOffer({ ...newOffer, value: e.target.value })}
                    className="w-full p-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="w-1/2 py-2.5 rounded-full bg-surface-container font-bold text-on-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-full bg-primary text-on-primary font-bold shadow-md hover:brightness-105"
                >
                  Create Promo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
