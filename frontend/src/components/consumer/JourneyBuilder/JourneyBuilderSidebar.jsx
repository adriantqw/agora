import { useState } from 'react';
import { Sparkles, Pencil } from 'lucide-react';
import { getIconByName } from '../../../utils/iconMapper';

// Map foundation labels to icons
const FOUNDATION_ICONS = {
  'Location / Time': 'MapPin',
  'Department': 'Store',
  'Age Range': 'User',
  'Sizing & Fit': 'Ruler',
  'Weather': 'Cloud',
  'Time of Day': 'Clock',
  'Location': 'MapPin',
  'Budget': 'DollarSign',
};

function SectionHeader({ label }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '11px',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      color: 'var(--consumer-purple)',
      marginBottom: '10px',
    }}>
      <Sparkles size={12} color='var(--consumer-purple)' />
      {label}
    </div>
  );
}

function FoundationRow({ label, values }) {
  const hasValues = values && values.length > 0;
  const displayValues = hasValues ? values.slice(0, 2) : [];
  const overflow = hasValues ? values.length - 2 : 0;
  const overflowValues = overflow > 0 ? values.slice(2) : [];

  // Get icon component
  const iconName = FOUNDATION_ICONS[label] || 'HelpCircle';
  const IconComponent = getIconByName(iconName);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 0',
      flexWrap: 'wrap',
    }}>
      {/* Icon */}
      <div style={{
        width: '24px',
        height: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        color: 'var(--text-secondary)',
      }}>
        <IconComponent size={16} />
      </div>

      {/* Label - smaller, more subtle */}
      <span style={{
        fontSize: '11px',
        color: 'var(--text-muted)',
        fontWeight: '500',
        minWidth: '70px',
        flexShrink: 0,
      }}>
        {label}
      </span>

      {/* Pills */}
      {!hasValues ? (
        <span style={{
          fontSize: '11px',
          color: 'var(--text-muted)',
          fontStyle: 'italic',
        }}>
          Not set
        </span>
      ) : (
        <>
          {displayValues.map((val, i) => (
            <div key={i} style={{
              fontSize: '12px',
              fontWeight: '600',
              color: 'var(--text-primary)',
              background: 'var(--consumer-purple-light)',
              padding: '4px 12px',
              borderRadius: '12px',
              whiteSpace: 'nowrap',
            }}>
              {val}
            </div>
          ))}
          {overflow > 0 && (
            <div
              title={overflowValues.join(', ')}
              style={{
                fontSize: '11px',
                fontWeight: '700',
                color: 'var(--consumer-purple)',
                background: 'var(--consumer-purple-light)',
                padding: '4px 8px',
                borderRadius: '12px',
                cursor: 'help',
                position: 'relative',
              }}
            >
              +{overflow}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function JourneyBuilderSidebar({ foundations, narrativeText, currentBatch, journeyTitle }) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [localTitle, setLocalTitle] = useState(journeyTitle);

  const handleSaveTitle = () => {
    setIsEditingTitle(false);
    // In future: Call API to persist title change
    console.log('Title saved:', localTitle);
  };

  return (
    <div style={{
      height: '100%',
      overflow: 'hidden',
      background: 'var(--card-background)',
      borderRadius: '16px',
      boxShadow: 'var(--shadow-md)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Scrollable content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px 16px',
      }}>
        {/* Top header */}
        <SectionHeader label="Current Journey Summary" />

        {/* Journey title - editable */}
        {isEditingTitle ? (
          <input
            type="text"
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
            autoFocus
            style={{
              fontSize: '22px',
              fontWeight: '700',
              color: 'var(--consumer-purple)',
              marginBottom: '8px',
              border: '2px solid var(--consumer-purple)',
              borderRadius: '8px',
              padding: '4px 8px',
              background: 'transparent',
              width: '100%',
            }}
          />
        ) : (
          <div
            onClick={() => setIsEditingTitle(true)}
            style={{
              fontSize: '22px',
              fontWeight: '700',
              color: 'var(--consumer-purple)',
              marginBottom: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {localTitle || 'Your Journey'}
            <Pencil size={16} style={{ opacity: 0.5 }} />
          </div>
        )}

        {/* Description */}
        <p style={{
          fontSize: '12px',
          color: 'var(--text-secondary)',
          margin: '0 0 16px',
          lineHeight: '1.5',
        }}>
          View the summary of your journey. This information will help Eggora curate the perfect styles just for you.
        </p>

        {/* Foundations section */}
        <div style={{ marginBottom: '16px' }}>
          <SectionHeader label="Journey Foundations" />
          {foundations.map((item, i) => (
            <FoundationRow key={i} label={item.label} values={item.values} />
          ))}
        </div>

        {/* Style DNA section */}
        <div>
          <SectionHeader label="Style DNA" />

          {currentBatch < 1 ? (
            <div className="sidebar-shimmer-container">
              <div className="sidebar-shimmer" style={{ height: '32px', borderRadius: '8px', marginBottom: '10px' }} />
              <div className="sidebar-shimmer" style={{ height: '32px', borderRadius: '8px', width: '70%' }} />
            </div>
          ) : (
            <p style={{
              fontSize: '13px',
              color: 'var(--text-tertiary)',
              lineHeight: '1.6',
              margin: 0,
            }}>
              {narrativeText}
            </p>
          )}
        </div>
      </div>

      <style>{`
        .sidebar-shimmer {
          background: linear-gradient(90deg, var(--border-color) 25%, var(--consumer-purple-light) 50%, var(--border-color) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer {
          from { background-position: -200% 0; }
          to   { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}
