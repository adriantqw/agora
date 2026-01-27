import RecommendationCard from '../RecommendationCard/RecommendationCard';

export default function RecommendationSection({
  title,
  eventLink,
  recommendations = [],
  onSeeMore,
}) {
  const handleCardClick = (recommendation) => {
    console.log('Clicked recommendation:', recommendation);
    // Future: Navigate to detail page or quiz with pre-filled style
  };

  return (
    <section className="recommendation-section" style={{
      padding: '32px 48px',
    }}>
      {/* Section Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
      }}>
        {/* Title with calendar icon */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            background: '#FFF5F7',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#F5A5B8',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>

          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#1a202c',
            margin: 0,
          }}>
            {title}
          </h2>
        </div>

        {/* See more button */}
        {onSeeMore && (
          <button
            onClick={onSeeMore}
            style={{
              background: 'none',
              border: 'none',
              color: '#F5A5B8',
              fontSize: '15px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              borderRadius: '8px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#FFF5F7';
              e.currentTarget.style.transform = 'translateX(4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            See more
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        )}
      </div>

      {/* Recommendations Grid */}
      <div className="recommendation-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '24px',
        overflowX: 'auto',
        paddingBottom: '8px',
      }}>
        {recommendations.map((rec) => (
          <RecommendationCard
            key={rec.id}
            style={rec.style}
            tags={rec.tags}
            imageUrl={rec.imageUrl}
            onClick={() => handleCardClick(rec)}
          />
        ))}
      </div>

      <style>{`
        /* Desktop: 4 columns */
        @media (min-width: 1025px) {
          .recommendation-grid {
            grid-template-columns: repeat(4, 1fr) !important;
          }
        }

        /* Tablet: 2 columns */
        @media (min-width: 769px) and (max-width: 1024px) {
          .recommendation-section {
            padding: 24px !important;
          }

          .recommendation-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 16px !important;
          }
        }

        /* Mobile: 1 column */
        @media (max-width: 768px) {
          .recommendation-section {
            padding: 16px !important;
          }

          .recommendation-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
        }
      `}</style>
    </section>
  );
}
