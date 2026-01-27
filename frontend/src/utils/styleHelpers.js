/**
 * Style Helper Utilities
 *
 * Reusable style functions for the dynamic forms system.
 * These helpers provide consistent styling across all question components.
 */

import STYLE_GUIDE from '../config/styleGuide.js';

const { colors, radius, shadows, spacing, typography, transitions } = STYLE_GUIDE;

/**
 * Get card style with selection and disabled states
 *
 * @param {boolean} selected - Whether the card is selected
 * @param {boolean} disabled - Whether the card is disabled
 * @param {Object} theme - Theme configuration (optional, defaults to STYLE_GUIDE)
 * @returns {Object} Style object for the card
 */
export const getCardStyle = (selected = false, disabled = false, theme = STYLE_GUIDE) => {
  const { colors: themeColors, radius: themeRadius, spacing: themeSpacing, transitions: themeTransitions, shadows: themeShadows } = theme;

  return {
    background: themeColors.surface || themeColors.card?.background || '#fff',
    border: selected
      ? `2px solid ${themeColors.primary}`
      : `1px solid ${themeColors.neutral300 || 'rgba(0,0,0,0.1)'}`,
    borderRadius: themeRadius.md,
    padding: themeSpacing.lg,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: `all ${themeTransitions.normal} ${themeTransitions.easing}`,
    opacity: disabled ? 0.5 : 1,
    boxShadow: selected ? (themeShadows.pink || themeShadows.blue) : 'none',
    position: 'relative',
    overflow: 'hidden'
  };
};

/**
 * Get button style with variants
 *
 * @param {'primary' | 'secondary' | 'ghost'} variant - Button variant
 * @param {boolean} disabled - Whether the button is disabled
 * @param {Object} theme - Theme configuration
 * @returns {Object} Style object for the button
 */
export const getButtonStyle = (variant = 'primary', disabled = false, theme = STYLE_GUIDE) => {
  const { colors: themeColors, radius: themeRadius, spacing: themeSpacing, typography: themeTypography, transitions: themeTransitions, shadows: themeShadows } = theme;

  const baseStyle = {
    padding: `${themeSpacing.md} ${themeSpacing.xl}`,
    fontSize: themeTypography.sizes.md,
    fontWeight: themeTypography.weights.semibold,
    fontFamily: themeTypography.fontFamily,
    border: 'none',
    borderRadius: themeRadius.md,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: `all ${themeTransitions.normal} ${themeTransitions.easing}`,
    opacity: disabled ? 0.5 : 1,
    display: 'inline-flex',
    alignItems: 'center',
    gap: themeSpacing.sm,
    boxSizing: 'border-box'
  };

  const variants = {
    primary: {
      ...baseStyle,
      color: 'white',
      background: disabled
        ? themeColors.neutral400
        : `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.primaryDark} 100%)`,
      boxShadow: disabled ? 'none' : themeShadows.blue
    },
    secondary: {
      ...baseStyle,
      color: disabled ? themeColors.neutral500 : themeColors.neutral900,
      background: themeColors.neutral100,
      border: `1px solid ${themeColors.neutral300}`
    },
    ghost: {
      ...baseStyle,
      color: disabled ? themeColors.neutral400 : themeColors.primary,
      background: 'transparent',
      border: 'none',
      padding: `${themeSpacing.sm} ${themeSpacing.md}`
    }
  };

  return variants[variant] || variants.primary;
};

/**
 * Get question container style
 *
 * @param {Object} theme - Theme configuration (optional, defaults to STYLE_GUIDE)
 * @returns {Object} Style object for the question container
 */
export const getQuestionContainerStyle = (theme = STYLE_GUIDE) => {
  const { colors: themeColors, radius: themeRadius, spacing: themeSpacing, shadows: themeShadows, typography: themeTypography } = theme;

  return {
    background: themeColors.surface,
    borderRadius: themeRadius.lg,
    padding: themeSpacing.xxl,
    boxShadow: themeShadows.md,
    border: `1px solid ${themeColors.neutral300 || 'transparent'}`,
    marginBottom: themeSpacing.xl,
    fontFamily: themeTypography.fontFamily
  };
};

