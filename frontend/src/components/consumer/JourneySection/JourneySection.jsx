import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useThemeColors } from '../../../hooks/useThemeColors';
import OutfitCard from '../OutfitCard/OutfitCard';

/**
 * JourneySection Component
 *
 * Displays a journey section with:
 * - Section header with colored dot and journey title
 * - Status badge (Ongoing Journey, In Progress, Ideation Stage)
 * - "View Closet" link with arrow
 * - Responsive grid of outfit cards
 *
 * @param {Object} journey - Journey data object
 * @param {Function} onOutfitAdd - Callback when outfit add button is clicked
 */
const JourneySection = ({ journey, onOutfitAdd }) => {
  const colors = useThemeColors();
  const navigate = useNavigate();

  const {
    id,
    title,
    status,
    statusColor,
    statusLabel,
    outfits = [],
    closetUrl,
  } = journey;

  const handleViewCloset = () => {
    if (closetUrl) {
      navigate(closetUrl);
    }
  };

  const handleOutfitAdd = (outfit) => {
    if (onOutfitAdd) {
      onOutfitAdd(outfit, journey);
    }
  };

  return (
    <section
      style={{
        marginBottom: '64px',
      }}
    >
      {/* Section Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        {/* Title and Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {/* Colored Dot */}
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: statusColor,
              flexShrink: 0,
            }}
          />

          {/* Journey Title */}
          <h2
            style={{
              fontSize: '28px',
              fontWeight: '700',
              color: colors.text.primary,
              margin: 0,
            }}
          >
            {title}
          </h2>

          {/* Status Badge */}
          <div
            style={{
              background: `${statusColor}15`,
              color: statusColor,
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            {statusLabel}
          </div>
        </div>

        {/* View Closet Link */}
        {closetUrl && (
          <button
            onClick={handleViewCloset}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'transparent',
              border: 'none',
              color: colors.primary.eggPink,
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              padding: '8px 12px',
              borderRadius: '8px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `${colors.primary.eggPink}10`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <span>View Closet</span>
            <ArrowRight size={16} strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* Outfit Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px',
        }}
        className="journey-outfits-grid"
      >
        {outfits.map((outfit) => (
          <OutfitCard
            key={outfit.id}
            outfit={outfit}
            onAdd={handleOutfitAdd}
          />
        ))}
      </div>

      {/* Responsive Grid Styles */}
      <style>
        {`
          @media (min-width: 1280px) {
            .journey-outfits-grid {
              grid-template-columns: repeat(4, 1fr);
            }
          }

          @media (min-width: 768px) and (max-width: 1279px) {
            .journey-outfits-grid {
              grid-template-columns: repeat(2, 1fr);
            }
          }

          @media (max-width: 767px) {
            .journey-outfits-grid {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>
    </section>
  );
};

export default JourneySection;
