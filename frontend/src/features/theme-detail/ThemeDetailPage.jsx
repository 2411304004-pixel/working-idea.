import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { formatCurrencyINR } from '../../utils/formatters';
import Viewer360 from '../../components/Viewer360';
import { useBooking } from '../../context/BookingContext';

export default function ThemeDetailPage() {
  const { themeId } = useParams();
  const [theme, setLocalTheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const { setTheme, toggleAddOn, selectedAddOns } = useBooking();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadTheme() {
      try {
        const data = await api.getThemeById(themeId);
        setLocalTheme(data);
        setTheme(data);
      } catch (err) {
        console.error('Failed to load theme detail:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTheme();
  }, [themeId]);

  if (loading) {
    return (
      <div className="w-full pt-32 pb-24 flex items-center justify-center text-sm font-semibold text-tertiary">
        <span className="material-symbols-outlined text-primary text-[28px] animate-spin mr-2">progress_activity</span>
        Curating theme experience...
      </div>
    );
  }

  if (!theme) {
    return (
      <div className="w-full pt-32 pb-24 text-center">
        <h2 className="text-xl font-bold text-on-surface">Theme not found</h2>
        <Link to="/explore" className="text-primary text-sm font-bold mt-2 inline-block hover:underline">
          Return to Explore Themes
        </Link>
      </div>
    );
  }

  const isAddonSelected = (addonName) => selectedAddOns.some(a => a.name === addonName);

  return (
    <div className="w-full pt-20 pb-24 bg-surface min-h-screen">
      
      {/* Active Theme Bar / Selected Experience Banner */}
      <section className="w-full bg-surface-container-low px-gutter-desktop py-space-md shadow-sm border-b border-outline-variant/30">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-md">
            <div className="w-12 h-12 rounded-2xl bg-secondary/15 flex items-center justify-center text-secondary shrink-0">
              <span className="material-symbols-outlined text-[24px]">palette</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-secondary animate-pulse"></span>
                <span className="text-[11px] font-bold text-secondary uppercase tracking-wider">Curated Experience Active</span>
              </div>
              <p className="font-bold text-lg text-on-surface tracking-tight">{theme.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-space-md w-full md:w-auto justify-end">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs text-on-surface-variant font-medium">Includes first 10 km + 2 baristas</span>
              <span className="text-base font-bold text-primary">{formatCurrencyINR(theme.base_price_inr)} / complete ride</span>
            </div>
            <Link
              to="/booking/route"
              onClick={() => setTheme(theme)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary text-on-primary text-sm font-bold shadow-md hover:brightness-105 transition-all"
            >
              <span>Next: Plan Route & Stops</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto px-gutter-desktop py-8">
        
        {/* Interactive 360° Panorama Viewer */}
        <section className="mb-10">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-secondary">Atmosphere & Staging</span>
              <h2 className="text-2xl font-bold text-on-surface">Step Inside The Caravan</h2>
            </div>
            <div className="flex items-center gap-1 text-xs text-secondary font-bold bg-secondary-container/40 px-3 py-1 rounded-full">
              <span className="material-symbols-outlined text-[16px]">visibility</span>
              <span>Drag to Pan 360°</span>
            </div>
          </div>
          
          <Viewer360 imageUrl={theme.tour_360_url || theme.hero_images?.[0]} />
        </section>

        {/* 2-Column Content Details & Add-Ons */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Description, Staging Items & Gallery */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-on-surface">Experience Concept & Atmosphere</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {theme.description}
              </p>

              <div className="pt-2">
                <h4 className="text-xs font-bold text-tertiary uppercase tracking-wider mb-2.5">
                  Included Staging & Staging Hardware:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {theme.staging_features?.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-container-low text-xs text-on-surface font-semibold">
                      <span className="material-symbols-outlined text-[18px] text-secondary">check_circle</span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Gallery Grid */}
            <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-sm">
              <h3 className="text-lg font-bold text-on-surface mb-4">Atmosphere Gallery</h3>
              <div className="grid grid-cols-2 gap-3">
                {theme.hero_images?.map((img, idx) => (
                  <div key={idx} className="h-44 rounded-2xl overflow-hidden bg-surface-container">
                    <img src={img} alt="Theme gallery shot" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Theme Add-Ons & Booking Summary Box */}
          <div className="lg:col-span-5 space-y-6 sticky top-24">
            <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-sm space-y-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Custom Add-Ons</span>
                <h3 className="text-xl font-bold text-on-surface mt-0.5">Elevate Your Moments</h3>
                <p className="text-xs text-on-surface-variant mt-1">Select personalized touches for the van styling</p>
              </div>

              <div className="space-y-3">
                {theme.add_ons?.map((addon) => {
                  const selected = isAddonSelected(addon.name);
                  return (
                    <div
                      key={addon.id}
                      onClick={() => toggleAddOn(addon)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                        selected
                          ? 'bg-primary/5 border-primary shadow-xs'
                          : 'bg-surface-container-low/60 border-outline-variant/30 hover:bg-surface-container-low'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                            selected ? 'bg-primary border-primary text-white font-bold' : 'border-outline text-transparent'
                          }`}>
                            ✓
                          </span>
                          <p className="text-sm font-bold text-on-surface truncate">{addon.name}</p>
                        </div>
                        <p className="text-xs text-on-surface-variant mt-1 pl-5 leading-relaxed">{addon.description}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-primary">
                          {addon.price_inr === 0 ? 'Complimentary' : `+${formatCurrencyINR(addon.price_inr)}`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pricing Box */}
              <div className="pt-4 border-t border-outline-variant/30 space-y-2 text-xs">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Theme Base (Includes 10 km)</span>
                  <span className="font-bold text-on-surface">{formatCurrencyINR(theme.base_price_inr)}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Per km rate beyond 10 km</span>
                  <span className="font-bold text-secondary">₹8.00 / km</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Selected Add-Ons</span>
                  <span className="font-bold text-on-surface">
                    {formatCurrencyINR(selectedAddOns.reduce((sum, a) => sum + a.price_inr, 0))}
                  </span>
                </div>
              </div>

              <button
                onClick={() => { setTheme(theme); navigate('/booking/route'); }}
                className="w-full py-4 rounded-full bg-primary text-on-primary font-bold text-sm shadow-md hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <span>Continue With This Theme</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
