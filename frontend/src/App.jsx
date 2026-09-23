import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Feature Pages
import HomePage from './features/home/HomePage';
import ExplorePage from './features/explore/ExplorePage';
import ThemeDetailPage from './features/theme-detail/ThemeDetailPage';

// Booking Flow Steps
import RoutePlannerStep from './features/booking-flow/RoutePlannerStep';
import ThemeCustomizerStep from './features/booking-flow/ThemeCustomizerStep';
import MenuPreOrderStep from './features/booking-flow/MenuPreOrderStep';
import VehicleSlotStep from './features/booking-flow/VehicleSlotStep';
import ReviewStep from './features/booking-flow/ReviewStep';

// Checkout & Live Tracking
import CheckoutPage from './features/checkout/CheckoutPage';
import RideTrackingPage from './features/ride-tracking/RideTrackingPage';
import CustomerDashboardPage from './features/profile/CustomerDashboardPage';

// Admin Suite
import AdminLayout from './features/admin/AdminLayout';
import AdminDashboardPage from './features/admin/AdminDashboardPage';
import AdminVehiclesPage from './features/admin/AdminVehiclesPage';
import AdminThemesPage from './features/admin/AdminThemesPage';
import AdminMenuPage from './features/admin/AdminMenuPage';
import AdminOffersPage from './features/admin/AdminOffersPage';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface">
      <Navbar />
      
      <main className="flex-1">
        <Routes>
          {/* Customer Core Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/theme/:themeId" element={<ThemeDetailPage />} />

          {/* Booking Flow Multi-Step */}
          <Route path="/booking/route" element={<RoutePlannerStep />} />
          <Route path="/booking/theme" element={<ThemeCustomizerStep />} />
          <Route path="/booking/menu" element={<MenuPreOrderStep />} />
          <Route path="/booking/slots" element={<VehicleSlotStep />} />
          <Route path="/booking/review" element={<ReviewStep />} />

          {/* Checkout & Telemetry */}
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/ride/:bookingId/track" element={<RideTrackingPage />} />
          
          {/* Customer Profile & Dashboard */}
          <Route path="/dashboard" element={<CustomerDashboardPage />} />
          <Route path="/profile" element={<CustomerDashboardPage />} />

          {/* Admin Management Suite */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="vehicles" element={<AdminVehiclesPage />} />
            <Route path="themes" element={<AdminThemesPage />} />
            <Route path="menu" element={<AdminMenuPage />} />
            <Route path="bookings" element={<AdminDashboardPage />} />
            <Route path="offers" element={<AdminOffersPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
