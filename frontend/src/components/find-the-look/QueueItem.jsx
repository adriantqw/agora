import React from 'react';
import { X } from 'lucide-react';

const QueueItem = ({ item, onRemove }) => {
  const itemStyle = {
    display: 'flex',
    gap: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '12px',
    transition: 'all 0.2s ease',
  };

  const thumbnailStyle = {
    width: '64px',
    height: '64px',
    borderRadius: '8px',
    objectFit: 'cover',
    flexShrink: 0,
  };

  const infoStyle = {
    flex: '1',
    minWidth: '0',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  };

  const nameStyle = {
    fontSize: '14px',
    fontWeight: '500',
    color: '#1A202C',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const brandStyle = {
    fontSize: '12px',
    color: '#718096',
  };

  const priceStyle = {
    fontSize: '14px',
    fontWeight: '700',
    color: '#793DB0',
  };

  const removeButtonStyle = {
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    flexShrink: 0,
  };

  return (
    <div style={itemStyle}>
      <img
        src={item.image}
        alt={item.name}
        style={thumbnailStyle}
      />

      <div style={infoStyle}>
        <p style={nameStyle}>{item.name}</p>
        <p style={brandStyle}>{item.brand}</p>
        <p style={priceStyle}>${item.price}</p>
      </div>

      <button
        style={removeButtonStyle}
        onClick={onRemove}
        aria-label="Remove item"
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <X size={16} color="#4A5568" />
      </button>
    </div>
  );
};

export default QueueItem;
