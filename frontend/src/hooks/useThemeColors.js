import { useMemo, useState, useLayoutEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useLocation } from 'react-router-dom';

export const useThemeColors = () => {
  const { theme } = useTheme();
  const location = useLocation();
  const isMerchant = location.pathname.startsWith('/merchant');

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

    const getConsumerColor = (merchantVar, consumerVar) => {
      return isMerchant ? getColor(merchantVar) : getColor(consumerVar);
    };

    return {
      page: {
        background: getColor('--page-background'),
      },
      card: {
        background: getColor('--card-background'),
        backgroundAlt: getColor('--card-background-alt'),
      },
      surface: {
        light: getColor('--color-surface-light'),
      },
      text: {
        primary: getConsumerColor('--text-primary', '--consumer-text-primary'), // Updated for consumer purple
        secondary: getColor('--text-secondary'),
        tertiary: getColor('--text-tertiary'),
        muted: getColor('--text-muted'),
      },
      border: {
        color: getColor('--border-color'),
        light: getColor('--border-color-light'),
        subtle: getColor('--color-border-subtle'),
        divider: getColor('--section-divider'),
      },
      primary: {
        blue: getColor('--primary-blue'),
        blueDark: getColor('--primary-blue-dark'),
        blueLight: getColor('--primary-blue-light'),
        purple: getColor('--primary-purple'),
        purpleDark: getColor('--primary-purple-dark'),
        // Pink colors for consumer pages (Mapped to Consumer Purple when not merchant)
        pink: getConsumerColor('--color-primary-pink', '--consumer-purple'),
        pinkDark: getColor('--color-primary-pink-dark'),
        pinkLight: getConsumerColor('--color-primary-pink-light', '--consumer-purple-light'),
        pinkSecondary: getColor('--color-secondary-pink'),
        // Egg pink colors for journey homepage
        eggPink: getConsumerColor('--color-egg-pink', '--consumer-purple'),
        eggPinkLight: getConsumerColor('--color-egg-pink-light', '--consumer-purple-light'),
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
        // Pink gradients for consumer pages
        pink: getConsumerColor('--gradient-pink', '--consumer-gradient'),
        fittingRoom: getColor('--gradient-fitting-room'),
      },
      shadow: {
        sm: getColor('--shadow-sm'),
        md: getColor('--shadow-md'),
        blue: getColor('--shadow-blue'),
        purple: getColor('--shadow-purple'),
      },
    };
  }, [theme, updateTrigger, isMerchant]);

  return colors;
};
