import { useState, useMemo, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, ChevronDown } from 'lucide-react';
import Markdown from 'react-markdown';
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
      // scale-rating now uses minValue/maxValue like dual-range
      return answer.minValue !== undefined &&
        answer.maxValue !== undefined &&
        answer.minValue !== null &&
        answer.maxValue !== null &&
        answer.minValue < answer.maxValue;
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
      // scale-rating now uses minValue/maxValue like dual-range
      if (answer.minValue === undefined || answer.maxValue === undefined) return null;
      return `$${answer.minValue} - $${answer.maxValue}`;
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

// Extract foundations from summaryUpdates (from complete event)
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

// Extract foundations from raw JourneySchema fields (from streaming journey_field events)
function extractFoundationsFromJourney(journey) {
  const rows = [];
  if (journey.location) rows.push({ label: 'Location', values: [journey.location] });
  if (journey.style_preferences?.length) rows.push({ label: 'Style', values: journey.style_preferences.slice(0, 2) });
  if (journey.occasion) rows.push({ label: 'Occasion', values: [journey.occasion] });
  if (journey.time_of_day) rows.push({ label: 'Time of Day', values: [journey.time_of_day] });
  if (journey.fit_preference) rows.push({ label: 'Sizing', values: [journey.fit_preference] });
  if (journey.season) rows.push({ label: 'Season', values: [journey.season] });
  if (journey.budget_rating != null) rows.push({ label: 'Budget', values: [`${journey.budget_rating}/5`] });
  if (journey.colour_palette?.length) rows.push({ label: 'Colour Palette', values: journey.colour_palette });
  return rows;
}

// Gemini-style thinking dropdown (defined outside component to prevent remount on re-render)
function ThinkingDropdown({ text, isActive, startTime }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const contentRef = useRef(null);

  // Auto-collapse when thinking ends
  useEffect(() => {
    if (!isActive && text) {
      const timer = setTimeout(() => setIsExpanded(false), 600);
      return () => clearTimeout(timer);
    }
    if (isActive) setIsExpanded(true);
  }, [isActive, text]);

  // Auto-scroll content to bottom while streaming
  useEffect(() => {
    if (isExpanded && contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [text, isExpanded]);

  const elapsed = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;

  if (!text && !isActive) return null;

  return (
    <div style={{
      marginBottom: isExpanded ? '16px' : '8px',
      borderRadius: isExpanded ? '12px' : '20px',
      border: isExpanded ? '1px solid rgba(139, 92, 246, 0.15)' : 'none',
      background: isExpanded ? 'rgba(139, 92, 246, 0.04)' : 'transparent',
      overflow: 'hidden',
      animation: 'fadeIn 0.3s ease-out',
      maxWidth: isExpanded ? '75%' : 'fit-content',
      transition: 'all 0.3s ease',
    }}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(prev => !prev)}
        style={{
          width: isExpanded ? '100%' : 'auto',
          display: 'inline-flex',
          alignItems: 'center',
          gap: isExpanded ? '8px' : '5px',
          padding: isExpanded ? '10px 14px' : '5px 12px',
          background: isExpanded ? 'none' : 'rgba(139, 92, 246, 0.08)',
          border: isExpanded ? 'none' : '1px solid rgba(139, 92, 246, 0.12)',
          borderRadius: isExpanded ? '0' : '20px',
          cursor: 'pointer',
          fontSize: isExpanded ? '13px' : '11px',
          fontWeight: '600',
          color: '#793DB0',
          transition: 'all 0.3s ease',
        }}
      >
        <Sparkles size={isExpanded ? 14 : 11} />
        <span style={{ textAlign: 'left' }}>
          {isActive ? 'Thinking' : `Thought for ${elapsed}s`}
        </span>
        {isActive && (
          <span style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                width: '4px', height: '4px',
                backgroundColor: '#793DB0', borderRadius: '50%',
                animation: `wiggle 1.4s ease-in-out infinite ${i * 0.2}s`,
              }} />
            ))}
          </span>
        )}
        <ChevronDown size={isExpanded ? 14 : 11} style={{
          transition: 'transform 0.2s',
          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
        }} />
      </button>

      {/* Collapsible body */}
      <div style={{
        maxHeight: isExpanded ? '200px' : '0px',
        transition: 'max-height 0.3s ease',
        overflow: 'hidden',
      }}>
        <div
          ref={contentRef}
          className="thinking-content"
          style={{
            padding: '0 14px 12px',
            fontSize: '12px',
            lineHeight: '1.6',
            color: '#666',
            maxHeight: '180px',
            overflowY: 'auto',
          }}
        >
          <Markdown>{text}</Markdown>
          {isActive && <span className="thinking-cursor" />}
        </div>
      </div>
    </div>
  );
}

