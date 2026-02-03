import React from 'react';
import { Plus } from 'lucide-react';
import { useThemeColors } from '../../../hooks/useThemeColors';

/**
 * OutfitCard Component
 *
 * Displays an individual outfit item with:
 * - Image placeholder with custom icon
 * - Optional "AI Pick" curated tag
 * - Outfit label and subtext
 * - Price display
 * - Add button (circular plus icon)
 * - Hover effects (lift and shadow)
 *
 * @param {Object} outfit - Outfit data object
 * @param {Function} onAdd - Callback when add button is clicked
 */
const OutfitCard = ({ outfit, onAdd }) => {
  const colors = useThemeColors();

  const {
    id,
    label,
    subtext,
    price,
    imageUrl,
    icon: IconComponent,
    iconColor,
    backgroundColor,
    isAIPick,
  } = outfit;

  const handleAddClick = (e) => {
    e.stopPropagation();
    if (onAdd) {
      onAdd(outfit);
    }
  };

  const isDark = document.documentElement.classList.contains('dark-theme');

  return (
    <div
      style={{
        position: 'relative',
        background: colors.card.background,
        borderRadius: '12px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        border: `1px solid ${colors.border.subtle}`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-10px)';
        e.currentTarget.style.boxShadow = colors.shadow.md;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Image Container - 3:4 aspect ratio */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          paddingTop: '133.33%', // 4:3 aspect ratio
          background: imageUrl 
            ? `url(${imageUrl}) center/cover` 
            : isDark 
              ? colors.card.backgroundAlt // Use theme color in dark mode
              : backgroundColor || '#f3f4f6', // Use provided color in light mode
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* AI Pick Tag */}
        {isAIPick && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#ffffff',
              padding: '4px 10px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
            }}
          >
            AI Pick
          </div>
        )}

        {/* Icon Placeholder (when no image) */}
        {!imageUrl && IconComponent && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <IconComponent
              size={48}
              strokeWidth={1.5}
              style={{ 
                color: isDark 
                  ? (iconColor === '#1a202c' ? colors.text.secondary : iconColor) 
                  : iconColor || colors.text.tertiary 
              }}
            />
          </div>
        )}
      </div>

      {/* Card Content */}
      <div
        style={{
          padding: '16px',
        }}
      >
        {/* Label and Subtext */}
        <div style={{ marginBottom: '12px' }}>
          <h3
            style={{
              fontSize: '16px',
              fontWeight: '600',
              color: colors.text.primary,
              marginBottom: '4px',
              lineHeight: '1.3',
            }}
          >
            {label}
          </h3>
          <p
            style={{
              fontSize: '13px',
              color: colors.text.secondary,
              lineHeight: '1.4',
            }}
          >
            {subtext}
          </p>
        </div>

        {/* Price and Add Button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              fontSize: '18px',
              fontWeight: '700',
              color: colors.text.primary,
            }}
          >
            ${price.toFixed(2)}
          </span>

          {/* Circular Plus Button */}
          <button
            onClick={handleAddClick}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: 'none',
              background: colors.gradient.start,
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: `0 2px 8px ${colors.gradient.start}33`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = `0 4px 12px ${colors.gradient.start}44`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = `0 2px 8px ${colors.gradient.start}33`;
            }}
          >
            <Plus size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OutfitCard;
