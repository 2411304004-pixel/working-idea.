import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';
import { formatCurrencyINR, formatDistanceKm, formatDurationMin } from '../../utils/formatters';

export default function RoutePlannerStep() {
  const {
    theme,
    pickup,
    setPickup,
    destination,
    setDestination,
    optionalStop,
    setOptionalStop,
    pricing,
    calculating
  } = useBooking();
  const navigate = useNavigate();

  // Preset curated scenic stops in Mumbai
  const popularPresets = [
    {
      name: "Heritage to Worli Coastline",
      pickup: { lat: 18.9220, lng: 72.8347, address: "Gateway of India, Colaba" },
      stop: { lat: 18.9442, lng: 72.8234, address: "Marine Drive Promenade (Pour-Over Stop)" },
      destination: { lat: 18.9894, lng: 72.8296, address: "Worli Sea Face Coastal Perch" }
    },
    {
      name: "Bandra Sea Walk & Fort",
      pickup: { lat: 19.0544, lng: 72.8258, address: "Carter Road Promenade, Bandra" },
      stop: { lat: 19.0436, lng: 72.8198, address: "Bandstand Ocean Lookout" },
      destination: { lat: 19.0416, lng: 72.8214, address: "Bandra Fort Amphitheatre" }
    },
    {
      name: "Juhu Beachside Twilight",
      pickup: { lat: 19.0988, lng: 72.8264, address: "Juhu Tara Road Residence" },
      stop: null,
      destination: { lat: 19.1026, lng: 72.8258, address: "Juhu Beach Sunset Point" }
    }
  ];

  const applyPreset = (preset) => {
    setPickup(preset.pickup);
    setOptionalStop(preset.stop);
    setDestination(preset.destination);
  };

  return (
    <div className="w-full pt-20 pb-24 bg-surface min-h-screen">
      <div className="max-w-[1200px] mx-auto px-gutter-desktop">
        
        {/* Progress Header */}
        <div className="py-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-on-primary text-xs font-bold">1</span>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Step 1 of 5: Route & Stops</span>
            </div>
            <span className="text-xs text-tertiary">Next: Styling & Signage</span>
          </div>
          
          <div className="w-full bg-surface-container-high rounded-full h-1.5 overflow-hidden">
            <div className="bg-primary h-1.5 rounded-full transition-all duration-500" style={{ width: '20%' }}></div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div>
              <h1 className="text-3xl font-extrabold text-on-surface">Route & Scenic Stops</h1>
              <p className="text-sm text-on-surface-variant mt-0.5">Where should our vintage espresso caravan stage and serve your guests?</p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-secondary text-xs font-bold bg-secondary-container/40 px-3 py-1 rounded-full self-start">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              <span>Theme: {theme?.name || 'Proposal & Sunset Romance'}</span>
            </span>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Interactive Visual Route Canvas & Timeline Builder */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Map Canvas Graphic */}
            <div className="relative w-full rounded-3xl overflow-hidden shadow-sm bg-surface-container-low border border-outline-variant/30">
              <div 
                className="w-full h-64 bg-cover bg-center relative"
                style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBd4x8gEmSdMYjZQ9VAGTj6XxvXyrRkqUW4nXAdfTaa8Qwn0iorQz2Aau1zQDF8OuYBwi5meVdQWW3S-XtxvCUGilJxsdKhkFkFF3Ye3PimI6Hq76Q-jS7EY1xZPuQ1e-WboI9T6Rsj8iiTVUuc1N111hIIIHvS4nbRHJj19bxNHwP1jjlUxV8yCq9MGbkO68IaKyeSLgGMmGzxqkStXyURR1Et13JwjbKcn1dHAyBZYYFdnw_AxrlQ')` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/85 via-inverse-surface/30 to-transparent"></div>

                {/* SVG Route Line */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 360 224" preserveAspectRatio="none">
                  <path d="M 32 180 C 70 170, 110 130, 145 118 S 210 120, 250 82 S 290 60, 325 45" stroke="#ffffff" strokeWidth="4" strokeDasharray="6 4" strokeLinecap="round" opacity="0.6" fill="none" />
                  <path d="M 32 180 C 70 170, 110 130, 145 118 S 210 120, 250 82 S 290 60, 325 45" stroke="#E8623D" strokeWidth="3" strokeLinecap="round" fill="none" />
                  
                  {/* Stop Marker */}
                  <circle cx="180" cy="118" r="6" fill="#a73412" />
                  <circle cx="180" cy="118" r="3" fill="#ffffff" />
                  {/* Start Marker */}
                  <circle cx="32" cy="180" r="6" fill="#35675a" />
                  <circle cx="32" cy="180" r="3" fill="#ffffff" />
                  {/* End Marker */}
                  <circle cx="325" cy="45" r="6" fill="#a73412" />
                  <circle cx="325" cy="45" r="3" fill="#ffffff" />
                </svg>

                {/* Floating Pin */}
                <div className="absolute top-24 left-[48%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <div className="bg-surface-container-lowest text-on-surface px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 text-xs font-bold">
                    <span className="material-symbols-outlined text-primary text-[16px]">local_cafe</span>
                    <span>Pour-Over Stopover</span>
                  </div>
                </div>

                {/* Scenic Badge */}
                <div className="absolute top-3 left-3 bg-surface-container-lowest/90 backdrop-blur-md px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5 text-xs font-semibold text-on-surface">
                  <span className="material-symbols-outlined text-secondary text-[16px]">photo_camera</span>
                  <span>Scenic Coastal Waypoint</span>
                </div>

                {/* Golden Hour Pill */}
                <div className="absolute bottom-3 left-3">
                  <span className="text-xs font-semibold text-surface-container-lowest bg-inverse-surface/80 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-primary">wb_sunny</span>
                    <span>Golden Hour Window 4:30 - 6:00 PM</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Itinerary Metric Strip */}
            <div className="bg-surface-container-low rounded-2xl p-4 shadow-sm border border-outline-variant/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary-container text-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">directions_car</span>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-tertiary uppercase tracking-wider">Estimated Total Itinerary</p>
                  <p className="text-lg font-extrabold text-on-surface">
                    {formatDistanceKm(pricing.actual_distance_km)}
                    <span className="text-xs font-normal text-on-surface-variant ml-1.5">
                      • {formatDurationMin(Math.round(pricing.actual_distance_km * 2.8))} service
                    </span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant text-xs font-bold">
                  Quiet Lithium Hybrid
                </span>
              </div>
            </div>

            {/* Popular Presets */}
            <div className="bg-surface-container-lowest p-5 rounded-3xl border border-outline-variant/30 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-tertiary">Quick Curated Presets</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {popularPresets.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => applyPreset(p)}
                    className="p-3 rounded-2xl bg-surface-container-low hover:bg-surface-container text-left transition-colors border border-outline-variant/20"
                  >
                    <p className="text-xs font-bold text-on-surface truncate">{p.name}</p>
                    <p className="text-[11px] text-secondary mt-0.5 font-semibold">Load Preset →</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Multi-Stop Timeline Builder */}
            <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-on-surface">Route Waypoints</h3>

              {/* Point A */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary text-on-secondary flex items-center justify-center text-xs font-bold shrink-0 mt-2">
                  A
                </div>
                <div className="flex-1">
                  <label className="text-xs font-bold text-on-surface">Pickup / Departure Point</label>
                  <input
                    type="text"
                    value={pickup.address}
                    onChange={(e) => setPickup({ ...pickup, address: e.target.value })}
                    placeholder="e.g. Gateway of India, Colaba, Mumbai"
                    className="w-full mt-1 p-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs font-medium text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Optional Stop */}
              <div className="flex items-start gap-3 pl-0.5">
                <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-2">
                  <span className="material-symbols-outlined text-[16px]">local_cafe</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-on-surface">Optional Stopover (Pour-Over Pause)</label>
                    {optionalStop ? (
                      <button onClick={() => setOptionalStop(null)} className="text-[11px] text-error font-semibold hover:underline">
                        Remove Stop
                      </button>
                    ) : (
                      <button onClick={() => setOptionalStop({ lat: 18.9442, lng: 72.8234, address: "Marine Drive Promenade" })} className="text-[11px] text-secondary font-semibold hover:underline">
                        + Add Stop
                      </button>
                    )}
                  </div>
                  {optionalStop && (
                    <input
                      type="text"
                      value={optionalStop.address}
                      onChange={(e) => setOptionalStop({ ...optionalStop, address: e.target.value })}
                      placeholder="e.g. Marine Drive Promenade (Pour-Over Stop)"
                      className="w-full mt-1 p-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs font-medium text-on-surface focus:outline-none focus:border-primary"
                    />
                  )}
                </div>
              </div>

              {/* Point B */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs font-bold shrink-0 mt-2">
                  B
                </div>
                <div className="flex-1">
                  <label className="text-xs font-bold text-on-surface">Final Serving Destination</label>
                  <input
                    type="text"
                    value={destination.address}
                    onChange={(e) => setDestination({ ...destination, address: e.target.value })}
                    placeholder="e.g. Worli Sea Face Lookout, Mumbai"
                    className="w-full mt-1 p-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs font-medium text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Live Pricing Sidebar */}
          <div className="lg:col-span-5 space-y-6 sticky top-24">
            <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
                <div>
                  <span className="text-xs font-bold text-secondary uppercase tracking-wider">Live Route Quote</span>
                  <h3 className="text-lg font-bold text-on-surface">Fare Computation</h3>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                  ₹8/km beyond 10km
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Complete Ride Package Base</span>
                  <span className="font-bold text-on-surface">{formatCurrencyINR(pricing.base_price_inr)}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Included Distance</span>
                  <span className="font-bold text-secondary">{pricing.included_km} km (Included)</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Estimated Total Distance</span>
                  <span className="font-bold text-on-surface">{formatDistanceKm(pricing.actual_distance_km)}</span>
                </div>
                {pricing.extra_km > 0 && (
                  <div className="flex justify-between text-primary font-semibold">
                    <span>Extra {pricing.extra_km} km @ ₹8/km</span>
                    <span>+{formatCurrencyINR(pricing.extra_km_charge_inr)}</span>
                  </div>
                )}
                {pricing.add_ons_total_inr > 0 && (
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Theme Add-Ons</span>
                    <span className="font-bold text-on-surface">+{formatCurrencyINR(pricing.add_ons_total_inr)}</span>
                  </div>
                )}
                {pricing.menu_total_inr > 0 && (
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Menu Pre-Orders</span>
                    <span className="font-bold text-on-surface">+{formatCurrencyINR(pricing.menu_total_inr)}</span>
                  </div>
                )}
                <div className="flex justify-between text-on-surface-variant">
                  <span>Estimated GST (5%)</span>
                  <span>+{formatCurrencyINR(pricing.tax_inr)}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-outline-variant/30 flex items-center justify-between">
                <div>
                  <span className="text-xs text-on-surface-variant block">Total Running Estimate</span>
                  <span className="text-2xl font-extrabold text-primary">
                    {formatCurrencyINR(pricing.total_inr)}
                  </span>
                </div>
                {calculating && (
                  <span className="text-xs text-tertiary animate-pulse">Calculating...</span>
                )}
              </div>

              <button
                onClick={() => navigate('/booking/theme')}
                className="w-full py-4 rounded-full bg-primary text-on-primary font-bold text-sm shadow-md hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <span>Proceed to Step 2: Customizer</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
