import { ArrowRight } from 'lucide-react';
import AIAvatar from '../AIAvatar/AIAvatar';
import { useThemeColors } from '../../../../hooks/useThemeColors';

export default function AIMessage({ title, description, children, onSubmit, submitLabel = 'Next Step' }) {
  const colors = useThemeColors();

  return (
    <div
      style={{
        display: 'flex',
        gap: '16px',
        maxWidth: '850px',
        animation: 'fadeIn 0.4s ease',
      }}
    >
      <AIAvatar size={40} />

      <div style={{ flexGrow: 1 }}>
        {/* Message bubble */}
        <div
          style={{
            background: colors.card.background,
            padding: '24px',
            borderRadius: '0 20px 20px 20px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
            marginBottom: '16px',
            border: `1px solid ${colors.border.subtle}`,
          }}
        >
          <h2
            style={{
              fontSize: '20px',
              fontWeight: '800',
              marginBottom: '10px',
              letterSpacing: '-0.3px',
              color: colors.text.primary,
            }}
          >
            {title}
          </h2>
          <p
            style={{
              color: colors.text.secondary,
              lineHeight: '1.6',
              fontSize: '15px',
              margin: 0,
            }}
          >
            {description}
          </p>
        </div>

        {/* Interactive content (e.g., StyleCard grid, batched questions) */}
        {children}

        {/* Optional Submit button */}
        {onSubmit && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: '24px',
            }}
          >
            <button
              onClick={onSubmit}
              style={{
                background: colors.primary.eggPink,
                color: '#1a202c', // Dark charcoal for high contrast on pink
                border: 'none',
                padding: '14px 34px',
                borderRadius: '30px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.2s',
                fontSize: '15px',
                boxShadow: '0 4px 12px rgba(255, 183, 197, 0.4)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.03)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(255, 183, 197, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 183, 197, 0.4)';
              }}
            >
              {submitLabel}
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
