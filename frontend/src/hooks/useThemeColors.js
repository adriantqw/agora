import { useMemo, useState, useLayoutEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export const useThemeColors = () => {
  const { theme } = useTheme();
  // Force re-compute after theme class is definitely applied
  const [updateTrigger, setUpdateTrigger] = useState(0);

  useLayoutEffect(() => {
    // Force immediate re-read of CSS variables after theme class is applied
    setUpdateTrigger(prev => prev + 1);
  }, [theme]);

  const colors = useMemo(() => {
    const getColor = (varName) => {
      return getComputedStyle(document.documentElement)
        .getPropertyValue(varName)
        .trim();
    };

    return {
      page: {
        background: getColor('--page-background'),
      },
      card: {
        background: getColor('--card-background'),
        backgroundAlt: getColor('--card-background-alt'),
      },
      text: {
        primary: getColor('--text-primary'),
        secondary: getColor('--text-secondary'),
        tertiary: getColor('--text-tertiary'),
        muted: getColor('--text-muted'),
      },
      border: {
        color: getColor('--border-color'),
        light: getColor('--border-color-light'),
      },
      primary: {
        blue: getColor('--primary-blue'),
        blueDark: getColor('--primary-blue-dark'),
        blueLight: getColor('--primary-blue-light'),
        purple: getColor('--primary-purple'),
        purpleDark: getColor('--primary-purple-dark'),
      },
      status: {
        success: {
          bg: getColor('--success-bg'),
          text: getColor('--success-text'),
          icon: getColor('--success-icon'),
        },
        warning: {
          bg: getColor('--warning-bg'),
          text: getColor('--warning-text'),
          icon: getColor('--warning-icon'),
        },
        error: {
          bg: getColor('--error-bg'),
          text: getColor('--error-text'),
          icon: getColor('--error-icon'),
        },
        info: {
          bg: getColor('--info-bg'),
          text: getColor('--info-text'),
          icon: getColor('--info-icon'),
        },
        pending: {
          bg: getColor('--pending-bg'),
          text: getColor('--pending-text'),
        },
      },
      icon: {
        bgBlue: getColor('--icon-bg-blue'),
        bgRed: getColor('--icon-bg-red'),
        bgGreen: getColor('--icon-bg-green'),
        bgYellow: getColor('--icon-bg-yellow'),
        bgPurple: getColor('--icon-bg-purple'),
      },
      input: {
        border: getColor('--input-border'),
        borderFocus: getColor('--input-border-focus'),
        background: getColor('--input-background'),
        placeholder: getColor('--input-placeholder'),
      },
      button: {
        text: getColor('--button-text'),
        border: getColor('--button-border'),
      },
      gradient: {
        blue: getColor('--gradient-blue'),
        purple: getColor('--gradient-purple'),
        ai: getColor('--gradient-ai'),
      },
      shadow: {
        sm: getColor('--shadow-sm'),
        md: getColor('--shadow-md'),
        blue: getColor('--shadow-blue'),
        purple: getColor('--shadow-purple'),
      },
    };
  }, [theme, updateTrigger]);

  return colors;
};
