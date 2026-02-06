import React, { useState } from 'react';

const LookCard = ({ look, isActive, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  const cardStyle = {
    borderRadius: '12px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    ...(isActive ? {
      transform: 'scale(1)',
      opacity: '1',
      backgroundColor: '#FFFFFF',
      border: '2px solid #793DB0',
      boxShadow: '0 10px 25px rgba(121, 61, 176, 0.2)',
    } : {
      transform: 'scale(0.9)',
      opacity: '0.7',
      backgroundColor: '#F7FAFC',
      border: '1px solid #E2E8F0',
      boxShadow: 'none',
    }),
    ...(isHovered && !isActive ? {
      transform: 'scale(0.92)',
      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
    } : {}),
  };

  const titleContainerStyle = {
    padding: '16px 16px 8px 16px',
  };

  const titleStyle = {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1A202C',
    margin: 0,
  };

  const imageContainerStyle = {
    aspectRatio: '3/4',
    padding: '0 16px',
    position: 'relative',
    overflow: 'hidden',
  };

  const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '8px',
  };

  const bottomContainerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 16px 16px 16px',
  };

  const brandStyle = {
    fontSize: '13px',
    color: '#718096',
    fontWeight: '400',
  };

  const priceStyle = {
    fontSize: '18px',
    fontWeight: '700',
    color: '#793DB0',
  };

  return (
    <div
      style={cardStyle}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={titleContainerStyle}>
        <h3 style={titleStyle}>Look {look.id}: {look.name}</h3>
      </div>

      <div style={imageContainerStyle}>
        <img
          src={look.image}
          alt={look.name}
          style={imageStyle}
        />
      </div>

      <div style={bottomContainerStyle}>
        <span style={brandStyle}>{look.brand}</span>
        <span style={priceStyle}>${look.price}</span>
      </div>
    </div>
  );
};

export default LookCard;
