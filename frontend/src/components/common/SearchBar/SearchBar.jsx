import { useState } from 'react';

export default function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = 'What are you looking for?',
  showMenuButton = false,
  showJustBrowsing = false,
  onMenuClick,
  onJustBrowsingClick,
}) {
  const [isFocused, setIsFocused] = useState(false);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch();
    }
  };

  return (
    <div style={{
      maxWidth: '680px',
      margin: '0 auto',
      width: '100%',
    }}>
      {/* Search Input Container */}
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        background: 'white',
        borderRadius: '50px',
        border: `2px solid ${isFocused ? '#F5A5B8' : '#EEEEEE'}`,
        padding: '8px 8px 8px 16px',
        boxShadow: isFocused ? '0 4px 16px rgba(245, 165, 184, 0.15)' : '0 2px 8px rgba(0, 0, 0, 0.06)',
        transition: 'all 0.2s ease',
      }}>
        {/* Hamburger Menu Button */}
        {showMenuButton && (
          <button
            onClick={onMenuClick}
            style={{
              width: '40px',
              height: '40px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#718096',
              flexShrink: 0,
              marginRight: '8px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#F5A5B8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#718096';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        )}

        {/* Search Input */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            fontSize: '16px',
            color: '#1a202c',
            background: 'transparent',
            padding: '8px 16px',
            fontFamily: 'inherit',
          }}
        />

        {/* Search Button */}
        <button
          onClick={onSearch}
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            border: 'none',
            background: 'linear-gradient(135deg, #F5A5B8 0%, #E8879C 100%)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(245, 165, 184, 0.3)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(245, 165, 184, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 165, 184, 0.3)';
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      </div>

      {/* "just browsing" link */}
      {showJustBrowsing && (
        <div style={{
          textAlign: 'center',
          marginTop: '12px',
        }}>
          <button
            onClick={onJustBrowsingClick}
            style={{
              background: 'none',
              border: 'none',
              color: '#718096',
              fontSize: '13px',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontFamily: 'inherit',
              padding: '4px 8px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#F5A5B8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#718096';
            }}
          >
            just browsing
          </button>
        </div>
      )}
    </div>
  );
}
