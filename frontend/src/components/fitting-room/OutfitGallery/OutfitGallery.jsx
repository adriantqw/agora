import React from 'react';
import { X, Shirt, Loader } from 'lucide-react';

const OutfitGallery = ({ items = [], onRemoveItem, fittingSets = [], isGenerating = false, thinkingText = '' }) => {
  const containerStyle = {
    background: 'linear-gradient(180deg, #E8B4CB 0%, #C9A0DC 100%)',
    borderRadius: '16px',
    padding: '24px 16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
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
    textAlign: 'center',
    margin: 0,
  };

  const hangerStyle = {
    color: '#7B3FA0',
    opacity: 0.7,
  };

  const mainImageStyle = {
    width: '280px',
    height: '340px',
    borderRadius: '12px',
    border: '3px solid #7B3FA0',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: 'rgba(255,255,255,0.3)',
    flexShrink: 0,
  };

  const thumbnailGridStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    justifyContent: 'center',
    maxWidth: '300px',
  };

  const thumbnailStyle = {
    width: '100px',
    height: '120px',
    borderRadius: '8px',
    border: '2px solid rgba(255,255,255,0.6)',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: 'rgba(255,255,255,0.3)',
    flexShrink: 0,
  };

  const removeButtonStyle = {
    position: 'absolute',
    top: '6px',
    right: '6px',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    transition: 'background-color 0.2s',
  };

  const emptyPlaceholderStyle = {
    width: '280px',
    height: '340px',
    borderRadius: '12px',
    border: '3px dashed rgba(255,255,255,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'rgba(255,255,255,0.7)',
    fontSize: '14px',
    textAlign: 'center',
    padding: '20px',
  };

  const imgStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  };

  const fittingSetCardStyle = {
    width: '280px',
    borderRadius: '12px',
    border: '3px solid #7B3FA0',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.9)',
    flexShrink: 0,
  };

  const fittingSetImageStyle = {
    width: '100%',
    height: '240px',
    objectFit: 'cover',
  };

  const fittingSetInfoStyle = {
    padding: '12px',
  };

  const fittingSetTitleStyle = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#7B3FA0',
    margin: '0 0 4px 0',
  };

  const fittingSetDescStyle = {
    fontSize: '12px',
    color: '#666',
    margin: 0,
    lineHeight: '1.4',
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
          {thinkingText && (
            <p style={{ fontSize: '12px', color: '#7B3FA0', opacity: 0.7, margin: '8px 0 0', lineHeight: '1.5', maxHeight: '120px', overflowY: 'auto', textAlign: 'left', width: '100%' }}>
              {thinkingText}
            </p>
          )}
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // Display fitting sets from backend if available
  if (fittingSets.length > 0) {
    return (
      <div style={containerStyle}>
        <div style={titleRowStyle}>
          <Shirt size={24} style={hangerStyle} />
          <h3 style={titleStyle}>Try On Queue</h3>
        </div>
        {fittingSets.map((set, index) => (
          <div key={index} style={fittingSetCardStyle}>
            {set.imagePaths && set.imagePaths.length > 0 && (
              <img
                src={set.imagePaths[0]}
                alt={set.title || `Outfit Set ${index + 1}`}
                style={fittingSetImageStyle}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}
            <div style={fittingSetInfoStyle}>
              <p style={fittingSetTitleStyle}>{set.title || `Outfit Set ${index + 1}`}</p>
              {set.description && <p style={fittingSetDescStyle}>{set.description}</p>}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Fallback: show product thumbnails from queue
  if (items.length === 0) {
    return (
      <div style={containerStyle}>
        <div style={titleRowStyle}>
          <Shirt size={24} style={hangerStyle} />
          <h3 style={titleStyle}>Try On Queue</h3>
        </div>
        <div style={emptyPlaceholderStyle}>
          Add items to your outfit to see them here
        </div>
      </div>
    );
  }

  const [mainItem, ...restItems] = items;

  return (
    <div style={containerStyle}>
      <Shirt size={32} style={hangerStyle} />
      <h3 style={titleStyle}>Try On Queue</h3>

      {/* Main large image */}
      <div style={mainImageStyle}>
        <img
          src={mainItem.image}
          alt={mainItem.name}
          style={imgStyle}
        />
        <button
          style={removeButtonStyle}
          onClick={() => onRemoveItem(mainItem.id)}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.7)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.5)'; }}
          title="Remove from outfit"
        >
          <X size={14} />
        </button>
      </div>

      {/* Thumbnail grid for remaining items */}
      {restItems.length > 0 && (
        <div style={thumbnailGridStyle}>
          {restItems.map((item) => (
            <div key={item.id} style={thumbnailStyle}>
              <img
                src={item.image}
                alt={item.name}
                style={imgStyle}
              />
              <button
                style={removeButtonStyle}
                onClick={() => onRemoveItem(item.id)}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.7)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.5)'; }}
                title="Remove from outfit"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OutfitGallery;
