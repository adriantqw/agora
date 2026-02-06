import React, { useState } from 'react';

const LookCard = ({ look, isActive, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  const cardStyle = {
    borderRadius: '12px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    boxSizing: 'border-box',
    ...(isActive ? {
      transform: 'scale(1)',
      opacity: '1',
      backgroundColor: '#FFFFFF',
      border: '3px solid #793DB0',
      boxShadow: '0 10px 25px rgba(121, 61, 176, 0.2)',
    } : {
      transform: 'scale(0.9)',
      opacity: '0.7',
      backgroundColor: '#F7FAFC',
      border: '2px solid #E2E8F0',
      boxShadow: 'none',
    }),
    ...(isHovered && !isActive ? {
      transform: 'scale(0.92)',
      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
    } : {}),
  };

  const titleContainerStyle = {
    padding: '20px 16px 12px 16px',
  };

  const titleStyle = {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1A202C',
    margin: 0,
    textAlign: 'center',
  };

  const imageContainerStyle = {
    flex: '1',
    minHeight: '0',
    padding: '0 12px 12px 12px',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '12px',
    aspectRatio: '2/3',
  };

  const bottomContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '12px 16px 16px 16px',
  };

  const brandStyle = {
    fontSize: '14px',
    color: '#718096',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    textAlign: 'center',
  };

  return (
    <div
      style={cardStyle}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={titleContainerStyle}>
        <h3 style={titleStyle}>{look.name}</h3>
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
      </div>
    </div>
  );
};

export default LookCard;
