/**
 * Format price with currency symbol
 */
export function formatPrice(price) {
  return `$${price.toFixed(2)}`;
}

/**
 * Truncate text to max length
 */
export function truncate(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Format date to readable string
 */
export function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}
