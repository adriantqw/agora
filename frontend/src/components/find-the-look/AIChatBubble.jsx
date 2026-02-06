import React from 'react';

const AIChatBubble = ({ message, avatarSrc }) => {
  const containerStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    maxWidth: '800px',
  };

  const avatarStyle = {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#FFB7C5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
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
        {avatarSrc ? (
          <img
            src={avatarSrc}
            alt="AI Assistant"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15c0 1.66-1.34 3-3 3s-3-1.34-3-3c0-1.5.45-2.1 1.17-2.83l.9-.92c-.58-.61-1.07-1.32-1.07-2.25 0-2.21 1.79-4 4-4s4 1.79 4 4c0 .93-.49 1.64-1.07 2.25z"
              fill="#FFFFFF"
            />
          </svg>
        )}
      </div>

      <div style={bubbleStyle}>
        <p style={messageStyle}>{message}</p>
      </div>
    </div>
  );
};

export default AIChatBubble;
