import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

export default function Mascot({
  variant = 'default',
  message = '',
  isSearching = false,
  position = 'bottom-right',
  onClick,
  size,
}) {
  const [showSpeechBubble, setShowSpeechBubble] = useState(false);

  useEffect(() => {
    if (message) {
      setShowSpeechBubble(true);
    } else {
      setShowSpeechBubble(false);
    }
  }, [message]);

  const containerStyle = position === 'bottom-right'
    ? {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 50,
      }
    : position === 'bottom-left'
    ? {
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        zIndex: 50,
      }
    : {
        position: 'relative',
        display: 'inline-block',
      };

  // Avatar variant - Full character icon without background box
  if (variant === 'avatar') {
    const avatarSize = size || 40;

    return (
      <div 
        className="mascot-avatar"
        style={{
          width: `${avatarSize}px`,
          height: `${avatarSize}px`,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <img 
          src="/egg-chan.svg" 
          alt="Egg-chan Mascot"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            animation: isSearching ? 'mascot-bounce 1s infinite ease-in-out' : 'none',
          }}
        />
      </div>
    );
  }

  // FAB variant - Simple floating action button
  if (variant === 'fab') {
    return (
      <button
        onClick={onClick}
        className="mascot-fab"
        style={{
          ...containerStyle,
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: '#ffb7c5',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(255, 183, 197, 0.4)',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 183, 197, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(255, 183, 197, 0.4)';
        }}
      >
        <Sparkles size={28} strokeWidth={2} style={{ color: '#ffffff' }} />

        <style>{`
          /* Mobile: Smaller FAB */
          @media (max-width: 768px) {
            .mascot-fab {
              width: 48px !important;
              height: 48px !important;
              bottom: 16px !important;
              right: 16px !important;
            }
          }
        `}</style>
      </button>
    );
  }

  // Default mascot variant
  const isLetsGo = message === "Let's Goooo!";

  return (
    <div className="mascot-container" style={containerStyle}>
      {/* Speech Bubble */}
      {showSpeechBubble && message && (
        <div
          onClick={onClick}
          style={{
            position: 'absolute',
            bottom: position === 'bottom-left' ? '100%' : '40px',
            ...(position === 'bottom-left' ? { left: '20px' } : { right: '85px' }),
            ...(position === 'bottom-left' && { marginBottom: '12px' }),
            background: isLetsGo ? 'var(--gradient-user-answer)' : 'white',
            border: isLetsGo ? 'none' : '2px solid #F5A5B8',
            borderRadius: '16px 16px 4px 16px',
            padding: '16px 24px',
            fontSize: '17px',
            fontWeight: '600',
            color: isLetsGo ? '#ffffff' : '#1a202c',
            whiteSpace: 'nowrap',
            boxShadow: isLetsGo
              ? '0 6px 20px rgba(102, 126, 234, 0.35)'
              : '0 4px 12px rgba(245, 165, 184, 0.25)',
            animation: 'fadeIn 0.3s ease-in-out',
            cursor: onClick ? 'pointer' : 'default',
          }}>
          {message}
        </div>
      )}

      {/* Mascot Character */}
      <div style={{
        width: '80px',
        height: '96px',
        position: 'relative',
        animation: isSearching ? 'mascot-bounce 1s infinite ease-in-out' : 'none',
      }}>
        <img 
          src="/egg-chan.svg" 
          alt="Egg-chan Mascot"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
      </div>

      <style>{`
        @keyframes mascot-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes mascot-wobble {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-3deg); }
          75% { transform: rotate(3deg); }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Mobile: Smaller mascot and adjusted position */
        @media (max-width: 768px) {
          .mascot-container {
            bottom: 16px !important;
            transform: scale(0.8);
          }
          .mascot-container[style*="right"] {
            right: 16px !important;
            transform-origin: bottom right;
          }
          .mascot-container[style*="left"] {
            left: 16px !important;
            transform-origin: bottom left;
          }
        }
      `}</style>
    </div>
  );
}
