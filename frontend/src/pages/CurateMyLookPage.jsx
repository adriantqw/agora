import { useState, useMemo, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/common/Header/Header';
import Mascot from '../components/common/Mascot/Mascot';
import JourneyQuestionCard from '../components/consumer/JourneyBuilder/JourneyQuestionCard';
import JourneyBuilderSidebar from '../components/consumer/JourneyBuilder/JourneyBuilderSidebar';
import curateMyFitService from '../services/curateMyFitService';

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
      return !!answer.selectedOptions && answer.selectedOptions.length > 0;
    case 'dual-range':
      return answer.minValue !== undefined && answer.maxValue !== undefined;
    default:
      return !!answer.value || !!answer.selectedOptions?.length || !!answer.freeText;
  }
}

// ── Resolve a single answer to a human-readable string ──
function resolveAnswerLabel(question, answer) {
  if (!answer) return null;
  switch (question.type) {
    case 'multi-select': {
      if (!answer.selectedOptions?.length || !question.options) return null;
      const labels = answer.selectedOptions
        .map(value => question.options.find(o => o.value === value)?.label)
        .filter(Boolean);
      return labels.length ? labels.join(', ') : null;
    }
    case 'single-choice': {
      if (!answer.selectedOptions?.length || !question.options) return null;
      const opt = question.options.find(o => o.value === answer.selectedOptions[0]);
      return opt?.label || null;
    }
    case 'hybrid-select': {
      if (answer.selectedOptions?.length && question.options) {
        const opt = question.options.find(o => o.value === answer.selectedOptions[0]);
        if (opt) return opt.label;
      }
      const free = typeof answer.value === 'string' ? answer.value.trim() : '';
      return free || null;
    }
    case 'scale-rating': {
      if (answer.value === undefined || answer.value === null) return null;
      return '$'.repeat(Number(answer.value));
    }
    case 'free-text': {
      const val = typeof answer.value === 'string' ? answer.value.trim() : '';
      return val || null;
    }
    case 'dual-range': {
      if (answer.minValue === undefined || answer.maxValue === undefined) return null;
      return `$${answer.minValue} - $${answer.maxValue}`;
    }
    default:
      return answer.value != null ? String(answer.value) : null;
  }
}

function buildConfirmSummary(batch, answers) {
  const lines = [];
  for (const q of batch.questions) {
    const value = resolveAnswerLabel(q, answers[q.id]);
    if (value == null || value === '') continue;
    lines.push({ label: q.rowLabel || q.question, value });
  }
  return lines;
}

