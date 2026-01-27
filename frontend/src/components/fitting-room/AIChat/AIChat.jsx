import React, { useState, useRef, useEffect } from 'react';

const AIChat = ({ messages, onSendMessage, isTyping }) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() && onSendMessage) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    height: '300px',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  };

  const messagesContainerStyle = {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  };

  const messageBubbleStyle = (role) => ({
    maxWidth: '80%',
    padding: '10px 14px',
    borderRadius: '12px',
    fontSize: '14px',
    lineHeight: '1.4',
    alignSelf: role === 'ai' ? 'flex-start' : 'flex-end',
    backgroundColor: role === 'ai' ? '#F5A5B8' : '#FFFFFF',
    color: role === 'ai' ? '#FFFFFF' : '#333333',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  });

  const typingIndicatorStyle = {
    maxWidth: '80%',
    padding: '10px 14px',
    borderRadius: '12px',
    alignSelf: 'flex-start',
    backgroundColor: '#F5A5B8',
    color: '#FFFFFF',
    display: 'flex',
    gap: '4px',
  };

  const dotStyle = {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#FFFFFF',
    animation: 'bounce 1.4s infinite ease-in-out',
  };

  const inputContainerStyle = {
    display: 'flex',
    gap: '8px',
    padding: '12px',
    borderTop: '1px solid #EEEEEE',
    backgroundColor: '#FFFFFF',
  };

  const inputStyle = {
    flex: 1,
    padding: '10px 14px',
    border: '1px solid #EEEEEE',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
  };

  const sendButtonStyle = {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    background: 'linear-gradient(180deg, #FFB6C1 0%, #FFA07A 100%)',
    color: '#FFFFFF',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
  };

  return (
    <div style={containerStyle}>
      <style>
        {`
          @keyframes bounce {
            0%, 60%, 100% {
              transform: translateY(0);
            }
            30% {
              transform: translateY(-6px);
            }
          }
        `}
      </style>
      <div style={messagesContainerStyle}>
        {messages.map((message, index) => (
          <div key={index} style={messageBubbleStyle(message.role)}>
            {message.content}
          </div>
        ))}
        {isTyping && (
          <div style={typingIndicatorStyle}>
            <div style={{ ...dotStyle, animationDelay: '0s' }}></div>
            <div style={{ ...dotStyle, animationDelay: '0.2s' }}></div>
            <div style={{ ...dotStyle, animationDelay: '0.4s' }}></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} style={inputContainerStyle}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask for styling advice..."
          style={inputStyle}
        />
        <button type="submit" style={sendButtonStyle} disabled={!inputValue.trim()}>
          Send
        </button>
      </form>
    </div>
  );
};

export default AIChat;
