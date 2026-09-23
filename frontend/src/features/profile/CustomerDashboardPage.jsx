import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { formatCurrencyINR } from '../../utils/formatters';

export default function CustomerDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBookings() {
      try {
        const data = await api.getMyBookings();
        setBookings(data);
      } catch (err) {
        console.warn('Booking load note:', err);
      } finally {
        setLoading(false);
      }
    }
    loadBookings();
  }, []);

  const upcoming = bookings.filter(b => b.status === 'confirmed' || b.status === 'in_progress');
  const past = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled' || b.status === 'pending_payment');

  return (
    <div className="w-full pt-20 pb-24 bg-background min-h-screen">
      <div className="max-w-[1200px] mx-auto px-gutter-desktop py-space-lg w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          
          {/* Left Sidebar Profile & Navigation */}
          <aside className="lg:col-span-4 flex flex-col gap-space-md sticky top-24">
            
            {/* User Profile Card */}
            <div className="bg-surface-container-lowest rounded-3xl p-space-lg shadow-sm border border-outline-variant/30 flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-r from-primary-fixed to-secondary-container opacity-60"></div>
              
              <div className="relative mt-2 mb-space-sm">
                <div className="w-20 h-20 rounded-full bg-surface-container-high overflow-hidden shadow-md border-2 border-white">
                  <img
                    className="w-full h-full object-cover"
                    alt={user?.name || "Sophia Vance"}
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDHZOy-EoUSqrKfOKkGoggsC2HYa_ZHN2DmQexftKR4dQn-nrkMT3E1Iez-f05GR6Vw-K5kQitIuQL5oIu64bU3LiVSldPT8M5gZ_FhENNXf43HlfDRPoN6nFeSN_0jzoT0G9AvTo1BZJM5kTU4QZdqSfodRTDPhsZFTOIqbF3Pq_gPYb4bQy_Hcwrp_HShh0caE2O6VVl2E4f79QOnXX4c2iFtHtrzKjljvj2bYNOVQkGGTomLc12E"
                  />
                </div>
                <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-secondary text-on-secondary flex items-center justify-center text-[12px] shadow-sm">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                </span>
              </div>

              <h2 className="font-bold text-lg text-on-surface">{user?.name || 'Sophia Vance'}</h2>
              <p className="text-xs text-tertiary mt-0.5">{user?.email || 'sophia@example.com'}</p>
              
              <div className="mt-space-sm inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low text-tertiary text-xs font-semibold">
                <span className="material-symbols-outlined text-[14px] text-primary">award_star</span>
                <span>Artisanal Patron since 2023</span>
              </div>
            </div>

            {/* Sidebar Navigation Tabs */}
            <nav className="bg-surface-container-lowest rounded-3xl p-2 shadow-sm border border-outline-variant/30 flex flex-col gap-1">
              <button
                onClick={() => setActiveTab('bookings')}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all text-left ${
                  activeTab === 'bookings'
                    ? 'bg-surface-container text-on-surface'
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-primary text-[20px]">local_shipping</span>
                  <span>Journeys & Bookings</span>
                </div>
                {upcoming.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-primary text-on-primary text-[10px] font-bold">
                    {upcoming.length} Active
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('themes')}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all text-left ${
                  activeTab === 'themes'
                    ? 'bg-surface-container text-on-surface'
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-secondary text-[20px]">palette</span>
                  <span>Saved Themes</span>
                </div>
                <span className="text-xs text-tertiary">2 Saved</span>
              </button>

              <button
                onClick={() => setActiveTab('billing')}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all text-left ${
                  activeTab === 'billing'
                    ? 'bg-surface-container text-on-surface'
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-tertiary text-[20px]">credit_card</span>
                  <span>Payment & Billing</span>
                </div>
              </button>
            </nav>

            {/* Live Caravan Beacon Banner */}
            <div className="bg-secondary text-on-secondary rounded-3xl p-5 shadow-sm flex flex-col gap-2 relative overflow-hidden">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-fixed opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-surface-container-lowest"></span>
                </span>
                <span className="text-[11px] uppercase tracking-wider font-bold text-secondary-fixed">Caravan Beacon Active</span>
              </div>
              <p className="text-base font-bold text-on-secondary">1971 Teal Split-Screen Van #04</p>
              <p className="text-xs text-secondary-fixed opacity-90">Prepping single-origin espresso at Marine Drive.</p>
              
              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-on-secondary opacity-80">Serving until 6:30 PM</span>
                <Link
                  to="/ride/booking-demo-01/track"
                  className="text-xs font-bold text-secondary-fixed hover:underline flex items-center gap-1"
                >
                  <span>Live Map</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </div>
            </div>

          </aside>

          {/* Main Workspace */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Welcome Header & Quick Stats */}
            <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-sm border border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest">
                  <span>Artisan Host Profile</span>
                  <span className="w-1 h-1 rounded-full bg-tertiary"></span>
                  <span className="text-tertiary font-normal">Mumbai Coastal Hub</span>
                </div>
                <h1 className="text-2xl font-extrabold text-on-surface mt-1">Welcome back, {user?.name?.split(' ')[0] || 'Sophia'}</h1>
                <p className="text-xs text-on-surface-variant mt-0.5">Your bespoke vintage caravan reservations and mobile espresso curation.</p>
              </div>

              {/* Quick Stats Pill */}
              <div className="flex items-center gap-2 bg-surface-container-low p-2 rounded-2xl border border-outline-variant/20 self-start md:self-auto">
                <div className="px-3 py-1 text-center">
                  <span className="block text-lg font-bold text-primary">{bookings.length}</span>
                  <span className="text-[10px] text-tertiary uppercase font-bold">Journeys</span>
                </div>
                <div className="w-[1px] h-6 bg-outline-variant/40"></div>
                <div className="px-3 py-1 text-center">
                  <span className="block text-lg font-bold text-secondary">2</span>
                  <span className="text-[10px] text-tertiary uppercase font-bold">Saved</span>
                </div>
              </div>
            </div>

            {/* TAB: Bookings */}
            {activeTab === 'bookings' && (
              <div className="space-y-6">
                
                {/* Active / Upcoming Bookings */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg text-on-surface">Active & Upcoming Journeys</h3>
                    <Link to="/booking/route" className="text-xs font-bold text-primary hover:underline">
                      + Book New Experience
                    </Link>
                  </div>

                  {upcoming.length === 0 ? (
                    <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/30 text-center space-y-3">
                      <p className="text-xs text-on-surface-variant">No active journeys right now. Ready for an artisanal drive?</p>
                      <Link to="/explore" className="inline-block py-2.5 px-6 rounded-full bg-primary text-on-primary text-xs font-bold">
                        Browse Themes
                      </Link>
                    </div>
                  ) : (
                    upcoming.map((b) => (
                      <div
                        key={b.id || b._id}
                        className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/30 shadow-sm space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-outline-variant/20">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-secondary text-[11px] font-bold uppercase">
                                {b.status}
                              </span>
                              <span className="text-xs text-tertiary font-mono">Ref: {b.id || b._id}</span>
                            </div>
                            <h4 className="font-bold text-lg text-on-surface mt-1">{b.theme_name}</h4>
                          </div>
                          <div className="text-right">
                            <span className="text-xl font-extrabold text-primary block">
                              {formatCurrencyINR(b.pricing?.total_inr)}
                            </span>
                            <span className="text-[11px] text-tertiary">{b.scheduled_date} • {b.scheduled_time_slot}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-[10px] font-bold text-tertiary uppercase">Vehicle Model</span>
                            <p className="font-bold text-on-surface">{b.vehicle_name || 'Artisan Van 04 — Teal Split-Screen'}</p>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-tertiary uppercase">Staging Signboard</span>
                            <p className="font-serif italic font-bold text-on-surface">"{b.chalkboard_text || 'Bespoke Experience'}"</p>
                          </div>
                        </div>

                        <div className="pt-2 flex flex-wrap gap-2">
                          <Link
                            to={`/ride/${b.id || b._id}/track`}
                            className="py-2.5 px-5 rounded-full bg-primary text-on-primary text-xs font-bold shadow-xs hover:brightness-105 transition-all flex items-center gap-1.5"
                          >
                            <span className="material-symbols-outlined text-[16px]">near_me</span>
                            <span>Open Live GPS Tracking</span>
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Past Journeys History */}
                {past.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-base text-on-surface">Past Completed Journeys</h3>
                    <div className="space-y-3">
                      {past.map(b => (
                        <div key={b.id || b._id} className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 flex items-center justify-between text-xs">
                          <div>
                            <p className="font-bold text-on-surface">{b.theme_name}</p>
                            <p className="text-tertiary">{b.scheduled_date} • {b.status}</p>
                          </div>
                          <span className="font-bold text-on-surface">{formatCurrencyINR(b.pricing?.total_inr)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* TAB: Saved Themes */}
            {activeTab === 'themes' && (
              <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-sm space-y-4">
                <h3 className="font-bold text-lg text-on-surface">Your Saved Themes</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-surface-container-low space-y-2 border border-outline-variant/20">
                    <h4 className="font-bold text-sm text-on-surface">Proposal & Sunset Romance</h4>
                    <p className="text-xs text-on-surface-variant">Fairy lights, acoustic vinyl sound, chilled flutes.</p>
                    <Link to="/theme/theme-romance" className="text-xs font-bold text-primary hover:underline block pt-1">
                      View Experience →
                    </Link>
                  </div>
                  <div className="p-4 rounded-2xl bg-surface-container-low space-y-2 border border-outline-variant/20">
                    <h4 className="font-bold text-sm text-on-surface">Golden Hour Birthday</h4>
                    <p className="text-xs text-on-surface-variant">Matcha bar, bunting, polaroid photo nook.</p>
                    <Link to="/theme/theme-birthday" className="text-xs font-bold text-primary hover:underline block pt-1">
                      View Experience →
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Billing */}
            {activeTab === 'billing' && (
              <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-sm space-y-4">
                <h3 className="font-bold text-lg text-on-surface">Payment Methods & Invoices</h3>
                <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[24px] text-secondary">credit_card</span>
                    <div>
                      <p className="font-bold text-on-surface">HDFC Bank Visa Signature •••• 4242</p>
                      <p className="text-[11px] text-tertiary">Default Payment Method</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-secondary/15 text-secondary text-[10px] font-bold">Verified</span>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
