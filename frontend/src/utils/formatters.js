/**
 * Format amounts into Indian Rupees (INR) with standard Indian numbering system grouping
 * e.g., 4999 -> ₹4,999; 12499 -> ₹12,499; 1250000 -> ₹12,50,000
 */
export function formatCurrencyINR(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0';
  }
  const numericAmount = Math.round(Number(amount));
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(numericAmount);
}

/**
 * Format distance in km
 */
export function formatDistanceKm(km) {
  if (!km) return '0 km';
  return `${Number(km).toFixed(1)} km`;
}

/**
 * Format duration in minutes / hours
 */
export function formatDurationMin(min) {
  if (!min) return '30 mins';
  const hours = Math.floor(min / 60);
  const remainingMin = min % 60;
  if (hours > 0) {
    return `${hours} hr ${remainingMin > 0 ? remainingMin + ' min' : ''}`;
  }
  return `${min} mins`;
}
