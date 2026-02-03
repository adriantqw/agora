import React from 'react';
import {
  Sun, Moon, Leaf, Snowflake, Sunset,
  Home, TreePine, Waves, Briefcase,
  User, Users, Sparkles,
} from 'lucide-react';

// Icon registry: backend sends icon names as strings; frontend resolves here.
const ICON_REGISTRY = {
  Sun, Moon, Leaf, Snowflake, Sunset,
  Home, TreePine, Waves, Briefcase,
  User, Users,
};

function isQuestionAnswered(question, answer) {
  if (!answer) return false;
  switch (question.type) {
    case 'multi-select':
      return Array.isArray(answer.selectedOptions) && answer.selectedOptions.length > 0;
    case 'hybrid-select':
      return (Array.isArray(answer.selectedOptions) && answer.selectedOptions.length > 0) ||
        (typeof answer.value === 'string' && answer.value.trim() !== '');
    case 'scale-rating':
      return answer.value !== undefined && answer.value !== null;
    case 'free-text':
      return typeof answer.value === 'string' && answer.value.length > 0;
    case 'single-choice':
      return !!answer.value;
    case 'dual-range':
      return answer.minValue !== undefined && answer.maxValue !== undefined;
    default:
      return !!answer.value;
  }
}

function getSelectedOptions(question, answer) {
  if (!answer) return [];
  if (Array.isArray(answer.selectedOptions)) return answer.selectedOptions;
  if (answer.value && question.options) return [answer.value];
  return [];
}

/* ── Chip component ── */
function Chip({ iconName, label, selected, onClick, readOnly }) {
  const Icon = iconName ? ICON_REGISTRY[iconName] || null : null;
  return (
    <button
      type="button"
      onClick={readOnly ? undefined : onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '6px 12px',
        borderRadius: '9999px',
        border: selected ? '1px solid var(--consumer-purple)' : '1px solid var(--border-color)',
        background: selected ? 'var(--consumer-purple-light)' : 'var(--card-background)',
        color: selected ? 'var(--consumer-purple)' : 'var(--text-tertiary)',
        fontSize: '13px',
        fontWeight: '600',
        cursor: readOnly ? 'default' : 'pointer',
        transition: 'background 0.15s, border-color 0.15s, color 0.15s',
      }}
    >
      {Icon && <Icon size={13} />}
      {label}
    </button>
  );
}

