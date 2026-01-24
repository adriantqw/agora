import { useState, useEffect } from 'react';

export default function Mascot({
  message = '',
  isSearching = false,
  position = 'bottom-right'
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
    : {
        position: 'relative',
        display: 'inline-block',
      };

  return (
    <div className="mascot-container" style={containerStyle}>
      {/* Speech Bubble */}
      {showSpeechBubble && message && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          right: '0',
          marginBottom: '12px',
          background: 'white',
          border: '2px solid #F5A5B8',
          borderRadius: '16px',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: '500',
          color: '#1a202c',
          whiteSpace: 'nowrap',
          boxShadow: '0 4px 12px rgba(245, 165, 184, 0.25)',
          animation: 'fadeIn 0.3s ease-in-out',
        }}>
          {message}
          {/* Speech bubble arrow */}
          <div style={{
            position: 'absolute',
            bottom: '-8px',
            right: '24px',
            width: '0',
            height: '0',
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: '8px solid #F5A5B8',
          }} />
        </div>
      )}

      {/* Mascot Character */}
      <div style={{
        width: '80px',
        height: '96px',
        position: 'relative',
        animation: isSearching ? 'mascot-bounce 1s infinite ease-in-out' : 'none',
      }}>
        {/* Egg body */}
        <div style={{
          width: '80px',
          height: '80px',
          background: 'linear-gradient(135deg, #F5A5B8 0%, #FFB6C1 100%)',
          borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
          position: 'absolute',
          bottom: '0',
          left: '0',
          boxShadow: '0 8px 24px rgba(245, 165, 184, 0.4)',
          animation: isSearching ? 'mascot-wobble 1s infinite ease-in-out' : 'none',
        }}>
          {/* Eyes */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            position: 'absolute',
            top: '28px',
            left: '50%',
            transform: 'translateX(-50%)',
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              background: '#1a202c',
              borderRadius: '50%',
            }} />
            <div style={{
              width: '8px',
              height: '8px',
              background: '#1a202c',
              borderRadius: '50%',
            }} />
          </div>

          {/* Smile */}
          <div style={{
            width: '24px',
            height: '12px',
            border: '2px solid #1a202c',
            borderTop: 'none',
            borderRadius: '0 0 24px 24px',
            position: 'absolute',
            top: '44px',
            left: '50%',
            transform: 'translateX(-50%)',
          }} />
        </div>

        {/* Cap/Lid */}
        <div style={{
          width: '48px',
          height: '20px',
          background: '#E8879C',
          borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
          position: 'absolute',
          top: '0',
          left: '50%',
          transform: 'translateX(-50%)',
          boxShadow: '0 2px 8px rgba(232, 135, 156, 0.3)',
        }}>
          {/* Knob on top */}
          <div style={{
            width: '16px',
            height: '8px',
            background: '#E8879C',
            borderRadius: '50%',
            position: 'absolute',
            top: '-4px',
            left: '50%',
            transform: 'translateX(-50%)',
          }} />
        </div>
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
            right: 16px !important;
            transform: scale(0.8);
            transform-origin: bottom right;
          }
        }
      `}</style>
    </div>
  );
}
