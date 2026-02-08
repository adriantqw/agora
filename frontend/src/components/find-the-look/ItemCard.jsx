import React, { useState } from 'react';
import { Plus } from 'lucide-react';

const ItemCard = ({ item, onAddToQueue, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  const cardStyle = {
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    minWidth: '140px',
    maxWidth: '180px',
    flex: '0 0 auto',
    height: '100%',
  };

  const imageContainerStyle = {
    position: 'relative',
    flex: '1',
    minHeight: '0',
    backgroundColor: '#FFFFFF',
    borderRadius: '10px',
    overflow: 'hidden',
    marginBottom: '8px',
    border: '1px solid #E2E8F0',
  };

  const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    transition: 'transform 0.3s ease',
    ...(isHovered && {
      transform: 'scale(1.05)',
    }),
  };

  const addButtonStyle = {
    position: 'absolute',
    top: '6px',
    right: '6px',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#FFFFFF',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    opacity: isHovered ? 1 : 0,
    ...(isHovered && {
      backgroundColor: '#793DB0',
    }),
  };

  return (
    <div
      style={cardStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        style={imageContainerStyle}
        onClick={() => onClick(item)}
      >
        <img
          src={item.image}
          alt={item.name}
          style={imageStyle}
        />

        <button
          style={addButtonStyle}
          onClick={(e) => {
            e.stopPropagation();
            onAddToQueue(item);
          }}
          aria-label="Add to queue"
        >
          <Plus
            size={14}
            color={isHovered ? '#FFFFFF' : '#4A5568'}
          />
        </button>
      </div>

      <p style={{ fontSize: '11px', fontWeight: '600', color: '#1A202C', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {item.name}
      </p>
      {item.price > 0 && (
        <p style={{ fontSize: '12px', fontWeight: '700', color: '#793DB0', margin: 0 }}>
          ${item.price}
        </p>
      )}
    </div>
  );
};

export default ItemCard;
