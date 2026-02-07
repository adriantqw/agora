import React from 'react';
import Mascot from '../common/Mascot/Mascot';

const AIChatBubble = ({ message }) => {
  const containerStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0',
    maxWidth: '800px',
  };

  const avatarStyle = {
    width: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };

  const bubbleStyle = {
    flex: '1',
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    borderTopLeftRadius: '4px',
    padding: '16px 24px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  };

  const messageStyle = {
    fontSize: '15px',
    lineHeight: '1.6',
    color: '#1A202C',
    margin: 0,
  };

  return (
    <div style={containerStyle}>
      <div style={avatarStyle}>
        <Mascot variant="avatar" size={48} />
      </div>

      <div style={bubbleStyle}>
        <p style={messageStyle}>{message}</p>
      </div>
    </div>
  );
};

export default AIChatBubble;
