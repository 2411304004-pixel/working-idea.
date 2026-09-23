import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';
import { api } from '../../api/client';
import { formatCurrencyINR, formatDistanceKm } from '../../utils/formatters';

export default function ReviewStep() {
  const {
    theme,
    pickup,
    destination,
    optionalStop,
    chalkboardText,
    lightingChoice,
    playlistChoice,
    selectedAddOns,
    menuItems,
    vehicle,
    scheduledDate,
    scheduledSlot,
    guestCount,
    setGuestCount,
    specialRequests,
    setSpecialRequests,
    couponCode,
    appliedOffer,
    applyCoupon,
    pricing
  } = useBooking();

  const [inputCode, setInputCode] = useState(couponCode || '');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleApplyPromo = async (e) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    try {
      const offer = await applyCoupon(inputCode.trim().toUpperCase());
      setCouponSuccess(`Promo "${offer.code}" applied! ${offer.title}`);
    } catch (err) {
      setCouponError(err.message || 'Invalid or expired promo code');
    }
  };

  const handleConfirmBooking = async () => {
    setSubmitting(true);
    try {
      const payload = {
        theme_id: theme?.id || theme?._id || 'theme-romance',
        vehicle_id: vehicle?.id || vehicle?._id,
        pickup_location: pickup,
        destination: destination,
        optional_stop: optionalStop,
        selected_add_ons: selectedAddOns,
        menu_items: menuItems,
        guest_count: guestCount,
        scheduled_date: scheduledDate,
        scheduled_time_slot: scheduledSlot,
        special_requests: specialRequests,
        chalkboard_text: chalkboardText,
        coupon_code: appliedOffer ? appliedOffer.code : undefined
      };

      const bookingRes = await api.createBooking(payload);
      // Navigate to checkout with booking ID
      navigate(`/checkout?booking_id=${bookingRes.id}`);
    } catch (err) {
      alert(`Booking creation error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full pt-20 pb-24 bg-surface min-h-screen">
      <div className="max-w-[1200px] mx-auto px-gutter-desktop">
        
        {/* Progress Header */}
        <div className="py-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-on-primary text-xs font-bold">5</span>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Step 5 of 5: Final Review & Confirmation</span>
            </div>
            <span className="text-xs text-secondary font-bold flex items-center gap-1 bg-secondary-container/40 px-2.5 py-0.5 rounded-full">
              Free 24h Reschedules
            </span>
          </div>

          <div className="w-full bg-surface-container-high rounded-full h-1.5 overflow-hidden">
            <div className="bg-primary h-1.5 rounded-full transition-all duration-500" style={{ width: '100%' }}></div>
          </div>

          <div className="mt-4">
            <h1 className="text-3xl font-extrabold text-on-surface">Review Your Journey</h1>
            <p className="text-sm text-on-surface-variant mt-0.5">Check all itinerary details, custom staging hardware, and itemized pricing breakdown.</p>
          </div>
        </div>

        {/* 2-Column Review Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Itinerary Details */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Experience & Vehicle Card */}
            <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-secondary">Experience Selection</span>
                <span className="text-xs font-bold text-primary">{scheduledDate}</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <img
                  src={theme?.hero_images?.[0] || 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb'}
                  alt={theme?.name}
                  className="w-full sm:w-36 h-28 object-cover rounded-2xl"
                />
                <div className="space-y-1 w-full">
                  <h3 className="font-bold text-lg text-on-surface">{theme?.name}</h3>
                  <p className="text-xs text-on-surface-variant">{vehicle?.name || 'Artisan Van 04 — Teal Split-Screen'}</p>
                  <p className="text-xs text-secondary font-semibold">{scheduledSlot}</p>
                </div>
              </div>
            </div>

            {/* Waypoints Card */}
            <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-sm space-y-3">
              <h3 className="font-bold text-base text-on-surface">Route Waypoints ({formatDistanceKm(pricing.actual_distance_km)})</h3>
              
              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-secondary text-on-secondary text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">A</span>
                  <div>
                    <span className="font-bold text-on-surface block">Pickup Location</span>
                    <span className="text-on-surface-variant">{pickup.address}</span>
                  </div>
                </div>

                {optionalStop && (
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">☕</span>
                    <div>
                      <span className="font-bold text-on-surface block">Scenic Pour-Over Stopover</span>
                      <span className="text-on-surface-variant">{optionalStop.address}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-primary text-on-primary text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">B</span>
                  <div>
                    <span className="font-bold text-on-surface block">Final Serving Destination</span>
                    <span className="text-on-surface-variant">{destination.address}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Staging & Menu Summary */}
            <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-sm space-y-4">
              <h3 className="font-bold text-base text-on-surface">Staging Customization & Pre-Order</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-surface-container-low rounded-2xl">
                  <span className="text-[10px] font-bold uppercase text-tertiary">Chalkboard Script</span>
                  <p className="font-serif italic font-bold text-on-surface mt-0.5">"{chalkboardText}"</p>
                </div>
                <div className="p-3 bg-surface-container-low rounded-2xl">
                  <span className="text-[10px] font-bold uppercase text-tertiary">Lighting & Audio</span>
                  <p className="font-bold text-on-surface mt-0.5">{lightingChoice} • {playlistChoice}</p>
                </div>
              </div>

              {selectedAddOns.length > 0 && (
                <div className="pt-2">
                  <span className="text-xs font-bold text-tertiary uppercase tracking-wider block mb-1.5">Theme Add-Ons:</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedAddOns.map((a, idx) => (
                      <span key={idx} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                        {a.name} (+{formatCurrencyINR(a.price_inr)})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {menuItems.length > 0 && (
                <div className="pt-2">
                  <span className="text-xs font-bold text-tertiary uppercase tracking-wider block mb-1.5">Menu Pre-Orders:</span>
                  <div className="flex flex-wrap gap-2">
                    {menuItems.map((m, idx) => (
                      <span key={idx} className="px-3 py-1 rounded-full bg-surface-container text-on-surface text-xs font-semibold">
                        {m.quantity}× {m.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Guest Count & Special Requests */}
            <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-sm space-y-4">
              <div>
                <label className="text-xs font-bold text-on-surface block mb-1.5">Guest Count (Seating 2-8)</label>
                <div className="flex gap-2">
                  {[2, 3, 4, 5, 6, 7, 8].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setGuestCount(num)}
                      className={`w-9 h-9 rounded-full text-xs font-bold transition-all ${
                        guestCount === num ? 'bg-primary text-on-primary shadow-xs' : 'bg-surface-container-low hover:bg-surface-container text-on-surface'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-on-surface block mb-1.5">Special Barista Instructions or Dietary Notes</label>
                <textarea
                  rows={2}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="e.g. Please bring extra oat milk, and surprise guests with candle lit on cake upon arrival."
                  className="w-full p-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:outline-none focus:border-primary"
                />
              </div>
            </div>

          </div>

          {/* Right Column: Complete Itemized Price Breakdown */}
          <div className="lg:col-span-5 space-y-6 sticky top-24">
            <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-sm space-y-5">
              <h3 className="font-bold text-lg text-on-surface">Itemized Price Breakdown</h3>

              {/* Promo code form */}
              <form onSubmit={handleApplyPromo} className="space-y-1.5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    placeholder="Enter Promo (e.g. WHEELS500)"
                    className="flex-1 p-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs uppercase font-bold text-on-surface focus:outline-none focus:border-primary"
                  />
                  <button
                    type="submit"
                    className="py-2.5 px-4 rounded-xl bg-on-surface text-surface text-xs font-bold hover:bg-black transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {couponSuccess && <p className="text-[11px] text-secondary font-bold">{couponSuccess}</p>}
                {couponError && <p className="text-[11px] text-error font-medium">{couponError}</p>}
              </form>

              {/* Price rows */}
              <div className="space-y-2 text-xs border-t border-outline-variant/30 pt-3">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Theme Flat Complete Ride (Includes 10 km)</span>
                  <span className="font-bold text-on-surface">{formatCurrencyINR(pricing.base_price_inr)}</span>
                </div>
                
                {pricing.extra_km > 0 && (
                  <div className="flex justify-between text-primary font-semibold">
                    <span>Extra {pricing.extra_km} km (@ ₹8/km)</span>
                    <span>+{formatCurrencyINR(pricing.extra_km_charge_inr)}</span>
                  </div>
                )}

                {pricing.add_ons_total_inr > 0 && (
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Theme Staging Add-Ons</span>
                    <span className="font-bold text-on-surface">+{formatCurrencyINR(pricing.add_ons_total_inr)}</span>
                  </div>
                )}

                {pricing.menu_total_inr > 0 && (
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Menu Pre-Order Total</span>
                    <span className="font-bold text-on-surface">+{formatCurrencyINR(pricing.menu_total_inr)}</span>
                  </div>
                )}

                {pricing.discount_inr > 0 && (
                  <div className="flex justify-between text-secondary font-bold">
                    <span>Promotional Discount</span>
                    <span>-{formatCurrencyINR(pricing.discount_inr)}</span>
                  </div>
                )}

                <div className="flex justify-between text-on-surface-variant">
                  <span>GST & Service Tax (5%)</span>
                  <span>+{formatCurrencyINR(pricing.tax_inr)}</span>
                </div>
              </div>

              {/* Total */}
              <div className="pt-3 border-t border-outline-variant/30 flex items-center justify-between">
                <div>
                  <span className="text-xs text-on-surface-variant block">Total Payable in ₹</span>
                  <span className="text-3xl font-extrabold text-primary">
                    {formatCurrencyINR(pricing.total_inr)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => navigate('/booking/slots')}
                  className="w-1/3 py-3 rounded-full bg-surface-container hover:bg-surface-container-high font-bold text-xs text-on-surface transition-all"
                >
                  ← Back
                </button>
                <button
                  onClick={handleConfirmBooking}
                  disabled={submitting}
                  className="w-2/3 py-3.5 rounded-full bg-primary text-on-primary font-bold text-sm shadow-md hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>{submitting ? 'Confirming...' : 'Proceed to Checkout'}</span>
                  <span className="material-symbols-outlined text-[18px]">lock</span>
                </button>
              </div>

              <p className="text-[11px] text-tertiary text-center leading-relaxed">
                Guaranteed satisfaction. Full cancellation refund available up to 24 hours prior to departure.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
