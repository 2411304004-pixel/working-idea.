import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { formatCurrencyINR } from '../../utils/formatters';
import { useBooking } from '../../context/BookingContext';

export default function ExplorePage() {
  const [themes, setThemes] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const { setTheme } = useBooking();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchThemes() {
      try {
        const data = await api.getThemes();
        setThemes(data);
      } catch (err) {
        console.error('Failed to fetch themes:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchThemes();
  }, []);

  const filteredThemes = themes.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'romance') return t.mood_tags?.some(m => m.toLowerCase().includes('romance') || m.toLowerCase().includes('proposal'));
    if (filter === 'celebrations') return t.mood_tags?.some(m => m.toLowerCase().includes('celebration') || m.toLowerCase().includes('party'));
    if (filter === 'corporate') return t.mood_tags?.some(m => m.toLowerCase().includes('executive') || m.toLowerCase().includes('work'));
    if (filter === 'casual') return t.mood_tags?.some(m => m.toLowerCase().includes('comfort') || m.toLowerCase().includes('scenic'));
    return true;
  });

  const steps = [
    {
      step: 1,
      title: "Choose Caravan Theme",
      desc: "From fairy-lit sunset romance to high-energy birthday brunch setups.",
      icon: "palette",
      iconColor: "text-primary"
    },
    {
      step: 2,
      title: "Plan Route & Scenic Stops",
      desc: "Pick the coastal perch, tranquil park, private driveway, or vineyard.",
      icon: "pin_drop",
      iconColor: "text-secondary"
    },
    {
      step: 3,
      title: "Curate Artisanal Menu",
      desc: "Handcraft specialty single-origin blends, matcha lattes, and fresh patisserie boards.",
      icon: "local_cafe",
      iconColor: "text-primary"
    },
    {
      step: 4,
      title: "Van Arrives & Serves",
      desc: "Fully quiet self-powered setup, warm wooden counter & master barista team.",
      icon: "celebration",
      iconColor: "text-secondary"
    }
  ];

  const handleSelectTheme = (selected) => {
    setTheme(selected);
    navigate('/booking/route');
  };

  return (
    <div className="w-full pt-20 pb-24 bg-surface min-h-screen">
      <div className="max-w-[1200px] mx-auto px-gutter-desktop">
        
        {/* Hero Section with Live Availability Pill */}
        <section className="py-6">
          <div className="relative w-full rounded-3xl overflow-hidden shadow-xl bg-surface-container-highest border border-outline-variant/30 h-[380px] sm:h-[440px]">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuArPxgjzsCoUtTykIDI22m6X8PAMOpLTTUr8yTcJzWakn9Q2bIOYcMJhAQkBTY5u2BbX3lDcDMvFm4wo_2TX54eeC0AwF5s1N4fXHW5f-U7k92qxzydoPwZrETUiQWQxjfXesnDwRyIkwsYgdmqOow8e8u46IxFNxnOJJqj4z6NT9q3-7Qx0c0A02Er2Qk6dDteRrhsP_SIpH-h1T_V1kQ-NY86Mgus84tIGXeCoLi362LosaG-PBsj"
              alt="Vintage coffee van serving guests at sunset"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-on-surface/90 via-on-surface/40 to-transparent"></div>

            {/* Live Availability Pill */}
            <div className="absolute top-4 left-4 z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface/90 backdrop-blur-md shadow-sm border border-outline-variant/30">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary"></span>
                </span>
                <span className="text-xs font-bold text-on-surface">Next available slot: Today, 4:30 PM</span>
              </div>
            </div>

            {/* Hero Overlay Content */}
            <div className="absolute bottom-0 inset-x-0 p-6 sm:p-8 flex flex-col items-start gap-3 text-surface-container-lowest">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/90 backdrop-blur-sm text-on-primary text-xs font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-[14px]">local_cafe</span>
                <span>On-Demand Artisanal Caravan</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-surface-container-lowest tracking-tight leading-tight">
                Your Private Café.<br />Anywhere You Dream.
              </h1>
              
              <p className="text-sm sm:text-base text-surface-container-high max-w-lg leading-relaxed">
                Bespoke vintage barista caravan delivered to your doorstep, scenic lookout point, or private seaside celebration. First 10 km included in every experience.
              </p>

              <Link
                to="/booking/route"
                className="mt-2 inline-flex items-center gap-2 py-3 px-6 rounded-full bg-primary text-on-primary text-sm font-bold shadow-lg hover:brightness-110 active:scale-95 transition-all"
              >
                <span>Start Building Your Journey</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Interactive 4-Step Journey Preview */}
        <section className="py-6">
          <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-sm border border-outline-variant/30">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                  Simple 4-Step Magic
                </span>
                <h2 className="text-2xl font-bold text-on-surface">How Your Caravan Arrives</h2>
              </div>
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary-container text-on-secondary-fixed">
                <span className="material-symbols-outlined text-[18px]">electric_bolt</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {steps.map((s, idx) => (
                <div
                  key={s.step}
                  onClick={() => setActiveStep(idx)}
                  className={`p-4 rounded-2xl transition-all cursor-pointer border ${
                    activeStep === idx
                      ? 'bg-surface-container-low border-primary ring-1 ring-primary/40 shadow-sm'
                      : 'bg-surface-container-low/50 border-outline-variant/20 hover:bg-surface-container-low'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-full ${activeStep === idx ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface'} flex items-center justify-center text-xs font-bold shrink-0 mt-0.5`}>
                      {s.step}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-on-surface truncate">{s.title}</p>
                        <span className={`material-symbols-outlined text-[18px] ${s.iconColor}`}>{s.icon}</span>
                      </div>
                      <p className="text-xs text-tertiary mt-1 leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Filter Controls */}
        <section className="py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Signature Experiences
              </span>
              <h2 className="text-2xl font-bold text-on-surface">Curated Themes & Staging</h2>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {[
                { id: 'all', label: 'All Themes (4)' },
                { id: 'romance', label: 'Romance & Proposals' },
                { id: 'celebrations', label: 'Birthdays & Festive' },
                { id: 'corporate', label: 'Corporate & Retreat' },
                { id: 'casual', label: 'Comfort & Sunset' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
                    filter === tab.id
                      ? 'bg-on-surface text-surface shadow-sm'
                      : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high border border-outline-variant/30'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filtered Themes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredThemes.map(t => (
              <div
                key={t.id || t._id}
                className="bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/30 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative w-full h-48 bg-surface-container overflow-hidden">
                    <img
                      src={t.hero_images?.[0] || 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb'}
                      alt={t.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2.5 py-1 rounded-full bg-primary text-on-primary text-xs font-bold shadow-xs flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">favorite</span>
                        {t.mood_tags?.[0] || 'Curated'}
                      </span>
                    </div>
                    <div className="absolute bottom-2.5 right-2.5">
                      <span className="px-2 py-0.5 rounded bg-surface/90 backdrop-blur-md text-on-surface font-bold text-xs">
                        From {formatCurrencyINR(t.base_price_inr)}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-base text-on-surface">{t.name}</h3>
                    <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">
                      {t.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {t.staging_features?.slice(0, 3).map((feat, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface text-[10px] font-semibold">
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 flex items-center gap-2">
                  <Link
                    to={`/theme/${t.id || t._id}`}
                    className="flex-1 py-2 rounded-full bg-surface-container-high hover:bg-surface-variant text-on-surface font-bold text-xs text-center transition-all"
                  >
                    360° View
                  </Link>
                  <button
                    onClick={() => handleSelectTheme(t)}
                    className="flex-1 py-2 rounded-full bg-primary text-on-primary hover:brightness-105 font-bold text-xs text-center transition-all flex items-center justify-center gap-1 shadow-xs"
                  >
                    <span>Select</span>
                    <span className="material-symbols-outlined text-[14px]">check</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