function ConfirmBubble({ lines }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{
        background: 'var(--gradient-user-answer)',
        color: '#ffffff',
        padding: '16px 24px',
        borderRadius: '24px 24px 4px 24px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        maxWidth: '80%',
        animation: 'fadeInBatch 0.4s ease-out',
      }}>
        <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: lines.length ? '8px' : 0 }}>
          Confirmed ✓
        </div>
        {lines.map((line, i) => (
          <div key={i} style={{ fontSize: '13px', lineHeight: '1.6' }}>
            <span style={{ fontWeight: 600, opacity: 0.6 }}>{line.label}: </span>
            <span>{line.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Transform backend question format to frontend format
function transformQuestion(backendQuestion) {
  return {
    id: backendQuestion.id,
    type: backendQuestion.type,
    question: backendQuestion.question,
    rowLabel: backendQuestion.rowLabel,
    required: backendQuestion.required,
    options: backendQuestion.options?.map(opt => ({
      value: opt.value,
      label: opt.label,
      icon: opt.iconName,
      // Filter out temp file paths that frontend can't access
      imageUrl: opt.imageUrl && !opt.imageUrl.startsWith('/var/') && !opt.imageUrl.startsWith('/tmp/')
        ? opt.imageUrl
        : null, // Fallback to no image if temp path
      description: opt.description,
    })) || [],
    placeholder: backendQuestion.placeholder,
    min: backendQuestion.minValue,
    max: backendQuestion.maxValue,
    step: 1,
    minGap: backendQuestion.minValue !== undefined ? Math.max(1, (backendQuestion.maxValue - backendQuestion.minValue) / 20) : 50,
    multiSelect: backendQuestion.multiSelect,
  };
}

// Extract foundations from summaryUpdates
function extractFoundations(summaryUpdates) {
  const foundations = summaryUpdates?.foundations || {};
  const rows = [];

  if (foundations.location) {
    rows.push({ label: 'Location', values: [foundations.location] });
  }
  if (foundations.style) {
    rows.push({ label: 'Style', values: [foundations.style] });
  }
  if (foundations.occasion) {
    rows.push({ label: 'Occasion', values: [foundations.occasion] });
  }
  if (foundations.age) {
    rows.push({ label: 'Age', values: [foundations.age] });
  }
  if (foundations.sizing) {
    rows.push({ label: 'Sizing', values: [foundations.sizing] });
  }

  return rows;
}

export default function CurateMyLookPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialQuery = location.state?.searchQuery || '';
  const initialImages = location.state?.images || [];

  // API state
  const [threadId, setThreadId] = useState(null);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // UI state
  const [answers, setAnswers] = useState({});
  const [currentBatch, setCurrentBatch] = useState(0);
  const [confirmedBatches, setConfirmedBatches] = useState(new Set());
  const batch2Ref = useRef(null);

  // Summary state from API
  const [journeyTitle, setJourneyTitle] = useState('My Journey');
  const [foundations, setFoundations] = useState([]);
  const [narrativeText, setNarrativeText] = useState('');

  // Initialize: Call startBatch on mount
  const initializedRef = useRef(false);

  useEffect(() => {
    const initializeBatch = async () => {
      // Prevent double-execution in Strict Mode
      if (initializedRef.current) return;
      initializedRef.current = true;

      if (!initialQuery && initialImages.length === 0) {
        setError('No search query or images provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Convert base64 images back to File objects if needed
        const imageFiles = [];
        for (let i = 0; i < initialImages.length; i++) {
          const base64 = initialImages[i];
          if (base64.startsWith('data:image')) {
            // Convert base64 to File
            const response = await fetch(base64);
            const blob = await response.blob();
            const file = new File([blob], `image-${i}.jpg`, { type: 'image/jpeg' });
            imageFiles.push(file);
          }
        }

        const response = await curateMyFitService.startBatch(initialQuery, imageFiles);

        // Transform backend response to frontend format
        const firstBatch = {
          id: 'batch-1',
          label: 'Batch 1',
          blurb: response.blurb,
          hasConfirmButton: true,
          questions: response.questions.map(transformQuestion),
        };

        setThreadId(response.threadId);
        setBatches([firstBatch]);

        // Update summary from API
        if (response.summaryUpdates) {
          setJourneyTitle(response.summaryUpdates.title || 'My Journey');
          setFoundations(extractFoundations(response.summaryUpdates));
          setNarrativeText(response.summaryUpdates.narrative || '');
        }

        setLoading(false);
      } catch (err) {
        console.error('Failed to start batch:', err);

        // Provide specific error messages based on error type
        let errorMessage = 'Failed to load questions. Please try again.';

        if (err.message.includes('Authentication required')) {
          errorMessage = 'Your session has expired. Please log in again.';
          // Auto-redirect to login after 2 seconds
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        } else if (err.message.includes('Network') || err.message.includes('Failed to fetch')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else if (err.message) {
          errorMessage = err.message; // Use backend's error message
        }

        setError(errorMessage);
        setLoading(false);
      }
    };

    initializeBatch();
  }, []); // Only run once on mount

  const isReady = useMemo(() => {
    return batches.every(batch =>
      batch.questions
        .filter(q => q.required)
        .every(q => isQuestionAnswered(q, answers[q.id]))
    );
  }, [answers, batches]);

  // --- Handlers ---
  const handleAnswer = (answer) => {
    console.log('[CurateMyLookPage] handleAnswer called:', {
      questionId: answer.questionId,
      answerObject: answer,
      savedToState: { [answer.questionId]: answer }
    });
    setAnswers(prev => ({ ...prev, [answer.questionId]: answer }));
  };

  const handleConfirm = async (batchIndex) => {
    // Mark batch as confirmed
    setConfirmedBatches(prev => new Set([...prev, batchIndex]));

    // If not the last batch, just scroll to next
    if (batchIndex < batches.length - 1) {
      setCurrentBatch(batchIndex + 1);
      setTimeout(() => {
        batch2Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      return;
    }

    // If this is the last batch, submit answers to backend
    try {
      setSubmitting(true);
      setError(null);

      // Prepare answers in backend format
      const backendAnswers = {};
      Object.keys(answers).forEach(questionId => {
        const answer = answers[questionId];
        backendAnswers[questionId] = {
          selectedOptions: answer.selectedOptions || undefined,
          freeText: answer.freeText || undefined,
          minValue: answer.minValue || undefined,
          maxValue: answer.maxValue || undefined,
          timestamp: answer.timestamp || Date.now(),
        };
      });

      const response = await curateMyFitService.submitBatchAnswers(threadId, backendAnswers);

      if (response.hasMore) {
        // Add next batch
        const nextBatch = {
          id: `batch-${batches.length + 1}`,
          label: `Batch ${batches.length + 1}`,
          blurb: response.blurb,
          hasConfirmButton: true,
          questions: response.questions.map(transformQuestion),
        };

        setBatches(prev => [...prev, nextBatch]);
        setCurrentBatch(batches.length);

        // Update summary
        if (response.summaryUpdates) {
          setJourneyTitle(response.summaryUpdates.title || journeyTitle);
          setFoundations(extractFoundations(response.summaryUpdates));
          setNarrativeText(response.summaryUpdates.narrative || '');
        }

        // Scroll to new batch
        setTimeout(() => {
          batch2Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      } else {
        // Journey complete - navigate to recommendations
        const journeyId = response.journeyId;
        // Use backend's nextStep.url if provided, otherwise default to /recommendations
        const nextStepUrl = response.nextStep?.url || `/recommendations?journeyId=${journeyId}`;
        navigate(nextStepUrl);
      }

      setSubmitting(false);
    } catch (err) {
      console.error('Error confirming batch:', err);

      let errorMessage = 'Failed to submit answers. Please try again.';

      if (err.message.includes('Authentication required')) {
        errorMessage = 'Your session has expired. Redirecting to login...';
        setTimeout(() => window.location.href = '/login', 2000);
      } else if (err.message.includes('Network') || err.message.includes('Failed to fetch')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setSubmitting(false);
    }
  };

  const handleQuickMatch = () => {
    console.log('Quick Match clicked', { foundations, narrativeText });
  };

  const handleLetsGo = async () => {
    // Submit final batch
    await handleConfirm(batches.length - 1);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff9f5',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #793DB0',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }} />
          <div style={{ fontSize: '16px', color: '#666' }}>Loading your journey...</div>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff9f5',
      }}>
        <div style={{
          maxWidth: '500px',
          padding: '32px',
          backgroundColor: '#fff',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>😔</div>
          <div style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: '#333' }}>
            Oops! Something went wrong
          </div>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '24px' }}>
            {error}
          </div>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#793DB0',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
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
      backgroundColor: '#fff9f5',
      backgroundImage: `
        radial-gradient(circle at 50% 50%, #ffecd9 0%, rgba(255, 236, 217, 0) 65%),
        radial-gradient(circle at 0% 50%, #ffb6e6 0%, transparent 60%),
        radial-gradient(circle at 100% 0%, #9dcaff 0%, transparent 60%)
      `,
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <Header variant="full" />

      <div className="curate-grid" style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        height: 'calc(100vh - 65px)',
      }}>
        {/* Left column — scrollable questions */}
        <div style={{
          overflowY: 'auto',
          padding: '32px',
          opacity: submitting ? 0.6 : 1,
          pointerEvents: submitting ? 'none' : 'auto',
        }}>
          {(initialQuery || initialImages.length > 0) && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
              <div style={{
                background: 'var(--gradient-user-answer)',
                color: '#ffffff',
                padding: '16px 24px',
                borderRadius: '24px 24px 4px 24px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                maxWidth: '80%',
                animation: 'fadeInBatch 0.4s ease-out',
              }}>
                {initialImages.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: initialQuery ? '8px' : 0 }}>
                    {initialImages.map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt=""
                        style={{
                          width: '56px',
                          height: '56px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                        }}
                      />
                    ))}
                  </div>
                )}
                {initialQuery && <div style={{ fontSize: '14px', lineHeight: '1.5' }}>{initialQuery}</div>}
              </div>
            </div>
          )}

          {batches.map((batch, batchIndex) => (
            <div key={batch.id} ref={batchIndex === 1 ? batch2Ref : null} style={{ marginBottom: batchIndex < batches.length - 1 ? '32px' : 0 }}>
              {(batchIndex === 0 || currentBatch >= batchIndex) && (
                <>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    lineHeight: '1.4',
                    marginBottom: '16px',
                    background: 'var(--gradient-user-answer)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    animation: 'fadeInBatch 0.4s ease-out',
                  }}>
                    {batch.blurb}
                  </div>

                  <JourneyQuestionCard
                    batch={batch}
                    answers={answers}
                    onAnswer={handleAnswer}
                    onContinue={() => handleConfirm(batchIndex)}
                    readOnly={confirmedBatches.has(batchIndex)}
                    submitting={submitting}
                  />
                  {confirmedBatches.has(batchIndex) && (
                    <div style={{ marginTop: '16px' }}>
                      <ConfirmBubble lines={buildConfirmSummary(batch, answers)} />
                    </div>
                  )}
                </>
              )}
            </div>
          ))}

          {submitting && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              marginTop: '16px',
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                border: '3px solid #f3f3f3',
                borderTop: '3px solid #793DB0',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginRight: '12px',
              }} />
              <div style={{ fontSize: '14px', color: '#666' }}>Processing your answers...</div>
            </div>
          )}
        </div>

        {/* Right column — full-height sidebar */}
        <div style={{ height: '100%', overflow: 'hidden', display: 'flex', alignItems: 'center', marginRight: '16px' }}>
          <JourneyBuilderSidebar
            foundations={foundations}
            narrativeText={narrativeText}
            currentBatch={currentBatch}
            journeyTitle={journeyTitle}
          />
        </div>
      </div>

      {/* Mascot */}
      <Mascot
        variant="default"
        position="bottom-right"
        isSearching={!isReady || submitting}
        message={confirmedBatches.size > 0 ? (isReady ? "Let's Goooo!" : "Quick Match →") : ''}
        onClick={isReady && !submitting ? handleLetsGo : handleQuickMatch}
      />

      <style>{`
        @keyframes fadeInBatch {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .curate-grid > div:first-child {
            padding: 16px !important;
          }
          .mascot-container {
            z-index: 50 !important;
          }
        }
      `}</style>
    </div>
  );
}
