/**
 * QuestionRenderer Component
 *
 * Orchestrates component rendering based on question.type
 * Handles error states for unknown types and passes common props to all components
 */

import { getComponentByType, isComponentSupported } from './registry/ComponentRegistry.jsx';
import STYLE_GUIDE from '../../config/styleGuide.js';
import { getQuestionContainerStyle, getQuestionTextStyle } from '../../utils/styleHelpers.js';

/**
 * @typedef {Object} QuestionRendererProps
 * @property {Object} question - Question configuration
 * @property {Function} onAnswer - Callback when question is answered
 * @property {Object} [currentAnswer] - Previously saved answer for this question
 * @property {boolean} [disabled] - Disable all interactions
 * @property {boolean} [showQuestionText] - Whether to show the question text (default: true)
 */

export default function QuestionRenderer({
  question,
  onAnswer,
  currentAnswer,
  disabled = false,
  showQuestionText = true
}) {
  const { colors, spacing, typography } = STYLE_GUIDE;
  // Validate question object
  if (!question || !question.id || !question.type || !question.question) {
    return (
      <ErrorState
        title="Invalid Question"
        message="Question data is missing required fields (id, type, or question text)."
      />
    );
  }

  // Check if component type is supported
  if (!isComponentSupported(question.type)) {
    return (
      <ErrorState
        title="Unsupported Question Type"
        message={`Question type "${question.type}" is not yet implemented.`}
        details={`Question ID: ${question.id}`}
      />
    );
  }

  // Get the component for this question type
  const Component = getComponentByType(question.type);

  if (!Component) {
    return (
      <ErrorState
        title="Component Not Found"
        message={`No component registered for type "${question.type}".`}
      />
    );
  }

  return (
    <div style={getQuestionContainerStyle()}>
      {/* Question Text */}
      {showQuestionText && (
        <div style={getQuestionTextStyle()}>
          {question.question}
          {question.required && (
            <span style={{
              color: colors.error,
              marginLeft: spacing.xs,
              fontSize: typography.sizes.lg
            }}>
              *
            </span>
          )}
        </div>
      )}

      {/* Question Subtext (optional) */}
      {question.subtext && (
        <p style={{
          fontSize: typography.sizes.sm,
          color: colors.neutral600,
          marginTop: `-${spacing.md}`,
          marginBottom: spacing.lg,
          lineHeight: typography.lineHeights.normal
        }}>
          {question.subtext}
        </p>
      )}

      {/* Render the actual component */}
      <Component
        question={question}
        onAnswer={onAnswer}
        currentAnswer={currentAnswer}
        disabled={disabled}
      />
    </div>
  );
}

/**
 * ErrorState Component
 * Displays error messages when question cannot be rendered
 */
function ErrorState({ title, message, details }) {
  const { colors, spacing, radius, typography } = STYLE_GUIDE;
  return (
    <div style={{
      ...getQuestionContainerStyle(),
      background: colors.errorLight,
      border: `2px solid ${colors.error}`
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: spacing.md
      }}>
        {/* Error Icon */}
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: radius.full,
          background: colors.error,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>

        {/* Error Content */}
        <div style={{ flex: 1 }}>
          <h3 style={{
            fontSize: typography.sizes.lg,
            fontWeight: typography.weights.semibold,
            color: colors.error,
            margin: `0 0 ${spacing.sm}`,
            fontFamily: typography.fontFamily
          }}>
            {title}
          </h3>

          <p style={{
            fontSize: typography.sizes.md,
            color: colors.neutral900,
            margin: details ? `0 0 ${spacing.sm}` : 0,
            fontFamily: typography.fontFamily,
            lineHeight: typography.lineHeights.normal
          }}>
            {message}
          </p>

          {details && (
            <p style={{
              fontSize: typography.sizes.sm,
              color: colors.neutral600,
              margin: 0,
              fontFamily: 'monospace',
              background: colors.neutral100,
              padding: spacing.sm,
              borderRadius: radius.sm,
              marginTop: spacing.sm
            }}>
              {details}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