/**
 * Get question text style
 *
 * @param {Object} theme - Theme configuration (optional, defaults to STYLE_GUIDE)
 * @returns {Object} Style object for the question text
 */
export const getQuestionTextStyle = (theme = STYLE_GUIDE) => {
  const { colors: themeColors, spacing: themeSpacing, typography: themeTypography } = theme;

  return {
    fontSize: themeTypography.sizes.xl,
    fontWeight: themeTypography.weights.semibold,
    color: themeColors.neutral900,
    marginBottom: themeSpacing.xl,
    lineHeight: themeTypography.lineHeights.normal,
    fontFamily: themeTypography.fontFamily
  };
};

/**
 * Get input field style
 *
 * @param {boolean} focused - Whether the input is focused
 * @param {boolean} error - Whether the input has an error
 * @param {Object} theme - Theme configuration
 * @returns {Object} Style object for the input field
 */
export const getInputStyle = (focused = false, error = false, theme = STYLE_GUIDE) => {
  const { colors: themeColors, radius: themeRadius, spacing: themeSpacing, typography: themeTypography, transitions: themeTransitions } = theme;

  return {
    width: '100%',
    padding: `${themeSpacing.md} ${themeSpacing.lg}`,
    fontSize: themeTypography.sizes.md,
    fontFamily: themeTypography.fontFamily,
    border: error
      ? `2px solid ${themeColors.error}`
      : focused
        ? `2px solid ${themeColors.primary}`
        : `2px solid ${themeColors.neutral300}`,
    borderRadius: themeRadius.md,
    background: focused ? themeColors.surface : themeColors.neutral100,
    outline: 'none',
    transition: `all ${themeTransitions.normal} ${themeTransitions.easing}`,
    boxSizing: 'border-box',
    color: themeColors.neutral900,
    lineHeight: themeTypography.lineHeights.normal
  };
};

/**
 * Get chip style (for multi-select options)
 *
 * @param {boolean} selected - Whether the chip is selected
 * @param {boolean} disabled - Whether the chip is disabled
 * @param {Object} theme - Theme configuration (optional, defaults to STYLE_GUIDE)
 * @returns {Object} Style object for the chip
 */
export const getChipStyle = (selected = false, disabled = false, theme = STYLE_GUIDE) => {
  const { colors: themeColors, spacing: themeSpacing, typography: themeTypography, radius: themeRadius, transitions: themeTransitions } = theme;

  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: themeSpacing.sm,
    padding: `${themeSpacing.sm} ${themeSpacing.lg}`,
    fontSize: themeTypography.sizes.base,
    fontWeight: themeTypography.weights.medium,
    fontFamily: themeTypography.fontFamily,
    color: selected ? 'white' : themeColors.neutral700,
    background: selected ? themeColors.primary : themeColors.neutral100,
    border: `1px solid ${selected ? themeColors.primary : themeColors.neutral300}`,
    borderRadius: themeRadius.full,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: `all ${themeTransitions.normal} ${themeTransitions.easing}`,
    opacity: disabled ? 0.5 : 1,
    boxSizing: 'border-box'
  };
};

/**
 * Get label style
 *
 * @param {boolean} required - Whether the field is required
 * @param {Object} theme - Theme configuration
 * @returns {Object} Style object for the label
 */
export const getLabelStyle = (required = false, theme = STYLE_GUIDE) => {
  const { colors: themeColors, spacing: themeSpacing, typography: themeTypography } = theme;

  return {
    display: 'block',
    fontSize: themeTypography.sizes.sm,
    fontWeight: themeTypography.weights.semibold,
    color: themeColors.neutral700,
    marginBottom: themeSpacing.sm,
    fontFamily: themeTypography.fontFamily,
    ...(required && {
      ':after': {
        content: '" *"',
        color: themeColors.error
      }
    })
  };
};

/**
 * Get helper text style
 *
 * @param {boolean} error - Whether this is an error message
 * @param {Object} theme - Theme configuration
 * @returns {Object} Style object for helper text
 */
export const getHelperTextStyle = (error = false, theme = STYLE_GUIDE) => {
  const { colors: themeColors, typography: themeTypography, spacing: themeSpacing } = theme;

  return {
    fontSize: themeTypography.sizes.sm,
    color: error ? themeColors.error : themeColors.neutral600,
    marginTop: themeSpacing.sm,
    fontFamily: themeTypography.fontFamily,
    lineHeight: themeTypography.lineHeights.normal
  };
};

