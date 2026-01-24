import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeColors } from '../hooks/useThemeColors';
import Header from '../components/common/Header/Header';
import Mascot from '../components/common/Mascot/Mascot';
import JourneyHero from '../components/consumer/JourneyHero/JourneyHero';
import JourneySection from '../components/consumer/JourneySection/JourneySection';
import Footer from '../components/consumer/Footer/Footer';
import { mockJourneys } from '../data/mockJourneys';

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
    // Future: Add to cart functionality
    console.log('Add outfit to cart:', outfit, 'from journey:', journey.title);

    // Show notification
    setNotification(`Added "${outfit.label}" to your closet!`);
    setTimeout(() => setNotification(null), 3000);
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
        background: colors.surface.light,
        minHeight: '100vh',
      }}
    >
      {/* Header with journey variant */}
      <Header variant="journey" showNav={true} />

      {/* Hero Section */}
      <JourneyHero
        onSearch={handleSearch}
        activeJourneys={3}
        savedConcepts={12}
      />

      {/* Journey Sections */}
      <main
        style={{
          padding: '40px 6%',
          maxWidth: '1600px',
          margin: '0 auto',
        }}
      >
        {mockJourneys.map((journey) => (
          <JourneySection
            key={journey.id}
            journey={journey}
            onOutfitAdd={handleOutfitAdd}
          />
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
