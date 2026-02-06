import { useState } from 'react';
import { useFittingRoom } from '../contexts/FittingRoomContext';
import { MessageCircle } from 'lucide-react';
import Header from '../components/common/Header/Header';
import LookCarousel from '../components/find-the-look/LookCarousel';
import ItemGrid from '../components/find-the-look/ItemGrid';
import AIChatBubble from '../components/find-the-look/AIChatBubble';
import ProductDetailModal from '../components/find-the-look/ProductDetailModal';
import FittingRoomQueue from '../components/find-the-look/FittingRoomQueue';
import { mockLooks, aiRecommendations } from '../data/mockLooks';

const FindTheLookPage = () => {
  const [selectedLook, setSelectedLook] = useState(mockLooks[1]); // Start with middle item
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    gridTemplateRows: 'auto 2fr 1.5fr 1fr',
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
  };

  const chatInputContainerStyle = {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    marginTop: 'auto',
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
          <h1 style={titleStyle}>{selectedLook.name}</h1>

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
                  avatarSrc="/avatars/ai-blob.png"
                />
              </div>
            )}

            {/* Refine Search Bubble */}
            <div style={refineSectionStyle}>
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
    </div>
  );
};

export default FindTheLookPage;
