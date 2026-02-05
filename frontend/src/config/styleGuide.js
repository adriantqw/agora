/**
 * Central Style Guide for Dynamic Forms System
 *
 * This configuration defines the component types, color palette, layout options,
 * and constraints for the AI-powered dynamic forms system.
 *
 * Key Principle: AI generates data only (not code), pre-built React components
 * render the data securely using this style guide.
 */

/**
 * Component Types
 * 8 interactive component types supported by the dynamic forms system
 */
export const COMPONENT_TYPES = [
  'image-choice',      // Visual option selection with images
  'free-text',         // Single-line or multiline text input
  'multi-select',      // Chip-style multiple selection
  'single-choice',     // Radio button single selection
  'scale-rating',      // Horizontal slider with endpoint labels
  'color-palette',     // Display 2-4 palette options with color swatches
  'image-upload',      // Drag-and-drop file upload (optional)
  'text-with-images'   // Informational component, no user input (optional)
];

/**
 * Agora Color Palette
 * Brand colors for the shopping concierge - uses Agora blue theme
 */
export const COLORS = {
  // Primary colors (Agora blue)
  primary: '#4299e1',
  primaryDark: '#3182ce',
  primaryLight: '#63b3ed',

  // Secondary colors (darker blue variants)
  secondary: '#3182ce',
  secondaryDark: '#2c5282',
  secondaryLight: '#4299e1',

  // Accent colors (lighter blue)
  accent: '#63b3ed',
  accentLight: '#90cdf4',

  // Neutrals
  neutral900: '#1a202c',
  neutral800: '#2d3748',
  neutral700: '#4a5568',
  neutral600: '#718096',
  neutral500: '#a0aec0',
  neutral400: '#cbd5e0',
  neutral300: '#e2e8f0',
  neutral200: '#edf2f7',
  neutral100: '#f7fafc',
  neutral50: '#f8f9fb',

  // Semantic colors
  success: '#48bb78',
  successLight: '#c6f6d5',
  warning: '#ed8936',
  warningLight: '#feebc8',
  error: '#e53e3e',
  errorLight: '#fed7d7',

  // Background
  background: '#f8f9fb',
  surface: '#ffffff',
  overlay: 'rgba(0, 0, 0, 0.5)'
};

/**
 * Layout Options
 * Configuration for different layout modes
 */
export const LAYOUTS = {
  grid: {
    label: 'Grid',
    columns: [2, 3, 4], // Allowed column counts
    gap: '16px',
    defaultColumns: 2
  },
  stack: {
    label: 'Stack',
    columns: [1], // Always single column
    gap: '12px',
    defaultColumns: 1
  },
  carousel: {
    label: 'Carousel', // Not implemented in MVP
    columns: [1],
    gap: '0px',
    defaultColumns: 1
  }
};

/**
 * Component Constraints
 * Validation rules and limits for each component type
 */
export const CONSTRAINTS = {
  'image-choice': {
    minOptions: 2,
    maxOptions: 8,
    columns: [2, 3, 4],
    defaultColumns: 2,
    required: false
  },
  'free-text': {
    maxLength: 500,
    debounceMs: 500,
    required: false
  },
  'multi-select': {
    minOptions: 2,
    maxOptions: 10,
    minSelections: 0,
    maxSelections: null, // null = no limit
    required: false
  },
  'single-choice': {
    minOptions: 2,
    maxOptions: 6,
    required: false
  },
  'scale-rating': {
    minValue: 0,
    maxValue: 10,
    defaultMin: 0,
    defaultMax: 5,
    required: false
  },
  'color-palette': {
    minPalettes: 2,
    maxPalettes: 5,
    minColorsPerPalette: 1,
    maxColorsPerPalette: 5,
    required: false
  },
  'image-upload': {
    maxFileSizeMB: 5,
    acceptedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    required: false
  },
  'text-with-images': {
    minImages: 0,
    maxImages: 4,
    required: false // No user input, just display
  }
};

/**
 * Voice & Tone Settings
 * Guidelines for AI-generated question text
 */
export const VOICE = {
  tone: 'friendly',
  style: 'conversational',
  maxQuestionLength: 100,
  useEmojis: false, // No emojis in questions
  examples: [
    'What style appeals to you?',
    'Which colors do you prefer?',
    'How would you describe the occasion?',
    "What's your budget range?"
  ]
};

/**
 * Spacing & Sizing
 * Consistent spacing values across the system
 */
export const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  xxl: '32px',
  xxxl: '48px'
};

/**
 * Border Radius
 * Consistent border radius values
 */
export const RADIUS = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  full: '9999px'
};

/**
 * Shadows
 * Box shadow presets
 */
export const SHADOWS = {
  sm: '0 2px 8px rgba(0,0,0,0.08)',
  md: '0 4px 16px rgba(0,0,0,0.1)',
  lg: '0 12px 24px rgba(0,0,0,0.12)',
  blue: '0 4px 16px rgba(66, 153, 225, 0.3)'
};

/**
 * Typography
 * Font settings for different text elements
 */
export const TYPOGRAPHY = {
  fontFamily: '"Source Sans 3", -apple-system, BlinkMacSystemFont, sans-serif',

  sizes: {
    xs: '12px',
    sm: '13px',
    base: '14px',
    md: '15px',
    lg: '16px',
    xl: '18px',
    xxl: '20px',
    xxxl: '24px',
    heading: '28px',
    hero: '48px'
  },

  weights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700'
  },

  lineHeights: {
    tight: '1.2',
    normal: '1.5',
    relaxed: '1.6',
    loose: '1.8'
  }
};

/**
 * Transitions
 * Animation durations and easing
 */
export const TRANSITIONS = {
  fast: '0.15s',
  normal: '0.2s',
  slow: '0.3s',
  easing: 'ease-in-out'
};

/**
 * Complete Style Guide Object
 * Export as default for easy import
 */
const STYLE_GUIDE = {
  componentTypes: COMPONENT_TYPES,
  colors: COLORS,
  layouts: LAYOUTS,
  constraints: CONSTRAINTS,
  voice: VOICE,
  spacing: SPACING,
  radius: RADIUS,
  shadows: SHADOWS,
  typography: TYPOGRAPHY,
  transitions: TRANSITIONS
};

export default STYLE_GUIDE;
