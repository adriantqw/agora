import React from 'react';
import { X, Shirt, Loader } from 'lucide-react';

/**
 * OutfitGallery - Displays FittingSetObjects from queue
 *
 * Queue structure:
 * [
 *   { slot: 1, fittingSet: FittingSetObject | null, isFavorite: false },
 *   ...
 * ]
 *
 * FittingSetObject structure:
 * {
 *   title: string,
 *   description: string,
 *   productIds: string[],
 *   imagePath: string,  // Single string, not array
 *   isTemporary: boolean
 * }
 */
const OutfitGallery = ({ queue, onRemoveSet, isGenerating = false, thinkingText = '' }) => {
  const containerStyle = {
    backgroundColor: '#FFFFFF',
    border: '1px solid var(--border-color)',
    borderRadius: '16px',
    padding: '24px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    height: '100%',
    overflowY: 'auto',
  };

  const titleRowStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const titleStyle = {
    fontSize: '16px',
    fontWeight: '700',
    color: '#7B3FA0',
    textAlign: 'left',
    margin: 0,
  };

  const hangerStyle = {
    color: '#7B3FA0',
    opacity: 0.7,
  };

  const loadingContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '40px 20px',
    color: '#7B3FA0',
  };

  const thinkingStyle = {
    fontSize: '12px',
    color: '#7B3FA0',
    opacity: 0.7,
    margin: '8px 0 0',
    lineHeight: '1.5',
    maxHeight: '120px',
    overflowY: 'auto',
    textAlign: 'left',
    width: '100%',
  };

  // Loading state
  if (isGenerating) {
    return (
      <div style={containerStyle}>
        <div style={titleRowStyle}>
          <Shirt size={24} style={hangerStyle} />
          <h3 style={titleStyle}>Try On Queue</h3>
        </div>
        <div style={loadingContainerStyle}>
          <Loader size={32} style={{ animation: 'spin 1s linear infinite' }} />
          <span style={{ fontSize: '14px', fontWeight: '500' }}>Generating outfit sets...</span>
          {thinkingText && <p style={thinkingStyle}>{thinkingText}</p>}
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // Extract filled slots
  const filledSlots = queue.filter(slot => slot.fittingSet !== null);

  // Empty state
  if (filledSlots.length === 0) {
    return (
      <div style={containerStyle}>
        <div style={titleRowStyle}>
          <Shirt size={24} style={hangerStyle} />
          <h3 style={titleStyle}>Try On Queue</h3>
        </div>
      </div>
    );
  }

  // Render sets
  return (
    <div style={containerStyle}>
      <div style={titleRowStyle}>
        <Shirt size={24} style={hangerStyle} />
        <h3 style={titleStyle}>Try On Queue ({filledSlots.length})</h3>
      </div>

      {filledSlots.slice(0, 3).map((slot) => (
        <FittingSetCard
          key={slot.slot}
          fittingSet={slot.fittingSet}
          isFavorite={slot.isFavorite}
          slotIndex={slot.slot - 1}
          onRemove={() => onRemoveSet(slot.slot - 1)}
        />
      ))}
    </div>
  );
};

/**
 * FittingSetCard - Individual set card component
 */
const FittingSetCard = ({ fittingSet, isFavorite, slotIndex, onRemove }) => {
  const cardStyle = {
    width: '100%',
    maxWidth: '350px',
    borderRadius: '12px',
    border: '3px solid #7B3FA0',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.95)',
    flexShrink: 0,
    marginBottom: '16px',
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    gap: '0',
  };

  const imageStyle = {
    width: '140px',
    height: '160px',
    objectFit: 'cover',
    flexShrink: 0,
  };

  const infoStyle = {
    flex: '1',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    justifyContent: 'flex-start',
  };

  const titleStyle = {
    fontSize: '15px',
    fontWeight: '700',
    color: '#7B3FA0',
    margin: '0 0 4px 0',
    lineHeight: '1.3',
  };

  const descStyle = {
    fontSize: '12px',
    color: '#666',
    margin: 0,
    lineHeight: '1.4',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const removeButtonStyle = {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    transition: 'background-color 0.2s',
  };

  return (
    <div style={cardStyle}>
      {fittingSet.imagePath && (
        <img
          src={fittingSet.imagePath}
          alt={fittingSet.title}
          style={imageStyle}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      )}
      <div style={infoStyle}>
        <p style={titleStyle}>{fittingSet.title}</p>
        {fittingSet.description && <p style={descStyle}>{fittingSet.description}</p>}
      </div>
      <button
        style={removeButtonStyle}
        onClick={onRemove}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.8)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.6)'; }}
        title="Remove set"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default OutfitGallery;
