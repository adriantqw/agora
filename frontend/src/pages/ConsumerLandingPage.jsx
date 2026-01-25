import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeColors } from '../hooks/useThemeColors';
import Header from '../components/common/Header/Header';
import Mascot from '../components/common/Mascot/Mascot';
import JourneyHero from '../components/consumer/JourneyHero/JourneyHero';
import JourneySection from '../components/consumer/JourneySection/JourneySection';
import Footer from '../components/consumer/Footer/Footer';
import { guestMockData } from '../data/guestMockData';

/**
 * ConsumerLandingPage
 *
 * Journey-based homepage featuring:
 * - Header with journey navigation
 * - Hero section with AI stylist search
 * - 3 journey sections with outfit cards
 * - Footer with links and merchant portal
 * - AI FAB for future chat functionality
 */
const ConsumerLandingPage = () => {
  const colors = useThemeColors();
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);

  const handleSearch = (query) => {
    // Navigate to journey page with search query
    navigate('/journey', { state: { searchQuery: query } });
  };

  const handleOutfitAdd = (outfit, journey) => {
    // For guests, redirect to login on "Add"
    navigate('/login');
  };

  const handleAIFabClick = () => {
    // Future: Open AI chat modal
    console.log('AI FAB clicked - will open AI chat modal');
    setNotification('AI Chat coming soon!');
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div
      style={{
        background: colors.page.background,
        minHeight: '100vh',
      }}
    >
      {/* Header with landing variant */}
      <Header variant="landing" showNav={true} />

      {/* Hero Section */}
      <JourneyHero
        onSearch={handleSearch}
      />

      {/* Journey Sections */}
      <main
        style={{
          padding: '80px 6%',
          maxWidth: '1600px',
          margin: '0 auto',
        }}
      >
        {guestMockData.map((journey, index) => (
          <React.Fragment key={journey.id}>
            <JourneySection
              journey={journey}
              onOutfitAdd={handleOutfitAdd}
            />
            {index < guestMockData.length - 1 && (
              <div style={{
                height: '2px',
                background: colors.border.divider,
                margin: '80px 0',
                width: '100%',
                opacity: 0.8
              }} />
            )}
          </React.Fragment>
        ))}
      </main>

      {/* Footer */}
      <Footer />

      {/* AI FAB */}
      <Mascot variant="fab" position="bottom-right" onClick={handleAIFabClick} />

      {/* Toast Notification */}
      {notification && (
        <div
          style={{
            position: 'fixed',
            bottom: '100px',
            right: '20px',
            background: colors.text.primary,
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            zIndex: 1000,
            animation: 'slideInRight 0.3s ease-out',
          }}
        >
          {notification}
        </div>
      )}

      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ConsumerLandingPage;
