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
    flex: '1',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    borderTopLeftRadius: '4px',
    padding: '10px 16px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
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
