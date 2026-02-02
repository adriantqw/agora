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
export default function JourneyQuestionCard({ batch, answers, onAnswer, onContinue, readOnly }) {
  const allAnswered = batch.questions
    .filter(q => q.required)
    .every(q => isQuestionAnswered(q, answers[q.id]));

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
        color: 'var(--consumer-purple)',
        marginBottom: '16px',
      }}>
        <Sparkles size={14} color='var(--consumer-purple)' />
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
            disabled={!allAnswered}
            style={{
              padding: '8px 24px',
              borderRadius: '9999px',
              border: `1px solid ${allAnswered ? 'var(--consumer-purple)' : 'var(--text-muted)'}`,
              background: 'transparent',
              color: allAnswered ? 'var(--consumer-purple)' : 'var(--text-muted)',
              fontSize: '14px',
              fontWeight: '600',
              cursor: allAnswered ? 'pointer' : 'not-allowed',
              transition: 'border-color 0.2s, color 0.2s',
            }}
          >
            Confirm
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
