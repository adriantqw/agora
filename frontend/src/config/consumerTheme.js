/**
 * Consumer Theme Configuration
 *
 * Egg pink color palette for consumer-facing pages.
 * This overrides the default Agora blue theme for dynamic forms components.
 */

import STYLE_GUIDE from './styleGuide.js';

/**
 * Consumer Theme - Egg Pink Palette
 * Used for shopping concierge and consumer journey pages
 */
export const CONSUMER_THEME = {
  colors: {
    // Primary colors (Egg pink - replaces Agora blue)
    primary: 'var(--color-primary-pink)',
    primaryDark: 'var(--color-primary-pink-dark)',
    primaryLight: 'var(--color-primary-pink-light)',

    // Secondary colors (darker pink variants)
    secondary: 'var(--color-primary-pink-dark)',
    secondaryDark: 'var(--color-primary-pink-dark)',
    secondaryLight: 'var(--color-primary-pink)',

    // Accent colors (lighter pink)
    accent: 'var(--color-primary-pink-light)',
    accentLight: 'var(--color-egg-pink-light)',

    // Neutrals - Map to semantic CSS variables for dark mode support
    neutral900: 'var(--text-primary)',   // Main text
    neutral800: 'var(--text-primary)',
    neutral700: 'var(--text-secondary)', // Secondary text
    neutral600: 'var(--text-tertiary)',
    neutral500: 'var(--text-muted)',
    neutral400: 'var(--border-color)',   // Borders
    neutral300: 'var(--border-color)',
    neutral200: 'var(--border-color-light)',
    neutral100: 'var(--card-background-alt)', // Slight contrast background
    neutral50: 'var(--card-background)',      // Card background

    success: 'var(--success-text)',
    successLight: 'var(--success-bg)',
    warning: 'var(--warning-text)',
    warningLight: 'var(--warning-bg)',
    error: 'var(--error-text)',
    errorLight: 'var(--error-bg)',

    background: 'var(--page-background)',
    surface: 'var(--card-background)',
    overlay: 'rgba(0, 0, 0, 0.5)'
  },

  // Override shadows with egg pink variants
  shadows: {
    sm: 'var(--shadow-sm)',
    md: 'var(--shadow-md)',
    lg: 'var(--shadow-md)', // Fallback
    blue: '0 4px 16px rgba(255, 183, 197, 0.3)', // Egg pink shadow
    pink: '0 4px 16px rgba(255, 183, 197, 0.3)'  // Alias
  },

  // Keep all other properties from STYLE_GUIDE
  spacing: STYLE_GUIDE.spacing,
  radius: STYLE_GUIDE.radius,
  typography: STYLE_GUIDE.typography,
  transitions: STYLE_GUIDE.transitions
};

export default CONSUMER_THEME;
