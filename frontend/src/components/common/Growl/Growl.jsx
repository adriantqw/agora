import React, { useEffect, useState } from 'react';
import { Check, X, AlertCircle, Info } from 'lucide-react';
import { useThemeColors } from '../../../hooks/useThemeColors';

/**
 * Growl notification component that appears in the bottom-left corner
 *
 * @param {Object} props
 * @param {string} props.message - The message to display
 * @param {string} props.type - Type of notification: 'success' | 'error' | 'warning' | 'info'
 * @param {number} props.duration - Auto-dismiss duration in ms (0 = no auto-dismiss)
 * @param {function} props.onClose - Callback when notification is closed
 * @param {boolean} props.show - Whether to show the notification
 */
const Growl = ({ message, type = 'success', duration = 3000, onClose, show }) => {
  const colors = useThemeColors();
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setIsExiting(false);

      // Auto-dismiss if duration is set
      if (duration > 0) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);

        return () => clearTimeout(timer);
      }
    }
  }, [show, duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsExiting(false);
      onClose?.();
    }, 300); // Match animation duration
  };

  if (!isVisible && !show) return null;

  // Style configuration per type
  const styles = {
    success: {
      background: colors.status.success.background,
      color: colors.status.success.text,
      border: colors.status.success.border,
      icon: Check
    },
    error: {
      background: colors.status.error.background,
      color: colors.status.error.text,
      border: colors.status.error.border,
      icon: X
    },
    warning: {
      background: colors.status.warning?.background || '#FEF3C7',
      color: colors.status.warning?.text || '#92400E',
      border: colors.status.warning?.border || '#FCD34D',
      icon: AlertCircle
    },
    info: {
      background: colors.status.info?.background || '#DBEAFE',
      color: colors.status.info?.text || '#1E40AF',
      border: colors.status.info?.border || '#93C5FD',
      icon: Info
    }
  };

  const currentStyle = styles[type] || styles.success;
  const Icon = currentStyle.icon;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '24px',
        zIndex: 9999,
        maxWidth: '400px',
        minWidth: '280px',
        background: currentStyle.background,
        color: currentStyle.color,
        padding: '16px 20px',
        borderRadius: '12px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        border: `1px solid ${currentStyle.border}`,
        animation: isExiting ? 'slideOut 0.3s ease-out' : 'slideIn 0.3s ease-out',
        transform: isExiting ? 'translateX(-120%)' : 'translateX(0)',
        opacity: isExiting ? 0 : 1,
        transition: 'transform 0.3s ease-out, opacity 0.3s ease-out'
      }}
    >
      {/* Icon */}
      <div
        style={{
          flexShrink: 0,
          width: '20px',
          height: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Icon size={20} strokeWidth={2.5} />
      </div>

      {/* Message */}
      <div
        style={{
          flex: 1,
          fontSize: '14px',
          fontWeight: '600',
          lineHeight: '1.4'
        }}
      >
        {message}
      </div>

      {/* Close Button */}
      <button
        onClick={handleClose}
        style={{
          flexShrink: 0,
          background: 'transparent',
          border: 'none',
          color: 'inherit',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '6px',
          opacity: 0.7,
          transition: 'opacity 0.2s'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
      >
        <X size={16} />
      </button>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(-120%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(-120%);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Growl;
