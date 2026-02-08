import React from 'react';
import Mascot from '../common/Mascot/Mascot';

const AIChatBubble = ({ message }) => {
  const containerStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0',
    maxWidth: '700px',
  };

  const avatarStyle = {
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };

  const bubbleStyle = {
    background: 'rgba(255, 255, 255, 0.6)', // Slightly more opaque than the grid for readability
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    borderRadius: '20px 20px 20px 4px',    // Sharp corner on bottom-left for "tail" effect
    padding: '16px 20px',
    border: '1px solid rgba(255, 255, 255, 0.4)',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.02)',
    color: '#2D3748',                      // Darker slate for better contrast on glass
    fontSize: '14px',
    lineHeight: '1.6',
  };

  const messageStyle = {
    fontSize: '13px',
    lineHeight: '1.5',
    color: '#1A202C',
    margin: 0,
  };

  return (
    <div style={containerStyle}>
      <div style={avatarStyle}>
        <Mascot variant="avatar" size={36} />
      </div>

      <div style={bubbleStyle}>
        <p style={messageStyle}>{message}</p>
      </div>
    </div>
  );
};

export default AIChatBubble;
