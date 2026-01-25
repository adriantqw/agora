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
    primary: '#ffb7c5',
    primaryDark: '#ff9fb0',
    primaryLight: '#fff0f3',

    // Secondary colors (darker pink variants)
    secondary: '#ff9fb0',
    secondaryDark: '#ff8ba0',
    secondaryLight: '#ffb7c5',

    // Accent colors (lighter pink)
    accent: '#ffcbd4',
    accentLight: '#ffe0e6',

    // Keep all other colors from STYLE_GUIDE unchanged
    neutral900: STYLE_GUIDE.colors.neutral900,
    neutral800: STYLE_GUIDE.colors.neutral800,
    neutral700: STYLE_GUIDE.colors.neutral700,
    neutral600: STYLE_GUIDE.colors.neutral600,
    neutral500: STYLE_GUIDE.colors.neutral500,
    neutral400: STYLE_GUIDE.colors.neutral400,
    neutral300: STYLE_GUIDE.colors.neutral300,
    neutral200: STYLE_GUIDE.colors.neutral200,
    neutral100: STYLE_GUIDE.colors.neutral100,
    neutral50: STYLE_GUIDE.colors.neutral50,

    success: STYLE_GUIDE.colors.success,
    successLight: STYLE_GUIDE.colors.successLight,
    warning: STYLE_GUIDE.colors.warning,
    warningLight: STYLE_GUIDE.colors.warningLight,
    error: STYLE_GUIDE.colors.error,
    errorLight: STYLE_GUIDE.colors.errorLight,

    background: STYLE_GUIDE.colors.background,
    surface: STYLE_GUIDE.colors.surface,
    overlay: STYLE_GUIDE.colors.overlay
  },

  // Override shadows with egg pink variants
  shadows: {
    sm: STYLE_GUIDE.shadows.sm,
    md: STYLE_GUIDE.shadows.md,
    lg: STYLE_GUIDE.shadows.lg,
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
