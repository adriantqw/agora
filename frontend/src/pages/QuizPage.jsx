import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header/Header';
import QuestionRenderer from '../components/dynamic-forms/QuestionRenderer';
import QuizProgress from '../components/quiz/QuizProgress/QuizProgress';
import SearchSummaryPanel from '../components/quiz/SearchSummaryPanel/SearchSummaryPanel';
import { useSearchContext, CONSUMER_THEME } from '../contexts/SearchContext';
import quizService from '../services/quizService';

export default function QuizPage() {
  const navigate = useNavigate();
  const {
    currentStep,
    totalSteps,
    setTotalSteps,
    answers,
    saveAnswer,
    updateFilter,
    nextStep,
    previousStep,
    submitSearch,
    resetSearch,
    isLoading,
    setIsLoading,
    error,
    setError
  } = useSearchContext();

  const [questions, setQuestions] = useState([]);

  // Load quiz questions on mount
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const quizQuestions = await quizService.loadQuizQuestions();
        setQuestions(quizQuestions);
        setTotalSteps(quizQuestions.length);
      } catch (err) {
        console.error('Failed to load quiz questions:', err);
        setError('Failed to load quiz. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestions();

    // Cleanup: reset search state when leaving page
    return () => {
      // Don't reset if navigating to search results
      if (!window.location.pathname.includes('/search')) {
        resetSearch();
      }
    };
  }, []);

  const currentQuestion = questions[currentStep];
  const isLastStep = currentStep === totalSteps - 1;

  // Handle answer updates
  const handleAnswer = (answer) => {
    // Save answer to context
    saveAnswer(currentQuestion.id, answer);

    // Transform answer to filter and update SearchContext
    const filterResult = quizService.answerToFilter(
      currentQuestion.id,
      answer,
      questions
    );

    if (filterResult) {
      updateFilter(filterResult.category, filterResult.values);
    }
  };

  // Handle navigation
  const handlePrevious = () => {
    if (currentStep > 0) {
      previousStep();
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNext = () => {
    if (isLastStep) {
      handleSubmit();
    } else {
      nextStep();
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = () => {
    const searchData = submitSearch();
    navigate('/search', { state: searchData });
  };

  const handleBack = () => {
    if (window.confirm('Are you sure you want to leave? Your quiz progress will be lost.')) {
      resetSearch();
      navigate('/');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#F9F9F9' }}>
        <Header variant="full" showNav={true} />
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: '16px'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: `4px solid ${CONSUMER_THEME.primaryLight}`,
            borderTopColor: CONSUMER_THEME.primary,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ fontSize: '18px', color: '#718096' }}>Loading your quiz...</p>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  // Error state
  if (error || questions.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: '#F9F9F9' }}>
        <Header variant="full" showNav={true} />
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: '24px',
          padding: '48px'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px'
          }}>😕</div>
          <h2 style={{
            fontSize: '28px',
            fontWeight: '600',
            color: '#2d3748',
            margin: 0
          }}>
            {error || 'No quiz questions available'}
          </h2>
          <button
            onClick={handleBack}
            style={{
              padding: '16px 32px',
              fontSize: '16px',
              fontWeight: '600',
              color: 'white',
              background: CONSUMER_THEME.gradient,
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              boxShadow: `0 4px 16px ${CONSUMER_THEME.primaryGlow}`
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F9F9F9',
      fontFamily: '"Inter", -apple-system, sans-serif'
    }}>
      <Header variant="full" showNav={true} />

      <div
        className="quiz-container"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 400px',
          gap: '48px',
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '48px'
        }}
      >
        {/* Left Column - Quiz Questions */}
        <div className="quiz-questions-column">
          {/* Back Button */}
          <button
            onClick={handleBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'transparent',
              border: 'none',
              color: '#4a5568',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              padding: '8px 0',
              marginBottom: '24px',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = CONSUMER_THEME.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#4a5568';
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          {/* Quiz Progress */}
          <QuizProgress
            currentStep={currentStep}
            totalSteps={totalSteps}
          />

          {/* Current Question */}
          {currentQuestion && (
            <div style={{ marginBottom: '48px' }}>
              <QuestionRenderer
                question={currentQuestion}
                onAnswer={handleAnswer}
                currentAnswer={answers[currentQuestion.id]}
              />
            </div>
          )}

          {/* Navigation Buttons */}
          <div
            className="quiz-navigation"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '16px',
              marginTop: '48px'
            }}
          >
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              style={{
                padding: '16px 32px',
                fontSize: '16px',
                fontWeight: '600',
                color: currentStep === 0 ? '#a0aec0' : '#4a5568',
                background: 'white',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                opacity: currentStep === 0 ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (currentStep !== 0) {
                  e.currentTarget.style.borderColor = CONSUMER_THEME.primary;
                  e.currentTarget.style.color = CONSUMER_THEME.primary;
                }
              }}
              onMouseLeave={(e) => {
                if (currentStep !== 0) {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.color = '#4a5568';
                }
              }}
            >
              Previous
            </button>

            <button
              onClick={handleNext}
              style={{
                padding: '16px 32px',
                fontSize: '16px',
                fontWeight: '600',
                color: 'white',
                background: CONSUMER_THEME.gradient,
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                boxShadow: `0 4px 16px ${CONSUMER_THEME.primaryGlow}`,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = CONSUMER_THEME.gradientHover;
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 6px 20px ${CONSUMER_THEME.primaryGlow}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = CONSUMER_THEME.gradient;
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `0 4px 16px ${CONSUMER_THEME.primaryGlow}`;
              }}
            >
              {isLastStep ? 'See Results' : 'Next'}
            </button>
          </div>
        </div>

        {/* Right Column - Search Summary Panel */}
        <SearchSummaryPanel />
      </div>

      {/* Responsive CSS */}
      <style>{`
        @media (max-width: 1024px) {
          .quiz-container {
            grid-template-columns: 1fr 350px !important;
            gap: 32px !important;
            padding: 32px !important;
          }
        }

        @media (max-width: 768px) {
          .quiz-container {
            grid-template-columns: 1fr !important;
            gap: 0 !important;
            padding: 24px !important;
          }

          .quiz-navigation {
            flex-direction: column !important;
          }

          .quiz-navigation button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
