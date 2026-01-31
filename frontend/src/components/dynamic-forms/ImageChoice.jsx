/**
 * ImageChoice Component
 *
 * Visual option selection with images (MOST IMPORTANT component)
 * Supports grid/stack layout, hover effects, and selection states
 */

import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { getCardStyle, getGridStyle, getStackStyle, getImagePlaceholderStyle } from '../../utils/styleHelpers.js';

/**
 * @typedef {Object} ImageChoiceProps
 * @property {Object} question - Question configuration
 * @property {Function} onAnswer - Callback when answered
 * @property {Object} [currentAnswer] - Previously saved answer
 * @property {boolean} [disabled] - Disable interactions
 */

export default function ImageChoice({ question, onAnswer, currentAnswer, disabled = false }) {
  const theme = useTheme();
  const { colors, radius, spacing, typography, transitions } = theme;

  const [hoveredOption, setHoveredOption] = useState(null);
  const [selectedOption, setSelectedOption] = useState(currentAnswer?.value || null);

  const { options = [], layout = 'grid', columns = 2 } = question;

  const handleOptionClick = (optionId) => {
    if (disabled) return;

    setSelectedOption(optionId);
    onAnswer({
      questionId: question.id,
      value: optionId,
      selectedOptions: [optionId],
      timestamp: Date.now()
    });
  };

  const containerStyle = layout === 'grid'
    ? getGridStyle(columns, theme)
    : getStackStyle(theme);

  return (
    <div style={{ fontFamily: typography.fontFamily }}>
      <div style={containerStyle}>
        {options.map((option) => {
          const isSelected = selectedOption === option.id;
          const isHovered = hoveredOption === option.id;

          return (
            <div
              key={option.id}
              onClick={() => handleOptionClick(option.id)}
              onMouseEnter={() => !disabled && setHoveredOption(option.id)}
              onMouseLeave={() => setHoveredOption(null)}
              style={{
                ...getCardStyle(isSelected, disabled, theme),
                transform: isHovered && !disabled ? 'translateY(-4px)' : 'translateY(0)',
                boxShadow: isSelected
                  ? theme.shadows.pink || theme.shadows.blue
                  : isHovered && !disabled
                    ? '0 8px 16px rgba(0,0,0,0.1)'
                    : '0 2px 8px rgba(0,0,0,0.05)'
              }}
              role="button"
              tabIndex={disabled ? -1 : 0}
              aria-pressed={isSelected}
              aria-label={`Select ${option.label}`}
              onKeyDown={(e) => {
                if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  handleOptionClick(option.id);
                }
              }}
            >
              {/* Image Section */}
              <div style={{
                ...getImagePlaceholderStyle(theme),
                marginBottom: spacing.md,
                position: 'relative',
                overflow: 'hidden'
              }}>
                {option.imageUrl ? (
                  <img
                    src={option.imageUrl}
                    alt={option.label}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: option.metadata?.objectPosition || 'center',
                      borderRadius: radius.md
                    }}
                  />
                ) : (
                  // Placeholder when no image
                  <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: spacing.sm,
                    color: colors.neutral400
                  }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <span style={{ fontSize: typography.sizes.xs, textAlign: 'center' }}>
                      {option.imagePrompt || option.label}
                    </span>
                  </div>
                )}

                {/* Selection Indicator */}
                {isSelected && (
                  <div style={{
                    position: 'absolute',
                    top: spacing.md,
                    right: spacing.md,
                    width: '32px',
                    height: '32px',
                    background: colors.primary,
                    borderRadius: radius.full,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                )}
              </div>

              {/* Text Content */}
              <div>
                <h3 style={{
                  fontSize: typography.sizes.md,
                  fontWeight: typography.weights.semibold,
                  color: isSelected ? colors.primary : colors.neutral900,
                  margin: `0 0 ${spacing.sm}`,
                  transition: `color ${transitions.normal}`
                }}>
                  {option.label}
                </h3>

                {option.description && (
                  <p style={{
                    fontSize: typography.sizes.sm,
                    color: colors.neutral600,
                    margin: 0,
                    lineHeight: typography.lineHeights.normal
                  }}>
                    {option.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
