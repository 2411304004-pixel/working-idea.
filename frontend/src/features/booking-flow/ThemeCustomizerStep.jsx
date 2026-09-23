import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';
import { formatCurrencyINR } from '../../utils/formatters';

export default function ThemeCustomizerStep() {
  const {
    theme,
    chalkboardText,
    setChalkboardText,
    lightingChoice,
    setLightingChoice,
    playlistChoice,
    setPlaylistChoice,
    selectedAddOns,
    toggleAddOn,
    pricing
  } = useBooking();
  const navigate = useNavigate();

  const [activeOccasion, setActiveOccasion] = useState('proposal');

  const occasions = [
    { id: 'anniversary', name: 'Anniversary', icon: 'celebration' },
    { id: 'proposal', name: 'Proposal', icon: 'favorite' },
    { id: 'birthday', name: 'Birthday', icon: 'cake' },
    { id: 'gathering', name: 'Casual Gathering', icon: 'groups' },
    { id: 'corporate', name: 'Corporate Perk', icon: 'business_center' }
  ];

  const lightingOptions = [
    {
      id: 'edison',
      name: 'Warm Edison Bistro Stringers',
      desc: 'Ambient 2200K filament globes hung across the vintage cedar awning'
    },
    {
      id: 'fairy',
      name: 'Delicate Micro-Fairy Lights',
      desc: 'Woven golden canopy of twinkling fairy wire around the service window'
    },
    {
      id: 'lanterns',
      name: 'Brass Moroccan Candle Lanterns',
      desc: 'Ground-level flickering warm lanterns for twilight coastal staging'
    }
  ];

  const playlistOptions = [
    { id: 'acoustic', name: 'Acoustic Guitar & Sunset Folk', vibe: 'Intimate, warm, organic' },
    { id: 'jazz', name: 'Golden Hour Vinyl Jazz', vibe: 'Smooth saxophone & double bass' },
    { id: 'lofi', name: 'Artisanal Cafe Chill Lo-Fi', vibe: 'Relaxing modern beats' },
    { id: 'bossa', name: 'Coastal Bossa Nova', vibe: 'Breezy seaside rhythm' }
  ];

  return (
    <div className="w-full pt-20 pb-24 bg-surface min-h-screen">
      <div className="max-w-[1200px] mx-auto px-gutter-desktop">
        
        {/* Progress Header */}
        <div className="py-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-on-primary text-xs font-bold">2</span>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Step 2 of 5: Atmosphere & Styling</span>
            </div>
            <span className="text-xs text-tertiary">Next: Menu Pre-Order</span>
          </div>

          <div className="w-full bg-surface-container-high rounded-full h-1.5 overflow-hidden">
            <div className="bg-primary h-1.5 rounded-full transition-all duration-500" style={{ width: '40%' }}></div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div>
              <h1 className="text-3xl font-extrabold text-on-surface">Atmosphere & Styling</h1>
              <p className="text-sm text-on-surface-variant mt-0.5">Custom calligraphy chalkboard, lighting mood, and acoustic melodies.</p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-secondary text-xs font-bold bg-secondary-container/40 px-3 py-1 rounded-full self-start">
              <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
              <span>Bespoke Staging</span>
            </span>
          </div>
        </div>

        {/* Occasion Selector Pills */}
        <div className="pb-6 overflow-x-auto no-scrollbar flex gap-2.5">
          {occasions.map((occ) => (
            <button
              key={occ.id}
              onClick={() => setActiveOccasion(occ.id)}
              className={`shrink-0 px-4 py-2.5 rounded-full shadow-xs flex items-center gap-2 text-xs font-bold transition-all ${
                activeOccasion === occ.id
                  ? 'bg-primary text-on-primary shadow-md'
                  : 'bg-surface-container-lowest text-on-surface border border-outline-variant/30 hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{occ.icon}</span>
              <span>{occ.name}</span>
            </button>
          ))}
        </div>

        {/* 2-Column Customizer Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-7 space-y-6">
            
            {/* Live Visual Preview Card with Signboard Marquee */}
            <div className="relative w-full rounded-3xl overflow-hidden bg-surface-container-lowest border border-outline-variant/30 shadow-md">
              <div className="relative w-full h-60 bg-surface-container overflow-hidden">
                <img
                  src={theme?.hero_images?.[0] || 'https://lh3.googleusercontent.com/aida-public/AB6AXuANKJQPSNiIZYnJonQooGn0nlDSsLPcFSa4HsF1H0bt2IpwP74pAF55decZ2YISZ1zrZKzBPfqyhWnoZ7x4J0281J2BM839KaetQW3KJdiL0jFR2A-hfLtmdmhVudM5WeXxF1eV6ahGMYx4KD5BbJWdA2iSunxwS8DaCRa0ERQc7NhOAPrAeJI4_h2Qir8zFKhyeHt8nw-JNvM9DM5lkK-pqmDNjL2zsTNrQke5Zl2C0xOI-r0CKKpL'}
                  alt="Caravan visual mock"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent"></div>

                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-bright/90 backdrop-blur-md shadow-xs text-xs font-bold text-on-surface uppercase tracking-wide">
                  <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                  <span>Live Staging Mock</span>
                </div>

                {/* Custom Chalkboard Over Van Visual */}
                <div className="absolute bottom-3 left-3 right-3 bg-surface-bright/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl flex items-center justify-between border border-outline-variant/30">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="material-symbols-outlined text-primary text-[24px] shrink-0">edit_note</span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">
                        Reclaimed Cedar Chalkboard Script
                      </span>
                      <p className="text-base font-serif italic text-on-surface truncate font-bold">
                        "{chalkboardText || 'Curated Coffee Journey'}"
                      </p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-secondary text-[22px] shrink-0">verified</span>
                </div>
              </div>

              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">wb_twilight</span>
                  <span className="font-bold text-sm text-on-surface">{theme?.name || 'Proposal & Sunset Romance'}</span>
                </div>
                <span className="text-xs text-secondary font-bold px-2.5 py-0.5 rounded-full bg-secondary/10">
                  Included in Base Ride
                </span>
              </div>
            </div>

            {/* Live Signage Input */}
            <div className="p-6 rounded-3xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-bold text-on-surface" htmlFor="marquee-input">
                  <span className="material-symbols-outlined text-primary text-[20px]">signpost</span>
                  <span>Wooden Counter Board Calligraphy</span>
                </label>
                <span className="text-xs text-on-surface-variant font-mono">{chalkboardText.length}/40</span>
              </div>
              <input
                id="marquee-input"
                type="text"
                maxLength={40}
                value={chalkboardText}
                onChange={(e) => setChalkboardText(e.target.value)}
                placeholder="e.g. Sarah & Mark's Forever Brew ☕"
                className="w-full bg-surface-container-low text-on-surface text-sm font-medium rounded-xl p-3.5 border border-outline-variant/30 focus:outline-none focus:border-primary transition-all"
              />
              <p className="text-xs text-on-surface-variant">
                Handwritten with white chalk calligraphy on the caravan’s live-edge cedar serving counter.
              </p>
            </div>

            {/* Lighting Selection */}
            <div className="p-6 rounded-3xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">lightbulb</span>
                <h3 className="font-bold text-base text-on-surface">Ambient Evening Lighting</h3>
              </div>

              <div className="space-y-2.5">
                {lightingOptions.map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => setLightingChoice(opt.name)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      lightingChoice === opt.name
                        ? 'bg-primary/5 border-primary shadow-xs'
                        : 'bg-surface-container-low/50 border-outline-variant/20 hover:bg-surface-container-low'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-bold text-on-surface">{opt.name}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">{opt.desc}</p>
                    </div>
                    <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs ${
                      lightingChoice === opt.name ? 'bg-primary border-primary text-white font-bold' : 'border-outline'
                    }`}>
                      {lightingChoice === opt.name ? '✓' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Playlist Selection */}
            <div className="p-6 rounded-3xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[20px]">music_note</span>
                <h3 className="font-bold text-base text-on-surface">Curated Soundstage</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {playlistOptions.map((pl) => (
                  <button
                    key={pl.id}
                    onClick={() => setPlaylistChoice(pl.name)}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      playlistChoice === pl.name
                        ? 'bg-secondary/10 border-secondary shadow-xs'
                        : 'bg-surface-container-low/50 border-outline-variant/20 hover:bg-surface-container-low'
                    }`}
                  >
                    <p className="text-xs font-bold text-on-surface">{pl.name}</p>
                    <p className="text-[11px] text-tertiary mt-0.5">{pl.vibe}</p>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Right Summary Sidebar */}
          <div className="lg:col-span-5 space-y-6 sticky top-24">
            <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-sm space-y-5">
              <h3 className="font-bold text-lg text-on-surface">Customization Summary</h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-surface-container-low space-y-1">
                  <span className="text-[10px] uppercase font-bold text-tertiary">Signboard Text</span>
                  <p className="font-serif italic font-bold text-on-surface">"{chalkboardText}"</p>
                </div>
                <div className="p-3 rounded-2xl bg-surface-container-low space-y-1">
                  <span className="text-[10px] uppercase font-bold text-tertiary">Selected Lighting</span>
                  <p className="font-bold text-on-surface">{lightingChoice}</p>
                </div>
                <div className="p-3 rounded-2xl bg-surface-container-low space-y-1">
                  <span className="text-[10px] uppercase font-bold text-tertiary">Acoustic Audio</span>
                  <p className="font-bold text-on-surface">{playlistChoice}</p>
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
                  onClick={() => navigate('/booking/route')}
                  className="w-1/3 py-3 rounded-full bg-surface-container hover:bg-surface-container-high font-bold text-xs text-on-surface transition-all"
                >
                  ← Back
                </button>
                <button
                  onClick={() => navigate('/booking/menu')}
                  className="w-2/3 py-3 rounded-full bg-primary text-on-primary font-bold text-xs shadow-md hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Step 3: Menu</span>
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
