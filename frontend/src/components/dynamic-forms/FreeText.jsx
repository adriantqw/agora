/**
 * FreeText Component
 *
 * Single-line or multiline text input with character counter and debouncing
 */

import { useState, useEffect, useRef } from 'react';
import STYLE_GUIDE from '../../config/styleGuide.js';
import { getInputStyle, getHelperTextStyle } from '../../utils/styleHelpers.js';

/**
 * @typedef {Object} FreeTextProps
 * @property {Object} question - Question configuration
 * @property {Function} onAnswer - Callback when answered
 * @property {Object} [currentAnswer] - Previously saved answer
 * @property {boolean} [disabled] - Disable interactions
 */

export default function FreeText({ question, onAnswer, currentAnswer, disabled = false }) {
  const { colors, spacing, typography, constraints } = STYLE_GUIDE;
  const [value, setValue] = useState(currentAnswer?.value || '');
  const [isFocused, setIsFocused] = useState(false);
  const debounceTimerRef = useRef(null);

  const {
    multiline = false,
    maxLength = constraints['free-text'].maxLength,
    placeholder = '',
    required = false
  } = question;

  const debounceMs = constraints['free-text'].debounceMs;

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleChange = (e) => {
    const newValue = e.target.value;

    // Enforce max length
    if (newValue.length > maxLength) {
      return;
    }

    setValue(newValue);

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new debounced callback
    debounceTimerRef.current = setTimeout(() => {
      onAnswer({
        questionId: question.id,
        value: newValue,
        timestamp: Date.now()
      });
    }, debounceMs);
  };

  const handleBlur = () => {
    setIsFocused(false);

    // Immediately trigger answer on blur (don't wait for debounce)
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    onAnswer({
      questionId: question.id,
      value: value,
      timestamp: Date.now()
    });
  };

  const charCount = value.length;
  const charLimit = maxLength;
  const charPercentage = (charCount / charLimit) * 100;
  const isNearLimit = charPercentage > 80;
  const isAtLimit = charCount >= charLimit;

  const inputStyle = {
    ...getInputStyle(isFocused, false),
    resize: multiline ? 'vertical' : 'none',
    minHeight: multiline ? '120px' : 'auto'
  };

  const InputComponent = multiline ? 'textarea' : 'input';

  return (
    <div style={{ fontFamily: typography.fontFamily }}>
      <InputComponent
        type={multiline ? undefined : 'text'}
        value={value}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        aria-label={question.question}
        aria-required={required}
        aria-describedby={`${question.id}-helper`}
        style={inputStyle}
      />

      {/* Character Counter */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: spacing.sm
      }}>
        {/* Helper Text - Removed */}
        
        {/* Character Count */}
        <div style={{ marginLeft: 'auto' }}>
          <span style={{
            fontSize: typography.sizes.xs,
            color: isAtLimit ? colors.error : isNearLimit ? colors.warning : colors.neutral500,
            fontWeight: isAtLimit || isNearLimit ? typography.weights.semibold : typography.weights.normal
          }}>
            {charCount} / {charLimit}
          </span>
        </div>
      </div>

      {/* Visual Progress Bar */}
      {charCount > 0 && (
        <div style={{
          width: '100%',
          height: '3px',
          background: colors.neutral200,
          borderRadius: '2px',
          marginTop: spacing.xs,
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${charPercentage}%`,
            background: isAtLimit
              ? colors.error
              : isNearLimit
                ? colors.warning
                : colors.primary,
            transition: 'all 0.2s ease'
          }} />
        </div>
      )}
    </div>
  );
}
