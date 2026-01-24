import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeColors } from '../hooks/useThemeColors';
import Header from '../components/common/Header/Header';
import EventDatePicker from '../components/home/EventDatePicker/EventDatePicker';
import RecommendationSection from '../components/home/RecommendationSection/RecommendationSection';
import Mascot from '../components/common/Mascot/Mascot';

// Mock recommendation data
const mockRecommendations = {
  valentines: [
    { id: '1', style: 'Casual', tags: ['Date Night', 'Date Night'], imageUrl: null },
    { id: '2', style: 'Chill', tags: ['Date Night', 'Date Night'], imageUrl: null },
    { id: '3', style: 'Fancy', tags: ['Date Night', 'Date Night'], imageUrl: null },
    { id: '4', style: 'Bold', tags: ['Date Night', 'Date Night'], imageUrl: null },
  ],
  roomDecor: [
    { id: '5', style: 'Casual', tags: ['Date Night', 'Date Night'], imageUrl: null },
    { id: '6', style: 'Casual', tags: ['Date Night', 'Date Night'], imageUrl: null },
    { id: '7', style: 'Casual', tags: ['Date Night', 'Date Night'], imageUrl: null },
    { id: '8', style: 'Casual', tags: ['Date Night', 'Date Night'], imageUrl: null },
  ]
};

export default function StorefrontLandingPage() {
  const navigate = useNavigate();
  const colors = useThemeColors();

  const [searchQuery, setSearchQuery] = useState('');
  const [eventName, setEventName] = useState('xxx');
  const [selectedDate, setSelectedDate] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    // Navigate to quiz page with search query as initial prompt
    setTimeout(() => {
      navigate('/quiz', { state: { initialPrompt: searchQuery } });
      setIsSearching(false);
    }, 1500);
  };

  const handleJustBrowsing = () => {
    navigate('/browse');
  };

  return (
    <div className="storefront-page" style={{
      minHeight: '100vh',
      background: colors.page.background,
      fontFamily: '"Inter", -apple-system, sans-serif',
      position: 'relative',
    }}>
      <Header
        variant="full"
        showNav={true}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearch={handleSearch}
      />

      {/* Event Picker */}
      <section className="event-section" style={{
        padding: '0 48px 48px',
        textAlign: 'center',
      }}>
        <EventDatePicker
          selectedDate={selectedDate}
          eventName={eventName}
          onDateChange={setSelectedDate}
          onEventNameChange={setEventName}
        />
      </section>

      {/* Recommendations for Valentines Day Date */}
      <RecommendationSection
        title="Valentines Day Date"
        recommendations={mockRecommendations.valentines}
        onSeeMore={() => navigate('/browse/valentines-day')}
      />

      {/* Recommendations for Room Decorating Project */}
      <RecommendationSection
        title="Room Decorating Project"
        recommendations={mockRecommendations.roomDecor}
        onSeeMore={() => navigate('/browse/room-decor')}
      />

      {/* Mascot */}
      <Mascot
        message={isSearching ? "Searching the racks..." : ""}
        isSearching={isSearching}
        position="bottom-right"
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        /* Tablet */
        @media (max-width: 1024px) {
          .event-section {
            padding: 0 24px 32px !important;
          }
        }

        /* Mobile */
        @media (max-width: 768px) {
          .event-section {
            padding: 0 16px 24px !important;
          }
        }
      `}</style>
    </div>
  );
}
