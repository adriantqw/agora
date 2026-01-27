/**
 * MultiSelect Component
 *
 * Chip-style multiple selection with min/max validation
 */

import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { getChipStyle, getHelperTextStyle } from '../../utils/styleHelpers.js';

/**
 * @typedef {Object} MultiSelectProps
 * @property {Object} question - Question configuration
 * @property {Function} onAnswer - Callback when answered
 * @property {Object} [currentAnswer] - Previously saved answer
 * @property {boolean} [disabled] - Disable interactions
 */

export default function MultiSelect({ question, onAnswer, currentAnswer, disabled = false }) {
  const theme = useTheme();
  const { colors, spacing, typography, constraints } = theme;

  const [selectedOptions, setSelectedOptions] = useState(currentAnswer?.selectedOptions || []);

  const {
    options = [],
    minSelections = constraints['multi-select'].minSelections,
    maxSelections = constraints['multi-select'].maxSelections,
    required = false
  } = question;

  const handleToggleOption = (optionId) => {
    if (disabled) return;

    let newSelection;

    if (selectedOptions.includes(optionId)) {
      // Deselect
      newSelection = selectedOptions.filter(id => id !== optionId);
    } else {
      // Select (check max limit)
      if (maxSelections && selectedOptions.length >= maxSelections) {
        return; // Don't allow more selections
      }
      newSelection = [...selectedOptions, optionId];
    }

    setSelectedOptions(newSelection);

    onAnswer({
      questionId: question.id,
      value: newSelection.join(','),
      selectedOptions: newSelection,
      timestamp: Date.now()
    });
  };

  const isMinValid = minSelections ? selectedOptions.length >= minSelections : true;
  const isMaxReached = maxSelections ? selectedOptions.length >= maxSelections : false;
  const showMinError = required && selectedOptions.length === 0;

  return (
    <div style={{ fontFamily: typography.fontFamily }}>
      {/* Options Grid */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: spacing.md,
        marginBottom: spacing.md
      }}>
        {options.map((option) => {
          const isSelected = selectedOptions.includes(option.id);
          const isDisabled = disabled || (!isSelected && isMaxReached);

          return (
            <button
              key={option.id}
              onClick={() => handleToggleOption(option.id)}
              disabled={isDisabled}
              style={getChipStyle(isSelected, isDisabled, theme)}
              role="checkbox"
              aria-checked={isSelected}
              aria-label={option.label}
              tabIndex={isDisabled ? -1 : 0}
              onKeyDown={(e) => {
                if (!isDisabled && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  handleToggleOption(option.id);
                }
              }}
            >
              {/* Checkmark Icon */}
              {isSelected && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}

              {/* Label */}
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>

      {/* Helper Text & Validation Messages */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.xs
      }}>
        {/* Selection Count */}
        <p style={{
          ...getHelperTextStyle(false),
          margin: 0,
          color: colors.neutral600
        }}>
          {selectedOptions.length} selected
          {maxSelections && ` (max ${maxSelections})`}
        </p>

        {/* Min Selections Warning */}
        {minSelections && !isMinValid && selectedOptions.length > 0 && (
          <p style={{
            ...getHelperTextStyle(true),
            margin: 0
          }}>
            Please select at least {minSelections} option{minSelections > 1 ? 's' : ''}
          </p>
        )}

        {/* Max Reached Info */}
        {isMaxReached && (
          <p style={{
            ...getHelperTextStyle(false),
            margin: 0,
            color: colors.primary
          }}>
            Maximum selections reached
          </p>
        )}
      </div>
    </div>
  );
}
