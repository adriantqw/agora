/**
 * QuizProgress Component
 *
 * Horizontal 3-dot progress indicator showing quiz completion status
 */

import { CONSUMER_THEME } from '../../../contexts/SearchContext';

export default function QuizProgress({ currentStep, totalSteps, onStepClick }) {
  return (
    <div
      role="progressbar"
      aria-valuenow={currentStep + 1}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      aria-label={`Question ${currentStep + 1} of ${totalSteps}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 0',
        gap: '8px'
      }}
    >
      {Array.from({ length: totalSteps }).map((_, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isActive = isCompleted || isCurrent;

        return (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {/* Dot */}
            <button
              onClick={() => onStepClick && onStepClick(index)}
              disabled={!onStepClick}
              aria-label={`Question ${index + 1}${isCompleted ? ' (completed)' : isCurrent ? ' (current)' : ''}`}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: isActive ? 'none' : '2px solid #cbd5e0',
                background: isActive ? CONSUMER_THEME.gradient : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: onStepClick ? 'pointer' : 'default',
                transition: 'all 0.3s ease',
                boxShadow: isCurrent ? `0 0 0 4px ${CONSUMER_THEME.primaryGlow}` : 'none',
                transform: isCurrent ? 'scale(1.1)' : 'scale(1)'
              }}
            >
              {isCompleted ? (
                // Checkmark icon
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                // Step number or empty for future steps
                <span
                  style={{
                    color: isCurrent ? 'white' : '#a0aec0',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}
                >
                  {isCurrent ? index + 1 : ''}
                </span>
              )}
            </button>

            {/* Progress line (not shown after last dot) */}
            {index < totalSteps - 1 && (
              <div
                style={{
                  width: '80px',
                  height: '3px',
                  background: isCompleted ? CONSUMER_THEME.gradient : '#e2e8f0',
                  borderRadius: '2px',
                  transition: 'background 0.3s ease'
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
