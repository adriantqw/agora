/**
 * RangeSlider Component
 *
 * Dual-handle price range slider using two overlapping <input type="range"> elements.
 * Emits { questionId, value: null, min, max, timestamp } on change.
 */

import { useState, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export default function RangeSlider({ question, onAnswer, currentAnswer, disabled = false }) {
  const theme = useTheme();
  const { colors, spacing, typography, radius } = theme;

  const {
    min = 0,
    max = 1000,
    step = 50,
    defaultMin,
    defaultMax,
    minLabel = `$${min}`,
    maxLabel = `$${max}`,
  } = question;

  const [low, setLow] = useState(
    currentAnswer?.min !== undefined ? currentAnswer.min : (defaultMin ?? min)
  );
  const [high, setHigh] = useState(
    currentAnswer?.max !== undefined ? currentAnswer.max : (defaultMax ?? max)
  );

  // Track which thumb was last interacted with for z-index layering
  const [lastActive, setLastActive] = useState(null); // 'low' | 'high'
  const containerRef = useRef(null);

  const emitAnswer = (newLow, newHigh) => {
    onAnswer({
      questionId: question.id,
      value: null,
      min: newLow,
      max: newHigh,
      timestamp: Date.now(),
    });
  };

  const handleLowChange = (e) => {
    if (disabled) return;
    const val = Math.min(Number(e.target.value), high - step);
    setLow(val);
    setLastActive('low');
    emitAnswer(val, high);
  };

  const handleHighChange = (e) => {
    if (disabled) return;
    const val = Math.max(Number(e.target.value), low + step);
    setHigh(val);
    setLastActive('high');
    emitAnswer(low, val);
  };

  // Percentage positions for track segments
  const lowPct = ((low - min) / (max - min)) * 100;
  const highPct = ((high - min) / (max - min)) * 100;

  const eggPink = colors.primary || '#ffb7c5';

  return (
    <div className="range-slider-container" style={{ fontFamily: typography.fontFamily }}>
      {/* Value badges */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginBottom: spacing.lg }}>
        <div style={{
          padding: `${spacing.sm} ${spacing.lg}`,
          background: eggPink,
          color: colors.surface || '#fff',
          borderRadius: radius.md,
          fontSize: typography.sizes.xl,
          fontWeight: typography.weights.bold,
          boxShadow: '0 4px 12px rgba(255, 183, 197, 0.3)',
          minWidth: '72px',
          textAlign: 'center',
        }}>
          ${low.toLocaleString()}
        </div>
        <span style={{ color: colors.text?.secondary || '#718096', fontSize: typography.sizes.lg, fontWeight: typography.weights.bold }}>–</span>
        <div style={{
          padding: `${spacing.sm} ${spacing.lg}`,
          background: eggPink,
          color: colors.surface || '#fff',
          borderRadius: radius.md,
          fontSize: typography.sizes.xl,
          fontWeight: typography.weights.bold,
          boxShadow: '0 4px 12px rgba(255, 183, 197, 0.3)',
          minWidth: '72px',
          textAlign: 'center',
        }}>
          ${high.toLocaleString()}
        </div>
      </div>

      {/* Slider container */}
      <div ref={containerRef} style={{ position: 'relative', padding: `${spacing.md} 0`, height: '32px' }}>
        {/* Track background */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          height: '8px',
          background: colors.neutral200 || colors.border?.subtle || '#e2e8f0',
          borderRadius: radius.full,
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
        }}>
          {/* Filled segment between handles */}
          <div style={{
            position: 'absolute',
            left: `${lowPct}%`,
            width: `${highPct - lowPct}%`,
            top: 0,
            height: '100%',
            background: eggPink,
            borderRadius: radius.full,
          }} />
        </div>

        {/* Low handle */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={low}
          onChange={handleLowChange}
          onMouseDown={() => setLastActive('low')}
          onTouchStart={() => setLastActive('low')}
          disabled={disabled}
          aria-label="Minimum budget"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            appearance: 'none',
            WebkitAppearance: 'none',
            background: 'transparent',
            outline: 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
            zIndex: lastActive === 'low' ? 2 : 1,
            pointerEvents: disabled ? 'none' : 'auto',
          }}
        />

        {/* High handle */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={high}
          onChange={handleHighChange}
          onMouseDown={() => setLastActive('high')}
          onTouchStart={() => setLastActive('high')}
          disabled={disabled}
          aria-label="Maximum budget"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            appearance: 'none',
            WebkitAppearance: 'none',
            background: 'transparent',
            outline: 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
            zIndex: lastActive === 'high' ? 2 : 1,
            pointerEvents: disabled ? 'none' : 'auto',
          }}
        />
      </div>

      {/* Min / Max labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: spacing.sm }}>
        <span style={{ fontSize: typography.sizes.sm, color: colors.text?.secondary || '#718096', fontWeight: typography.weights.medium }}>
          {minLabel}
        </span>
        <span style={{ fontSize: typography.sizes.sm, color: colors.text?.secondary || '#718096', fontWeight: typography.weights.medium }}>
          {maxLabel}
        </span>
      </div>

      {/* Shared thumb styles */}
      <style>{`
        .range-slider-container input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          -webkit-appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: ${colors.surface || '#fff'};
          border: 3px solid ${eggPink};
          cursor: ${disabled ? 'not-allowed' : 'pointer'};
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .range-slider-container input[type="range"]::-webkit-slider-thumb:hover {
          transform: ${disabled ? 'none' : 'scale(1.15)'};
          box-shadow: ${disabled ? '0 2px 8px rgba(0,0,0,0.15)' : '0 4px 12px rgba(255, 183, 197, 0.4)'};
        }
        .range-slider-container input[type="range"]::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: ${colors.surface || '#fff'};
          border: 3px solid ${eggPink};
          cursor: ${disabled ? 'not-allowed' : 'pointer'};
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }
        .range-slider-container input[type="range"]::-moz-range-thumb:hover {
          transform: ${disabled ? 'none' : 'scale(1.15)'};
        }
        .range-slider-container input[type="range"]:disabled {
          opacity: 0.5;
        }
      `}</style>
    </div>
  );
}
