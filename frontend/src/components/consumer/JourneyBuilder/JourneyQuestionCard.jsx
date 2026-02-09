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
      const scaleValidationChecks = {
        isUndefined: answer?.value === undefined,
        isNull: answer?.value === null,
        isEmpty: answer?.value === '',
      };
      const scaleResult = !(answer.value === undefined || answer.value === null || answer.value === '') && !isNaN(Number(answer.value)) && Number(answer.value) >= 0;
      if (process.env.NODE_ENV === 'development') {
        console.log('[isQuestionAnswered] Scale-rating validation:', {
          questionId: question.id,
          answer: answer,
          answerValue: answer?.value,
          valueType: typeof answer?.value,
          validationChecks: scaleValidationChecks,
          result: scaleResult
        });
      }
      return scaleResult;
    case 'image-select':
      const imageResult = Array.isArray(answer?.selectedOptions) && answer.selectedOptions.length === 1;
      if (process.env.NODE_ENV === 'development') {
        console.log('[isQuestionAnswered] Image-select validation:', {
          questionId: question.id,
          answer: answer,
          selectedOptions: answer?.selectedOptions,
          selectionCount: answer?.selectedOptions?.length,
          result: imageResult
        });
      }
      return imageResult;
    case 'free-text':
      return typeof answer.value === 'string' && answer.value.length > 0;
    case 'single-choice':
      return Array.isArray(answer.selectedOptions) && answer.selectedOptions.length === 1;
    case 'color-palette':
      return Array.isArray(answer.selectedOptions) && answer.selectedOptions.length === 1;
    case 'dual-range':
      return answer.minValue !== undefined &&
        answer.maxValue !== undefined &&
        answer.minValue !== null &&
        answer.maxValue !== null &&
        answer.minValue < answer.maxValue;
    default:
      return answer.value !== undefined && answer.value !== null && answer.value !== '';
  }
}

