import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/common/Header/Header';
import Mascot from '../components/common/Mascot/Mascot';
import FilterTag from '../components/quiz/FilterTag/FilterTag';
import { CONSUMER_THEME } from '../contexts/SearchContext';
import { getFilterCount } from '../services/quizService';

export default function SearchResultsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchData = location.state || {};
  const { query = '', filters = {}, useExistingPreferences = false } = searchData;

  const filterCount = getFilterCount(filters);
  const hasFilters = filterCount > 0 || useExistingPreferences;

  const handleRefineSearch = () => {
    navigate('/journey');
  };

  const handleRemoveFilter = (category, label) => {
    // For now, just alert - in production, this would update filters and re-search
    console.log('Remove filter:', category, label);
    alert('Filter removal will be implemented with backend integration');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F9F9F9',
      fontFamily: '"Inter", -apple-system, sans-serif',
      position: 'relative',
    }}>
      <Header
        variant="full"
        showNav={true}
        onQuizClick={() => navigate('/journey')}
      />

      <div style={{
        padding: '64px 48px',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: '700',
            color: '#1a202c',
            marginBottom: '16px',
          }}>
            Your Perfect Matches
          </h1>
          {query && (
            <p style={{
              fontSize: '18px',
              color: '#718096',
              marginBottom: '16px',
            }}>
              Searching for: <strong style={{ color: CONSUMER_THEME.primary }}>"{query}"</strong>
            </p>
          )}
          {hasFilters && (
            <p style={{
              fontSize: '16px',
              color: '#718096',
            }}>
              {filterCount} filter{filterCount !== 1 ? 's' : ''} applied
            </p>
          )}
        </div>

        {/* Active Filters Section */}
        {hasFilters && (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            marginBottom: '48px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#2d3748',
                margin: 0,
              }}>
                Active Filters
              </h2>
              <button
                onClick={handleRefineSearch}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: CONSUMER_THEME.primary,
                  background: 'transparent',
                  border: `2px solid ${CONSUMER_THEME.primary}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = CONSUMER_THEME.primary;
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = CONSUMER_THEME.primary;
                }}
              >
                Refine Search
              </button>
            </div>

            {/* Filters Grid */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}>
              {/* Date & Time */}
              {filters.dateTime && filters.dateTime.length > 0 && (
                <FilterRow
                  title="Date & Time"
                  filters={filters.dateTime}
                  category="dateTime"
                  onRemove={handleRemoveFilter}
                />
              )}

              {/* Style Preferences */}
              {filters.style && filters.style.length > 0 && (
                <FilterRow
                  title="Style Preferences"
                  filters={filters.style}
                  category="style"
                  onRemove={handleRemoveFilter}
                />
              )}

              {/* Budget */}
              {filters.price && (
                <FilterRow
                  title="Budget"
                  filters={[filters.price]}
                  category="price"
                  onRemove={handleRemoveFilter}
                />
              )}

              {/* Add-ons */}
              {filters.addOns && filters.addOns.length > 0 && (
                <FilterRow
                  title="Add-ons"
                  filters={filters.addOns}
                  category="addOns"
                  onRemove={handleRemoveFilter}
                />
              )}

              {/* Existing Preferences */}
              {useExistingPreferences && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  background: '#f7fafc',
                  borderRadius: '8px',
                  border: `1px solid ${CONSUMER_THEME.primaryLight}`,
                }}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={CONSUMER_THEME.primary}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span style={{ fontSize: '14px', color: '#2d3748', fontWeight: '500' }}>
                    Using existing wedding preferences
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results Section (Placeholder) */}
        <div style={{
          textAlign: 'center',
          padding: '64px 32px',
        }}>
          <div style={{
            fontSize: '64px',
            marginBottom: '24px',
          }}>
            🎉
          </div>
          <h2 style={{
            fontSize: '32px',
            fontWeight: '600',
            color: '#2d3748',
            marginBottom: '16px',
          }}>
            Product Results Coming Soon
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#718096',
            marginBottom: '32px',
            lineHeight: '1.6',
            maxWidth: '600px',
            margin: '0 auto 32px',
          }}>
            We're building an amazing product discovery experience based on your preferences.
            The search filters are working perfectly - next up is connecting to our product catalog!
          </p>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            flexWrap: 'wrap',
          }}>
            <button
              onClick={() => navigate('/')}
              style={{
                padding: '16px 32px',
                fontSize: '16px',
                fontWeight: '600',
                color: 'white',
                background: CONSUMER_THEME.gradient,
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                boxShadow: `0 4px 16px ${CONSUMER_THEME.primaryGlow}`,
              }}
            >
              Back to Home
            </button>

            {!hasFilters && (
              <button
                onClick={handleRefineSearch}
                style={{
                  padding: '16px 32px',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: CONSUMER_THEME.primary,
                  background: 'white',
                  border: `2px solid ${CONSUMER_THEME.primary}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                }}
              >
                Take the Quiz
              </button>
            )}
          </div>
        </div>
      </div>

      <Mascot
        message={hasFilters ? "Found some great options!" : "Let me help you find what you're looking for!"}
        isSearching={false}
        position="bottom-right"
      />
    </div>
  );
}

/**
 * FilterRow Component
 * Displays a row of filters with a title
 */
function FilterRow({ title, filters, category, onRemove }) {
  return (
    <div style={{
      display: 'flex',
      gap: '16px',
      alignItems: 'flex-start',
    }}>
      <div style={{
        minWidth: '140px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#4a5568',
        paddingTop: '8px',
      }}>
        {title}
      </div>
      <div style={{
        flex: 1,
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
      }}>
        {filters.map((filter, index) => (
          <FilterTag
            key={`${category}-${index}`}
            label={filter}
            category={category}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
}
