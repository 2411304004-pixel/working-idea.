import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { useBooking } from '../../context/BookingContext';
import { formatCurrencyINR } from '../../utils/formatters';

export default function VehicleSlotStep() {
  const [vehicles, setVehicles] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const {
    vehicle,
    setVehicle,
    scheduledDate,
    setScheduledDate,
    scheduledSlot,
    setScheduledSlot,
    pricing
  } = useBooking();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const vData = await api.getVehicles();
        setVehicles(vData);
        if (vData.length > 0 && !vehicle) {
          setVehicle(vData[0]);
        }
        const sData = await api.getSlots(scheduledDate);
        setSlots(sData.slots || []);
      } catch (err) {
        console.error('Failed to load fleet/slots:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [scheduledDate]);

  return (
    <div className="w-full pt-20 pb-24 bg-surface min-h-screen">
      <div className="max-w-[1200px] mx-auto px-gutter-desktop">
        
        {/* Progress Header */}
        <div className="py-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-on-primary text-xs font-bold">4</span>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Step 4 of 5: Vehicle & Slots</span>
            </div>
            <span className="text-xs text-secondary font-bold flex items-center gap-1 bg-secondary-container/40 px-2.5 py-0.5 rounded-full">
              <span className="material-symbols-outlined text-[14px]">verified_user</span>
              Guaranteed Power & Water
            </span>
          </div>

          <div className="w-full bg-surface-container-high rounded-full h-1.5 overflow-hidden">
            <div className="bg-primary h-1.5 rounded-full transition-all duration-500" style={{ width: '80%' }}></div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div>
              <h1 className="text-3xl font-extrabold text-on-surface">Select Caravan & Time Window</h1>
              <p className="text-sm text-on-surface-variant mt-0.5">Choose your vintage espresso caravan model and reserved departure slot.</p>
            </div>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Fleet Selection & Slot Picker */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Fleet Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-secondary text-on-secondary flex items-center justify-center text-xs font-bold">1</span>
                  <h3 className="font-bold text-lg text-on-surface">Choose Mobile Espresso Bar</h3>
                </div>
                <span className="text-xs text-on-surface-variant font-medium">3 Vehicles In Fleet</span>
              </div>

              <div className="space-y-4">
                {vehicles.map((v) => {
                  const isSelected = (vehicle?.id || vehicle?._id) === (v.id || v._id);
                  return (
                    <div
                      key={v.id || v._id}
                      onClick={() => setVehicle(v)}
                      className={`cursor-pointer rounded-2xl p-4 sm:p-5 transition-all border ${
                        isSelected
                          ? 'bg-surface-container-lowest border-primary ring-2 ring-primary/60 shadow-md'
                          : 'bg-surface-container-lowest/80 border-outline-variant/30 hover:border-outline-variant hover:bg-surface-container-lowest'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative w-full sm:w-48 h-36 shrink-0 rounded-xl overflow-hidden bg-surface-container">
                          <img src={v.render_image_url} alt={v.name} className="w-full h-full object-cover" />
                          <span className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-full bg-surface/90 backdrop-blur text-[10px] font-bold text-on-surface">
                            {v.edition}
                          </span>
                        </div>

                        <div className="flex flex-col justify-between flex-1">
                          <div>
                            <div className="flex items-start justify-between">
                              <h4 className="font-bold text-base text-on-surface">{v.name}</h4>
                              {isSelected && (
                                <span className="px-2.5 py-1 rounded-full bg-primary text-on-primary text-[10px] font-bold flex items-center gap-1 shadow-xs">
                                  <span className="material-symbols-outlined text-[13px]">check_circle</span>
                                  Selected
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-on-surface-variant mt-1">Dual-tone vintage coach with live-edge cedar serving bar.</p>
                          </div>

                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {v.features?.map((f, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface text-[10px] font-semibold">
                                {f}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Date & Slot Picker Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-secondary text-on-secondary flex items-center justify-center text-xs font-bold">2</span>
                <h3 className="font-bold text-lg text-on-surface">Reservation Date & Time Slot</h3>
              </div>

              <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-sm space-y-4">
                <div>
                  <label className="text-xs font-bold text-on-surface block mb-1.5">Select Journey Date</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 text-xs font-bold text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-on-surface block mb-2">Select Departure Window</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {slots.map((s) => {
                      const isChosen = scheduledSlot.includes(s.time);
                      return (
                        <button
                          key={s.id}
                          disabled={!s.available}
                          onClick={() => setScheduledSlot(`${s.time} (${s.label})`)}
                          className={`p-3.5 rounded-2xl border text-left transition-all ${
                            isChosen
                              ? 'bg-primary/10 border-primary ring-1 ring-primary/40 shadow-xs'
                              : s.available
                              ? 'bg-surface-container-low/50 border-outline-variant/30 hover:bg-surface-container-low'
                              : 'opacity-40 cursor-not-allowed bg-surface-container-high'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-on-surface">{s.time}</span>
                            {s.available ? (
                              <span className="text-[10px] text-secondary font-bold">Available</span>
                            ) : (
                              <span className="text-[10px] text-tertiary">Booked</span>
                            )}
                          </div>
                          <p className="text-[11px] text-on-surface-variant mt-0.5">{s.label}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Summary Sidebar */}
          <div className="lg:col-span-5 space-y-6 sticky top-24">
            <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-sm space-y-5">
              <h3 className="font-bold text-lg text-on-surface">Booking Summary</h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-surface-container-low space-y-1">
                  <span className="text-[10px] uppercase font-bold text-tertiary">Selected Caravan</span>
                  <p className="font-bold text-on-surface">{vehicle?.name || 'Artisan Van 04'}</p>
                </div>
                <div className="p-3 rounded-2xl bg-surface-container-low space-y-1">
                  <span className="text-[10px] uppercase font-bold text-tertiary">Date & Window</span>
                  <p className="font-bold text-on-surface">{scheduledDate} • {scheduledSlot}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-outline-variant/30 flex items-center justify-between">
                <div>
                  <span className="text-xs text-on-surface-variant block">Running Total</span>
                  <span className="text-2xl font-extrabold text-primary">
                    {formatCurrencyINR(pricing.total_inr)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => navigate('/booking/menu')}
                  className="w-1/3 py-3 rounded-full bg-surface-container hover:bg-surface-container-high font-bold text-xs text-on-surface transition-all"
                >
                  ← Back
                </button>
                <button
                  onClick={() => navigate('/booking/review')}
                  className="w-2/3 py-3 rounded-full bg-primary text-on-primary font-bold text-xs shadow-md hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Step 5: Review</span>
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
