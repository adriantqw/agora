/**
 * ScaleRating Component
 *
 * Horizontal slider with endpoint labels and current value indicator
 */

import { useState } from 'react';
import STYLE_GUIDE from '../../config/styleGuide.js';

/**
 * @typedef {Object} ScaleRatingProps
 * @property {Object} question - Question configuration
 * @property {Function} onAnswer - Callback when answered
 * @property {Object} [currentAnswer] - Previously saved answer
 * @property {boolean} [disabled] - Disable interactions
 */

export default function ScaleRating({ question, onAnswer, currentAnswer, disabled = false }) {
  const { colors, spacing, typography, radius, constraints } = STYLE_GUIDE;

  const {
    min = constraints['scale-rating'].defaultMin,
    max = constraints['scale-rating'].defaultMax,
    step = 0.5,
    minLabel = 'Min',
    maxLabel = 'Max',
    required = false
  } = question;

  const [value, setValue] = useState(
    currentAnswer?.value !== undefined
      ? Number(currentAnswer.value)
      : Math.floor((min + max) / 2)
  );
  const [isDragging, setIsDragging] = useState(false);

  const handleChange = (e) => {
    if (disabled) return;

    const newValue = Number(e.target.value);
    setValue(newValue);

    onAnswer({
      questionId: question.id,
      value: newValue,
      timestamp: Date.now()
    });
  };

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div style={{ fontFamily: typography.fontFamily }}>
      {/* Current Value Display */}
      <div style={{
        textAlign: 'center',
        marginBottom: spacing.xl
      }}>
        <div style={{
          display: 'inline-block',
          padding: `${spacing.sm} ${spacing.xl}`,
          background: colors.primary,
          color: colors.surface,
          borderRadius: radius.md,
          fontSize: typography.sizes.xxl,
          fontWeight: typography.weights.bold,
          boxShadow: '0 4px 12px rgba(66, 153, 225, 0.3)',
          minWidth: '80px'
        }}>
          {value}
        </div>
      </div>

      {/* Slider Container */}
      <div style={{ position: 'relative', padding: `${spacing.md} 0` }}>
        {/* Track Background */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          height: '8px',
          background: colors.neutral200 || colors.border?.subtle,
          borderRadius: radius.full,
          transform: 'translateY(-50%)',
          pointerEvents: 'none'
        }}>
          {/* Filled Track */}
          <div style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: `${percentage}%`,
            background: colors.primary,
            borderRadius: radius.full,
            transition: isDragging ? 'none' : 'width 0.2s ease'
          }} />
        </div>

        {/* Slider Input */}
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={handleChange}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          disabled={disabled}
          aria-label={question.question}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          style={{
            width: '100%',
            height: '32px',
            position: 'relative',
            cursor: disabled ? 'not-allowed' : 'pointer',
            appearance: 'none',
            WebkitAppearance: 'none',
            background: 'transparent',
            outline: 'none',
            zIndex: 1
          }}
        />
      </div>

      {/* Labels */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: spacing.md
      }}>
        <div style={{ textAlign: 'left', flex: 1 }}>
          <div style={{
            fontSize: typography.sizes.xs,
            color: colors.text?.secondary || colors.neutral500,
            marginBottom: spacing.xs
          }}>
            {min}
          </div>
          <div style={{
            fontSize: typography.sizes.sm,
            fontWeight: typography.weights.medium,
            color: colors.text?.primary || colors.neutral700
          }}>
            {minLabel}
          </div>
        </div>

        <div style={{ textAlign: 'right', flex: 1 }}>
          <div style={{
            fontSize: typography.sizes.xs,
            color: colors.text?.secondary || colors.neutral500,
            marginBottom: spacing.xs
          }}>
            {max}
          </div>
          <div style={{
            fontSize: typography.sizes.sm,
            fontWeight: typography.weights.medium,
            color: colors.text?.primary || colors.neutral700
          }}>
            {maxLabel}
          </div>
        </div>
      </div>

      {/* Tick Marks (optional visual enhancement) */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: spacing.sm,
        paddingTop: spacing.xs
      }}>
        {Array.from({ length: max - min + 1 }).map((_, index) => {
          const tickValue = min + index;
          const isActive = tickValue <= value;

          return (
            <div
              key={tickValue}
              style={{
                width: '2px',
                height: '8px',
                background: isActive ? colors.primary : colors.neutral300 || colors.border?.subtle,
                borderRadius: '1px',
                transition: 'background 0.2s ease'
              }}
            />
          );
        })}
      </div>

      <style>{`
        /* Custom slider thumb styles */
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          -webkit-appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: ${colors.surface};
          border: 3px solid ${colors.primary};
          cursor: ${disabled ? 'not-allowed' : 'pointer'};
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        input[type="range"]::-webkit-slider-thumb:hover {
          transform: ${disabled ? 'none' : 'scale(1.1)'};
          box-shadow: ${disabled ? '0 2px 8px rgba(0, 0, 0, 0.15)' : '0 4px 12px rgba(66, 153, 225, 0.4)'};
        }

        input[type="range"]::-webkit-slider-thumb:active {
          transform: ${disabled ? 'none' : 'scale(1.05)'};
        }

        input[type="range"]::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: ${colors.surface};
          border: 3px solid ${colors.primary};
          cursor: ${disabled ? 'not-allowed' : 'pointer'};
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        input[type="range"]::-moz-range-thumb:hover {
          transform: ${disabled ? 'none' : 'scale(1.1)'};
          box-shadow: ${disabled ? '0 2px 8px rgba(0, 0, 0, 0.15)' : '0 4px 12px rgba(66, 153, 225, 0.4)'};
        }

        input[type="range"]::-moz-range-thumb:active {
          transform: ${disabled ? 'none' : 'scale(1.05)'};
        }

        input[type="range"]:disabled {
          opacity: 0.5;
        }
      `}</style>
    </div>
  );
}
