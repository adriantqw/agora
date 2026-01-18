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
 * @returns {Object} Style object for the card
 */
export const getCardStyle = (selected = false, disabled = false) => ({
  background: colors.surface,
  border: selected
    ? `3px solid ${colors.primary}`
    : `1px solid ${colors.neutral300}`,
  borderRadius: radius.md,
  padding: spacing.lg,
  cursor: disabled ? 'not-allowed' : 'pointer',
  transition: `all ${transitions.normal} ${transitions.easing}`,
  opacity: disabled ? 0.5 : 1,
  boxShadow: selected ? shadows.blue : 'none',
  position: 'relative',
  overflow: 'hidden'
});

/**
 * Get button style with variants
 *
 * @param {'primary' | 'secondary' | 'ghost'} variant - Button variant
 * @param {boolean} disabled - Whether the button is disabled
 * @returns {Object} Style object for the button
 */
export const getButtonStyle = (variant = 'primary', disabled = false) => {
  const baseStyle = {
    padding: `${spacing.md} ${spacing.xl}`,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    fontFamily: typography.fontFamily,
    border: 'none',
    borderRadius: radius.md,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: `all ${transitions.normal} ${transitions.easing}`,
    opacity: disabled ? 0.5 : 1,
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacing.sm,
    boxSizing: 'border-box'
  };

  const variants = {
    primary: {
      ...baseStyle,
      color: colors.surface,
      background: disabled
        ? colors.neutral400
        : `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
      boxShadow: disabled ? 'none' : shadows.blue
    },
    secondary: {
      ...baseStyle,
      color: disabled ? colors.neutral500 : colors.neutral900,
      background: colors.neutral100,
      border: `1px solid ${colors.neutral300}`
    },
    ghost: {
      ...baseStyle,
      color: disabled ? colors.neutral400 : colors.primary,
      background: 'transparent',
      border: 'none',
      padding: `${spacing.sm} ${spacing.md}`
    }
  };

  return variants[variant] || variants.primary;
};

/**
 * Get question container style
 *
 * @returns {Object} Style object for the question container
 */
export const getQuestionContainerStyle = () => ({
  background: colors.surface,
  borderRadius: radius.lg,
  padding: spacing.xxl,
  boxShadow: shadows.md,
  marginBottom: spacing.xl,
  fontFamily: typography.fontFamily
});

/**
 * Get question text style
 *
 * @returns {Object} Style object for the question text
 */
export const getQuestionTextStyle = () => ({
  fontSize: typography.sizes.xl,
  fontWeight: typography.weights.semibold,
  color: colors.neutral900,
  marginBottom: spacing.xl,
  lineHeight: typography.lineHeights.normal,
  fontFamily: typography.fontFamily
});

/**
 * Get input field style
 *
 * @param {boolean} focused - Whether the input is focused
 * @param {boolean} error - Whether the input has an error
 * @returns {Object} Style object for the input field
 */
export const getInputStyle = (focused = false, error = false) => ({
  width: '100%',
  padding: `${spacing.md} ${spacing.lg}`,
  fontSize: typography.sizes.md,
  fontFamily: typography.fontFamily,
  border: error
    ? `2px solid ${colors.error}`
    : focused
      ? `2px solid ${colors.primary}`
      : `2px solid ${colors.neutral300}`,
  borderRadius: radius.md,
  background: focused ? colors.surface : colors.neutral50,
  outline: 'none',
  transition: `all ${transitions.normal} ${transitions.easing}`,
  boxSizing: 'border-box',
  color: colors.neutral900,
  lineHeight: typography.lineHeights.normal
});

/**
 * Get chip style (for multi-select options)
 *
 * @param {boolean} selected - Whether the chip is selected
 * @param {boolean} disabled - Whether the chip is disabled
 * @returns {Object} Style object for the chip
 */
export const getChipStyle = (selected = false, disabled = false) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: spacing.sm,
  padding: `${spacing.sm} ${spacing.lg}`,
  fontSize: typography.sizes.base,
  fontWeight: typography.weights.medium,
  fontFamily: typography.fontFamily,
  color: selected ? colors.surface : colors.neutral700,
  background: selected ? colors.primary : colors.neutral100,
  border: `1px solid ${selected ? colors.primary : colors.neutral300}`,
  borderRadius: radius.full,
  cursor: disabled ? 'not-allowed' : 'pointer',
  transition: `all ${transitions.normal} ${transitions.easing}`,
  opacity: disabled ? 0.5 : 1,
  boxSizing: 'border-box'
});

/**
 * Get label style
 *
 * @param {boolean} required - Whether the field is required
 * @returns {Object} Style object for the label
 */
export const getLabelStyle = (required = false) => ({
  display: 'block',
  fontSize: typography.sizes.sm,
  fontWeight: typography.weights.semibold,
  color: colors.neutral700,
  marginBottom: spacing.sm,
  fontFamily: typography.fontFamily,
  ...(required && {
    ':after': {
      content: '" *"',
      color: colors.error
    }
  })
});

/**
 * Get helper text style
 *
 * @param {boolean} error - Whether this is an error message
 * @returns {Object} Style object for helper text
 */
export const getHelperTextStyle = (error = false) => ({
  fontSize: typography.sizes.sm,
  color: error ? colors.error : colors.neutral600,
  marginTop: spacing.sm,
  fontFamily: typography.fontFamily,
  lineHeight: typography.lineHeights.normal
});

/**
 * Get grid container style
 *
 * @param {number} columns - Number of columns (2-4)
 * @returns {Object} Style object for grid container
 */
export const getGridStyle = (columns = 2) => ({
  display: 'grid',
  gridTemplateColumns: `repeat(${columns}, 1fr)`,
  gap: spacing.lg,
  marginTop: spacing.lg
});

/**
 * Get stack container style
 *
 * @returns {Object} Style object for stack container
 */
export const getStackStyle = () => ({
  display: 'flex',
  flexDirection: 'column',
  gap: spacing.md,
  marginTop: spacing.lg
});

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
 * @returns {Object} Style object for image placeholders
 */
export const getImagePlaceholderStyle = () => ({
  aspectRatio: '1',
  background: colors.neutral100,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: radius.md,
  color: colors.neutral400
});

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
