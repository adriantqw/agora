import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useFittingRoom } from '../contexts/FittingRoomContext';
import { MessageCircle, ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';
import Header from '../components/common/Header/Header';
import Mascot from '../components/common/Mascot/Mascot';
import LookCarousel from '../components/find-the-look/LookCarousel';
import ItemGrid from '../components/find-the-look/ItemGrid';
import AIChatBubble from '../components/find-the-look/AIChatBubble';
import ProductDetailModal from '../components/find-the-look/ProductDetailModal';
import FittingRoomQueue from '../components/find-the-look/FittingRoomQueue';
import JourneyBuilderSidebar from '../components/consumer/JourneyBuilder/JourneyBuilderSidebar';
import Growl from '../components/common/Growl/Growl';
import Markdown from 'react-markdown';
import findTheLookService from '../services/findTheLookService';

/**
 * Transform MatchMaker matches into the look format components expect.
 *
 * MatchMaker returns:
 *   - ProductMatchSet: { title, description, productSet: [{ id, name, imageUrl, price, score, reason }] }
 *   - Standalone ProductMatch: { id, name, imageUrl, price, score, reason }
 *
 * Components expect:
 *   - Look: { id, name, brand, price, image, items: [{ id, name, brand, price, image, description }] }
 */
function transformMatchesToLooks(matches) {
  const looks = [];
  let lookCounter = 0;

  for (const match of matches) {
    if (match.productSet) {
      // ProductMatchSet -> a "look" with nested items
      lookCounter++;
      const items = match.productSet.map((p, i) => ({
        id: p.id || `item-${lookCounter}-${i}`,
        name: p.name || 'Unnamed Product',
        brand: p.brand || '',
        price: p.price ?? 0,
        image: p.imageUrl || '',
        description: p.reason || '',
      }));

      const totalPrice = items.reduce((sum, item) => sum + (item.price || 0), 0);

      looks.push({
        id: `look-${lookCounter}`,
        type: 'set',
        name: match.title || `Look ${lookCounter}`,
        brand: match.description || '',
        price: totalPrice,
        image: items[0]?.image || '',
        items,
      });
    } else {
      // Standalone ProductMatch -> individual carousel entry
      const item = {
        id: match.id || `product-${looks.length}`,
        name: match.name || 'Unnamed Product',
        brand: match.brand || '',
        price: match.price ?? 0,
        image: match.imageUrl || '',
        description: match.reason || '',
      };
      looks.push({
        id: item.id,
        type: 'product',
        name: item.name,
        brand: item.brand,
        price: item.price,
        image: item.image,
        items: [item],
      });
    }
  }

  return looks;
}

const FindTheLookPage = () => {
  const MAX_CAROUSEL_ITEMS = 12;
  const location = useLocation();
  const navigate = useNavigate();

  // Navigation state from CurateMyLookPage
  const journeyId = location.state?.journeyId;
  const stylistThreadId = location.state?.threadId;
  const navJourneyTitle = location.state?.journeyTitle;
  const navFoundations = location.state?.foundations;
  const navNarrative = location.state?.narrative || location.state?.narrativeText;
  const navMoodBoardUrl = location.state?.moodBoardUrl;

  // Streaming state
  const [isLoading, setIsLoading] = useState(true);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingText, setThinkingText] = useState('');
  const [threadId, setThreadId] = useState(null);
  const [aiMessage, setAiMessage] = useState('');
  const [looks, setLooks] = useState([]);
  const [error, setError] = useState(null);
  const [isRefining, setIsRefining] = useState(false);

  // UI state
  const [selectedLook, setSelectedLook] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isJourneySidebarExpanded, setIsJourneySidebarExpanded] = useState(false);
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [journeyTitle, setJourneyTitle] = useState(navJourneyTitle || 'My Journey');

  const [growl, setGrowl] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  const { queue, addToQueue, addMultipleToQueue, removeFromQueue } = useFittingRoom();
  const cleanupRef = useRef(null);

  // Stream callbacks shared between initial load and refinement
  const makeCallbacks = (onDone, isRefinement = false) => ({
    onThinkingStart: () => {
      setIsThinking(true);
      setThinkingText('');
    },
    onThinking: (content) => setThinkingText(prev => prev + content),
    onThinkingEnd: () => setIsThinking(false),
    onProcessing: () => {},
    onComplete: (data) => {
      const allLooks = transformMatchesToLooks(data.matches || []);
      const newMatchCount = Math.max(0, data.newMatchCount || 0);

      if (isRefinement && newMatchCount > 0) {
        const boundedNewCount = Math.min(newMatchCount, allLooks.length);
        const newLooks = allLooks.slice(allLooks.length - boundedNewCount);
        const oldLooks = allLooks.slice(0, allLooks.length - boundedNewCount);
        const mergedLooks = [...newLooks, ...oldLooks].slice(0, MAX_CAROUSEL_ITEMS);
        setLooks(mergedLooks);
        setSelectedLook(mergedLooks[0] || null);
      } else {
        const limitedLooks = allLooks.slice(0, MAX_CAROUSEL_ITEMS);
        setLooks(limitedLooks);
        setSelectedLook(limitedLooks[0] || null);
      }
      setThreadId(data.threadId);
      setAiMessage(data.message || '');
      setIsLoading(false);
      setIsRefining(false);
      onDone?.();
    },
    onError: (msg) => {
      setError(msg || 'Failed to find matches. Please try again.');
      setIsLoading(false);
      setIsRefining(false);
    },
  });

  // Start match stream on mount
  useEffect(() => {
    if (!journeyId && !stylistThreadId) {
      setError('No journey found. Please complete the style quiz first.');
      setIsLoading(false);
      return;
    }

    cleanupRef.current = findTheLookService.startMatchStream(
      journeyId,
      stylistThreadId,
      makeCallbacks()
    );

    return () => {
      cleanupRef.current?.();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Get fitting room items from context
  const queueItems = queue
    .filter(slot => slot.product !== null)
    .map(slot => slot.product);

  const handleSelectLook = (look) => {
    setSelectedLook(look);
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleAddToQueue = (item) => {
    const wasAdded = addToQueue(item);
    if (wasAdded) {
      setGrowl({ show: true, message: `Added ${item.name} to fitting room`, type: 'success' });
      setTimeout(() => setGrowl({ show: false, message: '', type: 'success' }), 3000);
      return true;
    }

    setGrowl({ show: true, message: 'Fitting room is full', type: 'error' });
    setTimeout(() => setGrowl({ show: false, message: '', type: 'error' }), 3000);
    return false;
  };

  const handleAddAllToQueue = (items) => {
    const addedCount = addMultipleToQueue(items);
    if (addedCount > 0) {
      setGrowl({ show: true, message: `Added ${addedCount} items to fitting room`, type: 'success' });
      setTimeout(() => setGrowl({ show: false, message: '', type: 'success' }), 3000);
    }
    return addedCount;
  };

  const handleRemoveFromQueue = (itemId) => {
    const slotIndex = queue.findIndex(slot => slot.product?.id === itemId);
    if (slotIndex !== -1) {
      removeFromQueue(slotIndex);
    }
  };


  const handleToggleFeedback = () => {
    setShowFeedbackInput(prev => !prev);
    setFeedbackText('');
  };

  const handleFeedbackSubmit = () => {
    if (!feedbackText.trim() || !threadId || (!journeyId && !stylistThreadId)) return;

    setIsRefining(true);
    setShowFeedbackInput(false);

    cleanupRef.current?.();
    cleanupRef.current = findTheLookService.refineMatchStream(
      journeyId,
      stylistThreadId,
      threadId,
      feedbackText.trim(),
      makeCallbacks(() => {
        setGrowl({ show: true, message: 'Matches refined!', type: 'success' });
        setTimeout(() => setGrowl({ show: false, message: '', type: 'success' }), 3000);
      }, true)
    );

    setFeedbackText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleFeedbackSubmit();
    }
  };

  // Error state
  if (error) {
    return (
      <div style={{
        height: '100vh',
        backgroundColor: '#FFE4E9',
        fontFamily: '"Readex Pro", -apple-system, sans-serif',
      }}>
        <Header variant="full" />
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 'calc(100vh - 65px)',
        }}>
          <div style={{
            maxWidth: '500px',
            padding: '32px',
            backgroundColor: '#fff',
            borderRadius: '16px',
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
      </div>
    );
  }

  const pageStyle = {
    height: '100vh',
    backgroundColor: '#FFE4E9',
    fontFamily: '"Readex Pro", -apple-system, sans-serif',
    overflow: 'hidden',
  };

  const gridContainerStyle = {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    height: 'calc(100vh - 65px)',
  };

  const mainContentStyle = {
    display: 'grid',
    gridTemplateRows: 'auto 2fr 1.5fr 1fr',
    gap: '12px',
    height: '100%',
    padding: '24px 48px',
    overflow: 'hidden',
  };

  const sidebarStyle = {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 24px',
  };

  const titleStyle = {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1A202C',
    margin: 0,
    marginTop: '4px',
  };

  const chatAreaStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    overflow: 'visible',
    padding: '0',
    minHeight: 0,
  };

  const chatInputContainerStyle = {
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end',
    marginTop: 'auto',
    width: '100%',
    boxSizing: 'border-box',
  };

  const chatInputStyle = {
    flex: '1',
    padding: '0 20px',
    borderRadius: '24px',
    border: '1px solid #E2E8F0',
    fontSize: '14px',
    outline: 'none',
    fontFamily: '"Readex Pro", -apple-system, sans-serif',
    height: '44px',
    boxSizing: 'border-box',
  };

  const sendButtonStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: '#793DB0',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s',
  };

  const refineSectionStyle = {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    zIndex: 1000
  };

  const refineTextStyle = {
    fontSize: '14px',
    color: '#4A5568',
    margin: 0,
  };

  const refineButtonStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '2px solid transparent',
    background: 'white',
    backgroundClip: 'padding-box',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    position: 'relative',
  };

  // Loading / Thinking state overlay for main content
  const renderLoadingState = () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      gap: '24px',
      gridRow: '2 / 4',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 24px',
        borderRadius: '24px',
        background: 'rgba(121, 61, 176, 0.08)',
        border: '1px solid rgba(121, 61, 176, 0.15)',
      }}>
        <Sparkles size={16} color="#793DB0" />
        <span style={{ fontSize: '14px', fontWeight: '600', color: '#793DB0' }}>
          {isThinking ? 'Finding your perfect looks' : 'Preparing matches'}
        </span>
        <span style={{ display: 'flex', gap: '3px' }}>
          {[0, 1, 2].map(i => (
            <span key={i} style={{
              width: '4px', height: '4px',
              backgroundColor: '#793DB0', borderRadius: '50%',
              animation: `wiggle 1.4s ease-in-out infinite ${i * 0.2}s`,
            }} />
          ))}
        </span>
      </div>
      {thinkingText && (
        <div className="thinking-content" style={{
          maxWidth: '500px',
          maxHeight: '150px',
          overflowY: 'auto',
          fontSize: '12px',
          lineHeight: '1.6',
          color: '#666',
          textAlign: 'left',
          padding: '0 16px',
        }}>
          <Markdown>{thinkingText}</Markdown>
        </div>
      )}
      {/* Shimmer placeholders */}
      <div style={{ display: 'flex', gap: '16px' }}>
        {[0, 1, 2].map(i => (
          <div key={i} className="shimmer-bar" style={{
            width: '160px',
            height: '200px',
            borderRadius: '12px',
          }} />
        ))}
      </div>
    </div>
  );

  return (
    <div style={pageStyle}>
      <Header variant="full" />

      <style>{`
        @media (max-width: 900px) {
          .find-look-grid {
            display: block;
            height: auto;
          }
          .fitting-room-sidebar {
            width: 100%;
            height: auto;
          }
        }

        .items-scroll-container::-webkit-scrollbar {
          height: 8px;
        }
        .items-scroll-container::-webkit-scrollbar-track {
          background: #F7FAFC;
          border-radius: 4px;
        }
        .items-scroll-container::-webkit-scrollbar-thumb {
          background: #CBD5E0;
          border-radius: 4px;
        }
        .items-scroll-container::-webkit-scrollbar-thumb:hover {
          background: #A0AEC0;
        }

        @keyframes wiggle {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }

        @keyframes shimmer {
          from { background-position: -200% 0; }
          to   { background-position: 200% 0; }
        }

        .shimmer-bar {
          background: linear-gradient(90deg, #f0e6f6 25%, #e8d5f5 50%, #f0e6f6 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        .ai-bubble-shimmer {
          position: relative;
          overflow: hidden;
        }

        .ai-bubble-shimmer::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.65) 50%, rgba(255,255,255,0) 100%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }

        .thinking-content p { margin: 2px 0; }
        .thinking-content strong { font-weight: 700; color: #555; }
        .thinking-content em { font-style: italic; }
        .thinking-content ul, .thinking-content ol { margin: 2px 0; padding-left: 18px; }
        .thinking-content li { margin: 1px 0; }
        .thinking-content h1, .thinking-content h2, .thinking-content h3 {
          font-size: 12px; font-weight: 700; color: #555; margin: 6px 0 2px;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      <div style={gridContainerStyle} className="find-look-grid">
        {/* Main Content */}
        <main style={mainContentStyle}>
          {/* Page Title - Journey Name */}
          <h1 style={titleStyle}>{journeyTitle}</h1>

          {(isLoading || isRefining) ? renderLoadingState() : (
            <>
              {/* Row 2: Look Carousel */}
              <section style={{ overflow: 'hidden' }}>
                {looks.length > 0 && (
                  <LookCarousel
                    looks={looks}
                    onSelectLook={handleSelectLook}
                  />
                )}
              </section>

              {/* Row 3: Items Grid */}
              <section style={{ overflow: 'hidden', minHeight: 0 }}>
                {selectedLook?.items && (
                  <ItemGrid
                    items={selectedLook.items}
                    onItemClick={handleItemClick}
                    onAddToQueue={handleAddToQueue}
                    onAddAllToQueue={handleAddAllToQueue}
                  />
                )}
              </section>
            </>
          )}

          {/* Row 4: Chat Area - AI Message + Refine/Feedback */}
          <section style={chatAreaStyle}>
            {/* AI Recommendation */}
            {aiMessage && !isLoading && (
              <div style={{ overflow: 'visible', minHeight: 'fit-content', width: '100%' }}>
                <AIChatBubble message={aiMessage} isShimmering={isRefining} />
              </div>
            )}

            {/* Refine / Feedback — single row */}
            {!isLoading && !isRefining && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'flex-end',
                marginTop: 'auto',
                height: '44px',
              }}>
                {/* Text input — expands when active */}
                {showFeedbackInput && (
                  <input
                    type="text"
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Tell me what you'd like..."
                    style={chatInputStyle}
                    autoFocus
                  />
                )}

                {/* Refine label — hidden when input is open */}
                {!showFeedbackInput && (
                  <p
                    style={{ ...refineTextStyle, cursor: 'pointer' }}
                    onClick={handleToggleFeedback}
                  >
                    Not quite right? Refine your search
                  </p>
                )}

                {/* Send button — only when input is open */}
                {showFeedbackInput && (
                  <button
                    onClick={handleFeedbackSubmit}
                    style={sendButtonStyle}
                    disabled={!feedbackText.trim() || isRefining}
                    aria-label="Send feedback"
                  >
                    <ArrowRight size={20} />
                  </button>
                )}

                {/* Gradient circle button — toggles input */}
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #793DB0 0%, #9F6AD6 100%)',
                    padding: '2px',
                    flexShrink: 0,
                    cursor: 'pointer',
                  }}
                  onClick={handleToggleFeedback}
                >
                  <button
                    style={{
                      ...refineButtonStyle,
                      width: '100%',
                      height: '100%',
                      background: 'white',
                      border: 'none',
                    }}
                    aria-label={showFeedbackInput ? 'Close feedback' : 'Refine search'}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#F7FAFC'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; }}
                  >
                    {showFeedbackInput ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#793DB0" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    ) : (
                      <MessageCircle
                        size={20}
                        style={{
                          background: 'linear-gradient(135deg, #793DB0 0%, #9F6AD6 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                        }}
                      />
                    )}
                  </button>
                </div>
              </div>
            )}
          </section>
        </main>

        {/* Fitting Room Sidebar */}
        <aside style={sidebarStyle} className="fitting-room-sidebar">
          <FittingRoomQueue
            items={queueItems}
            onRemoveItem={handleRemoveFromQueue}
          />
        </aside>
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddToQueue={handleAddToQueue}
      />

      {/* Backdrop overlay - closes sidebar when clicked */}
      {isJourneySidebarExpanded && (
        <div
          onClick={() => setIsJourneySidebarExpanded(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            zIndex: 100,
            animation: 'fadeIn 0.3s ease-out',
          }}
        />
      )}

      {/* Push/Pull Tab - always visible */}
      <div
        onClick={() => setIsJourneySidebarExpanded(!isJourneySidebarExpanded)}
        style={{
          position: 'fixed',
          right: isJourneySidebarExpanded ? 'calc(30vw + 1px)' : '8px',
          top: '100px',
          zIndex: 102,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '12px 16px',
          backgroundColor: 'var(--card-background, #ffffff)',
          borderRadius: '8px 0 0 8px',
          boxShadow: '-2px 2px 8px rgba(0,0,0,0.15)',
          cursor: 'pointer',
          transition: 'right 0.3s ease-out',
          border: '1px solid var(--border-color, #e2e8f0)',
          borderRight: 'none',
        }}
      >
        {isJourneySidebarExpanded ? (
          <ChevronRight size={18} color="var(--consumer-purple, #793DB0)" />
        ) : (
          <ChevronLeft size={18} color="var(--consumer-purple, #793DB0)" />
        )}
        <span style={{
          fontSize: '13px',
          fontWeight: '600',
          color: 'var(--consumer-purple, #793DB0)',
          whiteSpace: 'nowrap',
        }}>
          Summary
        </span>
      </div>

      {/* Journey Sidebar Card - slides in from right */}
      <div
        style={{
          position: 'fixed',
          right: '16px',
          top: '80px',
          width: '30vw',
          minWidth: '350px',
          maxWidth: '500px',
          height: '85vh',
          zIndex: 101,
          transform: isJourneySidebarExpanded ? 'translateX(0)' : 'translateX(calc(100% + 1px))',
          transition: 'transform 0.3s ease-out',
          backgroundColor: 'var(--card-background, #ffffff)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ height: '100%', padding: '16px' }}>
          <JourneyBuilderSidebar
            foundations={navFoundations || []}
            narrativeText={navNarrative || ''}
            currentBatch={1}
            journeyTitle={journeyTitle}
            onTitleChange={setJourneyTitle}
            isExpanded={isJourneySidebarExpanded}
            onToggle={() => setIsJourneySidebarExpanded(!isJourneySidebarExpanded)}
            moodBoardUrl={navMoodBoardUrl}
          />
        </div>
      </div>

      {/* Growl Notification */}
      <Growl
        message={growl.message}
        type={growl.type}
        show={growl.show}
        onClose={() => setGrowl({ show: false, message: '', type: 'success' })}
        customStyle={{
          background: '#FFFFFF',
          textColor: '#1A202C',
          border: '#E2E8F0'
        }}
      />

      {/* Floating Mascot Button - Navigate to Fitting Room */}
      <Mascot
        variant="default"
        message="Let's fit!"
        onClick={() => navigate('/fitting-room')}
        position="bottom-right"
      />
    </div>
  );
};

export default FindTheLookPage;