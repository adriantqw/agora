import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeColors } from '../hooks/useThemeColors';
import Header from '../components/common/Header/Header';
import Mascot from '../components/common/Mascot/Mascot';
import JourneyHero from '../components/consumer/JourneyHero/JourneyHero';
import JourneySection from '../components/consumer/JourneySection/JourneySection';
import Footer from '../components/consumer/Footer/Footer';
import { guestMockData } from '../data/guestMockData';
import { useAuth } from '../contexts/AuthContext';
import journeyService from '../services/journeyService';
import { getIconByName } from '../utils/iconMapper';

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
  const { isAuthenticated } = useAuth();
  const [notification, setNotification] = useState(null);
  const [journeys, setJourneys] = useState(guestMockData);

  useEffect(() => {
    const fetchJourneys = async () => {
      if (isAuthenticated) {
        try {
          const data = await journeyService.getJourneys();
          if (data && data.length > 0) {
            // Transform backend data to frontend format
            const formattedJourneys = data.map(j => ({
              id: j.id,
              title: j.title,
              status: j.status,
              statusColor: j.status_color,
              statusLabel: j.status_label,
              closetUrl: j.closet_url,
              outfits: j.outfits.map(o => ({
                id: o.id,
                label: o.label,
                subtext: o.subtext,
                price: o.price,
                imageUrl: o.image_url,
                icon: getIconByName(o.icon_name),
                iconColor: o.icon_color,
                backgroundColor: o.background_color,
                isAIPick: o.is_ai_pick
              }))
            }));
            setJourneys(formattedJourneys);
          }
        } catch (error) {
          console.error("Failed to fetch journeys", error);
          // Fallback to guest data is already set
        }
      } else {
        setJourneys(guestMockData);
      }
    };

    fetchJourneys();
  }, [isAuthenticated]);

  const handleSearch = (query) => {
    // Navigate to journey page with search query
    navigate('/journey', { state: { searchQuery: query } });
  };

  const handleOutfitAdd = (outfit, journey) => {
    // For guests, redirect to login on "Add"
    if (!isAuthenticated) {
        navigate('/login');
    } else {
        setNotification(`Added ${outfit.label} to closet!`);
        setTimeout(() => setNotification(null), 3000);
    }
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
        {journeys.map((journey, index) => (
          <React.Fragment key={journey.id}>
            <JourneySection
              journey={journey}
              onOutfitAdd={handleOutfitAdd}
            />
            {index < journeys.length - 1 && (
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