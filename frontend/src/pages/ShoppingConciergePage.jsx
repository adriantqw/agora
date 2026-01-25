/**
 * Shopping Concierge Page - Chat-Based Journey Interface
 *
 * AI-powered conversational shopping assistant with split layout:
 * - Left: Chat feed with user messages and AI responses
 * - Right: Summary panel showing journey context
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useThemeColors } from '../hooks/useThemeColors';
import Header from '../components/common/Header/Header';
import ChatFeed from '../components/consumer/Chat/ChatFeed/ChatFeed';
import SummaryPanel from '../components/consumer/Chat/SummaryPanel/SummaryPanel';
import conciergeService from '../services/conciergeService';
import { ThemeProvider } from '../context/ThemeContext';
import CONSUMER_THEME from '../config/consumerTheme';

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

  // Journey context state
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
  });

  // Answer tracking state
  const [currentAnswers, setCurrentAnswers] = useState({});

  // Batch tracking state
  const [currentBatchId, setCurrentBatchId] = useState(null);
  const [batchAnswers, setBatchAnswers] = useState({});  // Answers for current batch only
  const [batchNumber, setBatchNumber] = useState(0);

  // Conversation tracking
  const [currentStep, setCurrentStep] = useState('aesthetic');

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
    if (initialQuery && !hasInitialized.current) {
      hasInitialized.current = true;
      handleInitialQuery(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run on mount

  // Handle answer submission from QuestionRenderer
  const handleAnswer = useCallback((answer) => {
    // Store in batch-specific state (not global currentAnswers yet)
    setBatchAnswers((prev) => ({
      ...prev,
      [answer.questionId]: answer
    }));

    // DO NOT add user message here - wait for batch submit
  }, []);

  // Handle batch submit button click
  const handleBatchSubmit = useCallback(() => {
    // Find current batch message
    const batchMessage = messages.find(msg => msg.batchId === currentBatchId);
    if (!batchMessage || !batchMessage.questions) return;

    // Check if all required questions are answered
    const requiredQuestions = batchMessage.questions.filter(q => q.required);
    const allRequiredAnswered = requiredQuestions.every(q => batchAnswers[q.id]);

    if (!allRequiredAnswered) {
      // Show validation error or keep button disabled
      return;
    }

    // Generate summary text for user message
    const summaryParts = batchMessage.questions
      .map(question => {
        const answer = batchAnswers[question.id];
        if (!answer) return null;
        return conciergeService.formatAnswerForBatchSummary(question, answer);
      })
      .filter(Boolean);  // Remove null/undefined entries

    const summaryText = summaryParts.length > 0
      ? summaryParts.join(' • ')
      : '(no additional details)';

    // Add user message with summary
    addUserMessage(summaryText);

    // Merge batch answers into global currentAnswers
    setCurrentAnswers(prev => ({ ...prev, ...batchAnswers }));

    // Process answers and update journey context
    batchMessage.questions.forEach(question => {
      const answer = batchAnswers[question.id];
      if (!answer) return;

      // Update journey context based on question type
      if (question.id === 'aesthetic-visual-mood') {
        const aesthetic = conciergeService.processAestheticAnswer(answer);
        setJourneyContext(prev => ({ ...prev, aesthetic }));
      } else if (question.id === 'risk-tolerance-scale') {
        const riskTolerance = conciergeService.processRiskAnswer(answer);
        setJourneyContext(prev => ({ ...prev, riskTolerance }));
      } else if (question.id === 'style-attributes') {
        const attributes = conciergeService.processAttributesAnswer(answer);
        setJourneyContext(prev => ({ ...prev, attributes }));
      } else if (question.id === 'inspiration-image') {
        const inspirationImage = conciergeService.processImageAnswer(answer);
        setJourneyContext(prev => ({ ...prev, inspirationImage }));
      } else if (question.id === 'additional-context') {
        const additionalContext = conciergeService.processContextAnswer(answer);
        setJourneyContext(prev => ({ ...prev, additionalContext }));
      } else if (question.id === 'budget-range') {
        const budget = answer.value ? parseFloat(answer.value) : null;
        setJourneyContext(prev => ({ ...prev, budget }));
      } else if (question.id === 'key-pieces') {
        const keyPieces = answer.value ? answer.value.split(',').map(s => s.trim()) : [];
        setJourneyContext(prev => ({ ...prev, keyPieces }));
      }
      // Add more question processing as needed
    });

    // Clear batch answers
    setBatchAnswers({});

    // Progress to next batch
    if (batchNumber === 1) {
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

  // Handle next step button click
  const handleNextStep = useCallback((messageId) => {
    // Find the message that triggered next step
    const message = messages.find((msg) => msg.id === messageId);
    if (!message || !message.question) return;

    const answer = currentAnswers[message.question.id];
    if (!answer) return;

    // Update journey context based on question type
    if (message.question.type === 'image-choice' && message.question.id === 'aesthetic-visual-mood') {
      const aesthetic = conciergeService.processAestheticAnswer(answer);
      setJourneyContext((prev) => ({
        ...prev,
        aesthetic,
        status: 'Building Your Journey...',
      }));
      setCurrentStep('risk');

      // Generate next AI response
      setTimeout(() => {
        const response = conciergeService.generateConversationResponse('risk');
        addAIMessage(response);
      }, 500);
    } else if (message.question.type === 'scale-rating') {
      const riskTolerance = conciergeService.processRiskAnswer(answer);
      setJourneyContext((prev) => ({
        ...prev,
        riskTolerance,
      }));
      setCurrentStep('attributes');

      // Generate next AI response
      setTimeout(() => {
        const response = conciergeService.generateConversationResponse('attributes');
        addAIMessage(response);
      }, 500);
    } else if (message.question.type === 'multi-select') {
      const attributes = conciergeService.processAttributesAnswer(answer);
      setJourneyContext((prev) => ({
        ...prev,
        attributes,
      }));
      setCurrentStep('inspiration');

      // Generate next AI response
      setTimeout(() => {
        const response = conciergeService.generateConversationResponse('inspiration');
        addAIMessage(response);
      }, 500);
    } else if (message.question.type === 'image-upload') {
      const inspirationImage = conciergeService.processImageAnswer(answer);
      setJourneyContext((prev) => ({
        ...prev,
        inspirationImage,
      }));
      setCurrentStep('context');

      // Generate next AI response
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

      // Generate completion message
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

    // Add new user message to chat feed
    addUserMessage(query);

    // Extract context and generate AI response
    const extractedOccasion = conciergeService.extractOccasion(query);
    const extractedLocation = conciergeService.extractLocation(query);

    setJourneyContext(prev => ({
      ...prev,
      occasion: extractedOccasion || prev.occasion,
      weather: extractedLocation || prev.weather,
      title: extractedOccasion || prev.title || 'New Journey',
    }));

    // Generate follow-up AI response
    const response = conciergeService.generateConversationResponse('aesthetic');
    addAIMessage(response);

    // Clear search input
    setHeaderSearchQuery('');
  };

  // Handle edit actions from summary panel
  const handleEditContext = (field, value) => {
    console.log('Edit field:', field, 'Value:', value);

    if (field === 'title') {
      setJourneyContext(prev => ({
        ...prev,
        title: value,
      }));
    } else {
      // Future: Allow re-asking questions or editing other context fields
    }
  };

  // Handle Save Journey button
  const handleSaveJourney = () => {
    // Future: Save to backend/localStorage
    console.log('Saving journey:', journeyContext);
    alert('Journey saved! (Feature coming soon)');
  };

  // Handle Return to Home button
  const handleReturnHome = () => {
    navigate('/');
  };

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
            gridTemplateColumns: '2fr 1fr',
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

          {/* RIGHT: Summary Panel */}
          <SummaryPanel
            journey={journeyContext}
            onEdit={handleEditContext}
            onSaveJourney={handleSaveJourney}
            onReturnHome={handleReturnHome}
          />
        </div>
      </ThemeProvider>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 900px) {
          .journey-layout {
            grid-template-columns: 1fr !important;
            height: auto !important;
            overflow: visible !important;
          }

          aside {
            border-left: none !important;
            border-top: 2px solid ${colors.border.divider} !important;
          }
        }
      `}</style>
    </div>
  );
}
