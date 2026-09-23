import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { formatCurrencyINR, formatDurationMin } from '../../utils/formatters';
import DriverSimulationModal from '../../components/DriverSimulationModal';

export default function RideTrackingPage() {
  const { bookingId } = useParams();
  const id = bookingId || 'booking-demo-01';

  const [booking, setBooking] = useState(null);
  const [trackingState, setTrackingState] = useState({
    driver_location: { lat: 18.9442, lng: 72.8234, address: 'Marine Drive Promenade' },
    progress_percent: 45.0,
    status: 'en_route',
    eta_minutes: 25,
    speed_kmh: 32.0
  });

  const [wsConnected, setWsConnected] = useState(false);
  const [showDriverConsole, setShowDriverConsole] = useState(false);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);

  // Initial fetch of booking and tracking state
  useEffect(() => {
    async function loadData() {
      try {
        const b = await api.getBookingById(id);
        setBooking(b);
        const t = await api.getRideTracking(id);
        if (t) setTrackingState(prev => ({ ...prev, ...t }));
      } catch (err) {
        console.warn('Tracking fetch note:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  // WebSocket Live Connection
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws/ride/${id}?client_type=customer`;

    let socket;
    try {
      socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        setWsConnected(true);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.driver_location) {
            setTrackingState(data);
          }
        } catch (e) {
          console.warn('WS parse error:', e);
        }
      };

      socket.onclose = () => {
        setWsConnected(false);
      };

      socket.onerror = () => {
        setWsConnected(false);
      };
    } catch (e) {
      console.warn('WS connection failed, falling back to polling:', e);
    }

    // Polling fallback every 3 seconds if WebSocket closes
    const pollInterval = setInterval(async () => {
      if (!wsConnected) {
        try {
          const t = await api.getRideTracking(id);
          if (t) setTrackingState(prev => ({ ...prev, ...t }));
        } catch (e) {
          // ignore
        }
      }
    }, 3000);

    return () => {
      if (socket) socket.close();
      clearInterval(pollInterval);
    };
  }, [id, wsConnected]);

  const loc = trackingState.driver_location || { lat: 18.9442, lng: 72.8234 };

  return (
    <div className="w-full pt-20 pb-24 bg-surface min-h-screen">
      <div className="max-w-[1200px] mx-auto px-gutter-desktop">
        
        {/* Tracking Header */}
        <div className="py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2.5 h-2.5 rounded-full ${wsConnected ? 'bg-secondary animate-ping' : 'bg-primary'}`}></span>
              <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                {wsConnected ? 'Live Real-Time Telemetry Stream' : 'Live Polling Active'}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-on-surface">GPS Ride Tracking</h1>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Live location stream for: <span className="font-bold text-on-surface">{booking?.theme_name || 'Artisanal Experience'}</span> ({booking?.vehicle_name || 'Van #04'})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDriverConsole(true)}
              className="px-4 py-2.5 rounded-full bg-secondary text-on-secondary text-xs font-bold shadow-sm hover:brightness-105 transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">sensors</span>
              <span>Open Driver Simulation Console</span>
            </button>
          </div>
        </div>

        {/* 2-Column Live Map & Telemetry Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Live Interactive Map Display */}
          <div className="lg:col-span-8 space-y-6">
            
            <div className="relative w-full rounded-3xl overflow-hidden shadow-xl bg-inverse-surface border border-outline-variant/30 h-[460px]">
              
              {/* Map Canvas with Custom Dark Luxury Aesthetic */}
              <iframe
                title="Live Map View"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight="0"
                marginWidth="0"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${loc.lng - 0.03}%2C${loc.lat - 0.02}%2C${loc.lng + 0.03}%2C${loc.lat + 0.02}&layer=mapnik&marker=${loc.lat}%2C${loc.lng}`}
                className="w-full h-full filter saturate-[0.8] contrast-[1.1] opacity-90 pointer-events-none"
              ></iframe>

              {/* Real-time Dynamic Van Marker Floating Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative flex flex-col items-center">
                  <div className="bg-primary text-on-primary px-3.5 py-1.5 rounded-full shadow-2xl flex items-center gap-2 text-xs font-bold animate-bounce">
                    <span className="material-symbols-outlined text-[18px]">local_cafe</span>
                    <span>Artisan Van #04</span>
                  </div>
                  <div className="w-3 h-3 bg-primary rotate-45 -mt-1 shadow-md"></div>
                  <div className="w-8 h-8 rounded-full bg-primary/25 animate-ping absolute -bottom-1"></div>
                </div>
              </div>

              {/* Status Pill Badge Floating Top Left */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                <div className="bg-surface-container-lowest/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border border-outline-variant/30 flex items-center gap-2 text-xs font-bold text-on-surface">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary"></span>
                  </span>
                  <span className="uppercase tracking-wider">
                    Status: {trackingState.status === 'en_route' ? 'En Route to Destination' : trackingState.status === 'arrived_stop' ? 'Paused at Stopover' : trackingState.status}
                  </span>
                </div>

                <div className="bg-surface-container-lowest/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md text-[11px] font-medium text-on-surface-variant">
                  Current Speed: <span className="font-bold text-primary font-mono">{trackingState.speed_kmh} km/h</span>
                </div>
              </div>

              {/* Recenter & Map Controls Top Right */}
              <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                <button
                  onClick={() => alert(`Van Coordinates:\nLatitude: ${loc.lat.toFixed(5)}\nLongitude: ${loc.lng.toFixed(5)}`)}
                  className="w-10 h-10 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-on-surface shadow-lg flex items-center justify-center hover:bg-surface-container-high transition-colors"
                  title="View GPS Coordinates"
                >
                  <span className="material-symbols-outlined text-[20px]">my_location</span>
                </button>
              </div>

              {/* ETA Bar Floating Bottom */}
              <div className="absolute bottom-4 left-4 right-4 z-10 bg-surface-bright/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-outline-variant/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-tertiary block">Estimated Arrival</span>
                  <p className="text-xl font-extrabold text-on-surface">
                    ~{trackingState.eta_minutes} mins <span className="text-xs text-secondary font-bold">({formatDurationMin(trackingState.eta_minutes)})</span>
                  </p>
                </div>

                <div className="w-48 hidden sm:block">
                  <div className="flex justify-between text-[10px] font-bold text-tertiary mb-1">
                    <span>Progress</span>
                    <span>{Math.round(trackingState.progress_percent)}%</span>
                  </div>
                  <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                    <div className="bg-primary h-full rounded-full transition-all duration-700" style={{ width: `${trackingState.progress_percent}%` }}></div>
                  </div>
                </div>
              </div>

            </div>

            {/* Route Stops Progress Cards */}
            <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-sm space-y-4">
              <h3 className="font-bold text-base text-on-surface">Journey Route & Waypoints</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-secondary flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    <span>Pickup Point</span>
                  </span>
                  <p className="text-xs font-bold text-on-surface truncate">{booking?.pickup_location?.address || 'Gateway of India, Colaba'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/30 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-primary flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">local_cafe</span>
                    <span>Pour-Over Stopover</span>
                  </span>
                  <p className="text-xs font-bold text-on-surface truncate">{booking?.optional_stop?.address || 'Marine Drive Promenade'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-tertiary flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">flag</span>
                    <span>Final Destination</span>
                  </span>
                  <p className="text-xs font-bold text-on-surface truncate">{booking?.destination?.address || 'Worli Sea Face Coastal Perch'}</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Driver & Booking Info */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Driver Profile Card */}
            <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-sm space-y-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-secondary text-on-secondary flex items-center justify-center font-bold text-lg shadow-md">
                  KS
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <h3 className="font-bold text-base text-on-surface">Kabir Sharma</h3>
                    <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                  </div>
                  <p className="text-xs text-on-surface-variant">Master Barista & Caravan Pilot</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-secondary/15 text-secondary text-[10px] font-bold">
                    ★ 4.99 (480+ Journeys)
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-outline-variant/20 grid grid-cols-2 gap-2 text-xs">
                <a
                  href="tel:+919988776655"
                  className="py-2.5 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px] text-primary">call</span>
                  <span>Call Pilot</span>
                </a>
                <button
                  onClick={() => alert("Connecting via in-app secure chat with Barista Kabir...")}
                  className="py-2.5 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px] text-secondary">chat</span>
                  <span>Chat</span>
                </button>
              </div>
            </div>

            {/* In-Caravan Customizations Reminder */}
            <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-sm space-y-3">
              <h3 className="font-bold text-sm text-on-surface">Staged Experience Active</h3>

              <div className="text-xs space-y-2 text-on-surface-variant">
                <p><span className="font-bold text-on-surface">Signboard:</span> "{booking?.chalkboard_text || "Sarah & Mark's Forever Brew"}"</p>
                <p><span className="font-bold text-on-surface">Pre-Orders:</span> {booking?.menu_items?.length || 2} artisanal items onboard</p>
                {booking?.special_requests && (
                  <p><span className="font-bold text-on-surface">Special Note:</span> {booking.special_requests}</p>
                )}
              </div>

              <Link
                to="/dashboard"
                className="w-full py-2.5 px-4 rounded-full bg-surface-container hover:bg-surface-container-high text-xs font-bold text-on-surface text-center block transition-colors mt-2"
              >
                Back to Dashboard
              </Link>
            </div>

          </div>

        </div>

      </div>

      {/* Driver Simulation Modal */}
      {showDriverConsole && (
        <DriverSimulationModal
          bookingId={id}
          onClose={() => setShowDriverConsole(false)}
        />
      )}
    </div>
  );
}
