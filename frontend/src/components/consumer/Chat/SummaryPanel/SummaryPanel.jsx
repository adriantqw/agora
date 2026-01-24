import { Map, CalendarHeart, CloudRain, Banknote, Edit2, Plus, Save, Home } from 'lucide-react';
import { useThemeColors } from '../../../../hooks/useThemeColors';

export default function SummaryPanel({ journey, onEdit, onSaveJourney, onReturnHome }) {
  const colors = useThemeColors();

  const SummaryItem = ({ label, value, icon: Icon, onEditClick }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <span
        style={{
          fontSize: '12px',
          color: colors.text.secondary,
          fontWeight: '600',
        }}
      >
        {label}
      </span>
      <div
        style={{
          background: colors.surface.light,
          padding: '12px 16px',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        {Icon && <Icon size={14} color={colors.text.secondary} />}
        <span style={{ flex: 1 }}>{value || 'Not set'}</span>
        {onEditClick && (
          <Edit2
            size={12}
            color={colors.text.muted}
            style={{ cursor: 'pointer', marginLeft: 'auto' }}
            onClick={onEditClick}
          />
        )}
      </div>
    </div>
  );

  return (
    <aside
      style={{
        background: 'white',
        borderLeft: `1px solid ${colors.border.subtle}`,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Scrollable Content Area */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: '30px',
          display: 'flex',
          flexDirection: 'column',
          gap: '32px',
        }}
      >
        {/* Journey Header */}
        <div>
        <div
          style={{
            fontSize: '12px',
            fontWeight: '800',
            color: colors.text.muted,
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Map size={14} />
          CURRENT JOURNEY
        </div>
        <div
          style={{
            fontSize: '22px',
            fontWeight: '800',
            marginBottom: '6px',
            letterSpacing: '-0.5px',
          }}
        >
          {journey.title || 'New Journey'}
        </div>
        <div
          style={{
            color: colors.primary.eggPink,
            fontSize: '13px',
            fontWeight: '700',
          }}
        >
          {journey.status}
        </div>
      </div>

      {/* Summary List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <SummaryItem
          label="Occasion Type"
          value={journey.occasion}
          icon={CalendarHeart}
          onEditClick={() => onEdit && onEdit('occasion')}
        />

        <SummaryItem
          label="Weather / Location"
          value={journey.weather}
          icon={CloudRain}
          onEditClick={() => onEdit && onEdit('weather')}
        />

        <SummaryItem
          label="Budget Range"
          value={journey.budget}
          icon={Banknote}
          onEditClick={() => onEdit && onEdit('budget')}
        />

        {/* Key Pieces Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span
            style={{
              fontSize: '12px',
              color: colors.text.secondary,
              fontWeight: '600',
            }}
          >
            Key Pieces (Ideation)
          </span>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
            }}
          >
            {journey.keyPieces && journey.keyPieces.length > 0 ? (
              journey.keyPieces.map((piece, index) => (
                <div
                  key={index}
                  style={{
                    background: index === 0 ? '#fff5f7' : colors.surface.light,
                    color: index === 0 ? colors.primary.eggPink : '#bbb',
                    borderRadius: '10px',
                    aspectRatio: '1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `1px ${index === 0 ? 'solid' : 'dashed'} ${
                      index === 0 ? colors.primary.eggPink : colors.border.subtle
                    }`,
                    fontSize: '11px',
                    fontWeight: '600',
                    textAlign: 'center',
                    padding: '8px',
                  }}
                >
                  {piece}
                </div>
              ))
            ) : (
              <>
                <div
                  style={{
                    background: colors.surface.light,
                    borderRadius: '10px',
                    aspectRatio: '1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#bbb',
                    border: `1px dashed ${colors.border.subtle}`,
                    fontSize: '11px',
                    fontWeight: '600',
                    textAlign: 'center',
                    padding: '8px',
                  }}
                >
                  Pending
                </div>
                <div
                  style={{
                    background: colors.surface.light,
                    borderRadius: '10px',
                    aspectRatio: '1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#bbb',
                    border: `1px dashed ${colors.border.subtle}`,
                    fontSize: '11px',
                    fontWeight: '600',
                    textAlign: 'center',
                    padding: '8px',
                  }}
                >
                  Pending
                </div>
              </>
            )}
            {/* Add button */}
            <div
              style={{
                background: 'white',
                borderRadius: '10px',
                aspectRatio: '1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1px solid ${colors.border.subtle}`,
                cursor: 'pointer',
              }}
              onClick={() => onEdit && onEdit('keyPieces')}
            >
              <Plus size={16} />
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Action Buttons - Fixed at bottom */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '20px 30px',
        borderTop: `1px solid ${colors.border.subtle}`,
        background: 'white',
      }}>
        {/* Save Journey Button */}
        <button
          onClick={onSaveJourney}
          style={{
            background: colors.primary.eggPink,
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '14px 20px',
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s',
            boxShadow: '0 4px 12px rgba(255, 183, 197, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(255, 183, 197, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 183, 197, 0.3)';
          }}
        >
          <Save size={16} />
          Save Journey
        </button>

        {/* Return to Home Button */}
        <button
          onClick={onReturnHome}
          style={{
            background: 'transparent',
            color: colors.text.secondary,
            border: `1px solid ${colors.border.subtle}`,
            borderRadius: '12px',
            padding: '14px 20px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.surface.light;
            e.currentTarget.style.borderColor = colors.primary.eggPink;
            e.currentTarget.style.color = colors.primary.eggPink;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = colors.border.subtle;
            e.currentTarget.style.color = colors.text.secondary;
          }}
        >
          <Home size={16} />
          Return to Home
        </button>
      </div>
    </aside>
  );
}
