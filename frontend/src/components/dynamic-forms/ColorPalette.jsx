/**
 * ColorPalette Component
 *
 * Display 2-4 palette options with 3-5 color swatches each
 * Similar structure to ImageChoice but shows color swatches
 */

import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { getCardStyle, getGridStyle } from '../../utils/styleHelpers.js';

/**
 * @typedef {Object} ColorPaletteProps
 * @property {Object} question - Question configuration
 * @property {Function} onAnswer - Callback when answered
 * @property {Object} [currentAnswer] - Previously saved answer
 * @property {boolean} [disabled] - Disable interactions
 */

export default function ColorPalette({ question, onAnswer, currentAnswer, disabled = false }) {
  const theme = useTheme();
  const { colors, radius, spacing, typography, transitions, shadows } = theme;

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
    : { display: 'flex', flexDirection: 'column', gap: spacing.md };

  return (
    <div style={{ fontFamily: typography.fontFamily }}>
      <div style={containerStyle}>
        {options.map((option) => {
          const isSelected = selectedOption === option.id;
          const isHovered = hoveredOption === option.id;
          const paletteColors = option.colors || [];

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
                  ? theme.shadows.pink || shadows.blue
                  : isHovered && !disabled
                    ? shadows.md
                    : shadows.sm
              }}
              role="button"
              tabIndex={disabled ? -1 : 0}
              aria-pressed={isSelected}
              aria-label={`Select ${option.label} palette`}
              onKeyDown={(e) => {
                if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  handleOptionClick(option.id);
                }
              }}
            >
              {/* Color Swatches */}
              <div style={{
                display: 'flex',
                gap: spacing.sm,
                marginBottom: spacing.md,
                justifyContent: 'center',
                position: 'relative'
              }}>
                {paletteColors.map((color, index) => (
                  <div
                    key={`${option.id}-color-${index}`}
                    style={{
                      width: '60px',
                      height: '60px',
                      background: color,
                      borderRadius: radius.md,
                      border: `2px solid ${isSelected ? colors.primary : colors.neutral300}`,
                      transition: `all ${transitions.normal}`,
                      boxShadow: isSelected ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
                    }}
                    aria-label={`Color ${index + 1}: ${color}`}
                  />
                ))}

                {/* Selection Indicator */}
                {isSelected && (
                  <div style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
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
              <div style={{ textAlign: 'center' }}>
                <h3 style={{
                  fontSize: typography.sizes.md,
                  fontWeight: typography.weights.semibold,
                  color: isSelected ? colors.primary : colors.neutral900,
                  margin: `0 0 ${spacing.xs}`,
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

              {/* Color Names (optional, for accessibility) */}
              {isSelected && (
                <div style={{
                  marginTop: spacing.md,
                  paddingTop: spacing.md,
                  borderTop: `1px solid ${colors.neutral300}`
                }}>
                  <div style={{
                    fontSize: typography.sizes.xs,
                    color: colors.neutral500,
                    textAlign: 'center',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: spacing.xs,
                    justifyContent: 'center'
                  }}>
                    {paletteColors.map((color, index) => (
                      <code
                        key={`${option.id}-code-${index}`}
                        style={{
                          padding: `2px ${spacing.xs}`,
                          background: colors.neutral100,
                          borderRadius: spacing.xs,
                          fontFamily: 'monospace',
                          fontSize: typography.sizes.xs,
                          color: colors.text?.primary || colors.neutral900
                        }}
                      >
                        {color}
                      </code>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
