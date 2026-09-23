import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

const BookingContext = createContext(null);

export function BookingProvider({ children }) {
  const [theme, setTheme] = useState(null);
  const [pickup, setPickup] = useState({
    lat: 18.9220,
    lng: 72.8347,
    address: 'Gateway of India, Colaba, Mumbai'
  });
  const [destination, setDestination] = useState({
    lat: 18.9894,
    lng: 72.8296,
    address: 'Worli Sea Face, Mumbai'
  });
  const [optionalStop, setOptionalStop] = useState({
    lat: 18.9442,
    lng: 72.8234,
    address: 'Marine Drive Promenade (Pour-Over Stopover)'
  });
  
  // Customization
  const [chalkboardText, setChalkboardText] = useState("Sarah & Mark's Forever Brew");
  const [lightingChoice, setLightingChoice] = useState("Warm Edison Stringers");
  const [playlistChoice, setPlaylistChoice] = useState("Acoustic Vinyl Melodies");
  const [selectedAddOns, setSelectedAddOns] = useState([
    { name: "Fresh Ecuadorian Rose Posies", price_inr: 799.0, config: {} }
  ]);

  // Menu items: [{ item_id, name, quantity, price_at_booking }]
  const [menuItems, setMenuItems] = useState([
    { item_id: "item-01", name: "Smoked Honey Cinnamon Cortado", quantity: 2, price_at_booking: 349.0 }
  ]);

  // Vehicle & Schedule
  const [vehicle, setVehicle] = useState(null);
  const [scheduledDate, setScheduledDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [scheduledSlot, setScheduledSlot] = useState("4:30 PM - 6:30 PM (Golden Hour)");
  const [guestCount, setGuestCount] = useState(2);
  const [specialRequests, setSpecialRequests] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedOffer, setAppliedOffer] = useState(null);

  // Pricing state
  const [pricing, setPricing] = useState({
    base_price_inr: 4999.0,
    included_km: 10.0,
    actual_distance_km: 14.8,
    extra_km: 4.8,
    per_km_rate_inr: 8.0,
    extra_km_charge_inr: 38.4,
    add_ons_total_inr: 799.0,
    menu_total_inr: 698.0,
    subtotal_inr: 6535.4,
    tax_inr: 326.77,
    discount_inr: 0.0,
    total_inr: 6862.0
  });

  const [calculating, setCalculating] = useState(false);

  // Function to refresh pricing quote live from backend
  const refreshQuote = useCallback(async () => {
    if (!theme?._id && !theme?.id) return;
    setCalculating(true);
    try {
      const payload = {
        theme_id: theme._id || theme.id,
        pickup,
        destination,
        optional_stop: optionalStop,
        selected_add_ons: selectedAddOns,
        menu_items: menuItems,
        coupon_code: couponCode || undefined
      };
      const quote = await api.calculatePricing(payload);
      setPricing(quote);
    } catch (err) {
      console.error('Pricing recalculation failed:', err);
    } finally {
      setCalculating(false);
    }
  }, [theme, pickup, destination, optionalStop, selectedAddOns, menuItems, couponCode]);

  // Recalculate whenever relevant inputs change
  useEffect(() => {
    refreshQuote();
  }, [refreshQuote]);

  // Initial theme loader
  useEffect(() => {
    async function loadDefaultTheme() {
      try {
        const themes = await api.getThemes();
        if (themes && themes.length > 0 && !theme) {
          setTheme(themes[0]);
        }
      } catch (e) {
        console.warn('Theme init notice:', e);
      }
    }
    loadDefaultTheme();
  }, []);

  // Helper to add or toggle add-ons
  const toggleAddOn = (addon) => {
    setSelectedAddOns(prev => {
      const exists = prev.find(a => a.name === addon.name);
      if (exists) {
        return prev.filter(a => a.name !== addon.name);
      } else {
        return [...prev, { name: addon.name, price_inr: addon.price_inr, config: {} }];
      }
    });
  };

  // Helper to update menu item quantity
  const updateMenuItemQuantity = (item, delta) => {
    setMenuItems(prev => {
      const existing = prev.find(m => m.item_id === (item._id || item.id));
      if (existing) {
        const newQty = existing.quantity + delta;
        if (newQty <= 0) {
          return prev.filter(m => m.item_id !== (item._id || item.id));
        }
        return prev.map(m => m.item_id === (item._id || item.id) ? { ...m, quantity: newQty } : m);
      } else if (delta > 0) {
        return [...prev, {
          item_id: item._id || item.id,
          name: item.name,
          quantity: delta,
          price_at_booking: item.price_inr
        }];
      }
      return prev;
    });
  };

  const applyCoupon = async (code) => {
    if (!code) return;
    try {
      const res = await api.validateOffer(code);
      setCouponCode(code);
      setAppliedOffer(res.offer);
      return res.offer;
    } catch (err) {
      setAppliedOffer(null);
      throw err;
    }
  };

  const value = {
    theme,
    setTheme,
    pickup,
    setPickup,
    destination,
    setDestination,
    optionalStop,
    setOptionalStop,
    chalkboardText,
    setChalkboardText,
    lightingChoice,
    setLightingChoice,
    playlistChoice,
    setPlaylistChoice,
    selectedAddOns,
    toggleAddOn,
    menuItems,
    updateMenuItemQuantity,
    vehicle,
    setVehicle,
    scheduledDate,
    setScheduledDate,
    scheduledSlot,
    setScheduledSlot,
    guestCount,
    setGuestCount,
    specialRequests,
    setSpecialRequests,
    couponCode,
    appliedOffer,
    applyCoupon,
    pricing,
    calculating,
    refreshQuote
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}
