/**
 * SummaryDrawer — Mobile bottom-sheet wrapper for SummaryPanel
 *
 * Slide-up drawer with backdrop, drag handle, and close button.
 * Passes all props through to SummaryPanel.
 */

import SummaryPanel from '../SummaryPanel/SummaryPanel';
import { useThemeColors } from '../../../../hooks/useThemeColors';
import { X } from 'lucide-react';

export default function SummaryDrawer({ open, onClose, ...panelProps }) {
  const colors = useThemeColors();

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.4)',
            zIndex: 199,
            transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      )}

      {/* Drawer Panel */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          width: '100%',
          maxHeight: '85vh',
          background: colors.page.background,
          borderRadius: '20px 20px 0 0',
          zIndex: 200,
          transform: open ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.2)',
        }}
      >
        {/* Drag handle + close row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px 16px 8px',
          position: 'relative',
          flexShrink: 0,
        }}>
          {/* Decorative pill handle */}
          <div style={{
            width: '40px',
            height: '4px',
            borderRadius: '9999px',
            background: colors.border.subtle,
          }} />

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              right: '16px',
              top: '10px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: colors.text.muted,
              padding: '4px',
              borderRadius: '6px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.card.backgroundAlt;
              e.currentTarget.style.color = colors.text.secondary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = colors.text.muted;
            }}
            aria-label="Close summary"
          >
            <X size={20} />
          </button>
        </div>

        {/* SummaryPanel fills remaining height — remove its border-left for drawer context */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <SummaryPanel
            {...panelProps}
            onClose={onClose}
          />
        </div>
      </div>
    </>
  );
}