// Streaming blurb with cursor (defined outside component to prevent remount on re-render)
function StreamingBlurb({ text, isStreaming }) {
  if (!text) return null;
  return (
    <div className="streaming-blurb" style={{
      fontSize: '15px',
      lineHeight: '1.6',
      marginBottom: '16px',
      animation: 'fadeIn 0.3s ease-out',
      color: 'var(--text-primary)',
    }}>
      <Markdown>{text}</Markdown>
      {isStreaming && (
        <span style={{
          display: 'inline-block',
          width: '2px',
          height: '1em',
          background: '#793DB0',
          marginLeft: '2px',
          verticalAlign: 'text-bottom',
          animation: 'blink 1s step-end infinite',
        }} />
      )}
    </div>
  );
}

// Shimmer skeleton for question cards
function QuestionShimmer() {
  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          background: 'rgba(255,255,255,0.7)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '16px',
          border: '1px solid rgba(139, 92, 246, 0.1)',
        }}>
          {/* Question text shimmer */}
          <div className="shimmer-bar" style={{ width: '70%', height: '16px', borderRadius: '8px', marginBottom: '16px' }} />
          {/* Option chips shimmer */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {[0, 1, 2, 3].map(j => (
              <div key={j} className="shimmer-bar" style={{
                width: `${60 + j * 20}px`,
                height: '36px',
                borderRadius: '18px',
              }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CurateMyLookPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialQuery = location.state?.searchQuery || '';
  const initialImages = location.state?.images || [];

  // API state
  const [threadId, setThreadId] = useState(null);
  const [journeyId, setJourneyId] = useState(null);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // UI state
  const [answers, setAnswers] = useState({});
  const [currentBatch, setCurrentBatch] = useState(0);
  const [confirmedBatches, setConfirmedBatches] = useState(new Set());
  const [hasMore, setHasMore] = useState(true);
  const batch2Ref = useRef(null);

  // Summary state from API
  const [journeyTitle, setJourneyTitle] = useState('My Journey');
  const [foundations, setFoundations] = useState([]);
  const [narrativeText, setNarrativeText] = useState('');
  const [moodBoardUrl, setMoodBoardUrl] = useState('');

  // Streaming state
  const [thinkingText, setThinkingText] = useState('');
  const [messageText, setMessageText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showShimmer, setShowShimmer] = useState(false);
  const [streamedJourney, setStreamedJourney] = useState({});
  const thinkingStartTime = useRef(null);
  const cleanupRef = useRef(null);
  // Store turn 1 thinking so it persists (collapsed) while turn 2 streams
  const [prevThinkingText, setPrevThinkingText] = useState('');
  const prevThinkingStartTime = useRef(null);
  const chatScrollRef = useRef(null);

  // Auto-scroll chat to bottom when new streaming content arrives
  useEffect(() => {
    const el = chatScrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [thinkingText, messageText, showShimmer, batches.length, submitting]);

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
        setThinkingText('');
        setMessageText('');
        setStreamedJourney({});
        setIsStreaming(true);

        // Convert base64 images back to File objects if needed
        const imageFiles = [];
        for (let i = 0; i < initialImages.length; i++) {
          const base64 = initialImages[i];
          if (base64.startsWith('data:image')) {
            const response = await fetch(base64);
            const blob = await response.blob();
            const file = new File([blob], `image-${i}.jpg`, { type: 'image/jpeg' });
            imageFiles.push(file);
          }
        }

        // Pre-upload images
        let imageUrls = [];
        let imageTypes = [];
        if (imageFiles.length > 0) {
          const uploadResult = await curateMyFitService.uploadImages(imageFiles);
          imageUrls = uploadResult.imageUrls;
          imageTypes = uploadResult.imageTypes;
        }

        // Start streaming batch
        cleanupRef.current = curateMyFitService.startBatchStream(
          initialQuery, imageUrls, imageTypes,
          {
            onThinkingStart: () => {
              setIsThinking(true);
              thinkingStartTime.current = Date.now();
            },
            onThinking: (content) => setThinkingText(prev => prev + content),
            onThinkingEnd: () => {
              setIsThinking(false);
              setThinkingText(prev => prev ? prev + '\n\n' : prev);
            },
            onJourneyField: (delta) => {
              setStreamedJourney(prev => {
                const updated = { ...prev, ...delta };
                if (updated.title) setJourneyTitle(updated.title);
                if (updated.summary) setNarrativeText(updated.summary);
                if (updated.mood_board_path) setMoodBoardUrl(updated.mood_board_path);
                const journeyFoundations = extractFoundationsFromJourney(updated);
                if (journeyFoundations.length > 0) setFoundations(journeyFoundations);
                return updated;
              });
            },
            onMessage: (content) => setMessageText(content),
            onQuestions: () => setShowShimmer(false),
            onProcessing: () => setShowShimmer(true),
            onComplete: (data) => {
              setShowShimmer(false);
              setIsStreaming(false);

              const firstBatch = {
                id: 'batch-1',
                label: 'Batch 1',
                blurb: data.blurb,
                hasConfirmButton: true,
                questions: data.questions.map(transformQuestion),
              };

              setThreadId(data.threadId);
              setBatches([firstBatch]);

              // Only fall back to summaryUpdates if streaming didn't already populate
              if (data.summaryUpdates) {
                setJourneyTitle(prev => prev !== 'My Journey' ? prev : (data.summaryUpdates.title || 'My Journey'));
                setFoundations(prev => prev.length > 0 ? prev : extractFoundations(data.summaryUpdates));
                setNarrativeText(prev => prev ? prev : (data.summaryUpdates.narrative || ''));
              }

              setLoading(false);
            },
            onError: (msg) => {
              console.error('Stream error:', msg);
              setError(msg || 'Failed to load questions. Please try again.');
              setLoading(false);
              setIsStreaming(false);
              setShowShimmer(false);
            },
          }
        );
      } catch (err) {
        console.error('Failed to start batch:', err);

        let errorMessage = 'Failed to load questions. Please try again.';
        if (err.message?.includes('Authentication required')) {
          errorMessage = 'Your session has expired. Please log in again.';
          setTimeout(() => { window.location.href = '/login'; }, 2000);
        } else if (err.message?.includes('Network') || err.message?.includes('Failed to fetch')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else if (err.message) {
          errorMessage = err.message;
        }

        setError(errorMessage);
        setLoading(false);
        setIsStreaming(false);
      }
    };

    initializeBatch();

    // Cleanup stream on unmount
    return () => {
      cleanupRef.current?.();
      // Reset so Strict Mode remount can re-execute
      initializedRef.current = false;
    };
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

    // If this is the last batch, submit answers to backend via streaming
    // Save turn 1 thinking before clearing for turn 2
    setPrevThinkingText(thinkingText);
    prevThinkingStartTime.current = thinkingStartTime.current;
    setSubmitting(true);
    setError(null);
    setThinkingText('');
    setMessageText('');
    setStreamedJourney({});
    setIsStreaming(true);

    // Prepare answers in backend format
    // Map frontend answer shapes to AnswerData schema: {selectedOptions, freeText, minValue, maxValue}
    const backendAnswers = {};
    const allQuestions = batches.flatMap(b => b.questions);
    Object.keys(answers).forEach(questionId => {
      const answer = answers[questionId];
      const question = allQuestions.find(q => q.id === questionId);
      const entry = {
        selectedOptions: answer.selectedOptions || undefined,
        freeText: answer.freeText || undefined,
        minValue: answer.minValue || undefined,
        maxValue: answer.maxValue || undefined,
        timestamp: answer.timestamp || Date.now(),
      };
      // free-text stores answer in value field — send as freeText
      if (question?.type === 'free-text' && answer.value && !entry.freeText) {
        entry.freeText = answer.value;
      }
      backendAnswers[questionId] = entry;
    });

    cleanupRef.current = curateMyFitService.submitBatchAnswersStream(
      threadId, backendAnswers,
      {
        onThinkingStart: () => {
          setIsThinking(true);
          thinkingStartTime.current = Date.now();
        },
        onThinking: (content) => setThinkingText(prev => prev + content),
        onThinkingEnd: () => {
          setIsThinking(false);
          setThinkingText(prev => prev ? prev + '\n\n' : prev);
        },
        onJourneyField: (delta) => {
          setStreamedJourney(prev => {
            const updated = { ...prev, ...delta };
            if (updated.title) setJourneyTitle(updated.title);
            if (updated.summary) setNarrativeText(updated.summary);
            if (updated.mood_board_path) setMoodBoardUrl(updated.mood_board_path);
            const journeyFoundations = extractFoundationsFromJourney(updated);
            if (journeyFoundations.length > 0) setFoundations(journeyFoundations);
            return updated;
          });
        },
        onMessage: (content) => setMessageText(content),
        onQuestions: () => setShowShimmer(false),
        onProcessing: () => setShowShimmer(true),
        onComplete: (data) => {
          setShowShimmer(false);
          setIsStreaming(false);
          setSubmitting(false);

          if (data.hasMore) {
            setHasMore(true);
            const nextBatch = {
              id: `batch-${batches.length + 1}`,
              label: `Batch ${batches.length + 1}`,
              blurb: data.blurb,
              hasConfirmButton: true,
              questions: data.questions.map(transformQuestion),
            };

            setBatches(prev => [...prev, nextBatch]);
            setCurrentBatch(batches.length);

            // Only fall back to summaryUpdates if streaming didn't already populate
            if (data.summaryUpdates) {
              setJourneyTitle(prev => prev !== 'My Journey' ? prev : (data.summaryUpdates.title || prev));
              setFoundations(prev => prev.length > 0 ? prev : extractFoundations(data.summaryUpdates));
              setNarrativeText(prev => prev ? prev : (data.summaryUpdates.narrative || ''));
            }

            setTimeout(() => {
              batch2Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
          } else {
            setHasMore(false);
            if (data.journeyId) setJourneyId(data.journeyId);
            // Auto-navigate to matchmaking when journey is complete
            navigate('/find-the-look', {
              state: {
                journeyId: data.journeyId,
                journeyTitle,
                foundations,
                narrativeText,
                moodBoardUrl,
              }
            });
          }
        },
        onError: (msg) => {
          console.error('Stream error:', msg);
          setError(msg || 'Failed to submit answers. Please try again.');
          setSubmitting(false);
          setIsStreaming(false);
          setShowShimmer(false);
        },
      }
    );
  };

  const isJourneyReady = !hasMore || !!moodBoardUrl;

  const navigateToFindTheLook = async (extraState = {}) => {
    try {
      const result = await curateMyFitService.createJourney(threadId);
      navigate('/find-the-look', {
        state: {
          journeyId: result.journeyId,
          journeyTitle,
          foundations,
          narrative: narrativeText,
          ...extraState,
        },
      });
    } catch (err) {
      console.error('Failed to create journey:', err);
      setError('Failed to start matching. Please try again.');
    }
  };

  const handleQuickMatch = () => {
    navigate('/find-the-look', {
      state: {
        journeyId,
        threadId,
        journeyTitle,
        foundations,
        narrativeText,
        moodBoardUrl,
        quickMatch: true,
      },
    });
  };

  const handleLetsGo = () => {
    navigate('/find-the-look', {
      state: {
        journeyId,
        threadId,
        journeyTitle,
        foundations,
        narrativeText,
        moodBoardUrl,
      },
    });
  };



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
        <div ref={chatScrollRef} style={{
          overflowY: 'auto',
          padding: '32px',
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

          {/* Turn 1 thinking dropdown — shows prevThinkingText (collapsed) once turn 2 starts, or current thinkingText during turn 1 */}
          <ThinkingDropdown
            text={prevThinkingText || (!submitting ? thinkingText : '')}
            isActive={!submitting && isThinking}
            startTime={prevThinkingStartTime.current || (!submitting ? thinkingStartTime.current : null)}
          />

          {/* Streaming UI: blurb + shimmer during initial load */}
          {(loading || (isStreaming && batches.length === 0)) && (
            <div style={{ marginBottom: '24px' }}>
              {!messageText && (isThinking || isStreaming) && (
                <div style={{ marginBottom: '16px' }}>
                  <div className="shimmer-bar" style={{ height: '20px', width: '90%', borderRadius: '8px', marginBottom: '8px' }} />
                  <div className="shimmer-bar" style={{ height: '20px', width: '60%', borderRadius: '8px' }} />
                </div>
              )}
              <StreamingBlurb text={messageText} isStreaming={isStreaming} />
              {showShimmer && <QuestionShimmer />}
            </div>
          )}

          {batches.map((batch, batchIndex) => (
            <div key={batch.id} ref={batchIndex === 1 ? batch2Ref : null} style={{ marginBottom: batchIndex < batches.length - 1 ? '32px' : 0 }}>
              {(batchIndex === 0 || currentBatch >= batchIndex) && (
                <>
                  <div className="streaming-blurb" style={{
                    fontSize: '15px',
                    lineHeight: '1.6',
                    marginBottom: '16px',
                    color: 'var(--text-primary)',
                    animation: 'fadeInBatch 0.4s ease-out',
                  }}>
                    <Markdown>{batch.blurb}</Markdown>
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

          {/* Streaming UI: thinking + blurb + shimmer during submission */}
          {submitting && (
            <div style={{ marginTop: '24px' }}>
              <ThinkingDropdown text={thinkingText} isActive={isThinking} startTime={thinkingStartTime.current} />
              {!messageText && (isThinking || isStreaming) && (
                <div style={{ marginBottom: '16px' }}>
                  <div className="shimmer-bar" style={{ height: '20px', width: '90%', borderRadius: '8px', marginBottom: '8px' }} />
                  <div className="shimmer-bar" style={{ height: '20px', width: '60%', borderRadius: '8px' }} />
                </div>
              )}
              <StreamingBlurb text={messageText} isStreaming={isStreaming} />
              {showShimmer && <QuestionShimmer />}
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
            isStreaming={isStreaming}
            moodBoardUrl={moodBoardUrl}
          />
        </div>
      </div>

      {/* Mascot */}
      <Mascot
        variant="default"
        position="bottom-right"
        isSearching={!isReady || submitting}
        message={confirmedBatches.size > 0 ? (isJourneyReady ? "Let's Goooo!" : "Quick Match →") : ''}
        onClick={isJourneyReady ? handleLetsGo : handleQuickMatch}
        disabled={isStreaming || submitting}
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

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes wiggle {
          0%, 60%, 100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-6px);
          }
        }

        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }

        @keyframes shimmer {
          from { background-position: -200% 0; }
          to   { background-position: 200% 0; }
        }

        .thinking-cursor {
          display: inline-block;
          width: 2px;
          height: 1em;
          background-color: #793DB0;
          margin-left: 2px;
          vertical-align: text-bottom;
          animation: blink 1s step-end infinite;
        }

        .thinking-content p { margin: 0 0 4px 0; }
        .thinking-content strong { color: #555; }
        .thinking-content ul, .thinking-content ol { margin: 2px 0; padding-left: 18px; }
        .thinking-content li { margin: 1px 0; }
        .thinking-content h1, .thinking-content h2, .thinking-content h3 {
          font-size: 12px; font-weight: 700; color: #555; margin: 6px 0 2px;
        }

        .streaming-blurb p { margin: 0 0 8px; }
        .streaming-blurb p:last-child { margin-bottom: 0; }
        .streaming-blurb strong { font-weight: 700; }
        .streaming-blurb em { font-style: italic; }
        .streaming-blurb ul, .streaming-blurb ol { margin: 4px 0; padding-left: 20px; }
        .streaming-blurb li { margin: 2px 0; }
        .streaming-blurb h1, .streaming-blurb h2, .streaming-blurb h3 {
          font-size: 16px; font-weight: 700; margin: 8px 0 4px;
        }

        .shimmer-bar {
          background: linear-gradient(90deg, #f0e6f6 25%, #e8d5f5 50%, #f0e6f6 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
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