function getSelectedOptions(question, answer) {
  if (!answer) return [];

  // First try: check selectedOptions array (preferred format)
  if (Array.isArray(answer.selectedOptions) && answer.selectedOptions.length > 0) {
    return answer.selectedOptions;
  }

  // Second try: parse value field (for compatibility)
  if (typeof answer.value === 'string' && answer.value.trim() !== '') {
    // Check if it's comma-separated (multi-select format)
    if (answer.value.includes(',')) {
      return answer.value.split(',').map(s => s.trim());
    }
    return [answer.value];
  }

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
  // For pricing/budget questions, default to 0-500 range
  const isPricing = question.id?.toLowerCase().includes('budget') || 
                    question.id?.toLowerCase().includes('price') ||
                    question.rowLabel?.toLowerCase().includes('budget') ||
                    question.rowLabel?.toLowerCase().includes('price');
  
  const minValue = question.min ?? (isPricing ? 0 : 0);
  const maxValue = question.max ?? (isPricing ? 500 : 100);
  const step = question.step ?? (isPricing ? 10 : 1);
  const minGap = question.minGap ?? step;

  const currentMin = answer?.minValue ?? minValue;
  const currentMax = answer?.maxValue ?? maxValue;

  const trackRef = React.useRef(null);
  const isDraggingRef = React.useRef(false);
  const draggingHandleRef = React.useRef(null);
  const showTooltipRef = React.useRef({ min: false, max: false });

  const [, forceUpdate] = React.useReducer(x => x + 1, 0);

  const updateValues = React.useCallback((newMin, newMax) => {
    onAnswer({
      questionId: question.id,
      minValue: newMin,
      maxValue: newMax,
      timestamp: Date.now(),
    });
  }, [question.id, onAnswer]);

  const getPercentFromValue = React.useCallback((value) => {
    return ((value - minValue) / (maxValue - minValue)) * 100;
  }, [minValue, maxValue]);

  const getValueFromPercent = React.useCallback((percent) => {
    const rawValue = percent * (maxValue - minValue) + minValue;
    return Math.round(rawValue / step) * step;
  }, [maxValue, minValue, step]);

  const handleMouseDown = React.useCallback((e, handle) => {
    if (readOnly) return;
    e.preventDefault();
    isDraggingRef.current = true;
    draggingHandleRef.current = handle;
    showTooltipRef.current = { ...showTooltipRef.current, [handle]: true };
    forceUpdate();
  }, [readOnly]);

  const handleMouseMove = React.useCallback((e) => {
    if (!isDraggingRef.current || !draggingHandleRef.current || !trackRef.current) return;

    const rect = trackRef.current.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    let percent = (clientX - rect.left) / rect.width;
    // Clamp to [0, 1] for full range, then convert to value
    percent = Math.max(0, Math.min(1, percent));

    const value = getValueFromPercent(percent);

    if (draggingHandleRef.current === 'min') {
      // Min handle: clamp to [minValue, currentMax - minGap]
      const newMin = Math.max(minValue, Math.min(value, currentMax - minGap));
      updateValues(newMin, currentMax);
    } else {
      // Max handle: clamp to [currentMin + minGap, maxValue]
      const newMax = Math.max(currentMin + minGap, Math.min(value, maxValue));
      updateValues(currentMin, newMax);
    }
  }, [minValue, maxValue, currentMin, currentMax, minGap, getValueFromPercent, updateValues]);

  const handleMouseUp = React.useCallback(() => {
    isDraggingRef.current = false;
    draggingHandleRef.current = null;
    showTooltipRef.current = { min: false, max: false };
    forceUpdate();
  }, []);

  React.useEffect(() => {
    if (isDraggingRef.current) {
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
  }, [handleMouseMove, handleMouseUp]);

  const handleTrackClick = React.useCallback((e) => {
    if (readOnly || e.target.closest('.slider-handle')) return;

    const rect = trackRef.current.getBoundingClientRect();
    // Clamp percent to [0, 1] to ensure full range accessibility
    let percent = (e.clientX - rect.left) / rect.width;
    percent = Math.max(0, Math.min(1, percent));
    const value = getValueFromPercent(percent);

    const distToMin = Math.abs(value - currentMin);
    const distToMax = Math.abs(value - currentMax);

    if (distToMin < distToMax) {
      // Move min handle - ensure it can reach absolute min
      const newMin = Math.max(minValue, Math.min(value, currentMax - minGap));
      updateValues(newMin, currentMax);
    } else {
      // Move max handle - ensure it can reach absolute max
      const newMax = Math.max(currentMin + minGap, Math.min(value, maxValue));
      updateValues(currentMin, newMax);
    }
  }, [readOnly, minValue, maxValue, currentMin, currentMax, minGap, getValueFromPercent, updateValues]);

  const handleInputChange = React.useCallback((handle, inputValue) => {
    // Remove any non-numeric characters except minus sign at start
    let cleanedValue = inputValue.replace(/[^0-9-]/g, '');
    // Ensure minus only appears at the start
    if (cleanedValue.lastIndexOf('-') > 0) {
      cleanedValue = cleanedValue.replace(/-/g, '');
    }
    
    let val = parseInt(cleanedValue, 10);
    if (isNaN(val)) {
      // Don't update if invalid, keep current value
      return;
    }
    
    // Clamp to absolute min/max bounds first
    val = Math.max(minValue, Math.min(val, maxValue));

    if (handle === 'min') {
      // Min handle: must be >= minValue and <= (max handle - minGap)
      val = Math.max(minValue, Math.min(val, currentMax - minGap));
      updateValues(val, currentMax);
    } else {
      // Max handle: must be >= (min handle + minGap) and <= maxValue
      val = Math.max(currentMin + minGap, Math.min(val, maxValue));
      updateValues(currentMin, val);
    }
  }, [minValue, maxValue, currentMin, currentMax, minGap, updateValues]);

  const minPercent = getPercentFromValue(currentMin);
  const maxPercent = getPercentFromValue(currentMax);
  const showTooltip = showTooltipRef.current;

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
              transition: isDraggingRef.current ? 'none' : 'all 0.1s',
            }}
          />

          {/* Min Handle */}
          <div
            className="slider-handle"
            onMouseDown={(e) => handleMouseDown(e, 'min')}
            onTouchStart={(e) => handleMouseDown(e, 'min')}
            onMouseEnter={() => !readOnly && (showTooltipRef.current = { ...showTooltipRef.current, min: true }) && forceUpdate()}
            onMouseLeave={() => !isDraggingRef.current && (showTooltipRef.current = { ...showTooltipRef.current, min: false }) && forceUpdate()}
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
            onMouseEnter={() => !readOnly && (showTooltipRef.current = { ...showTooltipRef.current, max: true }) && forceUpdate()}
            onMouseLeave={() => !isDraggingRef.current && (showTooltipRef.current = { ...showTooltipRef.current, max: false }) && forceUpdate()}
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

