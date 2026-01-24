/**
 * Shopping Concierge Page - Chat-Based Journey Interface
 *
 * AI-powered conversational shopping assistant with split layout:
 * - Left: Chat feed with user messages and AI responses
 * - Right: Summary panel showing journey context
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useThemeColors } from '../hooks/useThemeColors';
import Header from '../components/common/Header/Header';
import ChatFeed from '../components/consumer/Chat/ChatFeed/ChatFeed';
import SummaryPanel from '../components/consumer/Chat/SummaryPanel/SummaryPanel';
import conciergeService from '../services/conciergeService';

export default function ShoppingConciergePage() {
  const location = useLocation();
  const colors = useThemeColors();

  // Get initial query from navigation state (from landing page search)
  const initialQuery = location.state?.searchQuery || '';

  // Track if conversation has been initialized (prevents double-init in Strict Mode)
  const hasInitialized = useRef(false);

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
  });

  // Conversation state
  const [selectedStyle, setSelectedStyle] = useState(null);

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
  const addAIMessage = useCallback(({ title, description, questionType, options }) => {
    setIsTyping(true);

    // Simulate AI thinking delay
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: generateMessageId(),
          type: 'ai',
          title,
          description,
          questionType,
          options,
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
    }));

    // Generate first AI response (aesthetic selection)
    const aestheticResponse = conciergeService.generateConversationResponse('aesthetic');
    addAIMessage(aestheticResponse);
  }, [addUserMessage, addAIMessage]);

  // Initialize conversation on mount if query exists
  useEffect(() => {
    if (initialQuery && !hasInitialized.current) {
      hasInitialized.current = true;
      handleInitialQuery(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run on mount

  // Handle aesthetic/style selection
  const handleStyleSelection = (aestheticId) => {
    setSelectedStyle(aestheticId);
  };

  // Handle next step after aesthetic selection
  const handleNextStep = () => {
    if (!selectedStyle) return;

    // Find selected aesthetic label
    const aestheticOptions = conciergeService.getAestheticOptions();
    const selectedOption = aestheticOptions.find((opt) => opt.id === selectedStyle);

    // Add user message bubble with selection
    addUserMessage(selectedOption?.label || 'Selected aesthetic');

    // Update journey context
    setJourneyContext((prev) => ({
      ...prev,
      aesthetic: selectedStyle,
      status: 'Building Your Journey...',
    }));

    // Reset selection for next interaction
    setSelectedStyle(null);

    // Generate next AI response (placeholder - can expand to full flow)
    setTimeout(() => {
      addAIMessage({
        title: 'Great choice!',
        description: `I love the ${selectedOption?.label.toLowerCase()} vibe! Let me curate some perfect pieces for you based on your ${journeyContext.occasion || 'event'}.`,
        questionType: 'results',
        options: [],
      });

      // Update status to complete
      setJourneyContext((prev) => ({
        ...prev,
        status: 'Journey Complete!',
      }));
    }, 1000);
  };

  // Handle edit actions from summary panel
  const handleEditContext = (field) => {
    console.log('Edit field:', field);
    // Future: Allow re-asking questions or editing context
  };

  return (
    <div style={{ minHeight: '100vh', background: colors.surface.light }}>
      {/* Header with journey variant */}
      <Header variant="journey" showNav={true} />

      {/* Split Layout: Chat Feed + Summary Panel */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          height: 'calc(100vh - 65px)',
          overflow: 'hidden',
        }}
      >
        {/* LEFT: Chat Feed */}
        <ChatFeed
          messages={messages}
          loading={isTyping}
          onStyleSelect={handleStyleSelection}
          selectedStyle={selectedStyle}
          onNextStep={handleNextStep}
        />

        {/* RIGHT: Summary Panel */}
        <SummaryPanel journey={journeyContext} onEdit={handleEditContext} />
      </div>

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
            border-top: 1px solid var(--color-border-subtle) !important;
          }
        }
      `}</style>
    </div>
  );
}
