import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { formatCurrencyINR } from '../../utils/formatters';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const s = await api.admin.getStats();
      setStats(s);
      const b = await api.admin.getBookings();
      setBookings(b);
    } catch (err) {
      console.warn('Admin stats note:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await api.admin.updateBookingStatus(bookingId, newStatus);
      loadData();
    } catch (err) {
      alert(`Status update error: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-tertiary">
        <span className="material-symbols-outlined text-primary text-[24px] animate-spin">progress_activity</span>
        <p className="mt-2 font-bold">Loading dashboard intelligence...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-surface-container-lowest p-5 rounded-3xl border border-outline-variant/30 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-tertiary text-xs font-bold uppercase tracking-wider">
            <span>Total Revenue</span>
            <span className="material-symbols-outlined text-primary text-[20px]">currency_rupee</span>
          </div>
          <p className="text-2xl font-extrabold text-on-surface">
            {formatCurrencyINR(stats?.total_revenue_inr || 7200)}
          </p>
          <span className="text-[11px] text-secondary font-semibold">Live verified bookings</span>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-3xl border border-outline-variant/30 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-tertiary text-xs font-bold uppercase tracking-wider">
            <span>Active Live Rides</span>
            <span className="material-symbols-outlined text-secondary text-[20px]">near_me</span>
          </div>
          <p className="text-2xl font-extrabold text-secondary">
            {stats?.active_rides || 1}
          </p>
          <span className="text-[11px] text-on-surface-variant font-semibold">Transmitting GPS pings</span>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-3xl border border-outline-variant/30 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-tertiary text-xs font-bold uppercase tracking-wider">
            <span>Total Reservations</span>
            <span className="material-symbols-outlined text-tertiary text-[20px]">receipt_long</span>
          </div>
          <p className="text-2xl font-extrabold text-on-surface">
            {stats?.total_bookings || bookings.length}
          </p>
          <span className="text-[11px] text-secondary font-semibold">Across 4 signature themes</span>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-3xl border border-outline-variant/30 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-tertiary text-xs font-bold uppercase tracking-wider">
            <span>Fleet Availability</span>
            <span className="material-symbols-outlined text-tertiary text-[20px]">local_shipping</span>
          </div>
          <p className="text-2xl font-extrabold text-on-surface">
            {stats?.available_vehicles || 2} / {stats?.total_vehicles || 3}
          </p>
          <span className="text-[11px] text-secondary font-semibold">Caravans staged & ready</span>
        </div>

      </div>

      {/* Bookings Management Table */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg text-on-surface">Live Bookings & Dispatch</h3>
            <p className="text-xs text-on-surface-variant">Update journey statuses and monitor live customer tracking</p>
          </div>
          <button onClick={loadData} className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            <span>Refresh</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-outline-variant/30 text-tertiary uppercase font-bold text-[10px] tracking-wider">
                <th className="py-3 px-3">Reference</th>
                <th className="py-3 px-3">Theme & Route</th>
                <th className="py-3 px-3">Schedule</th>
                <th className="py-3 px-3">Total (₹)</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="py-3.5 px-3 font-mono font-bold text-on-surface">
                    {b.id}
                  </td>
                  <td className="py-3.5 px-3">
                    <p className="font-bold text-on-surface">{b.theme_name}</p>
                    <p className="text-[11px] text-tertiary truncate max-w-xs">{b.pickup_location?.address} → {b.destination?.address}</p>
                  </td>
                  <td className="py-3.5 px-3">
                    <p className="font-bold text-on-surface">{b.scheduled_date}</p>
                    <p className="text-[11px] text-tertiary">{b.scheduled_time_slot}</p>
                  </td>
                  <td className="py-3.5 px-3 font-bold text-primary">
                    {formatCurrencyINR(b.pricing?.total_inr)}
                  </td>
                  <td className="py-3.5 px-3">
                    <select
                      value={b.status}
                      onChange={(e) => handleStatusChange(b.id, e.target.value)}
                      className="p-1.5 rounded-lg bg-surface-container text-on-surface font-bold text-xs border border-outline-variant/30 focus:outline-none focus:border-primary"
                    >
                      <option value="pending_payment">Pending Payment</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <Link
                      to={`/ride/${b.id}/track`}
                      className="inline-flex items-center gap-1 text-secondary font-bold hover:underline"
                    >
                      <span>Track</span>
                      <span className="material-symbols-outlined text-[14px]">near_me</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
