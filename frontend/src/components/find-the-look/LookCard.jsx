import React, { useState } from 'react';
import { Package, ShoppingBag } from 'lucide-react';

const LookCard = ({ look, isActive, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const isSet = look.type === 'set';

  const cardStyle = {
    borderRadius: '10px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    boxSizing: 'border-box',
    ...(isActive ? {
      transform: 'scale(1.05)',
      zIndex: 2,
      opacity: '1',
      backgroundColor: '#FFFFFF',
      border: '2px solid #793DB0',
      boxShadow: '0 4px 12px rgba(121, 61, 176, 0.2)',
    } : {
      transform: 'scale(0.90)',
      opacity: '0.7',
      backgroundColor: '#F7FAFC',
      border: '1px solid #E2E8F0',
      boxShadow: 'none',
    }),
    ...(isHovered && !isActive ? {
      transform: 'scale(0.92)',
      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.08)',
    } : {}),
  };

  const imageStyle = {
    width: '100%',
    height: '65%',
    objectFit: 'cover',
    flexShrink: 0,
    borderRadius: '4px',
    margin: '6px 6px 0 6px',
  };

  const infoStyle = {
    flex: 1,
    padding: '8px 10px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: '2px',
    minWidth: 0,
    overflow: 'hidden',
  };

  return (
    <div
      style={cardStyle}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px 0' }}>
        {isSet ? <Package size={11} color="#793DB0" /> : <ShoppingBag size={11} color="#793DB0" />}
        <span style={{ fontSize: '9px', color: '#793DB0', fontWeight: '600', textTransform: 'uppercase' }}>
          {isSet ? `${look.items.length} items` : 'Product'}
        </span>
      </div>
      <img
        src={look.image}
        alt={look.name}
        style={imageStyle}
      />
      <div style={infoStyle}>
        <p style={{
          fontSize: '11px',
          fontWeight: '700',
          color: '#1A202C',
          margin: 0,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          lineHeight: '1.3',
        }}>
          {look.name}
        </p>
        {look.price > 0 && (
          <p style={{ fontSize: '11px', fontWeight: '600', color: '#793DB0', margin: 0 }}>
            ${look.price.toFixed(2)}
          </p>
        )}
      </div>
    </div>
  );
};

export default LookCard;
