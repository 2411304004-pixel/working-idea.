import React from 'react';
import { Link } from 'react-router-dom';

export default function ActiveBeaconPill({ customText, trackingBookingId = 'booking-demo-01' }) {
  return (
    <section className="max-w-[1200px] mx-auto px-gutter-desktop w-full pt-space-md pb-space-xs">
      <div className="flex flex-wrap items-center justify-between gap-space-sm bg-surface-container-low px-space-lg py-2.5 rounded-full shadow-sm border border-outline-variant/30">
        <div className="flex items-center gap-space-sm">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
          </span>
          <span className="text-xs font-bold text-secondary uppercase tracking-wider">
            Live Active Beacon
          </span>
          <span className="text-tertiary text-xs hidden sm:inline">•</span>
          <span className="text-xs sm:text-sm text-on-surface-variant font-medium">
            {customText || "Van #04 currently crafting single-origin pour-overs at Marine Drive Promenade until 6:30 PM"}
          </span>
        </div>
        <Link
          to={`/ride/${trackingBookingId}/track`}
          className="inline-flex items-center gap-1 text-xs font-bold text-secondary hover:text-primary transition-colors ml-auto sm:ml-0"
        >
          <span>Track Coordinates</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </Link>
      </div>
    </section>
  );
}
