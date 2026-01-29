import React, { useState } from 'react';
import { X, Copy, Check, Share2 } from 'lucide-react';
import { useThemeColors } from '../../hooks/useThemeColors';

const ShareModal = ({ isOpen, onClose, shareLink }) => {
  const colors = useThemeColors();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        background: colors.card.background,
        borderRadius: '24px',
        padding: '32px',
        width: '90%',
        maxWidth: '480px',
        position: 'relative',
        boxShadow: colors.shadow.md,
        display: 'flex',
        flexDirection: 'column',
        animation: 'scaleIn 0.2s ease-out'
      }}>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: colors.text.tertiary,
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <X size={20} />
        </button>

        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: colors.primary.eggPinkLight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px',
          alignSelf: 'center',
          color: colors.primary.eggPink
        }}>
          <Share2 size={28} />
        </div>

        <h3 style={{ fontSize: '24px', fontWeight: '700', color: colors.text.primary, marginBottom: '8px', textAlign: 'center' }}>
          Share your Wishlist
        </h3>
        
        <p style={{ color: colors.text.secondary, fontSize: '15px', lineHeight: '1.5', textAlign: 'center', marginBottom: '24px' }}>
          Copy the link below to share your style picks with friends or your personal stylist.
        </p>

        <div style={{
          display: 'flex',
          gap: '8px',
          background: colors.card.backgroundAlt,
          padding: '8px',
          borderRadius: '16px',
          border: `1px solid ${colors.border.subtle}`
        }}>
          <input 
            type="text" 
            value={shareLink} 
            readOnly 
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              padding: '0 12px',
              color: colors.text.primary,
              fontSize: '14px',
              outline: 'none',
              width: '100%'
            }}
          />
          <button 
            onClick={handleCopy}
            style={{
              background: copied ? colors.status.success.bg : colors.primary.eggPink,
              color: copied ? colors.status.success.text : 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '10px 20px',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default ShareModal;
