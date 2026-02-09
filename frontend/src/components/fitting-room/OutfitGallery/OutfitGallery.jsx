import React from 'react';
import { X, Shirt } from 'lucide-react';

const OutfitGallery = ({ items = [], onRemoveItem }) => {
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

  const hangerStyle = {
    color: '#7B3FA0',
    opacity: 0.7,
    marginBottom: '4px',
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

  if (items.length === 0) {
    return (
      <div style={containerStyle}>
        <Shirt size={32} style={hangerStyle} />
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
