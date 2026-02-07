import { useState } from 'react';
import { useFittingRoom } from '../contexts/FittingRoomContext';
import { MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '../components/common/Header/Header';
import LookCarousel from '../components/find-the-look/LookCarousel';
import ItemGrid from '../components/find-the-look/ItemGrid';
import AIChatBubble from '../components/find-the-look/AIChatBubble';
import ProductDetailModal from '../components/find-the-look/ProductDetailModal';
import FittingRoomQueue from '../components/find-the-look/FittingRoomQueue';
import JourneyBuilderSidebar from '../components/consumer/JourneyBuilder/JourneyBuilderSidebar';
import Growl from '../components/common/Growl/Growl';
import { mockLooks, aiRecommendations } from '../data/mockLooks';

const FindTheLookPage = () => {
  const [selectedLook, setSelectedLook] = useState(mockLooks[1]); // Start with middle item
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isJourneySidebarExpanded, setIsJourneySidebarExpanded] = useState(false);
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [journeyTitle, setJourneyTitle] = useState("Casual Dinner Journey");

  const [growl, setGrowl] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  const { addToQueue } = useFittingRoom();

  // Get fitting room items from context
  const getQueueItems = () => {
    // This is a placeholder - you'd get actual items from your fitting room context
    // For now, returning empty array
    return [];
  };

  const queueItems = getQueueItems();

  const handleSelectLook = (look) => {
    setSelectedLook(look);
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleAddToQueue = (item) => {
    addToQueue(item);
    // Optional: Show toast notification
    console.log('Added to queue:', item.name);
  };

  const handleRemoveFromQueue = (itemId) => {
    // This is a placeholder - you'd implement actual remove logic
    console.log('Removed from queue:', itemId);
  };

  const handleToggleFeedback = () => {
    setShowFeedbackInput(prev => !prev);
    setFeedbackText('');
  };

  const handleFeedbackSubmit = () => {
    if (feedbackText.trim()) {
      console.log('Feedback submitted:', feedbackText);

      setGrowl({
        show: true,
        message: 'Feedback sent successfully!',
        type: 'success'
      });

      setFeedbackText('');
      setShowFeedbackInput(false);

      setTimeout(() => {
        setGrowl({ show: false, message: '', type: 'success' });
      }, 3000);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleFeedbackSubmit();
    }
  };

  const currentRecommendation = aiRecommendations[selectedLook?.id];

  const pageStyle = {
    height: '100vh',
    backgroundColor: '#FFE4E9',
    fontFamily: '"Readex Pro", -apple-system, sans-serif',
    overflow: 'hidden',
  };

  const gridContainerStyle = {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    height: 'calc(100vh - 65px)', // 65px = header height
  };

  const mainContentStyle = {
    display: 'grid',
    gridTemplateRows: 'auto 2.5fr 1.5fr 1fr',
    gap: '24px',
    height: '100%',
    padding: '32px 64px',
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
    fontSize: '32px',
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: '16px',
    margin: 0,
  };

  const itemsGridContainerStyle = {
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  };

  const chatAreaStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    overflow: 'hidden',
    paddingRight: '24px',
  };

  const chatInputContainerStyle = {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    marginTop: 'auto',
    maxWidth: '600px',
    width: '100%',
  };

  const chatInputStyle = {
    flex: '1',
    padding: '12px 16px',
    borderRadius: '24px',
    border: '1px solid #E2E8F0',
    fontSize: '14px',
    outline: 'none',
    fontFamily: '"Readex Pro", -apple-system, sans-serif',
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
      `}</style>

      <div style={gridContainerStyle} className="find-look-grid">
        {/* Main Content */}
        <main style={mainContentStyle}>
          {/* Page Title - Journey Name */}
          <h1 style={titleStyle}>{journeyTitle}</h1>

          {/* Look Carousel */}
          <section style={{ overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
            <LookCarousel
              looks={mockLooks}
              onSelectLook={handleSelectLook}
            />
          </section>

          {/* Items Grid */}
          <section style={itemsGridContainerStyle}>
            <div
              className="items-scroll-container"
              style={{
                overflowX: 'auto',
                overflowY: 'hidden',
                height: '100%',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              <ItemGrid
                items={selectedLook.items}
                onItemClick={handleItemClick}
                onAddToQueue={handleAddToQueue}
              />
            </div>
          </section>

          {/* Chat Area - AI Message + User Input + Refine Search */}
          <section style={chatAreaStyle}>
            {/* AI Recommendation */}
            {currentRecommendation && (
              <div style={{ flex: '1', overflowY: 'auto' }}>
                <AIChatBubble
                  message={currentRecommendation.message}
                />
              </div>
            )}

            {/* Feedback Input (replaces Refine Search when active) */}
            {showFeedbackInput ? (
              <div style={chatInputContainerStyle}>
                <input
                  type="text"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Tell me what you'd like..."
                  style={chatInputStyle}
                  autoFocus
                />
                <button
                  onClick={handleFeedbackSubmit}
                  style={sendButtonStyle}
                  disabled={!feedbackText.trim()}
                  aria-label="Send feedback"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2 11" />
                  </svg>
                </button>
                <button
                  onClick={() => setShowFeedbackInput(false)}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: '#718096',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                  aria-label="Close feedback"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F7FAFC';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ) : (
              /* Refine Search Bubble */
              <div
                style={refineSectionStyle}
                onClick={handleToggleFeedback}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.opacity = '1';
                }}
              >
                <p style={refineTextStyle}>Not quite right? Refine your search</p>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #793DB0 0%, #9F6AD6 100%)',
                  padding: '2px',
                }}>
                  <button
                    style={{
                      ...refineButtonStyle,
                      width: '100%',
                      height: '100%',
                      background: 'white',
                      border: 'none',
                    }}
                    aria-label="Refine search"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#F7FAFC';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'white';
                    }}
                  >
                    <MessageCircle
                      size={20}
                      style={{
                        background: 'linear-gradient(135deg, #793DB0 0%, #9F6AD6 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    />
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
            foundations={[
              { label: 'Location', values: ['New York'] },
              { label: 'Style', values: ['Casual', 'Chic'] },
              { label: 'Occasion', values: ['Dinner'] },
            ]}
            narrativeText="Shopping from New York for a casual chic dinner look. Budget: $100-$300."
            currentBatch={1}
            journeyTitle={journeyTitle}
            onTitleChange={setJourneyTitle}
            isExpanded={isJourneySidebarExpanded}
            onToggle={() => setIsJourneySidebarExpanded(!isJourneySidebarExpanded)}
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

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default FindTheLookPage;
