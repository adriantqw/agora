/**
 * SingleChoice Component
 *
 * Radio button single selection - reuses MultiSelect logic with maxSelections: 1
 */

import { useState } from 'react';
import STYLE_GUIDE from '../../config/styleGuide.js';
import { getCardStyle, getStackStyle } from '../../utils/styleHelpers.js';

const { colors, spacing, typography, radius } = STYLE_GUIDE;

/**
 * @typedef {Object} SingleChoiceProps
 * @property {Object} question - Question configuration
 * @property {Function} onAnswer - Callback when answered
 * @property {Object} [currentAnswer] - Previously saved answer
 * @property {boolean} [disabled] - Disable interactions
 */

export default function SingleChoice({ question, onAnswer, currentAnswer, disabled = false }) {
  const [selectedOption, setSelectedOption] = useState(
    currentAnswer?.selectedOptions?.[0] || currentAnswer?.value || null
  );
  const [hoveredOption, setHoveredOption] = useState(null);

  const { options = [], required = false } = question;

  const handleSelectOption = (optionId) => {
    if (disabled) return;

    setSelectedOption(optionId);

    onAnswer({
      questionId: question.id,
      value: optionId,
      selectedOptions: [optionId],
      timestamp: Date.now()
    });
  };

  return (
    <div style={{ fontFamily: typography.fontFamily }}>
      {/* Options List */}
      <div style={getStackStyle()}>
        {options.map((option) => {
          const isSelected = selectedOption === option.id;
          const isHovered = hoveredOption === option.id;

          return (
            <div
              key={option.id}
              onClick={() => handleSelectOption(option.id)}
              onMouseEnter={() => !disabled && setHoveredOption(option.id)}
              onMouseLeave={() => setHoveredOption(null)}
              style={{
                ...getCardStyle(isSelected, disabled),
                display: 'flex',
                alignItems: 'flex-start',
                gap: spacing.md,
                padding: spacing.lg,
                transform: isHovered && !disabled ? 'translateX(4px)' : 'translateX(0)'
              }}
              role="radio"
              aria-checked={isSelected}
              aria-label={option.label}
              tabIndex={disabled ? -1 : 0}
              onKeyDown={(e) => {
                if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  handleSelectOption(option.id);
                }
              }}
            >
              {/* Radio Button */}
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: radius.full,
                border: `2px solid ${isSelected ? colors.primary : colors.neutral300}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '2px',
                transition: 'all 0.2s ease',
                background: isSelected ? colors.primary : 'transparent'
              }}>
                {isSelected && (
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: radius.full,
                    background: colors.surface
                  }} />
                )}
              </div>

              {/* Text Content */}
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: typography.sizes.md,
                  fontWeight: typography.weights.semibold,
                  color: isSelected ? colors.primary : colors.neutral900,
                  marginBottom: option.description ? spacing.xs : 0,
                  transition: 'color 0.2s ease'
                }}>
                  {option.label}
                </div>

                {option.description && (
                  <div style={{
                    fontSize: typography.sizes.sm,
                    color: colors.neutral600,
                    lineHeight: typography.lineHeights.normal
                  }}>
                    {option.description}
                  </div>
                )}
              </div>

              {/* Checkmark for Selected */}
              {isSelected && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </div>
          );
        })}
      </div>

      {/* Helper Text */}
      {required && !selectedOption && (
        <p style={{
          fontSize: typography.sizes.sm,
          color: colors.neutral500,
          marginTop: spacing.md,
          fontStyle: 'italic'
        }}>
          * This question is required
        </p>
      )}
    </div>
  );
}
