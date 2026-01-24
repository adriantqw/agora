import { useState } from 'react';

export default function EventDatePicker({
  selectedDate,
  eventName,
  onDateChange,
  onEventNameChange,
}) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const formatDate = (date) => {
    if (!date) return '';
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
  };

  const handleNameClick = () => {
    setIsEditingName(true);
  };

  const handleNameChange = (e) => {
    onEventNameChange(e.target.value);
  };

  const handleNameBlur = () => {
    setIsEditingName(false);
  };

  const handleDateClick = () => {
    setShowDatePicker(true);
  };

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 24px',
      background: 'white',
      borderRadius: '50px',
      border: '1px solid #EEEEEE',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
    }}>
      {/* Calendar Icon */}
      <button
        onClick={handleDateClick}
        style={{
          width: '32px',
          height: '32px',
          border: 'none',
          background: '#FFF5F7',
          borderRadius: '8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#F5A5B8',
          transition: 'all 0.2s',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#F5A5B8';
          e.currentTarget.style.color = 'white';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#FFF5F7';
          e.currentTarget.style.color = '#F5A5B8';
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </button>

      {/* Event Name */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        {isEditingName ? (
          <input
            type="text"
            value={eventName}
            onChange={handleNameChange}
            onBlur={handleNameBlur}
            autoFocus
            style={{
              border: 'none',
              outline: 'none',
              fontSize: '15px',
              fontWeight: '500',
              color: '#1a202c',
              background: 'transparent',
              borderBottom: '1px solid #F5A5B8',
              padding: '2px 4px',
              fontFamily: 'inherit',
              minWidth: '120px',
            }}
          />
        ) : (
          <span
            onClick={handleNameClick}
            style={{
              fontSize: '15px',
              fontWeight: '500',
              color: '#1a202c',
              textDecoration: 'underline',
              textDecorationColor: '#F5A5B8',
              textDecorationThickness: '2px',
              textUnderlineOffset: '4px',
              cursor: 'pointer',
            }}
          >
            {eventName}
          </span>
        )}

        {selectedDate && (
          <>
            <span style={{
              color: '#a0aec0',
              fontSize: '15px',
            }}>
              •
            </span>
            <span style={{
              fontSize: '14px',
              color: '#718096',
            }}>
              {formatDate(selectedDate)}
            </span>
          </>
        )}
      </div>

      {/* Hidden date input */}
      {showDatePicker && (
        <>
          <input
            type="date"
            value={selectedDate ? new Date(selectedDate).toISOString().split('T')[0] : ''}
            onChange={(e) => {
              onDateChange(e.target.value ? new Date(e.target.value) : null);
              setShowDatePicker(false);
            }}
            onBlur={() => setShowDatePicker(false)}
            autoFocus
            style={{
              position: 'absolute',
              opacity: 0,
              pointerEvents: 'none',
            }}
          />
        </>
      )}
    </div>
  );
}
