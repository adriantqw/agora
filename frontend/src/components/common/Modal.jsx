import React, { useEffect } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { useThemeColors } from '../../hooks/useThemeColors';

const Modal = ({ isOpen, onClose, title, message, type = 'success' }) => {
  const colors = useThemeColors();

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

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
        maxWidth: '400px',
        position: 'relative',
        boxShadow: colors.shadow.md,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
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
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: colors.status.success.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
          color: colors.status.success.text
        }}>
          <CheckCircle size={32} />
        </div>

        <h3 style={{ fontSize: '20px', fontWeight: '700', color: colors.text.primary, marginBottom: '8px' }}>
          {title}
        </h3>
        
        <p style={{ color: colors.text.secondary, fontSize: '14px', lineHeight: '1.5' }}>
          {message}
        </p>
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

export default Modal;
