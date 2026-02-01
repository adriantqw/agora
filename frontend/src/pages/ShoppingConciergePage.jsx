/**
 * Shopping Concierge Page - Chat-Based Journey Interface
 *
 * AI-powered conversational shopping assistant with split layout:
 * - Left: Chat feed with user messages and AI responses
 * - Right: Summary panel showing journey context (desktop) / bottom-sheet drawer (mobile)
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useThemeColors } from '../hooks/useThemeColors';
import Header from '../components/common/Header/Header';
import ChatFeed from '../components/consumer/Chat/ChatFeed/ChatFeed';
import SummaryPanel from '../components/consumer/Chat/SummaryPanel/SummaryPanel';
import SummaryDrawer from '../components/consumer/Chat/SummaryDrawer/SummaryDrawer';
import conciergeService from '../services/conciergeService';
import journeyService from '../services/journeyService';
import { ThemeProvider } from '../contexts/ThemeContext';
import CONSUMER_THEME from '../config/consumerTheme';
import { Map } from 'lucide-react';

export default function ShoppingConciergePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const colors = useThemeColors();

  // Get initial query from navigation state (from landing page search)
  const initialQuery = location.state?.searchQuery || '';

  // Track if conversation has been initialized (prevents double-init in Strict Mode)
  const hasInitialized = useRef(false);

  // Header search state
  const [headerSearchQuery, setHeaderSearchQuery] = useState('');

  // Message feed state
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  // Journey context state — all fields declared up front
  const [journeyContext, setJourneyContext] = useState({
    title: '',
    status: 'Creating Style Profile...',
    occasion: null,
    weather: null,
    budget: null,
    keyPieces: [],
    aesthetic: null,
    riskTolerance: null,
    attributes: [],
    inspirationImage: null,
    additionalContext: null,
    // Fields populated by Batch 1
    styleLeaning: null,
    ageRange: null,
    timeOfDay: null,
    season: null,
    locationType: null,
    locationDetail: null,
  });

  // Answer tracking state
  const [currentAnswers, setCurrentAnswers] = useState({});

  // Batch tracking state
  const [currentBatchId, setCurrentBatchId] = useState(null);
  const [batchAnswers, setBatchAnswers] = useState({});  // Answers for current batch only
  const [batchNumber, setBatchNumber] = useState(0);

  // Ref holding current batch's questions for real-time lookup in handleAnswer
  const currentBatchQuestionsRef = useRef([]);

  // Conversation tracking
  const [currentStep, setCurrentStep] = useState('aesthetic');

  // Mobile responsive
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 900);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Generate unique message ID
  const generateMessageId = () => `msg-${Date.now()}-${Math.random()}`;

  // Add user message to chat feed
  const addUserMessage = useCallback((text) => {
    setMessages((prev) => [
      ...prev,
      {
        id: generateMessageId(),
        type: 'user',
        text,
        timestamp: new Date(),
      },
    ]);
  }, []);

  // Add AI message to chat feed
  const addAIMessage = useCallback(({ title, description, question, questionType, options, questions }) => {
    setIsTyping(true);

    // Generate unique batch ID
    const batchId = `batch-${Date.now()}`;
    if (questions && questions.length > 0) {
      setCurrentBatchId(batchId);
      currentBatchQuestionsRef.current = questions;
    }

    // Simulate AI thinking delay
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: generateMessageId(),
          type: 'ai',
          title,
          description,
          question, // New structure with question object (single question - legacy)
          questionType, // Legacy support
          options, // Legacy support
          questions, // Array of questions (batch mode)
          batchId, // Unique ID for this batch
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    }, 800);
  }, []);

  // ---------------------------------------------------------------------------
  // Real-time context updater — extracted so handleAnswer can call it immediately
  // ---------------------------------------------------------------------------
  const updateJourneyContextFromAnswer = useCallback((questionId, answer) => {
    if (questionId === 'greeting-query') {
      const query = answer.value;
      const extractedOccasion = conciergeService.extractOccasion(query);
      const extractedLocation = conciergeService.extractLocation(query);
      setJourneyContext((prev) => ({
        ...prev,
        title: extractedOccasion || 'New Journey',
        occasion: extractedOccasion,
        weather: extractedLocation,
        status: 'Creating Style Profile...',
      }));
    } else if (questionId === 'aesthetic-visual-mood') {
      const aesthetic = conciergeService.processAestheticAnswer(answer);
      setJourneyContext(prev => ({ ...prev, aesthetic }));
    } else if (questionId === 'risk-tolerance-scale') {
      const riskTolerance = conciergeService.processRiskAnswer(answer);
      setJourneyContext(prev => ({ ...prev, riskTolerance }));
    } else if (questionId === 'style-attributes') {
      const attributes = conciergeService.processAttributesAnswer(answer);
      setJourneyContext(prev => ({ ...prev, attributes }));
    } else if (questionId === 'inspiration-image') {
      const inspirationImage = conciergeService.processImageAnswer(answer);
      setJourneyContext(prev => ({ ...prev, inspirationImage }));
    } else if (questionId === 'additional-context') {
      const additionalContext = conciergeService.processContextAnswer(answer);
      setJourneyContext(prev => ({ ...prev, additionalContext }));
    } else if (questionId === 'budget-range') {
      setJourneyContext(prev => ({ ...prev, budget: { min: answer.min, max: answer.max } }));
    } else if (questionId === 'budget-scale') {
      const budget = answer.value ? parseFloat(answer.value) : null;
      setJourneyContext(prev => ({ ...prev, budget }));
    } else if (questionId === 'style-leaning') {
      const styleLeaning = answer.selectedOptions?.[0] || answer.value;
      setJourneyContext(prev => ({ ...prev, styleLeaning }));
    } else if (questionId === 'age-range') {
      const ageRange = answer.selectedOptions?.[0] || answer.value;
      setJourneyContext(prev => ({ ...prev, ageRange }));
    } else if (questionId === 'time-of-day') {
      const timeOfDay = answer.selectedOptions || [];
      setJourneyContext(prev => ({ ...prev, timeOfDay }));
    } else if (questionId === 'season') {
      const season = answer.selectedOptions || [];
      setJourneyContext(prev => ({ ...prev, season }));
    } else if (questionId === 'location-hybrid') {
      const locationType = answer.selectedOptions?.[0] || 'other';
      const locationDetail = answer.value;
      setJourneyContext(prev => ({ ...prev, locationType, locationDetail }));
    }
  }, []);

  // Handle initial query from landing page
  const handleInitialQuery = useCallback((query) => {
    // Add user's initial message
    addUserMessage(query);

    // Extract context from query
    const extractedOccasion = conciergeService.extractOccasion(query);
    const extractedLocation = conciergeService.extractLocation(query);

    // Update journey context with extracted info
    setJourneyContext((prev) => ({
      ...prev,
      title: extractedOccasion || 'New Journey',
      occasion: extractedOccasion,
      weather: extractedLocation,
      status: 'Creating Style Profile...'
    }));

    // Generate first batch of questions
    const batch1 = conciergeService.generateBatch1();
    addAIMessage(batch1);

    // Set batch number
    setBatchNumber(1);
  }, [addUserMessage, addAIMessage]);

  // Initialize conversation on mount if query exists
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      if (initialQuery) {
        handleInitialQuery(initialQuery);
      } else {
        // No initial query - start with greeting
        const greetingBatch = conciergeService.generateGreetingBatch();
        addAIMessage(greetingBatch);
        setBatchNumber(0);
        setJourneyContext(prev => ({ ...prev, status: 'Starting...' }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run on mount

  // Handle answer submission from QuestionRenderer — updates sidebar in real time
  const handleAnswer = useCallback((answer) => {
    // Store in batch-specific state
    setBatchAnswers((prev) => ({
      ...prev,
      [answer.questionId]: answer
    }));

    // Real-time sidebar update: look up question from current batch ref
    const question = currentBatchQuestionsRef.current.find(q => q.id === answer.questionId);
    if (question) {
      updateJourneyContextFromAnswer(question.id, answer);
    }
  }, [updateJourneyContextFromAnswer]);

  // Handle batch submit button click
  const handleBatchSubmit = useCallback(() => {
    // Find current batch message
    const batchMessage = messages.find(msg => msg.batchId === currentBatchId);
    if (!batchMessage || !batchMessage.questions) return;

    // Check if all required questions are answered
    const requiredQuestions = batchMessage.questions.filter(q => q.required);
    const allRequiredAnswered = requiredQuestions.every(q => batchAnswers[q.id]);

    if (!allRequiredAnswered) {
      return;
    }

    // Generate summary text for user message
    const summaryParts = batchMessage.questions
      .map(question => {
        const answer = batchAnswers[question.id];
        if (!answer) return null;
        return conciergeService.formatAnswerForBatchSummary(question, answer);
      })
      .filter(Boolean);

    const summaryText = summaryParts.length > 0
      ? summaryParts.join(' • ')
      : '(no additional details)';

    // Add user message with summary
    addUserMessage(summaryText);

    // Merge batch answers into global currentAnswers
    setCurrentAnswers(prev => ({ ...prev, ...batchAnswers }));

    // Context is already up-to-date from real-time updates in handleAnswer.
    // Clear batch answers and progress to next batch.
    setBatchAnswers({});

    if (batchNumber === 0) {
      setBatchNumber(1);
      setTimeout(() => {
        const batch1 = conciergeService.generateBatch1();
        addAIMessage(batch1);
      }, 500);
    } else if (batchNumber === 1) {
      setBatchNumber(2);
      setJourneyContext(prev => ({ ...prev, status: 'Refining Preferences...' }));
      setTimeout(() => {
        const batch2 = conciergeService.generateBatch2();
        addAIMessage(batch2);
      }, 500);
    } else if (batchNumber === 2) {
      setBatchNumber(3);
      setJourneyContext(prev => ({ ...prev, status: 'Final Touches...' }));
      setTimeout(() => {
        const batch3 = conciergeService.generateBatch3();
        addAIMessage(batch3);
      }, 500);
    } else if (batchNumber === 3) {
      setBatchNumber(4);
      setJourneyContext(prev => ({ ...prev, status: 'Journey Complete!' }));
      setTimeout(() => {
        const completion = conciergeService.generateCompletionMessage();
        addAIMessage(completion);
      }, 500);
    }
  }, [batchAnswers, currentBatchId, messages, batchNumber, addUserMessage, addAIMessage]);

  // Handle next step button click (legacy single-question flow)
  const handleNextStep = useCallback((messageId) => {
    const message = messages.find((msg) => msg.id === messageId);
    if (!message || !message.question) return;

    const answer = currentAnswers[message.question.id];
    if (!answer) return;

    if (message.question.type === 'image-choice' && message.question.id === 'aesthetic-visual-mood') {
      const aesthetic = conciergeService.processAestheticAnswer(answer);
      setJourneyContext((prev) => ({
        ...prev,
        aesthetic,
        status: 'Building Your Journey...',
      }));
      setCurrentStep('risk');
      setTimeout(() => {
        const response = conciergeService.generateConversationResponse('risk');
        addAIMessage(response);
      }, 500);
    } else if (message.question.type === 'scale-rating') {
      const riskTolerance = conciergeService.processRiskAnswer(answer);
      setJourneyContext((prev) => ({ ...prev, riskTolerance }));
      setCurrentStep('attributes');
      setTimeout(() => {
        const response = conciergeService.generateConversationResponse('attributes');
        addAIMessage(response);
      }, 500);
    } else if (message.question.type === 'multi-select') {
      const attributes = conciergeService.processAttributesAnswer(answer);
      setJourneyContext((prev) => ({ ...prev, attributes }));
      setCurrentStep('inspiration');
      setTimeout(() => {
        const response = conciergeService.generateConversationResponse('inspiration');
        addAIMessage(response);
      }, 500);
    } else if (message.question.type === 'image-upload') {
      const inspirationImage = conciergeService.processImageAnswer(answer);
      setJourneyContext((prev) => ({ ...prev, inspirationImage }));
      setCurrentStep('context');
      setTimeout(() => {
        const response = conciergeService.generateConversationResponse('context');
        addAIMessage(response);
      }, 500);
    } else if (message.question.type === 'free-text') {
      const additionalContext = conciergeService.processContextAnswer(answer);
      setJourneyContext((prev) => ({
        ...prev,
        additionalContext,
        status: 'Journey Complete!',
      }));
      setCurrentStep('complete');
      setTimeout(() => {
        addAIMessage({
          title: 'Perfect! Your journey is ready.',
          description: `I've curated the perfect selections based on your ${journeyContext.aesthetic || 'style'} preferences. Let me show you what I found!`,
          question: null,
        });
      }, 500);
    }
  }, [messages, currentAnswers, journeyContext.aesthetic, addAIMessage]);

  // Handle header search
  const handleHeaderSearch = (query) => {
    if (!query || !query.trim()) return;
    addUserMessage(query);

    const extractedOccasion = conciergeService.extractOccasion(query);
    const extractedLocation = conciergeService.extractLocation(query);

    setJourneyContext(prev => ({
      ...prev,
      occasion: extractedOccasion || prev.occasion,
      weather: extractedLocation || prev.weather,
      title: extractedOccasion || prev.title || 'New Journey',
    }));

    const response = conciergeService.generateConversationResponse('aesthetic');
    addAIMessage(response);
    setHeaderSearchQuery('');
  };

  // Handle edit actions from summary panel
  const handleEditContext = (field, value) => {
    if (field === 'title') {
      setJourneyContext(prev => ({ ...prev, title: value }));
    }
  };

  // ---------------------------------------------------------------------------
  // isReady — all required fields filled
  // ---------------------------------------------------------------------------
  const requiredFields = ['occasion', 'season', 'timeOfDay', 'locationType', 'styleLeaning', 'ageRange', 'aesthetic', 'budget'];
  const isReady = requiredFields.every(field => {
    const val = journeyContext[field];
    if (Array.isArray(val)) return val.length > 0;
    return val != null;
  });

  // ---------------------------------------------------------------------------
  // Question configs for inline sidebar editing (Feature 5)
  // ---------------------------------------------------------------------------
  const questionConfigs = {
    budget: conciergeService.getBudgetRangeQuestion(),
    aesthetic: conciergeService.getAestheticQuestion(),
    season: conciergeService.getSeasonQuestion(),
    timeOfDay: conciergeService.getTimeOfDayQuestion(),
    locationType: conciergeService.getLocationQuestion(),
    styleLeaning: conciergeService.getStyleLeaningQuestion(),
    ageRange: conciergeService.getAgeRangeQuestion(),
    occasion: { id: 'occasion', type: 'free-text', question: 'What is the occasion?', required: true },
    weather: { id: 'weather', type: 'free-text', question: 'Where / what weather?', required: false },
  };

  // Map sidebar field names back to question IDs for updateJourneyContextFromAnswer
  const fieldToQuestionId = {
    budget: 'budget-range',
    aesthetic: 'aesthetic-visual-mood',
    season: 'season',
    timeOfDay: 'time-of-day',
    locationType: 'location-hybrid',
    styleLeaning: 'style-leaning',
    ageRange: 'age-range',
    occasion: 'occasion',
    weather: 'weather',
  };

  const handleFieldEdit = useCallback((field, answer) => {
    const questionId = fieldToQuestionId[field];
    if (questionId) {
      // Special handling for free-text fields that map directly
      if (field === 'occasion') {
        setJourneyContext(prev => ({
          ...prev,
          occasion: answer.value || prev.occasion,
          title: answer.value || prev.title,
        }));
      } else if (field === 'weather') {
        setJourneyContext(prev => ({ ...prev, weather: answer.value || prev.weather }));
      } else {
        updateJourneyContextFromAnswer(questionId, answer);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateJourneyContextFromAnswer]);

  // Handle Save Journey button — calls journeyService
  const handleSaveJourney = async () => {
    const saved = await journeyService.saveJourney(journeyContext);
    if (saved?.id) {
      setJourneyContext(prev => ({ ...prev, id: saved.id, status: 'Journey Saved!' }));
    }
  };

  // Handle Return to Home button
  const handleReturnHome = () => {
    navigate('/');
  };

  // Shared props for SummaryPanel
  const summaryProps = {
    journey: journeyContext,
    onEdit: handleEditContext,
    onSaveJourney: handleSaveJourney,
    onReturnHome: handleReturnHome,
    isReady,
    questionConfigs,
    onFieldEdit: handleFieldEdit,
  };

  // FAB badge: count of filled required fields
  const filledCount = requiredFields.filter(field => {
    const val = journeyContext[field];
    if (Array.isArray(val)) return val.length > 0;
    return val != null;
  }).length;

  return (
    <div style={{ minHeight: '100vh', background: colors.page.background }}>
      {/* Header with journey variant */}
      <Header
        variant="journey"
        showNav={true}
        searchQuery={headerSearchQuery}
        onSearchChange={(e) => setHeaderSearchQuery(e.target.value)}
        onSearch={handleHeaderSearch}
      />

      {/* Split Layout: Chat Feed + Summary Panel */}
      <ThemeProvider theme={CONSUMER_THEME}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr',
            height: 'calc(100vh - 65px)',
            overflow: 'hidden',
          }}
        >
          {/* LEFT: Chat Feed */}
          <ChatFeed
            messages={messages}
            loading={isTyping}
            onAnswer={handleAnswer}
            batchAnswers={batchAnswers}
            onBatchSubmit={handleBatchSubmit}
          />

          {/* RIGHT: Summary Panel (desktop only) */}
          {!isMobile && (
            <SummaryPanel {...summaryProps} />
          )}
        </div>
      </ThemeProvider>

      {/* Mobile: FAB + Drawer */}
      {isMobile && (
        <>
          {/* FAB */}
          <button
            onClick={() => setDrawerOpen(true)}
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: colors.primary.eggPink,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(255, 183, 197, 0.45)',
              zIndex: 100,
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.08)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 183, 197, 0.55)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(255, 183, 197, 0.45)';
            }}
            aria-label="Open journey summary"
          >
            <Map size={24} color="#1a202c" />
            {/* Badge */}
            <span style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              background: '#1a202c',
              color: '#fff',
              fontSize: '11px',
              fontWeight: '700',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `2px solid ${colors.page.background}`,
            }}>
              {filledCount}/{requiredFields.length}
            </span>
          </button>

          {/* Bottom-sheet Drawer */}
          <SummaryDrawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            {...summaryProps}
          />
        </>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
