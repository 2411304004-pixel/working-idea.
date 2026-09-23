import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { formatCurrencyINR } from '../../utils/formatters';

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newVehicle, setNewVehicle] = useState({
    name: '',
    edition: 'Classic Edition',
    seating_capacity: 6,
    status: 'available',
    render_image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDKZRPX0oFFQrB4LkYTwB18pZDgfcTdQW_PD5D44LVDaV8BvJTQRp8z9YVch_Eg01CbMZMP48VfGOMUrG1c646Zq9VNniXNVkFNF_D2VDauYjwPxYL4DEa8WAZWxL3srGPYcgkLjm5ebFClR4Iz01RMttSnPsfBU8VN6Va9DquUYyUkngiV4mHeS15k30CPnr4mfLssDM9k9G5uew0q7Pm5lkwKDwhkYA_wkfxsjNK6aKBxc3EPJbmj',
    features: ['La Marzocco Linea PB', 'Silent Lithium Power', 'Awning Setup']
  });

  const loadVehicles = async () => {
    try {
      const data = await api.getVehicles();
      setVehicles(data);
    } catch (err) {
      console.warn('Vehicle load note:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const handleToggleStatus = async (v) => {
    const nextStatus = v.status === 'available' ? 'on_ride' : v.status === 'on_ride' ? 'maintenance' : 'available';
    try {
      await api.admin.updateVehicle(v.id || v._id, { ...v, status: nextStatus });
      loadVehicles();
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-on-surface">Fleet Management</h2>
          <p className="text-xs text-on-surface-variant">Active caravan inventory, status controls, and seating</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {vehicles.map((v) => (
          <div key={v.id || v._id} className="bg-surface-container-lowest p-5 rounded-3xl border border-outline-variant/30 shadow-sm space-y-4">
            <div className="h-40 rounded-2xl overflow-hidden bg-surface-container relative">
              <img src={v.render_image_url} alt={v.name} className="w-full h-full object-cover" />
              <span className={`absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                v.status === 'available' ? 'bg-secondary text-on-secondary' : v.status === 'on_ride' ? 'bg-primary text-on-primary' : 'bg-tertiary text-white'
              }`}>
                {v.status}
              </span>
            </div>

            <div>
              <h3 className="font-bold text-base text-on-surface">{v.name}</h3>
              <p className="text-xs text-on-surface-variant">{v.edition} • {v.seating_capacity} seats</p>
            </div>

            <div className="flex flex-wrap gap-1">
              {v.features?.map((f, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded bg-surface-container text-[10px] font-semibold text-on-surface-variant">
                  {f}
                </span>
              ))}
            </div>

            <button
              onClick={() => handleToggleStatus(v)}
              className="w-full py-2.5 rounded-full bg-surface-container hover:bg-surface-container-high text-xs font-bold text-on-surface transition-colors"
            >
              Toggle Status (Current: {v.status})
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
