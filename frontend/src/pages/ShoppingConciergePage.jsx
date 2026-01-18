/**
 * Shopping Concierge Page
 *
 * AI-powered personalized shopping assistant with 3-step flow:
 * 1. Input Screen - User enters search query
 * 2. Questions Screen - Answer 5 personalized questions
 * 3. Results Screen - View mood board + product recommendations
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QuestionRenderer from '../components/dynamic-forms/QuestionRenderer.jsx';
import conciergeService from '../services/conciergeService.js';
import STYLE_GUIDE from '../config/styleGuide.js';
import { getButtonStyle, getProgressBarStyle, getSpinnerStyle } from '../utils/styleHelpers.js';

const { colors, radius, spacing, typography, shadows } = STYLE_GUIDE;

export default function ShoppingConciergePage() {
  const navigate = useNavigate();

  // Page state
  const [step, setStep] = useState('input'); // 'input' | 'questions' | 'results'
  const [userInput, setUserInput] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle user input submission
  const handleSubmitInput = async () => {
    if (!userInput.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const generatedQuestions = await conciergeService.generateQuestions(userInput);
      setQuestions(generatedQuestions);
      setAnswers(new Array(generatedQuestions.length).fill(null));
      setStep('questions');
      setCurrentQuestionIndex(0);
    } catch (err) {
      setError(err.message || 'Failed to generate questions');
    } finally {
      setLoading(false);
    }
  };

  // Handle answer update
  const handleAnswerQuestion = (answer) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answer;
    setAnswers(newAnswers);
  };

  // Navigate to next question
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSeeResults();
    }
  };

  // Navigate to previous question
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Skip current question
  const handleSkip = () => {
    handleNext();
  };

  // Submit answers and get results
  const handleSeeResults = async () => {
    setLoading(true);
    setError(null);

    try {
      const nonNullAnswers = answers.filter(a => a !== null);
      const result = await conciergeService.submitAnswers(nonNullAnswers);
      setProducts(result.products || []);
      setStep('results');
    } catch (err) {
      setError(err.message || 'Failed to get recommendations');
    } finally {
      setLoading(false);
    }
  };

  // Start over
  const handleStartOver = () => {
    setStep('input');
    setUserInput('');
    setQuestions([]);
    setAnswers([]);
    setProducts([]);
    setCurrentQuestionIndex(0);
    setError(null);
  };

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.background,
      fontFamily: typography.fontFamily
    }}>
      {/* Header */}
      <header style={{
        background: colors.surface,
        borderBottom: `1px solid ${colors.neutral300}`,
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: shadows.sm
      }}>
        <div style={{
          padding: `${spacing.lg} ${spacing.xxxl}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Logo */}
          <div
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing.md,
              cursor: 'pointer'
            }}
          >
            <div style={{
              width: '44px',
              height: '44px',
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
              borderRadius: radius.md,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: shadows.blue
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
            </div>
            <span style={{ fontWeight: '700', fontSize: '24px', color: colors.neutral900 }}>Agora</span>
          </div>

          {/* Close Button */}
          <button
            onClick={() => navigate('/')}
            style={{
              ...getButtonStyle('ghost'),
              padding: `${spacing.md} ${spacing.lg}`
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Close
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Step 1: Input Screen */}
        {step === 'input' && (
          <div style={{
            background: `linear-gradient(135deg, ${colors.neutral900} 0%, ${colors.neutral800} 100%)`,
            padding: `${spacing.xxxl} ${spacing.xxxl}`,
            minHeight: 'calc(100vh - 80px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ maxWidth: '700px', width: '100%', textAlign: 'center' }}>
              {/* Title */}
              <h1 style={{
                fontSize: typography.sizes.hero,
                fontWeight: typography.weights.bold,
                color: colors.surface,
                margin: `0 0 ${spacing.lg}`,
                lineHeight: typography.lineHeights.tight
              }}>
                Your Personal Shopping Assistant
              </h1>

              <p style={{
                fontSize: typography.sizes.xl,
                color: colors.neutral500,
                margin: `0 0 ${spacing.xxxl}`,
                lineHeight: typography.lineHeights.normal
              }}>
                Tell us what you're looking for, and we'll help you find the perfect match with personalized questions.
              </p>

              {/* Search Input */}
              <div style={{ position: 'relative', marginBottom: spacing.xl }}>
                <input
                  type="text"
                  placeholder="What are you looking for?"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && userInput.trim()) {
                      handleSubmitInput();
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: `${spacing.xl} ${spacing.xxl}`,
                    fontSize: typography.sizes.lg,
                    border: `2px solid ${colors.neutral700}`,
                    borderRadius: radius.lg,
                    background: colors.surface,
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = colors.primary;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = colors.neutral700;
                  }}
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmitInput}
                disabled={!userInput.trim() || loading}
                style={{
                  ...getButtonStyle('primary', !userInput.trim() || loading),
                  padding: `${spacing.lg} ${spacing.xxxl}`,
                  fontSize: typography.sizes.lg,
                  width: '100%',
                  marginBottom: spacing.xxl
                }}
              >
                {loading ? (
                  <>
                    <div style={getSpinnerStyle('md')} />
                    Generating Questions...
                  </>
                ) : (
                  <>
                    Get Personalized Recommendations
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="5" y1="12" x2="19" y2="12"/>
                      <polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </>
                )}
              </button>

              {/* Suggestion Chips */}
              <div>
                <p style={{
                  fontSize: typography.sizes.sm,
                  color: colors.neutral500,
                  marginBottom: spacing.md
                }}>
                  Try these popular searches:
                </p>

                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: spacing.md,
                  justifyContent: 'center'
                }}>
                  {conciergeService.getSuggestionChips().map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setUserInput(suggestion)}
                      style={{
                        padding: `${spacing.sm} ${spacing.lg}`,
                        fontSize: typography.sizes.sm,
                        color: colors.neutral400,
                        background: colors.neutral800,
                        border: `1px solid ${colors.neutral700}`,
                        borderRadius: radius.full,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = colors.neutral700;
                        e.currentTarget.style.color = colors.surface;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = colors.neutral800;
                        e.currentTarget.style.color = colors.neutral400;
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div style={{
                  marginTop: spacing.xxl,
                  padding: spacing.lg,
                  background: colors.errorLight,
                  border: `1px solid ${colors.error}`,
                  borderRadius: radius.md,
                  color: colors.error,
                  fontSize: typography.sizes.md
                }}>
                  {error}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Questions Screen */}
        {step === 'questions' && currentQuestion && (
          <div style={{
            maxWidth: '900px',
            margin: '0 auto',
            padding: `${spacing.xxxl} ${spacing.xl}`
          }}>
            {/* Progress Bar */}
            <div style={{ marginBottom: spacing.xxl }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: spacing.md
              }}>
                <span style={{
                  fontSize: typography.sizes.sm,
                  color: colors.neutral600,
                  fontWeight: typography.weights.medium
                }}>
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <span style={{
                  fontSize: typography.sizes.sm,
                  color: colors.primary,
                  fontWeight: typography.weights.semibold
                }}>
                  {Math.round(progress)}% Complete
                </span>
              </div>

              <div style={getProgressBarStyle(progress).container}>
                <div style={getProgressBarStyle(progress).fill} />
              </div>
            </div>

            {/* Question */}
            <QuestionRenderer
              question={currentQuestion}
              onAnswer={handleAnswerQuestion}
              currentAnswer={currentAnswer}
              disabled={loading}
            />

            {/* Navigation Buttons */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: spacing.lg,
              marginTop: spacing.xxl
            }}>
              {/* Previous Button */}
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                style={getButtonStyle('secondary', currentQuestionIndex === 0)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="19" y1="12" x2="5" y2="12"/>
                  <polyline points="12 19 5 12 12 5"/>
                </svg>
                Previous
              </button>

              <div style={{ display: 'flex', gap: spacing.md }}>
                {/* Skip Button */}
                <button
                  onClick={handleSkip}
                  style={getButtonStyle('ghost')}
                >
                  Skip
                </button>

                {/* Next / See Results Button */}
                <button
                  onClick={handleNext}
                  disabled={loading}
                  style={getButtonStyle('primary', loading)}
                >
                  {loading ? (
                    <>
                      <div style={getSpinnerStyle('sm')} />
                      Loading...
                    </>
                  ) : currentQuestionIndex === questions.length - 1 ? (
                    <>
                      See Results
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </>
                  ) : (
                    <>
                      Next
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="5" y1="12" x2="19" y2="12"/>
                        <polyline points="12 5 19 12 12 19"/>
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Results Screen */}
        {step === 'results' && (
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: `${spacing.xxxl} ${spacing.xl}`
          }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: spacing.xxxl }}>
              <h1 style={{
                fontSize: typography.sizes.xxxl,
                fontWeight: typography.weights.bold,
                color: colors.neutral900,
                margin: `0 0 ${spacing.md}`
              }}>
                Your Personalized Recommendations
              </h1>
              <p style={{
                fontSize: typography.sizes.md,
                color: colors.neutral600,
                margin: 0
              }}>
                Based on your preferences, here are {products.length} products we think you'll love
              </p>
            </div>

            {/* Products Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: spacing.xl,
              marginBottom: spacing.xxxl
            }}>
              {products.map((product) => (
                <div
                  key={product.id}
                  style={{
                    background: colors.surface,
                    borderRadius: radius.lg,
                    overflow: 'hidden',
                    border: `1px solid ${colors.neutral300}`,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = shadows.md;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Product Image */}
                  <div style={{
                    aspectRatio: '1',
                    background: colors.neutral100,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                  }}>
                    {product.image ? (
                      <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={colors.neutral400} strokeWidth="1">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                    )}

                    {product.tag && (
                      <span style={{
                        position: 'absolute',
                        top: spacing.md,
                        left: spacing.md,
                        padding: `${spacing.xs} ${spacing.md}`,
                        fontSize: typography.sizes.xs,
                        fontWeight: typography.weights.semibold,
                        background: product.tag === 'Sale' ? colors.errorLight : product.tag === 'New' ? colors.successLight : colors.primaryLight,
                        color: product.tag === 'Sale' ? colors.error : product.tag === 'New' ? colors.success : colors.primary,
                        borderRadius: radius.sm
                      }}>
                        {product.tag}
                      </span>
                    )}
                  </div>

                  {/* Product Info */}
                  <div style={{ padding: spacing.lg }}>
                    <p style={{ margin: `0 0 ${spacing.xs}`, fontSize: typography.sizes.xs, color: colors.neutral600 }}>
                      {product.category}
                    </p>
                    <h3 style={{ margin: `0 0 ${spacing.md}`, fontSize: typography.sizes.md, fontWeight: typography.weights.semibold, color: colors.neutral900 }}>
                      {product.name}
                    </h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.neutral900 }}>
                        ${product.price.toFixed(2)}
                      </span>
                      <button
                        style={{
                          padding: `${spacing.sm} ${spacing.lg}`,
                          fontSize: typography.sizes.sm,
                          fontWeight: typography.weights.semibold,
                          color: colors.surface,
                          background: colors.primary,
                          border: 'none',
                          borderRadius: radius.sm,
                          cursor: 'pointer'
                        }}
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: spacing.lg
            }}>
              <button
                onClick={handleStartOver}
                style={getButtonStyle('secondary')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="1 4 1 10 7 10"/>
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                </svg>
                Start Over
              </button>
              <button
                onClick={() => navigate('/')}
                style={getButtonStyle('primary')}
              >
                Back to Shop
              </button>
            </div>
          </div>
        )}
      </main>

      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
