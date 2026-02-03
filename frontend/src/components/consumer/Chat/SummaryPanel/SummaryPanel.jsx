import { useState, useEffect } from 'react';
import { Map, CalendarHeart, CloudRain, Banknote, Edit2, Plus, Save, Home, Pencil, X } from 'lucide-react';
import { useThemeColors } from '../../../../hooks/useThemeColors';

export default function SummaryPanel({ journey, onEdit, onSaveJourney, onReturnHome }) {
  const colors = useThemeColors();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(journey.title || 'New Journey');

  // Sync titleInput with journey.title when it changes
  useEffect(() => {
    setTitleInput(journey.title || 'New Journey');
  }, [journey.title]);

  const handleSaveTitle = () => {
    if (titleInput.trim()) {
      onEdit && onEdit('title', titleInput.trim());
      setIsEditingTitle(false);
    }
  };

  const handleCancelEdit = () => {
    setTitleInput(journey.title || 'New Journey');
    setIsEditingTitle(false);
  };

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
          background: colors.card.background,
          padding: '12px 16px',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          border: `1px solid ${colors.border.subtle}`,
        }}
      >
        {Icon && <Icon size={14} color={colors.gradient.start} />}
        <span style={{ flex: 1, color: colors.text.primary }}>{value || 'Not set'}</span>
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
        background: colors.page.background,
        borderLeft: `2px solid ${colors.border.divider}`,
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
            color: colors.text.secondary,
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Map size={14} color={colors.gradient.start} />
          CURRENT JOURNEY
        </div>
        <div
          style={{
            fontSize: '22px',
            fontWeight: '800',
            marginBottom: '6px',
            letterSpacing: '-0.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: colors.text.primary,
          }}
        >
          <span style={{ flex: 1 }}>{journey.title || 'New Journey'}</span>
          <button
            onClick={() => {
              setTitleInput(journey.title || 'New Journey');
              setIsEditingTitle(true);
            }}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: colors.text.muted,
              transition: 'all 0.2s',
              borderRadius: '4px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.card.backgroundAlt;
              e.currentTarget.style.color = colors.gradient.start;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = colors.text.muted;
            }}
          >
            <Pencil size={14} />
          </button>
        </div>
        <div
          style={{
            color: colors.gradient.start,
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
          // onEditClick={() => onEdit && onEdit('occasion')}
        />

        <SummaryItem
          label="Weather / Location"
          value={journey.weather}
          icon={CloudRain}
          // onEditClick={() => onEdit && onEdit('weather')}
        />

        <SummaryItem
          label="Budget Range"
          value={journey.budget}
          icon={Banknote}
          // onEditClick={() => onEdit && onEdit('budget')}
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
                    background: index === 0 ? colors.gradient.light : colors.card.background,
                    color: index === 0 ? colors.gradient.start : colors.text.muted,
                    borderRadius: '10px',
                    aspectRatio: '1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `1px ${index === 0 ? 'solid' : 'dashed'} ${
                      index === 0 ? colors.gradient.start : colors.border.subtle
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
                    background: colors.card.background,
                    borderRadius: '10px',
                    aspectRatio: '1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: colors.text.muted,
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
                    background: colors.card.background,
                    borderRadius: '10px',
                    aspectRatio: '1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: colors.text.muted,
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
                background: colors.card.background,
                borderRadius: '10px',
                aspectRatio: '1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1px solid ${colors.border.subtle}`,
                cursor: 'pointer',
                color: colors.text.secondary,
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
        borderTop: `2px solid ${colors.border.divider}`,
        background: colors.page.background,
      }}>
        {/* Save Journey Button */}
        <button
          onClick={onSaveJourney}
          style={{
            background: colors.gradient.start,
            color: '#1a202c', // Dark text for contrast on pink
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
            boxShadow: `0 4px 12px ${colors.gradient.start}33`
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.boxShadow = `0 6px 16px ${colors.gradient.start}44`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = `0 4px 12px ${colors.gradient.start}33`;
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
            border: `1px solid ${colors.border.divider}`,
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
            e.currentTarget.style.background = colors.card.backgroundAlt;
            e.currentTarget.style.borderColor = colors.gradient.start;
            e.currentTarget.style.color = colors.gradient.start;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = colors.border.divider;
            e.currentTarget.style.color = colors.text.secondary;
          }}
        >
          <Home size={16} />
          Return to Home
        </button>
      </div>


      {/* Edit Title Popup */}
      {isEditingTitle && (
        <div
          style={{
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
          }}
          onClick={handleCancelEdit}
        >
          <div
            style={{
              background: colors.card.background,
              borderRadius: '16px',
              padding: '32px',
              width: '90%',
              maxWidth: '400px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: colors.text.primary,
                margin: 0,
              }}>
                Rename Journey
              </h3>
              <button
                onClick={handleCancelEdit}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  color: colors.text.muted,
                  borderRadius: '4px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.surface.light;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Input */}
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSaveTitle();
                }
              }}
              placeholder="Enter journey name..."
              autoFocus
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '15px',
                border: `2px solid ${colors.border.subtle}`,
                borderRadius: '8px',
                outline: 'none',
                marginBottom: '24px',
                fontFamily: 'inherit',
                transition: 'border-color 0.2s',
                background: colors.input.background,
                color: colors.text.primary,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = colors.gradient.start;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = colors.border.subtle;
              }}
            />

            {/* Buttons */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
            }}>
              <button
                onClick={handleCancelEdit}
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: colors.text.secondary,
                  background: 'transparent',
                  border: `1px solid ${colors.border.subtle}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.surface.light;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTitle}
                disabled={!titleInput.trim()}
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: '700',
                  color: 'white',
                  background: titleInput.trim() ? colors.gradient.start : colors.text.muted,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: titleInput.trim() ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s',
                  boxShadow: titleInput.trim() ? `0 4px 12px ${colors.gradient.start}33` : 'none',
                }}
                onMouseEnter={(e) => {
                  if (titleInput.trim()) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = `0 6px 16px ${colors.gradient.start}44`;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = titleInput.trim() ? `0 4px 12px ${colors.gradient.start}33` : 'none';
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
