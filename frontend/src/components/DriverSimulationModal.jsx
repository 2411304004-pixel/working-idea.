import React, { useState } from 'react';
import { api } from '../api/client';

export default function DriverSimulationModal({ bookingId = 'booking-demo-01', onClose }) {
  const [status, setStatus] = useState('en_route');
  const [speed, setSpeed] = useState(32);
  const [stepIndex, setStepIndex] = useState(0);
  const [pushing, setPushing] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);

  // Route path coordinates between Gateway of India -> Marine Drive -> Worli Sea Face
  const routeWaypoints = [
    { name: "Starting at Gateway of India", lat: 18.9220, lng: 72.8347, status: "not_started" },
    { name: "Passing Colaba Causeway", lat: 18.9265, lng: 72.8310, status: "en_route" },
    { name: "Approaching Churchgate Station", lat: 18.9322, lng: 72.8264, status: "en_route" },
    { name: "Arrived at Marine Drive Promenade (Pour-Over Pause)", lat: 18.9442, lng: 72.8234, status: "arrived_stop" },
    { name: "Cruising Queen's Necklace (Marine Drive)", lat: 18.9550, lng: 72.8205, status: "en_route" },
    { name: "Crossing Haji Ali Bay", lat: 18.9780, lng: 72.8120, status: "en_route" },
    { name: "Arriving at Worli Sea Face Destination", lat: 18.9894, lng: 72.8296, status: "arrived" }
  ];

  const currentWaypoint = routeWaypoints[stepIndex];

  const sendPing = async (waypoint) => {
    setPushing(true);
    try {
      const res = await api.updateDriverLocation({
        booking_id: bookingId,
        lat: waypoint.lat,
        lng: waypoint.lng,
        speed_kmh: Number(speed),
        status: waypoint.status
      });
      setLastMessage(`Ping sent! Lat: ${waypoint.lat.toFixed(4)}, Lng: ${waypoint.lng.toFixed(4)} (${waypoint.status})`);
    } catch (err) {
      setLastMessage(`Error pushing telemetry: ${err.message}`);
    } finally {
      setPushing(false);
    }
  };

  const handleNextStep = () => {
    const nextIdx = (stepIndex + 1) % routeWaypoints.length;
    setStepIndex(nextIdx);
    sendPing(routeWaypoints[nextIdx]);
  };

  const handlePrevStep = () => {
    const prevIdx = (stepIndex - 1 + routeWaypoints.length) % routeWaypoints.length;
    setStepIndex(prevIdx);
    sendPing(routeWaypoints[prevIdx]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-surface-container-lowest w-full max-w-md rounded-3xl p-6 shadow-2xl border border-outline-variant/40 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface font-bold text-sm"
        >
          ✕
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">local_shipping</span>
          </div>
          <div>
            <h3 className="font-bold text-base text-on-surface">Driver Telemetry Simulator</h3>
            <p className="text-xs text-on-surface-variant">Push live GPS pings to booking: <span className="font-mono text-primary font-bold">{bookingId}</span></p>
          </div>
        </div>

        {/* Current Coordinate Box */}
        <div className="bg-surface-container-low p-4 rounded-2xl mb-4 border border-outline-variant/30 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-tertiary uppercase font-bold tracking-wider">Waypoint {stepIndex + 1} of {routeWaypoints.length}</span>
            <span className="px-2 py-0.5 rounded-full bg-secondary/15 text-secondary font-bold uppercase text-[10px]">
              {currentWaypoint.status}
            </span>
          </div>
          <p className="font-bold text-sm text-on-surface">{currentWaypoint.name}</p>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono text-on-surface-variant pt-1">
            <div>Lat: <span className="font-bold text-primary">{currentWaypoint.lat.toFixed(4)}</span></div>
            <div>Lng: <span className="font-bold text-primary">{currentWaypoint.lng.toFixed(4)}</span></div>
          </div>
        </div>

        {/* Speed Slider */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-bold text-on-surface">Simulated Speed</span>
            <span className="font-bold text-secondary font-mono">{speed} km/h</span>
          </div>
          <input
            type="range"
            min="10"
            max="60"
            value={speed}
            onChange={(e) => setSpeed(e.target.value)}
            className="w-full accent-primary h-1.5 bg-surface-container rounded-lg cursor-pointer"
          />
        </div>

        {/* Action Controls */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            onClick={handlePrevStep}
            disabled={pushing}
            className="py-2.5 px-3 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold transition-all"
          >
            ← Previous Stop
          </button>
          <button
            onClick={handleNextStep}
            disabled={pushing}
            className="py-2.5 px-3 rounded-full bg-primary text-on-primary text-xs font-bold hover:brightness-105 transition-all shadow-sm"
          >
            Advance to Next Stop →
          </button>
        </div>

        <button
          onClick={() => sendPing(currentWaypoint)}
          disabled={pushing}
          className="w-full py-3 rounded-full bg-secondary text-on-secondary text-xs font-bold shadow-md hover:brightness-105 transition-all flex items-center justify-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[16px]">sensors</span>
          <span>{pushing ? 'Broadcasting Ping...' : 'Transmit Single GPS Ping'}</span>
        </button>

        {lastMessage && (
          <p className="mt-3 text-[11px] text-center text-secondary font-medium bg-secondary-container/40 p-2 rounded-xl">
            {lastMessage}
          </p>
        )}
      </div>
    </div>
  );
}
