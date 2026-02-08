import { useState, useEffect } from 'react';
import { Layers, Pencil, Sparkles, Goal, Image } from 'lucide-react';
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

function SectionHeader({ label, icon: Icon }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '10px',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      color: 'var(--text-muted)',
      marginBottom: '8px',
    }}>
      {Icon && <Icon size={11} color='var(--text-muted)' />}
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
    // CARD CONTAINER - Individual card for each foundation row
    <div style={{
      background: 'rgba(255, 255, 255, 0.5)',
      border: '1px solid var(--border-color)',
      borderRadius: '10px',
      padding: '12px 14px',
      marginBottom: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
    }}>
      {/* LEFT SIDE: Icon + Label */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        flexShrink: 0,
      }}>
        {/* Icon */}
        <div style={{
          width: '20px',
          height: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
        }}>
          <IconComponent size={16} />
        </div>

        {/* Label */}
        <span style={{
          fontSize: '11px',
          color: 'var(--text-secondary)',
          fontWeight: '500',
        }}>
          {label}
        </span>
      </div>

      {/* RIGHT SIDE: Pills */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        flexWrap: 'wrap',
        justifyContent: 'flex-end',
      }}>
        {!hasValues ? (
          <span style={{
            fontSize: '10px',
            color: 'var(--text-muted)',
            fontStyle: 'italic',
          }}>
            Not set
          </span>
        ) : (
          <>
            {displayValues.map((val, i) => (
              <div key={i} style={{
                fontSize: '11px',
                fontWeight: '600',
                color: 'var(--consumer-purple)',
                background: 'rgba(139, 92, 246, 0.12)',
                padding: '4px 11px',
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
                  fontSize: '10px',
                  fontWeight: '700',
                  color: 'var(--consumer-purple)',
                  background: 'rgba(139, 92, 246, 0.12)',
                  padding: '4px 8px',
                  borderRadius: '50%',
                  cursor: 'help',
                  minWidth: '24px',
                  minHeight: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                +{overflow}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function JourneyBuilderSidebar({ foundations, narrativeText, currentBatch, journeyTitle, isStreaming, moodBoardUrl }) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [localTitle, setLocalTitle] = useState(journeyTitle);

  // Sync local title when prop changes (e.g. from streaming journey_field events)
  useEffect(() => {
    if (!isEditingTitle) setLocalTitle(journeyTitle);
  }, [journeyTitle, isEditingTitle]);

  const handleSaveTitle = () => {
    setIsEditingTitle(false);
    // In future: Call API to persist title change
    console.log('Title saved:', localTitle);
  };

  return (
    <div style={{
      height: '95%',
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
        <SectionHeader label="Current Journey Summary" icon={Goal} />

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
              fontSize: '16px',
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
              fontSize: '17px',
              fontWeight: '700',
              background: 'var(--gradient-user-answer)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {localTitle || 'Your Journey'}
            <Pencil size={16} style={{ opacity: 0.5, WebkitTextFillColor: 'var(--text-muted)', color: 'var(--text-muted)' }} />
          </div>
        )}

        {/* Description */}
        <p style={{
          fontSize: '11px',
          color: 'var(--text-secondary)',
          margin: '0 0 20px',
          lineHeight: '1.5',
        }}>
          View the summary of your journey. This information will help Eggora curate the perfect styles just for you.
        </p>

        {/* Foundations section */}
        <div style={{ marginBottom: '20px' }}>
          <SectionHeader label="Journey Foundations" icon={Layers} />
          {foundations.length === 0 && isStreaming ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[0, 1, 2].map(i => (
                <div key={i} className="sidebar-shimmer" style={{ height: '44px', borderRadius: '10px' }} />
              ))}
            </div>
          ) : (
            foundations.map((item, i) => (
              <FoundationRow key={i} label={item.label} values={item.values} />
            ))
          )}
        </div>

        {/* Style DNA section */}
        <div>
          <SectionHeader label="Style Vibe" icon={Sparkles} />

          {!narrativeText && (currentBatch < 1 || isStreaming) ? (
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

        {/* Mood Board section */}
        {moodBoardUrl && (
          <div style={{ marginTop: '20px' }}>
            <SectionHeader label="Mood Board" icon={Image} />
            <div style={{
              borderRadius: '10px',
              overflow: 'hidden',
              border: '1px solid var(--border-color)',
              background: 'rgba(255, 255, 255, 0.5)',
            }}>
              <img
                src={moodBoardUrl}
                alt="Mood Board"
                style={{
                  width: '100%',
                  display: 'block',
                  objectFit: 'cover',
                }}
              />
            </div>
          </div>
        )}
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
