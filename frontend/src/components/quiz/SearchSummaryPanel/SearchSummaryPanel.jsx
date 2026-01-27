/**
 * SearchSummaryPanel Component
 *
 * Right-side sticky panel displaying accumulated search filters in real-time
 * Responsive: Desktop = sticky sidebar, Mobile = sticky bottom sheet
 */

import { useState } from 'react';
import { useSearchContext, CONSUMER_THEME } from '../../../contexts/SearchContext';
import FilterTag from '../FilterTag/FilterTag';
import { getFilterCount } from '../../../services/quizService';

export default function SearchSummaryPanel() {
  const {
    filters,
    removeFilter,
    useExistingPreferences,
    toggleExistingPreferences
  } = useSearchContext();

  const [isMobileExpanded, setIsMobileExpanded] = useState(true);

  const filterCount = getFilterCount(filters);
  const hasFilters = filterCount > 0 || useExistingPreferences;

  return (
    <>
      {/* Desktop View - Sticky Sidebar */}
      <div
        className="search-summary-desktop"
        role="complementary"
        aria-label="Search summary"
        style={{
          position: 'sticky',
          top: '100px',
          maxHeight: 'calc(100vh - 120px)',
          overflowY: 'auto',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}
      >
        <SummaryContent
          hasFilters={hasFilters}
          filterCount={filterCount}
          filters={filters}
          removeFilter={removeFilter}
          useExistingPreferences={useExistingPreferences}
          toggleExistingPreferences={toggleExistingPreferences}
        />
      </div>

      {/* Mobile View - Sticky Bottom Sheet */}
      <div
        className="search-summary-mobile"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'white',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.15)',
          zIndex: 1000,
          transition: 'transform 0.3s ease',
          transform: isMobileExpanded ? 'translateY(0)' : 'translateY(calc(100% - 60px))',
          maxHeight: '70vh',
          display: 'none'
        }}
      >
        {/* Toggle Handle */}
        <button
          onClick={() => setIsMobileExpanded(!isMobileExpanded)}
          aria-label={isMobileExpanded ? 'Hide search summary' : 'Show search summary'}
          style={{
            width: '100%',
            padding: '16px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {/* Drag Handle */}
          <div
            style={{
              width: '40px',
              height: '4px',
              background: '#cbd5e0',
              borderRadius: '2px'
            }}
          />
          {/* Title */}
          <div
            style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#2d3748'
            }}
          >
            {isMobileExpanded ? 'Hide' : 'Show'} Search Summary
            {hasFilters && ` (${filterCount} filter${filterCount !== 1 ? 's' : ''})`}
          </div>
        </button>

        {/* Content */}
        {isMobileExpanded && (
          <div
            style={{
              padding: '0 24px 24px 24px',
              overflowY: 'auto',
              maxHeight: 'calc(70vh - 60px)'
            }}
          >
            <SummaryContent
              hasFilters={hasFilters}
              filterCount={filterCount}
              filters={filters}
              removeFilter={removeFilter}
              useExistingPreferences={useExistingPreferences}
              toggleExistingPreferences={toggleExistingPreferences}
            />
          </div>
        )}
      </div>

      {/* Responsive CSS */}
      <style>{`
        @media (max-width: 768px) {
          .search-summary-desktop {
            display: none !important;
          }
          .search-summary-mobile {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
}

/**
 * SummaryContent Component
 * Reusable content for both desktop and mobile views
 */
function SummaryContent({
  hasFilters,
  filterCount,
  filters,
  removeFilter,
  useExistingPreferences,
  toggleExistingPreferences
}) {
  return (
    <>
      {/* Header */}
      <div>
        <h3
          style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#2d3748',
            margin: '0 0 8px 0',
            lineHeight: '1.4'
          }}
        >
          So far, this is what I'm searching for!
        </h3>
        {hasFilters && (
          <p
            style={{
              fontSize: '14px',
              color: '#718096',
              margin: 0
            }}
          >
            {filterCount} filter{filterCount !== 1 ? 's' : ''} applied
          </p>
        )}
      </div>

      {/* Empty State */}
      {!hasFilters && (
        <div
          style={{
            padding: '32px 16px',
            textAlign: 'center',
            color: '#a0aec0',
            fontSize: '14px',
            lineHeight: '1.6',
            fontStyle: 'italic'
          }}
        >
          Your search preferences will appear here as you answer questions.
        </div>
      )}

      {/* Filter Sections */}
      {hasFilters && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Date & Time Section */}
          {filters.dateTime && filters.dateTime.length > 0 && (
            <FilterSection
              title="Date & Time"
              filters={filters.dateTime}
              category="dateTime"
              onRemove={removeFilter}
            />
          )}

          {/* Style Preferences Section */}
          {filters.style && filters.style.length > 0 && (
            <FilterSection
              title="Style Preferences"
              filters={filters.style}
              category="style"
              onRemove={removeFilter}
            />
          )}

          {/* Existing Preferences Checkbox */}
          <div
            style={{
              padding: '16px',
              background: '#f7fafc',
              borderRadius: '12px',
              border: useExistingPreferences ? `2px solid ${CONSUMER_THEME.primary}` : '2px solid transparent'
            }}
          >
            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                cursor: 'pointer',
                userSelect: 'none'
              }}
            >
              <input
                type="checkbox"
                checked={useExistingPreferences}
                onChange={toggleExistingPreferences}
                style={{
                  width: '20px',
                  height: '20px',
                  marginTop: '2px',
                  cursor: 'pointer',
                  accentColor: CONSUMER_THEME.primary
                }}
              />
              <div style={{ flex: 1 }}>
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#2d3748'
                  }}
                >
                  Use existing wedding preferences
                </span>
                {useExistingPreferences && (
                  <button
                    style={{
                      marginLeft: '8px',
                      background: 'transparent',
                      border: 'none',
                      color: CONSUMER_THEME.primary,
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      padding: 0
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      // Future: Show preferences modal
                      alert('View preferences feature coming soon!');
                    }}
                  >
                    (view)
                  </button>
                )}
              </div>
            </label>
          </div>

          {/* Budget Section */}
          {filters.price && (
            <FilterSection
              title="Budget"
              filters={[filters.price]}
              category="price"
              onRemove={removeFilter}
            />
          )}

          {/* Add-ons Section */}
          {filters.addOns && filters.addOns.length > 0 && (
            <FilterSection
              title="Add-ons"
              filters={filters.addOns}
              category="addOns"
              onRemove={removeFilter}
            />
          )}
        </div>
      )}
    </>
  );
}

/**
 * FilterSection Component
 * Displays a section of filters with a title
 */
function FilterSection({ title, filters, category, onRemove }) {
  return (
    <div
      style={{
        paddingBottom: '20px',
        borderBottom: '1px solid #e2e8f0'
      }}
    >
      <h4
        style={{
          fontSize: '14px',
          fontWeight: '600',
          color: '#4a5568',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          margin: '0 0 12px 0'
        }}
      >
        {title}
      </h4>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px'
        }}
      >
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
