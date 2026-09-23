import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { formatCurrencyINR } from '../../utils/formatters';
import ActiveBeaconPill from '../../components/ActiveBeaconPill';
import AIRecommendationBanner from '../../components/AIRecommendationBanner';
import { useBooking } from '../../context/BookingContext';

export default function HomePage() {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { setTheme } = useBooking();

  useEffect(() => {
    async function loadData() {
      try {
        const data = await api.getThemes();
        setThemes(data);
      } catch (err) {
        console.error('Failed to load themes:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="w-full pt-20 bg-background flex flex-col">
      {/* Live Beacon */}
      <ActiveBeaconPill />

      {/* AI Recommendation Widget */}
      <AIRecommendationBanner />

      {/* Editorial Hero Section */}
      <section className="max-w-[1200px] mx-auto px-gutter-desktop w-full py-space-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-6 flex flex-col items-start gap-space-md">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-fixed-variant text-xs font-bold uppercase tracking-widest">
              <span className="material-symbols-outlined text-[14px]">local_cafe</span>
              <span>Curated Caravan Experiences</span>
            </div>

            <h1 className="font-extrabold text-4xl sm:text-5xl lg:text-6xl text-on-surface leading-[1.1] tracking-tight">
              Your Café, <br />
              <span className="text-primary italic font-serif font-normal">Your Way,</span> <br />
              On the Move.
            </h1>

            <p className="text-base sm:text-lg text-on-surface-variant max-w-xl leading-relaxed">
              A bespoke artisanal mobile café van delivered to your doorstep, scenic clifftop lookout, or private coastal celebration. Handcrafted single-origin espresso, curated vintage styling, and tailored celebration moments.
            </p>

            <div className="flex flex-wrap items-center gap-space-md pt-space-xs w-full sm:w-auto">
              <Link
                to="/booking/route"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-primary text-on-primary font-bold text-sm shadow-md hover:brightness-110 hover:shadow-lg transition-all active:scale-[0.98]"
              >
                <span>Book Your Experience</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
              <Link
                to="/explore"
                className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-surface-container-low text-on-surface font-bold text-sm hover:bg-surface-container-high transition-all border border-outline-variant/30"
              >
                Explore Themes
              </Link>
            </div>

            {/* Metric Strip */}
            <div className="grid grid-cols-3 gap-space-md pt-space-md w-full border-t border-outline-variant/30">
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">100%</div>
                <div className="text-xs text-on-surface-variant mt-0.5">Organic Single-Origin</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">0dB</div>
                <div className="text-xs text-on-surface-variant mt-0.5">Silent Eco Lithium Bar</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-secondary tracking-tight">4.98★</div>
                <div className="text-xs text-on-surface-variant mt-0.5">1,240+ Private Events</div>
              </div>
            </div>
          </div>

          {/* Right Hero Visual Mosaic */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-surface-container aspect-[4/3] group border border-outline-variant/30">
              <img
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                alt="A vintage coffee caravan parked at sunset with warm festoon lights and cedar counter"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDKZRPX0oFFQrB4LkYTwB18pZDgfcTdQW_PD5D44LVDaV8BvJTQRp8z9YVch_Eg01CbMZMP48VfGOMUrG1c646Zq9VNniXNVkFNF_D2VDauYjwPxYL4DEa8WAZWxL3srGPYcgkLjm5ebFClR4Iz01RMttSnPsfBU8VN6Va9DquUYyUkngiV4mHeS15k30CPnr4mfLssDM9k9G5uew0q7Pm5lkwKDwhkYA_wkfxsjNK6aKBxc3EPJbmj"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-transparent to-transparent"></div>
              
              <div className="absolute bottom-0 left-0 right-0 p-space-lg flex items-end justify-between">
                <div className="text-inverse-on-surface">
                  <span className="text-[11px] uppercase tracking-widest font-bold text-secondary-fixed">
                    Caravan Edition No. 04
                  </span>
                  <h3 className="text-xl font-bold text-surface-container-lowest">
                    The Vintage Coastrunner
                  </h3>
                  <p className="text-xs opacity-90 text-surface-container-high">
                    Twin-group La Marzocco • Organic oat milks • Full acoustic sound package
                  </p>
                </div>
                <div className="bg-surface/90 backdrop-blur-md rounded-full px-3.5 py-1.5 flex items-center gap-1.5 shadow-md shrink-0">
                  <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                  <span className="text-xs font-bold text-on-surface">Inspected & Ready</span>
                </div>
              </div>
            </div>

            {/* Floating Testimonial Pill Badge */}
            <div className="absolute -bottom-6 -left-4 sm:left-6 bg-surface-container-lowest p-3.5 rounded-2xl shadow-xl border border-outline-variant/30 max-w-[280px] hidden sm:flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-on-secondary shrink-0 font-bold text-sm">
                EV
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-on-surface truncate">"Stole the entire celebration."</p>
                <p className="text-[11px] text-on-surface-variant truncate">Eleni & Marcus • Marine Drive</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Value Propositions Banner */}
      <section className="max-w-[1200px] mx-auto px-gutter-desktop w-full py-space-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
          
          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs flex flex-col gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[26px]">pin_drop</span>
            </div>
            <h3 className="font-bold text-lg text-on-surface">Direct Doorstep or Scenic Perch</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              We roll up to your private driveway, cliffside lookout, or corporate courtyard with zero footprint. First 10 km included in every package.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs flex flex-col gap-3">
            <div className="w-12 h-12 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-[26px]">coffee_maker</span>
            </div>
            <h3 className="font-bold text-lg text-on-surface">Master Barista & Custom Menu</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Two certified baristas pulling single-origin espresso, pouring ceremonial matcha, and serving warm flaky sourdough pastries fresh on site.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs flex flex-col gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[26px]">auto_awesome</span>
            </div>
            <h3 className="font-bold text-lg text-on-surface">Bespoke Atmospheric Styling</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Warm Edison bulb strings, acoustic vinyl sound, fresh floral posies, and personalized wooden chalkboard calligraphy tailored to your milestone.
            </p>
          </div>

        </div>
      </section>

      {/* Signature Themes Showcase */}
      <section className="max-w-[1200px] mx-auto px-gutter-desktop w-full py-space-xl" id="themes-grid">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-secondary uppercase tracking-widest mb-1">
              <span>Signature Experiences</span>
            </div>
            <h2 className="text-3xl font-extrabold text-on-surface tracking-tight">
              Curated Mobile Café Themes
            </h2>
          </div>
          <Link
            to="/explore"
            className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline"
          >
            <span>View All 4 Themes</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {themes.map((theme) => (
            <div
              key={theme.id || theme._id}
              className="bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/30 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="relative w-full h-44 overflow-hidden bg-surface-container">
                  <img
                    src={theme.hero_images?.[0] || 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb'}
                    alt={theme.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2.5 py-1 rounded-full bg-primary text-on-primary text-xs font-bold shadow-xs flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">auto_awesome</span>
                      {theme.mood_tags?.[0] || 'Curated'}
                    </span>
                  </div>
                  <div className="absolute bottom-2.5 right-2.5">
                    <span className="px-2 py-0.5 rounded bg-surface/90 backdrop-blur-md text-on-surface font-bold text-xs">
                      {formatCurrencyINR(theme.base_price_inr)}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-base text-on-surface group-hover:text-primary transition-colors">
                    {theme.name}
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">
                    {theme.tagline || theme.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {theme.mood_tags?.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface text-[10px] font-semibold">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0 flex items-center gap-2">
                <Link
                  to={`/theme/${theme.id || theme._id}`}
                  className="flex-1 py-2 rounded-full bg-surface-container-high hover:bg-surface-variant text-on-surface font-bold text-xs text-center transition-all"
                >
                  360° Preview
                </Link>
                <Link
                  to="/booking/route"
                  onClick={() => setTheme(theme)}
                  className="py-2 px-4 rounded-full bg-primary hover:brightness-105 text-on-primary font-bold text-xs text-center transition-all"
                >
                  Select
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
