/**
 * HybridSelect Component
 *
 * Combines selectable options (chips/cards) with a free-text input field.
 * Useful for "Select all that apply + Other" or "Category + Details" scenarios.
 */

import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { getCardStyle } from '../../utils/styleHelpers.js';
import { Check, Plus } from 'lucide-react';

/**
 * @typedef {Object} HybridSelectProps
 * @property {Object} question - Question configuration
 * @property {Function} onAnswer - Callback when answered
 * @property {Object} [currentAnswer] - Previously saved answer
 * @property {boolean} [disabled] - Disable interactions
 */

export default function HybridSelect({ question, onAnswer, currentAnswer, disabled = false }) {
  const theme = useTheme();
  const { colors, spacing, typography, radius } = theme;

  const { 
    options = [], 
    multiSelect = true, 
    placeholder = "Type your own...",
    required = false 
  } = question;

  // State for selected predefined options
  const [selectedOptions, setSelectedOptions] = useState(
    currentAnswer?.selectedOptions || []
  );

  // State for free text input
  const [customText, setCustomText] = useState(
    currentAnswer?.value || ''
  );

  const [hoveredOption, setHoveredOption] = useState(null);

  // Sync state with parent on change
  useEffect(() => {
    // Debounce the update slightly to avoid rapid updates on every keystroke if needed
    // But for local state, standard React update is fine.
    // The parent 'onAnswer' is expected to be efficient.
    
    // Check validity: if required, need at least one option OR some text
    const isValid = !required || (selectedOptions.length > 0 || customText.trim().length > 0);
    
    // We only trigger onAnswer if something changed? 
    // Actually, we should trigger on every change so the parent has the latest data.
  }, [selectedOptions, customText, required]);

  const handleUpdateAnswer = (newSelected, newText) => {
    onAnswer({
      questionId: question.id,
      selectedOptions: newSelected,
      value: newText, // We store the text input in 'value'
      timestamp: Date.now()
    });
  };

  const handleToggleOption = (optionId) => {
    if (disabled) return;

    let newSelected;
    if (multiSelect) {
      if (selectedOptions.includes(optionId)) {
        newSelected = selectedOptions.filter(id => id !== optionId);
      } else {
        newSelected = [...selectedOptions, optionId];
      }
    } else {
      // Single select behavior
      newSelected = selectedOptions.includes(optionId) ? [] : [optionId];
    }

    setSelectedOptions(newSelected);
    handleUpdateAnswer(newSelected, customText);
  };

  const handleTextChange = (e) => {
    const text = e.target.value;
    setCustomText(text);
    handleUpdateAnswer(selectedOptions, text);
  };

  const primaryColor = colors.primary || '#FFB6C1';
  const textColor = colors.text?.primary || '#333';
  const neutralColor900 = colors.neutral900 || '#333';
  const neutralColor500 = colors.neutral500 || '#888';
  const neutralColor400 = colors.neutral400 || '#999';
  const neutralColor200 = colors.neutral200 || '#ccc';
  const neutralColor100 = colors.neutral100 || '#f5f5f5';

  return (
    <div style={{ fontFamily: typography.fontFamily }}>
      {/* Options Grid/Stack */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: spacing.md,
        marginBottom: spacing.lg
      }}>
        {options.map((option) => {
          const isSelected = selectedOptions.includes(option.id);
          const isHovered = hoveredOption === option.id;

          return (
            <div
              key={option.id}
              onClick={() => handleToggleOption(option.id)}
              onMouseEnter={() => !disabled && setHoveredOption(option.id)}
              onMouseLeave={() => setHoveredOption(null)}
              style={{
                ...getCardStyle(isSelected, disabled, theme),
                padding: spacing.md,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                minHeight: '60px',
                position: 'relative',
                transform: isHovered && !disabled ? 'translateY(-2px)' : 'translateY(0)'
              }}
              role={multiSelect ? "checkbox" : "radio"}
              aria-checked={isSelected}
              tabIndex={disabled ? -1 : 0}
            >
              {/* Label */}
              <span style={{
                fontSize: typography.sizes.md,
                fontWeight: isSelected ? typography.weights.semibold : typography.weights.medium,
                color: isSelected ? primaryColor : neutralColor900,
                zIndex: 1
              }}>
                {option.label}
              </span>

              {/* Checkmark Icon (Absolute) */}
              {isSelected && (
                <div style={{
                  position: 'absolute',
                  top: spacing.xs,
                  right: spacing.xs,
                  color: primaryColor
                }}>
                  <Check size={16} strokeWidth={3} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Free Text Input Area */}
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={customText}
          onChange={handleTextChange}
          placeholder={placeholder}
          disabled={disabled}
          style={{
            width: '100%',
            padding: `${spacing.md} ${spacing.md}`,
            fontSize: typography.sizes.md,
            border: `2px solid ${neutralColor200}`,
            borderRadius: radius.md,
            outline: 'none',
            transition: 'all 0.2s ease',
            backgroundColor: disabled ? neutralColor100 : 'white',
            color: textColor,
            boxSizing: 'border-box' // Fix padding width issue
          }}
          onFocus={(e) => {
            if (!disabled) e.target.style.borderColor = primaryColor;
          }}
          onBlur={(e) => {
            if (!disabled) e.target.style.borderColor = neutralColor200;
          }}
        />
        
        {/* Optional icon inside input */}
        {!customText && (
          <div style={{
            position: 'absolute',
            right: spacing.md,
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            color: neutralColor400
          }}>
            <Plus size={20} />
          </div>
        )}
      </div>
    </div>
  );
}
