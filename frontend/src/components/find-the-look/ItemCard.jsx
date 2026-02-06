import React, { useState } from 'react';
import { Plus } from 'lucide-react';

const ItemCard = ({ item, onAddToQueue, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  const cardStyle = {
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    minWidth: '200px',
    maxWidth: '280px',
    flex: '0 0 auto',
    height: '100%',
  };

  const imageContainerStyle = {
    position: 'relative',
    flex: '1',
    minHeight: '0',
    aspectRatio: '3/4',
    backgroundColor: '#F7FAFC',
    borderRadius: '12px',
    overflow: 'hidden',
    marginBottom: '12px',
  };

  const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s ease',
    ...(isHovered && {
      transform: 'scale(1.05)',
    }),
  };

  const addButtonStyle = {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#FFFFFF',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    ...(isHovered && {
      backgroundColor: '#793DB0',
    }),
  };

  const brandStyle = {
    fontSize: '12px',
    color: '#718096',
    marginBottom: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };

  const titleStyle = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: '4px',
  };

  const priceStyle = {
    fontSize: '16px',
    fontWeight: '700',
    color: '#793DB0',
  };

  return (
    <div
      style={cardStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        style={imageContainerStyle}
        onClick={onClick}
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
            size={16}
            color={isHovered ? '#FFFFFF' : '#4A5568'}
          />
        </button>
      </div>

      <p style={brandStyle}>{item.brand}</p>
      <p style={titleStyle}>{item.name}</p>
      <p style={priceStyle}>${item.price}</p>
    </div>
  );
};

export default ItemCard;