/**
 * Get grid container style
 *
 * @param {number} columns - Number of columns (2-4)
 * @param {Object} theme - Theme configuration (optional, defaults to STYLE_GUIDE)
 * @returns {Object} Style object for grid container
 */
export const getGridStyle = (columns = 2, theme = STYLE_GUIDE) => {
  const { spacing: themeSpacing } = theme;

  return {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: themeSpacing.lg,
    marginTop: themeSpacing.lg
  };
};

/**
 * Get stack container style
 *
 * @param {Object} theme - Theme configuration (optional, defaults to STYLE_GUIDE)
 * @returns {Object} Style object for stack container
 */
export const getStackStyle = (theme = STYLE_GUIDE) => {
  const { spacing: themeSpacing } = theme;

  return {
    display: 'flex',
    flexDirection: 'column',
    gap: themeSpacing.md,
    marginTop: themeSpacing.lg
  };
};

/**
 * Get hover effect style
 *
 * @returns {Object} Style object for hover effects
 */
export const getHoverEffectStyle = () => ({
  transform: 'translateY(-2px)',
  boxShadow: shadows.md
});

/**
 * Get focus ring style
 *
 * @returns {Object} Style object for focus rings
 */
export const getFocusRingStyle = () => ({
  outline: `2px solid ${colors.primary}`,
  outlineOffset: '2px'
});

/**
 * Get progress bar style
 *
 * @param {number} progress - Progress percentage (0-100)
 * @returns {Object} Style object for progress bar
 */
export const getProgressBarStyle = (progress = 0) => ({
  container: {
    width: '100%',
    height: '8px',
    background: colors.neutral200,
    borderRadius: radius.full,
    overflow: 'hidden',
    marginBottom: spacing.xl
  },
  fill: {
    height: '100%',
    width: `${progress}%`,
    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
    transition: `width ${transitions.slow} ${transitions.easing}`,
    borderRadius: radius.full
  }
});

/**
 * Get loading spinner style
 *
 * @param {string} size - Spinner size ('sm' | 'md' | 'lg')
 * @returns {Object} Style object for loading spinner
 */
export const getSpinnerStyle = (size = 'md') => {
  const sizes = {
    sm: '16px',
    md: '24px',
    lg: '40px'
  };

  return {
    width: sizes[size] || sizes.md,
    height: sizes[size] || sizes.md,
    border: `3px solid ${colors.neutral200}`,
    borderTopColor: colors.primary,
    borderRadius: radius.full,
    animation: 'spin 0.8s linear infinite'
  };
};

/**
 * Get image placeholder style
 *
 * @param {Object} theme - Theme configuration (optional, defaults to STYLE_GUIDE)
 * @returns {Object} Style object for image placeholders
 */
export const getImagePlaceholderStyle = (theme = STYLE_GUIDE) => {
  const { colors: themeColors, radius: themeRadius } = theme;

  return {
    aspectRatio: '1',
    background: themeColors.neutral100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: themeRadius.md,
    color: themeColors.neutral400
  };
};

/**
 * Get color swatch style
 *
 * @param {string} color - Hex color code
 * @param {boolean} selected - Whether the swatch is selected
 * @returns {Object} Style object for color swatch
 */
export const getColorSwatchStyle = (color, selected = false) => ({
  width: '40px',
  height: '40px',
  background: color,
  borderRadius: radius.sm,
  border: selected
    ? `3px solid ${colors.primary}`
    : `1px solid ${colors.neutral300}`,
  cursor: 'pointer',
  transition: `all ${transitions.normal} ${transitions.easing}`,
  boxShadow: selected ? shadows.md : 'none'
});

export default {
  getCardStyle,
  getButtonStyle,
  getQuestionContainerStyle,
  getQuestionTextStyle,
  getInputStyle,
  getChipStyle,
  getLabelStyle,
  getHelperTextStyle,
  getGridStyle,
  getStackStyle,
  getHoverEffectStyle,
  getFocusRingStyle,
  getProgressBarStyle,
  getSpinnerStyle,
  getImagePlaceholderStyle,
  getColorSwatchStyle
};
