import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="w-full bg-surface-container-high border-t border-outline-variant/30 mt-20">
      <div className="max-w-[1200px] mx-auto px-gutter-desktop py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">local_cafe</span>
              </div>
              <span className="font-bold text-lg text-on-surface">Cafe on Wheels</span>
            </div>
            <p className="text-sm text-on-surface-variant max-w-md leading-relaxed">
              Curated artisanal mobile cafe journeys housed within restored vintage caravans. Bringing single-origin espresso bars, bespoke atmospheric decor, and unforgettable celebration moments directly to coastal lookout points and doorstep locations.
            </p>
            <div className="flex items-center gap-2 text-xs text-secondary font-semibold">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span>100% Organic Specialty Beans • Silent Eco-Lithium Bar</span>
            </div>
          </div>

          {/* Experience Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-tertiary uppercase tracking-wider">Themes & Routes</h4>
            <ul className="space-y-2 text-sm text-on-surface-variant">
              <li><Link to="/explore" className="hover:text-primary transition-colors">Proposal & Sunset Romance</Link></li>
              <li><Link to="/explore" className="hover:text-primary transition-colors">Golden Hour Birthday</Link></li>
              <li><Link to="/explore" className="hover:text-primary transition-colors">Executive Retreat</Link></li>
              <li><Link to="/explore" className="hover:text-primary transition-colors">Comfort Drive & Sunset</Link></li>
              <li><Link to="/booking/route" className="hover:text-primary transition-colors">Custom Route Planner</Link></li>
            </ul>
          </div>

          {/* Quick Contact & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-tertiary uppercase tracking-wider">Service Hub</h4>
            <ul className="space-y-2 text-sm text-on-surface-variant">
              <li className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
                <span>Mumbai Coastline & Metro</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-secondary">phone</span>
                <span>+91 98200 12345</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-tertiary">mail</span>
                <span>concierge@cafeonwheels.in</span>
              </li>
              <li className="pt-1">
                <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary">
                  First 10 km Included in All Themes
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-on-surface-variant">
          <p>© {new Date().getFullYear()} Cafe on Wheels. Crafted with artisanal passion.</p>
          <div className="flex items-center gap-6">
            <span>Pricing in Indian Rupees (₹)</span>
            <span>PayU Certified Secured</span>
            <Link to="/admin" className="text-primary hover:underline font-semibold">Admin Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