/* ── Scale Rating Slider component ── */
function ScaleRatingSlider({ question, answer, onAnswer, readOnly }) {
  const min = question.min ?? 1;
  const max = question.max ?? 5;
  const step = question.step ?? 1;
  const currentValue = answer?.value ?? Math.ceil((min + max) / 2);

  const handleChange = (e) => {
    if (readOnly) return;
    onAnswer({
      questionId: question.id,
      value: Number(e.target.value),
      timestamp: Date.now(),
    });
  };

  return (
    <div style={{ width: '100%', padding: '4px 0' }}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={currentValue}
        onChange={handleChange}
        disabled={readOnly}
        style={{ width: '100%', accentColor: 'var(--consumer-purple)' }}
      />
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '6px',
      }}>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500' }}>
          {question.minLabel || min}
        </span>
        <span style={{
          fontSize: '13px',
          fontWeight: '700',
          color: 'var(--consumer-purple)',
          background: 'rgba(139, 92, 246, 0.1)',
          padding: '2px 12px',
          borderRadius: '12px',
        }}>
          {currentValue}/{max}
        </span>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500' }}>
          {question.maxLabel || max}
        </span>
      </div>
    </div>
  );
}

/* ── Unified chip-row for every question type ── */
function ChipRow({ question, answer, onAnswer, readOnly }) {
  const selected = getSelectedOptions(question, answer);
  const label = question.rowLabel || question.question.slice(0, 20);

  // Debug logging for development
  if (process.env.NODE_ENV === 'development') {
    React.useEffect(() => {
      console.log('ChipRow debug:', {
        questionId: question.id,
        questionType: question.type,
        answer,
        selected,
        options: question.options?.slice(0, 3)
      });
    }, [question.id, answer, selected]);
  }

  /* --- scale-rating: single value slider --- */
  if (question.type === 'scale-rating') {
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
            <ScaleRatingSlider
              question={question}
              answer={answer}
              onAnswer={onAnswer}
              readOnly={readOnly}
            />
          </div>
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

  /* --- image-select: image card grid selection --- */
  if (question.type === 'image-select') {
    const selected = getSelectedOptions(question, answer)[0] || null;

    console.log('[ChipRow] Image-select rendering:', {
      questionId: question.id,
      selected,
      answer,
      optionsCount: question.options?.length,
      hasImages: question.options?.some(opt => opt.imageUrl)
    });

    return (
      <div style={{
        padding: '10px 0',
        borderBottom: '1px solid var(--color-border-subtle)',
      }}>
        {label && (
          <div style={{
            fontSize: '13px',
            color: 'var(--text-secondary)',
            fontWeight: '500',
            marginBottom: '12px',
          }}>
            {label}
          </div>
        )}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
        }}>
          {question.options?.map(opt => {
            const isSelected = selected === (opt.id || opt.value);
            const hasImage = !!opt.imageUrl;

            return (
              <div
                key={opt.id || opt.value}
                onClick={() => {
                  if (readOnly) return;
                  console.log('[ChipRow] Image card clicked:', {
                    questionId: question.id,
                    optionId: opt.id || opt.value,
                    label: opt.label
                  });
                  onAnswer({
                    questionId: question.id,
                    selectedOptions: [opt.id || opt.value],
                    timestamp: Date.now(),
                  });
                }}
                style={{
                  position: 'relative',
                  borderRadius: '12px',
                  border: isSelected ? '2px solid var(--consumer-purple)' : '1px solid var(--border-color)',
                  background: isSelected ? 'var(--consumer-purple-light)' : 'var(--card-background)',
                  cursor: readOnly ? 'default' : 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                  overflow: 'hidden',
                  ...(readOnly ? {} : {
                    ':hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                    }
                  })
                }}
                onMouseEnter={(e) => {
                  if (!readOnly) {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!readOnly) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                {/* Image */}
                {hasImage ? (
                  <img
                    src={opt.imageUrl}
                    alt={opt.label}
                    style={{
                      width: '100%',
                      height: '160px',
                      objectFit: 'cover',
                      objectPosition: 'center',
                      display: 'block',
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '160px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--color-background-subtle)',
                    color: 'var(--text-tertiary)',
                    fontSize: '40px',
                  }}>
                    🖼️
                  </div>
                )}

                {/* Selection Checkmark */}
                {isSelected && (
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '32px',
                    height: '32px',
                    background: 'var(--consumer-purple)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}

                {/* Label */}
                <div style={{
                  padding: '12px',
                  borderTop: isSelected ? 'none' : '1px solid var(--color-border-subtle)',
                }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: isSelected ? 'var(--consumer-purple)' : 'var(--text-primary)',
                    textAlign: 'center',
                  }}>
                    {opt.label}
                  </div>
                  {opt.description && (
                    <div style={{
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                      textAlign: 'center',
                      marginTop: '4px',
                    }}>
                      {opt.description}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  /* --- color-palette: render colour swatches instead of text chips --- */
  if (question.type === 'color-palette') {
    const selectedOpt = getSelectedOptions(question, answer)[0] || null;

    return (
      <div style={{
        padding: '10px 0',
        borderBottom: '1px solid var(--color-border-subtle)',
      }}>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500', marginBottom: '10px' }}>
          {label}
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {question.options?.map(opt => {
            const isSelected = selectedOpt === (opt.id || opt.value);
            const hexColor = opt.value;
            return (
              <button
                key={opt.id || opt.value}
                type="button"
                onClick={readOnly ? undefined : () => onAnswer({
                  questionId: question.id,
                  selectedOptions: [opt.id || opt.value],
                  timestamp: Date.now(),
                })}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: hexColor,
                  border: isSelected ? '3px solid var(--consumer-purple)' : '2px solid var(--border-color)',
                  cursor: readOnly ? 'default' : 'pointer',
                  outline: isSelected ? '2px solid var(--consumer-purple-light)' : 'none',
                  outlineOffset: '2px',
                  transition: 'border 0.15s, outline 0.15s, transform 0.15s',
                  transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                  padding: 0,
                  position: 'relative',
                }}
                title={hexColor}
              >
                {isSelected && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"
                    style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
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
      // Single-choice: toggle selection
      newSelected = selected.includes(optionId) ? [] : [optionId];
    }

    // Consistent answer structure for all question types
    const answerData = {
      questionId: question.id,
      selectedOptions: newSelected,
      timestamp: Date.now(),
    };

    // Add value field only for hybrid-select (free-text input compatibility)
    if (question.type === 'hybrid-select') {
      answerData.value = '';  // Clear free-text when chip is selected
    }

    onAnswer(answerData);
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
              key={opt.id || opt.value}
              iconName={opt.icon}
              label={opt.label}
              selected={selected.includes(opt.id) || selected.includes(opt.value)}
              onClick={() => handleChipClick(opt.id || opt.value)}
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

  if (process.env.NODE_ENV === 'development') {
    console.log('[JourneyQuestionCard] Validation check:', {
      batchLabel: batch.label,
      requiredQuestions: batch.questions.filter(q => q.required).map(q => ({
        id: q.id,
        type: q.type,
        isAnswered: isQuestionAnswered(q, answers[q.id]),
        answer: answers[q.id]
      })),
      allAnswered: allAnswered,
      submitting: submitting,
      isDisabled: !allAnswered || submitting
    });
  }

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

        {/* Confirm pill — shows badge when frozen, button when active */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          {readOnly ? (
            <div style={{
              padding: '8px 24px',
              borderRadius: '9999px',
              background: 'var(--gradient-user-answer)',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              animation: 'fadeIn 0.3s ease-in-out',
            }}>
              ✓ Confirmed
            </div>
          ) : (
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
          )}
        </div>
      </div>

      <style>{`
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(4px); }
        to { opacity: 1; transform: translateY(0); }
      }

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
