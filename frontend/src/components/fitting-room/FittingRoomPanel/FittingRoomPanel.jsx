import React from 'react';
import VirtualModel from '../VirtualModel/VirtualModel';
import AIChat from '../AIChat/AIChat';

const FittingRoomPanel = ({
  outfit,
  onReset,
  onBuyOutfit,
  chatMessages,
  onSendMessage,
  isTyping
}) => {
  const containerStyle = {
    width: '400px',
    background: 'linear-gradient(180deg, #FFB6C1 0%, #FFA07A 100%)',
    borderTopLeftRadius: '24px',
    borderTopRightRadius: '24px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    height: '100%',
    overflowY: 'auto',
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  };

  const buttonStyle = (variant = 'outline') => ({
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: variant === 'outline' ? '2px solid #FFFFFF' : 'none',
    backgroundColor: variant === 'outline' ? 'transparent' : '#FFFFFF',
    color: variant === 'outline' ? '#FFFFFF' : '#F5A5B8',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  });

  const titleStyle = {
    fontSize: '20px',
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: '20px',
  };

  const modelContainerStyle = {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '20px',
  };

  const hasItems = outfit && outfit.some(item => item && item.product);

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <button
          onClick={onReset}
          style={buttonStyle('outline')}
          title="Reset outfit and start over"
        >
          🔄 Reset
        </button>
        <button
          onClick={onBuyOutfit}
          style={buttonStyle('solid')}
          disabled={!hasItems}
          title={hasItems ? 'Purchase this outfit' : 'Add items to purchase'}
        >
          🛍️ Buy Outfit
        </button>
      </div>

      <div style={titleStyle}>Your Virtual Try-On</div>

      <div style={modelContainerStyle}>
        <VirtualModel outfit={outfit} />
      </div>

      <AIChat
        messages={chatMessages}
        onSendMessage={onSendMessage}
        isTyping={isTyping}
      />
    </div>
  );
};

export default FittingRoomPanel;
