import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const location = useLocation();
  const { user, isAdmin, isDriver, logout, quickSwitchRole } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Themes', path: '/explore' },
    { name: 'Route Planner', path: '/booking/route' },
    { name: 'Menu', path: '/booking/menu' },
    { name: 'Bookings', path: '/dashboard' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-20 max-w-[1200px] mx-auto px-gutter-desktop flex items-center justify-between gap-space-md">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-space-md shrink-0">
          <Link to="/" className="flex items-center gap-space-sm group">
            <div className="w-9 h-9 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[22px]">local_cafe</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-headline-sm text-on-surface tracking-tight leading-none">
                Cafe on Wheels
              </span>
              <span className="text-[11px] text-secondary font-semibold uppercase tracking-wider mt-0.5">
                Artisanal Mobile Rostrum
              </span>
            </div>
          </Link>
        </div>

        {/* Central Navigation Pills */}
        <nav className="hidden lg:flex items-center gap-1 p-1 rounded-full bg-surface-container-low/80 border border-outline-variant/30">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  active
                    ? 'bg-surface-container-high text-on-surface font-bold shadow-xs'
                    : 'text-on-surface-variant hover:bg-surface-container-high/60 hover:text-on-surface'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          {isAdmin && (
            <Link
              to="/admin"
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                location.pathname.startsWith('/admin')
                  ? 'bg-primary text-on-primary font-bold shadow-xs'
                  : 'text-primary hover:bg-primary/10'
              }`}
            >
              Admin Suite
            </Link>
          )}
        </nav>

        {/* Right CTA and Profile Switcher */}
        <div className="flex items-center gap-space-sm shrink-0">
          <Link
            to="/booking/route"
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-primary text-on-primary text-sm font-bold shadow-sm hover:brightness-105 transition-all active:scale-95"
          >
            <span>Book Experience</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>

          {/* User Profile / Quick Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="w-10 h-10 rounded-full bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/40 flex items-center justify-center text-on-surface transition-colors focus:outline-none"
              title="Switch demo role or view profile"
            >
              <span className="material-symbols-outlined text-[20px] text-primary">person</span>
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/40 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-2 border-b border-surface-container pb-3 mb-2">
                  <p className="font-bold text-sm text-on-surface">{user?.name || 'Guest User'}</p>
                  <p className="text-xs text-on-surface-variant truncate">{user?.email || 'guest@cafeonwheels.com'}</p>
                  <span className="mt-1.5 inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-secondary/15 text-secondary">
                    Role: {user?.role || 'customer'}
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <p className="px-2 py-1 text-tertiary font-bold uppercase tracking-wider text-[10px]">
                    Switch Demo Persona:
                  </p>
                  <button
                    onClick={() => { quickSwitchRole('customer'); setProfileDropdownOpen(false); }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-surface-container flex items-center justify-between"
                  >
                    <span>Customer (Sophia Vance)</span>
                    {user?.role === 'customer' && <span className="text-primary font-bold">✓</span>}
                  </button>
                  <button
                    onClick={() => { quickSwitchRole('admin'); setProfileDropdownOpen(false); }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-surface-container flex items-center justify-between"
                  >
                    <span>Admin Suite (Owner)</span>
                    {user?.role === 'admin' && <span className="text-primary font-bold">✓</span>}
                  </button>
                  <button
                    onClick={() => { quickSwitchRole('driver'); setProfileDropdownOpen(false); }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-surface-container flex items-center justify-between"
                  >
                    <span>Driver Console (Kabir)</span>
                    {user?.role === 'driver' && <span className="text-primary font-bold">✓</span>}
                  </button>
                </div>

                <div className="border-t border-surface-container mt-2 pt-2">
                  <Link
                    to="/dashboard"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="block px-2.5 py-1.5 rounded-lg hover:bg-surface-container text-xs font-semibold text-on-surface"
                  >
                    My Bookings & Profile
                  </Link>
                  <button
                    onClick={() => { logout(); setProfileDropdownOpen(false); }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-error-container/30 text-xs font-semibold text-error"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
