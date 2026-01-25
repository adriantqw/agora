/**
 * Theme Context Provider
 *
 * Provides theme configuration to dynamic-forms components
 * Allows overriding default STYLE_GUIDE colors (e.g., egg pink for consumer pages)
 */

import { createContext, useContext } from 'react';
import STYLE_GUIDE from '../config/styleGuide.js';

// Create context with default STYLE_GUIDE theme
const ThemeContext = createContext(STYLE_GUIDE);

/**
 * ThemeProvider Component
 *
 * @param {Object} props
 * @param {Object} props.theme - Theme configuration object
 * @param {ReactNode} props.children - Child components
 */
export function ThemeProvider({ theme, children }) {
  // Merge provided theme with STYLE_GUIDE defaults
  const mergedTheme = theme ? {
    ...STYLE_GUIDE,
    colors: { ...STYLE_GUIDE.colors, ...theme.colors },
    shadows: { ...STYLE_GUIDE.shadows, ...theme.shadows },
    spacing: theme.spacing || STYLE_GUIDE.spacing,
    radius: theme.radius || STYLE_GUIDE.radius,
    typography: theme.typography || STYLE_GUIDE.typography,
    transitions: theme.transitions || STYLE_GUIDE.transitions,
  } : STYLE_GUIDE;

  return (
    <ThemeContext.Provider value={mergedTheme}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * useTheme Hook
 *
 * Access theme configuration from any component
 * @returns {Object} Theme configuration object
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export default ThemeContext;
