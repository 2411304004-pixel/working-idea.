import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
  const location = useLocation();
  const { user, quickSwitchRole } = useAuth();

  const links = [
    { name: 'Dashboard Stats', path: '/admin', icon: 'dashboard' },
    { name: 'Fleet Vehicles', path: '/admin/vehicles', icon: 'local_shipping' },
    { name: 'Themes & Rates', path: '/admin/themes', icon: 'palette' },
    { name: 'Menu Items', path: '/admin/menu', icon: 'local_cafe' },
    { name: 'All Bookings', path: '/admin/bookings', icon: 'receipt_long' },
    { name: 'Promos & Offers', path: '/admin/offers', icon: 'loyalty' }
  ];

  return (
    <div className="w-full pt-20 bg-background min-h-screen">
      <div className="max-w-[1280px] mx-auto px-gutter-desktop py-6">
        
        {/* Admin Suite Header */}
        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary text-on-primary flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-[24px]">admin_panel_settings</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-xl text-on-surface">Artisan Admin Suite</h1>
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase">
                  Management Console
                </span>
              </div>
              <p className="text-xs text-on-surface-variant">Fleet logistics, bookings management, menu pricing, and real-time revenue analytics</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/dashboard"
              className="py-2 px-4 rounded-full bg-surface-container hover:bg-surface-container-high text-xs font-bold text-on-surface transition-colors"
            >
              Switch to Customer View
            </Link>
          </div>
        </div>

        {/* Navigation Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar mb-4">
          {links.map((link) => {
            const active = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`px-4 py-2.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                  active
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-high border border-outline-variant/30'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{link.icon}</span>
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Child Router Content */}
        <div className="min-h-[500px]">
          <Outlet />
        </div>

      </div>
    </div>
  );
}
