const API_BASE = '/api';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('cow_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  
  if (!response.ok) {
    let errorDetail = 'An unexpected error occurred';
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorJson.message || JSON.stringify(errorJson);
    } catch {
      errorDetail = response.statusText;
    }
    const error = new Error(errorDetail);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

export const api = {
  // Auth
  login: (credentials) => apiRequest('/auth/login', { method: 'POST', body: credentials }),
  register: (userData) => apiRequest('/auth/register', { method: 'POST', body: userData }),
  getMe: () => apiRequest('/auth/me'),

  // Themes
  getThemes: (mood) => apiRequest(`/themes${mood ? `?mood=${encodeURIComponent(mood)}` : ''}`),
  getThemeById: (id) => apiRequest(`/themes/${id}`),

  // Vehicles
  getVehicles: () => apiRequest('/vehicles'),
  getSlots: (date) => apiRequest(`/vehicles/slots?date=${date}`),

  // Menu
  getMenu: (category, vegOnly) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (vegOnly) params.append('veg_only', 'true');
    const qs = params.toString();
    return apiRequest(`/menu${qs ? `?${qs}` : ''}`);
  },

  // Pricing
  calculatePricing: (payload) => apiRequest('/pricing/calculate', { method: 'POST', body: payload }),

  // Bookings
  createBooking: (payload) => apiRequest('/bookings', { method: 'POST', body: payload }),
  getMyBookings: (status) => apiRequest(`/bookings${status ? `?status=${status}` : ''}`),
  getBookingById: (id) => apiRequest(`/bookings/${id}`),
  cancelBooking: (id) => apiRequest(`/bookings/${id}/cancel`, { method: 'PATCH' }),

  // Payments
  initiatePayU: (bookingId) => apiRequest('/payments/payu/initiate', { method: 'POST', body: { booking_id: bookingId } }),
  simulatePayment: (bookingId, status = 'success') => apiRequest('/payments/simulate', { method: 'POST', body: { booking_id: bookingId, status } }),

  // Live Tracking
  getRideTracking: (bookingId) => apiRequest(`/rides/${bookingId}/tracking`),
  updateDriverLocation: (payload) => apiRequest('/rides/driver/location', { method: 'POST', body: payload }),

  // Offers
  getOffers: () => apiRequest('/offers'),
  validateOffer: (code) => apiRequest(`/offers/validate/${code}`),

  // Recommendations
  getRecommendations: (city = 'Mumbai') => apiRequest(`/recommendations?city=${encodeURIComponent(city)}`),

  // Admin
  admin: {
    getStats: () => apiRequest('/admin/stats'),
    getBookings: (status) => apiRequest(`/admin/bookings${status ? `?status=${status}` : ''}`),
    updateBookingStatus: (id, status) => apiRequest(`/admin/bookings/${id}/status`, { method: 'PATCH', body: { status } }),
    createVehicle: (data) => apiRequest('/admin/vehicles', { method: 'POST', body: data }),
    updateVehicle: (id, data) => apiRequest(`/admin/vehicles/${id}`, { method: 'PUT', body: data }),
    deleteVehicle: (id) => apiRequest(`/admin/vehicles/${id}`, { method: 'DELETE' }),
    createTheme: (data) => apiRequest('/admin/themes', { method: 'POST', body: data }),
    updateTheme: (id, data) => apiRequest(`/admin/themes/${id}`, { method: 'PUT', body: data }),
    createMenuItem: (data) => apiRequest('/admin/menu', { method: 'POST', body: data }),
    updateMenuItem: (id, data) => apiRequest(`/admin/menu/${id}`, { method: 'PUT', body: data }),
    deleteMenuItem: (id) => apiRequest(`/admin/menu/${id}`, { method: 'DELETE' }),
    createOffer: (data) => apiRequest('/admin/offers', { method: 'POST', body: data }),
    deleteOffer: (id) => apiRequest(`/admin/offers/${id}`, { method: 'DELETE' }),
  }
};
