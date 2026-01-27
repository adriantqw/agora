import React from 'react';
import { Calendar, Cloud, DollarSign, Sparkles } from 'lucide-react';
import { useThemeColors } from '../../../hooks/useThemeColors';

const JourneySummaryCard = ({ summaryContext }) => {
  const colors = useThemeColors();

  if (!summaryContext) return null;

  const {
    occasion = 'Not specified',
    style = 'Not specified',
    budget = 'Not specified',
    weather = 'Not specified'
  } = summaryContext;

  const items = [
    { icon: Calendar, label: 'Occasion', value: occasion, color: '#F687B3' },
    { icon: Sparkles, label: 'Style Vibe', value: style, color: '#9F7AEA' },
    { icon: DollarSign, label: 'Budget', value: budget, color: '#48BB78' },
    { icon: Cloud, label: 'Weather', value: weather, color: '#4299E1' },
  ];

  return (
    <div
      style={{
        height: '100%',
        minHeight: '420px', // Match typical OutfitCard height
        background: colors.card.background,
        borderRadius: '16px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: colors.shadow.sm,
        border: `2px solid ${colors.primary.eggPink}40`, // Subtle pink border
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{
          fontSize: '20px',
          fontWeight: '700',
          color: colors.text.primary,
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Sparkles size={20} color={colors.primary.eggPink} fill={colors.primary.eggPink} />
          Journey Profile
        </h3>
        <p style={{
          fontSize: '14px',
          color: colors.text.secondary,
          lineHeight: '1.5'
        }}>
          Based on your initial preferences and chat with the stylist.
        </p>
      </div>

      {/* Grid of details */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '20px',
        flexGrow: 1,
      }}>
        {items.map((item, index) => (
          <div key={index} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '12px',
            background: colors.card.backgroundAlt,
            borderRadius: '12px',
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: `${item.color}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <item.icon size={20} color={item.color} />
            </div>
            <div>
              <div style={{
                fontSize: '12px',
                color: colors.text.tertiary,
                textTransform: 'uppercase',
                fontWeight: '600',
                letterSpacing: '0.5px'
              }}>
                {item.label}
              </div>
              <div style={{
                fontSize: '15px',
                fontWeight: '600',
                color: colors.text.primary,
              }}>
                {item.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer/Action */}
      <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: `1px solid ${colors.border.light}` }}>
        <button style={{
          width: '100%',
          padding: '12px',
          background: 'transparent',
          border: `1px solid ${colors.border.color}`,
          borderRadius: '8px',
          color: colors.text.secondary,
          fontSize: '13px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = colors.primary.eggPink;
            e.currentTarget.style.color = colors.primary.eggPink;
            e.currentTarget.style.background = colors.primary.eggPinkLight;
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = colors.border.color;
            e.currentTarget.style.color = colors.text.secondary;
            e.currentTarget.style.background = 'transparent';
        }}
        >
          Edit Preferences
        </button>
      </div>
    </div>
  );
};

export default JourneySummaryCard;
