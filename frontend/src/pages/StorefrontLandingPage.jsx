import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeColors } from '../hooks/useThemeColors';
import Header from '../components/common/Header/Header';
import SearchBar from '../components/common/SearchBar/SearchBar';
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
    // Navigate to search page after animation
    setTimeout(() => {
      navigate('/search', { state: { query: searchQuery } });
      setIsSearching(false);
    }, 1500);
  };

  const handleQuizClick = () => {
    navigate('/quiz');
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
        onQuizClick={handleQuizClick}
      />

      {/* Search Section */}
      <section className="search-section" style={{
        padding: '48px 48px 32px',
        textAlign: 'center',
      }}>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onSearch={handleSearch}
          placeholder="What are you looking for?"
          showMenuButton={true}
          showJustBrowsing={true}
          onMenuClick={() => console.log('Menu clicked')}
          onJustBrowsingClick={handleJustBrowsing}
        />
      </section>

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
          .search-section {
            padding: 32px 24px 24px !important;
          }

          .event-section {
            padding: 0 24px 32px !important;
          }
        }

        /* Mobile */
        @media (max-width: 768px) {
          .search-section {
            padding: 24px 16px 16px !important;
          }

          .event-section {
            padding: 0 16px 24px !important;
          }
        }
      `}</style>
    </div>
  );
}
