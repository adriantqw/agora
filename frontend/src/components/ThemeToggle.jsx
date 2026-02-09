import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useThemeColors } from '../hooks/useThemeColors';

const ThemeToggle = ({
  iconColor,
  hoverBackground = '#F9F9F9',
  hoverIconColor = '#F5A5B8',
  size = 40,
  borderRadius = '8px',
  style
}) => {
  const { theme, toggleTheme } = useTheme();
  const colors = useThemeColors();
  const [isHovered, setIsHovered] = useState(false);

  const isDark = theme === 'dark';
  const effectiveIconColor = iconColor || colors.text.primary;
  const currentIconColor = isHovered ? hoverIconColor : effectiveIconColor;

  return (
    <button
      onClick={toggleTheme}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        padding: '0',
        background: isHovered ? hoverBackground : 'transparent',
        border: 'none',
        borderRadius: borderRadius,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
        color: currentIconColor,
        flexShrink: 0,
        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
        ...style,
      }}
    >
      {isDark ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      )}
    </button>
  );
};

export default ThemeToggle;
