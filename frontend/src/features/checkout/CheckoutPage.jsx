import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { api } from '../../api/client';
import { formatCurrencyINR } from '../../utils/formatters';

export default function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('booking_id') || 'booking-demo-01';
  const queryStatus = searchParams.get('status');

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMode, setPaymentMode] = useState('simulate'); // 'simulate' | 'payu_hosted'
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(queryStatus === 'success');
  const [paymentFailure, setPaymentFailure] = useState(queryStatus === 'failure');
  const navigate = useNavigate();

  useEffect(() => {
    async function loadBooking() {
      try {
        const data = await api.getBookingById(bookingId);
        setBooking(data);
        if (data.status === 'confirmed' || data.status === 'in_progress' || queryStatus === 'success') {
          setPaymentSuccess(true);
          confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        }
      } catch (err) {
        console.error('Failed to load booking:', err);
      } finally {
        setLoading(false);
      }
    }
    loadBooking();
  }, [bookingId, queryStatus]);

  const handleSimulateSuccess = async () => {
    setProcessing(true);
    try {
      await api.simulatePayment(bookingId, 'success');
      setPaymentSuccess(true);
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    } catch (err) {
      alert(`Simulation error: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handlePayUHostedRedirect = async () => {
    setProcessing(true);
    try {
      const payuData = await api.initiatePayU(bookingId);
      
      // Dynamically submit hidden HTML form to PayU hosted checkout URL
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = payuData.action_url;
      
      Object.keys(payuData).forEach(key => {
        if (key !== 'action_url') {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = payuData[key];
          form.appendChild(input);
        }
      });
      
      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      alert(`PayU initiation failed: ${err.message}`);
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full pt-32 pb-24 text-center">
        <span className="material-symbols-outlined text-primary text-[28px] animate-spin">progress_activity</span>
        <p className="text-sm font-bold text-tertiary mt-2">Loading checkout invoice...</p>
      </div>
    );
  }

  // SUCCESS STATE
  if (paymentSuccess) {
    return (
      <div className="w-full pt-28 pb-24 bg-surface min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-surface-container-lowest rounded-3xl p-8 shadow-2xl border border-outline-variant/30 text-center space-y-5 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-secondary text-on-secondary mx-auto flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-[36px]">check_circle</span>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-secondary">Payment Confirmed</span>
            <h2 className="text-2xl font-extrabold text-on-surface">Caravan Reserved!</h2>
            <p className="text-xs text-on-surface-variant max-w-xs mx-auto">
              Your artisanal mobile cafe booking has been verified. Our baristas are preparing single-origin beans and staging hardware.
            </p>
          </div>

          <div className="bg-surface-container-low p-4 rounded-2xl text-xs space-y-2 border border-outline-variant/20 text-left">
            <div className="flex justify-between">
              <span className="text-tertiary">Booking Reference</span>
              <span className="font-mono font-bold text-on-surface">{booking?.id || bookingId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-tertiary">Selected Experience</span>
              <span className="font-bold text-on-surface">{booking?.theme_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-tertiary">Departure Slot</span>
              <span className="font-bold text-on-surface">{booking?.scheduled_time_slot}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-tertiary">Total Amount Paid</span>
              <span className="font-bold text-primary text-sm">{formatCurrencyINR(booking?.pricing?.total_inr)}</span>
            </div>
          </div>

          <div className="pt-2 space-y-2.5">
            <Link
              to={`/ride/${booking?.id || bookingId}/track`}
              className="w-full py-3.5 px-6 rounded-full bg-primary text-on-primary font-bold text-sm shadow-md hover:brightness-105 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">near_me</span>
              <span>Open Live GPS Ride Tracking</span>
            </Link>

            <Link
              to="/dashboard"
              className="w-full py-3 px-6 rounded-full bg-surface-container hover:bg-surface-container-high font-bold text-xs text-on-surface transition-all block"
            >
              View My Dashboard & Receipts
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // STANDARD CHECKOUT STATE
  return (
    <div className="w-full pt-24 pb-24 bg-surface min-h-screen">
      <div className="max-w-[800px] mx-auto px-gutter-desktop">
        
        <div className="text-center mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-secondary">PayU India Gateway</span>
          <h1 className="text-3xl font-extrabold text-on-surface mt-1">Complete Your Booking</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">Secure 256-bit encrypted checkout in Indian Rupees (₹)</p>
        </div>

        {paymentFailure && (
          <div className="mb-6 p-4 rounded-2xl bg-error-container text-on-error-container text-xs font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>Payment attempt was cancelled or declined. Please retry below.</span>
          </div>
        )}

        <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 border border-outline-variant/30 shadow-md space-y-6">
          
          {/* Booking Summary Card */}
          <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-tertiary">Booking Order</span>
              <h3 className="font-bold text-base text-on-surface">{booking?.theme_name}</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                {booking?.scheduled_date} • {booking?.scheduled_time_slot}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-tertiary block">Total Payable</span>
              <span className="text-2xl font-extrabold text-primary">
                {formatCurrencyINR(booking?.pricing?.total_inr)}
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-tertiary uppercase tracking-wider">Choose Payment Option:</h4>
            
            {/* Instant Test Simulator Option */}
            <div
              onClick={() => setPaymentMode('simulate')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                paymentMode === 'simulate'
                  ? 'bg-secondary/10 border-secondary ring-1 ring-secondary/40'
                  : 'bg-surface-container-low/50 border-outline-variant/30 hover:bg-surface-container-low'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-secondary text-on-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">bolt</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-on-surface">PayU Instant Sandbox Simulator (Recommended for Demo)</p>
                  <p className="text-[11px] text-on-surface-variant">Simulates instant verified payment without external redirect</p>
                </div>
              </div>
              <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs ${
                paymentMode === 'simulate' ? 'bg-secondary border-secondary text-white font-bold' : 'border-outline'
              }`}>
                {paymentMode === 'simulate' ? '✓' : ''}
              </span>
            </div>

            {/* Hosted PayU Page Option */}
            <div
              onClick={() => setPaymentMode('payu_hosted')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                paymentMode === 'payu_hosted'
                  ? 'bg-primary/10 border-primary ring-1 ring-primary/40'
                  : 'bg-surface-container-low/50 border-outline-variant/30 hover:bg-surface-container-low'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">credit_card</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-on-surface">PayU India Hosted Payment Page</p>
                  <p className="text-[11px] text-on-surface-variant">Redirects to PayU test portal with SHA-512 cryptographic hash</p>
                </div>
              </div>
              <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs ${
                paymentMode === 'payu_hosted' ? 'bg-primary border-primary text-white font-bold' : 'border-outline'
              }`}>
                {paymentMode === 'payu_hosted' ? '✓' : ''}
              </span>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            {paymentMode === 'simulate' ? (
              <button
                onClick={handleSimulateSuccess}
                disabled={processing}
                className="w-full py-4 rounded-full bg-secondary text-on-secondary font-bold text-sm shadow-md hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>{processing ? 'Verifying Sandbox Payment...' : `Simulate Instant Authorization (${formatCurrencyINR(booking?.pricing?.total_inr)})`}</span>
              </button>
            ) : (
              <button
                onClick={handlePayUHostedRedirect}
                disabled={processing}
                className="w-full py-4 rounded-full bg-primary text-on-primary font-bold text-sm shadow-md hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">lock</span>
                <span>{processing ? 'Generating PayU Hash...' : `Redirect to PayU Hosted Checkout (${formatCurrencyINR(booking?.pricing?.total_inr)})`}</span>
              </button>
            )}
          </div>

          <div className="flex items-center justify-center gap-4 text-[11px] text-tertiary">
            <span>🔒 256-Bit SSL Encryption</span>
            <span>•</span>
            <span>UPI / Cards / NetBanking</span>
            <span>•</span>
            <span>Instant Booking Lock</span>
          </div>

        </div>

      </div>
    </div>
  );
}