/* ── Dual Range Slider component ── */
function DualRangeSlider({ question, answer, onAnswer, readOnly }) {
  const minValue = question.min ?? 0;
  const maxValue = question.max ?? 100;
  const step = question.step ?? 1;
  const minGap = question.minGap ?? step;

  const currentMin = answer?.minValue ?? minValue;
  const currentMax = answer?.maxValue ?? maxValue;

  const [isDragging, setIsDragging] = React.useState(false);
  const [draggingHandle, setDraggingHandle] = React.useState(null);
  const [showTooltip, setShowTooltip] = React.useState({ min: false, max: false });

  const trackRef = React.useRef(null);

  const updateValues = (newMin, newMax) => {
    onAnswer({
      questionId: question.id,
      minValue: newMin,
      maxValue: newMax,
      timestamp: Date.now(),
    });
  };

  const getPercentFromValue = (value) => {
    return ((value - minValue) / (maxValue - minValue)) * 100;
  };

  const getValueFromPercent = (percent) => {
    const rawValue = percent * (maxValue - minValue) + minValue;
    return Math.round(rawValue / step) * step;
  };

  const handleMouseDown = (e, handle) => {
    if (readOnly) return;
    e.preventDefault();
    setIsDragging(true);
    setDraggingHandle(handle);
    setShowTooltip({ ...showTooltip, [handle]: true });
  };

  const handleMouseMove = React.useCallback((e) => {
    if (!isDragging || !draggingHandle || !trackRef.current) return;

    const rect = trackRef.current.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    let percent = (clientX - rect.left) / rect.width;
    percent = Math.max(0, Math.min(1, percent));

    const value = getValueFromPercent(percent);

    if (draggingHandle === 'min') {
      if (value <= currentMax - minGap) {
        updateValues(value, currentMax);
      }
    } else {
      if (value >= currentMin + minGap) {
        updateValues(currentMin, value);
      }
    }
  }, [isDragging, draggingHandle, currentMin, currentMax, minGap, minValue, maxValue, step]);

  const handleMouseUp = React.useCallback(() => {
    setIsDragging(false);
    setDraggingHandle(null);
    setShowTooltip({ min: false, max: false });
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleMouseMove);
      document.addEventListener('touchend', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleMouseMove);
        document.removeEventListener('touchend', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleTrackClick = (e) => {
    if (readOnly || e.target.closest('.slider-handle')) return;

    const rect = trackRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const value = getValueFromPercent(percent);

    const distToMin = Math.abs(value - currentMin);
    const distToMax = Math.abs(value - currentMax);

    if (distToMin < distToMax) {
      if (value <= currentMax - minGap) {
        updateValues(value, currentMax);
      }
    } else {
      if (value >= currentMin + minGap) {
        updateValues(currentMin, value);
      }
    }
  };

  const handleInputChange = (handle, inputValue) => {
    let val = parseInt(inputValue.replace(/[^0-9-]/g, ''), 10);
    if (isNaN(val)) val = handle === 'min' ? minValue : maxValue;

    if (handle === 'min') {
      val = Math.max(minValue, Math.min(val, currentMax - minGap));
      updateValues(val, currentMax);
    } else {
      val = Math.max(currentMin + minGap, Math.min(val, maxValue));
      updateValues(currentMin, val);
    }
  };

  const minPercent = getPercentFromValue(currentMin);
  const maxPercent = getPercentFromValue(currentMax);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', width: '100%' }}>
      {/* Min Input */}
      <input
        type="text"
        value={currentMin}
        readOnly={readOnly}
        onChange={(e) => handleInputChange('min', e.target.value)}
        style={{
          width: '80px',
          height: '44px',
          border: `2px solid ${showTooltip.min ? 'var(--consumer-purple)' : 'var(--border-color)'}`,
          borderRadius: '22px',
          textAlign: 'center',
          fontSize: '14px',
          color: showTooltip.min ? 'var(--consumer-purple)' : 'var(--text-secondary)',
          fontWeight: '500',
          outline: 'none',
          transition: 'all 0.2s',
          background: 'var(--card-background)',
          cursor: readOnly ? 'default' : 'pointer',
        }}
      />

      {/* Slider Track */}
      <div
        ref={trackRef}
        onClick={handleTrackClick}
        style={{
          flex: 1,
          position: 'relative',
          height: '44px',
          display: 'flex',
          alignItems: 'center',
          cursor: readOnly ? 'default' : 'pointer',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '6px',
            background: 'var(--border-color)',
            borderRadius: '3px',
            position: 'relative',
          }}
        >
          {/* Fill */}
          <div
            style={{
              position: 'absolute',
              height: '100%',
              background: 'var(--consumer-purple)',
              borderRadius: '3px',
              left: `${minPercent}%`,
              width: `${maxPercent - minPercent}%`,
              transition: isDragging ? 'none' : 'all 0.1s',
            }}
          />

          {/* Min Handle */}
          <div
            className="slider-handle"
            onMouseDown={(e) => handleMouseDown(e, 'min')}
            onTouchStart={(e) => handleMouseDown(e, 'min')}
            onMouseEnter={() => !readOnly && setShowTooltip({ ...showTooltip, min: true })}
            onMouseLeave={() => !isDragging && setShowTooltip({ ...showTooltip, min: false })}
            style={{
              position: 'absolute',
              width: '20px',
              height: '20px',
              background: 'var(--consumer-purple)',
              border: '3px solid white',
              borderRadius: '50%',
              top: '50%',
              left: `${minPercent}%`,
              transform: `translate(-50%, -50%) scale(${showTooltip.min ? 1.1 : 1})`,
              cursor: readOnly ? 'default' : 'grab',
              boxShadow: '0 2px 8px rgba(109, 92, 174, 0.3)',
              transition: 'transform 0.1s, box-shadow 0.1s',
              zIndex: 2,
            }}
          >
            {/* Tooltip */}
            <div
              style={{
                position: 'absolute',
                background: '#1f2937',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                top: '-45px',
                left: '50%',
                transform: `translateX(-50%) scale(${showTooltip.min ? 1 : 0})`,
                opacity: showTooltip.min ? 1 : 0,
                transition: 'all 0.2s',
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              }}
            >
              {currentMin}
              <div
                style={{
                  content: '',
                  position: 'absolute',
                  bottom: '-4px',
                  left: '50%',
                  transform: 'translateX(-50%) rotate(45deg)',
                  width: '8px',
                  height: '8px',
                  background: '#1f2937',
                  borderRadius: '1px',
                }}
              />
            </div>
          </div>

          {/* Max Handle */}
          <div
            className="slider-handle"
            onMouseDown={(e) => handleMouseDown(e, 'max')}
            onTouchStart={(e) => handleMouseDown(e, 'max')}
            onMouseEnter={() => !readOnly && setShowTooltip({ ...showTooltip, max: true })}
            onMouseLeave={() => !isDragging && setShowTooltip({ ...showTooltip, max: false })}
            style={{
              position: 'absolute',
              width: '20px',
              height: '20px',
              background: 'var(--consumer-purple)',
              border: '3px solid white',
              borderRadius: '50%',
              top: '50%',
              left: `${maxPercent}%`,
              transform: `translate(-50%, -50%) scale(${showTooltip.max ? 1.1 : 1})`,
              cursor: readOnly ? 'default' : 'grab',
              boxShadow: '0 2px 8px rgba(109, 92, 174, 0.3)',
              transition: 'transform 0.1s, box-shadow 0.1s',
              zIndex: 2,
            }}
          >
            {/* Tooltip */}
            <div
              style={{
                position: 'absolute',
                background: '#1f2937',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                top: '-45px',
                left: '50%',
                transform: `translateX(-50%) scale(${showTooltip.max ? 1 : 0})`,
                opacity: showTooltip.max ? 1 : 0,
                transition: 'all 0.2s',
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              }}
            >
              {currentMax}
              <div
                style={{
                  content: '',
                  position: 'absolute',
                  bottom: '-4px',
                  left: '50%',
                  transform: 'translateX(-50%) rotate(45deg)',
                  width: '8px',
                  height: '8px',
                  background: '#1f2937',
                  borderRadius: '1px',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Max Input */}
      <input
        type="text"
        value={currentMax}
        readOnly={readOnly}
        onChange={(e) => handleInputChange('max', e.target.value)}
        style={{
          width: '80px',
          height: '44px',
          border: `2px solid ${showTooltip.max ? 'var(--consumer-purple)' : 'var(--border-color)'}`,
          borderRadius: '22px',
          textAlign: 'center',
          fontSize: '14px',
          color: showTooltip.max ? 'var(--consumer-purple)' : 'var(--text-secondary)',
          fontWeight: '500',
          outline: 'none',
          transition: 'all 0.2s',
          background: 'var(--card-background)',
          cursor: readOnly ? 'default' : 'pointer',
        }}
      />
    </div>
  );
}

/* ── Unified chip-row for every question type ── */
function ChipRow({ question, answer, onAnswer, readOnly }) {
  const selected = getSelectedOptions(question, answer);
  const label = question.rowLabel || question.question.slice(0, 20);

  /* --- scale-rating: chips[] override or $-repeat fallback --- */
  if (question.type === 'scale-rating') {
    const selectedLevel = answer?.value != null ? Number(answer.value) : null;

    if (question.chips) {
      // Discrete chip override from backend
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '10px 0',
          borderBottom: '1px solid var(--color-border-subtle)',
          gap: '12px',
        }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500', minWidth: '120px' }}>
            {label}
          </span>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {question.chips.map(chip => (
              <Chip
                key={chip.value}
                label={chip.label}
                selected={selectedLevel === chip.value}
                onClick={() => onAnswer({
                  questionId: question.id,
                  value: chip.value,
                  timestamp: Date.now(),
                })}
                readOnly={readOnly}
              />
            ))}
          </div>
        </div>
      );
    }

    // Fallback: continuous slider with $-repeat labels
    const pct = selectedLevel != null
      ? ((selectedLevel - question.min) / (question.max - question.min)) * 100
      : 0;

    return (
      <div style={{
        padding: '10px 0',
        borderBottom: '1px solid var(--color-border-subtle)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500', minWidth: '120px' }}>
            {label}
          </span>
          <div style={{ flex: 1 }}>
            <input
              type="range"
              className="curate-budget-slider"
              min={question.min}
              max={question.max}
              step={question.step}
              value={selectedLevel ?? question.min}
              disabled={readOnly}
              onChange={(e) => onAnswer({
                questionId: question.id,
                value: Number(e.target.value),
                timestamp: Date.now(),
              })}
              style={{
                width: '100%',
                background: selectedLevel != null
                  ? `linear-gradient(to right, var(--consumer-purple) 0%, var(--consumer-purple) ${pct}%, var(--border-color) ${pct}%, var(--border-color) 100%)`
                  : 'var(--border-color)',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>$</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{'$'.repeat(question.max)}</span>
            </div>
          </div>
          <span style={{
            minWidth: '48px',
            textAlign: 'right',
            fontSize: '14px',
            fontWeight: '700',
            color: selectedLevel != null ? 'var(--consumer-purple)' : 'var(--text-muted)',
          }}>
            {selectedLevel != null ? '$'.repeat(selectedLevel) : '—'}
          </span>
        </div>
      </div>
    );
  }

  /* --- dual-range: dual handle range slider --- */
  if (question.type === 'dual-range') {
    return (
      <div style={{
        padding: '10px 0',
        borderBottom: '1px solid var(--color-border-subtle)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500', minWidth: '120px' }}>
            {label}
          </span>
          <div style={{ flex: 1 }}>
            <DualRangeSlider
              question={question}
              answer={answer}
              onAnswer={onAnswer}
              readOnly={readOnly}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', padding: '0 100px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500' }}>
                {question.min ?? 0}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500' }}>
                {question.max ?? 100}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* --- free-text: inline input --- */
  if (question.type === 'free-text') {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '10px 0',
        borderBottom: '1px solid var(--color-border-subtle)',
        gap: '12px',
      }}>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500', minWidth: '120px' }}>
          {label}
        </span>
        <input
          type="text"
          value={answer?.value || ''}
          placeholder={question.placeholder || 'Type here…'}
          readOnly={readOnly}
          onChange={(e) => onAnswer({
            questionId: question.id,
            value: e.target.value,
            timestamp: Date.now(),
          })}
          style={{
            flex: 1,
            fontSize: '13px',
            padding: '6px 10px',
            borderRadius: '6px',
            border: '1px solid var(--border-color)',
            background: 'var(--card-background)',
            color: 'var(--text-primary)',
            outline: 'none',
            cursor: readOnly ? 'default' : undefined,
          }}
        />
      </div>
    );
  }

  /* --- chip-based types: multi-select, single-choice, hybrid-select --- */
  const isMulti = question.type === 'multi-select' ||
    (question.type === 'hybrid-select' && question.multiSelect);

  const handleChipClick = (optionId) => {
    let newSelected;
    if (isMulti) {
      newSelected = selected.includes(optionId)
        ? selected.filter(id => id !== optionId)
        : [...selected, optionId];
    } else {
      newSelected = selected.includes(optionId) ? [] : [optionId];
    }
    onAnswer({
      questionId: question.id,
      // hybrid-select: value is freetext only — clear it when a chip is picked
      value: question.type === 'hybrid-select' ? '' : (newSelected.length ? newSelected.join(',') : ''),
      selectedOptions: newSelected,
      timestamp: Date.now(),
    });
  };

  return (
    <div style={{
      padding: '10px 0',
      borderBottom: '1px solid var(--color-border-subtle)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minHeight: '32px' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500', minWidth: '120px' }}>
          {label}
        </span>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {question.options?.map(opt => (
            <Chip
              key={opt.id}
              iconName={opt.icon}
              label={opt.label}
              selected={selected.includes(opt.id)}
              onClick={() => handleChipClick(opt.id)}
              readOnly={readOnly}
            />
          ))}
        </div>
      </div>

      {/* Hybrid-select free-text input */}
      {question.type === 'hybrid-select' && (
        <input
          type="text"
          value={answer?.value || ''}
          placeholder={question.placeholder || 'Add details…'}
          readOnly={readOnly}
          onChange={(e) => onAnswer({
            questionId: question.id,
            value: e.target.value,
            selectedOptions: [],
            timestamp: Date.now(),
          })}
          style={{
            marginTop: '8px',
            marginLeft: '132px',
            display: 'block',
            width: 'calc(100% - 132px)',
            boxSizing: 'border-box',
            fontSize: '13px',
            padding: '6px 10px',
            borderRadius: '6px',
            border: '1px solid var(--border-color)',
            background: 'var(--card-background)',
            color: 'var(--text-primary)',
            outline: 'none',
            cursor: readOnly ? 'default' : undefined,
          }}
        />
      )}
    </div>
  );
}

/* ── Main export — single unified card for any batch ── */
export default function JourneyQuestionCard({ batch, answers, onAnswer, onContinue, readOnly, submitting }) {
  const allAnswered = batch.questions
    .filter(q => q.required)
    .every(q => isQuestionAnswered(q, answers[q.id]));

  const isDisabled = !allAnswered || submitting;

  return (
    <>
    <div style={{
      background: 'var(--card-background)',
      borderRadius: '16px',
      boxShadow: 'var(--shadow-md)',
      padding: '24px 28px',
      animation: 'fadeInBatch 0.4s ease-out',
    }}>
        {/* Header: sparkle + label */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '12px',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--text-muted)',
          marginBottom: '12px',
        }}>
          <Sparkles size={14} color='var(--text-muted)' />
          {batch.label.toUpperCase()}
        </div>

      {/* Rows — every question renders as a chip-row */}
      {batch.questions.map(question => (
        <ChipRow
          key={question.id}
          question={question}
          answer={answers[question.id]}
          onAnswer={onAnswer}
          readOnly={readOnly}
        />
      ))}

      {/* Confirm pill — hidden when card is frozen */}
      {!readOnly && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button
            type="button"
            onClick={onContinue}
            disabled={isDisabled}
            style={{
              padding: '8px 24px',
              borderRadius: '9999px',
              border: `1px solid ${!isDisabled ? 'var(--consumer-purple)' : 'var(--text-muted)'}`,
              background: 'transparent',
              color: !isDisabled ? 'var(--consumer-purple)' : 'var(--text-muted)',
              fontSize: '14px',
              fontWeight: '600',
              cursor: !isDisabled ? 'pointer' : 'not-allowed',
              transition: 'border-color 0.2s, color 0.2s',
              opacity: isDisabled ? 0.6 : 1,
            }}
          >
            {submitting ? 'Submitting...' : 'Confirm'}
          </button>
        </div>
      )}
    </div>

    <style>{`
      .curate-budget-slider {
        -webkit-appearance: none;
        appearance: none;
        height: 4px;
        border-radius: 2px;
        outline: none;
        cursor: pointer;
      }
      .curate-budget-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: var(--consumer-purple);
        cursor: pointer;
        box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        transition: transform 0.1s;
      }
      .curate-budget-slider::-webkit-slider-thumb:hover {
        transform: scale(1.15);
      }
      .curate-budget-slider::-moz-range-thumb {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: var(--consumer-purple);
        border: none;
        cursor: pointer;
        box-shadow: 0 1px 3px rgba(0,0,0,0.2);
      }
      .curate-budget-slider:disabled {
        cursor: default;
        pointer-events: none;
      }
    `}</style>
    </>
  );
}
