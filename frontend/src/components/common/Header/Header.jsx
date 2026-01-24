import { useNavigate } from 'react-router-dom';
import { Compass, LayoutGrid, UserCircle } from 'lucide-react';

export default function Header({
  variant = 'full',
  showNav = true,
  searchQuery = '',
  onSearchChange,
  onSearch,
}) {
  const navigate = useNavigate();

  return (
    <header style={{
      background: 'white',
      borderBottom: '1px solid #EEEEEE',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div className="header-container" style={{
        padding: variant === 'journey' ? '12px 4%' : '20px 48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '32px',
      }}>
        {/* Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          {/* Egg icon */}
          <div style={{
            width: '40px',
            height: '48px',
            background: 'linear-gradient(135deg, #F5A5B8 0%, #FFB6C1 100%)',
            borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
            boxShadow: '0 4px 12px rgba(245, 165, 184, 0.25)',
            position: 'relative',
          }}>
            {/* Eyes */}
            <div style={{
              display: 'flex',
              gap: '6px',
              justifyContent: 'center',
              position: 'absolute',
              top: '16px',
              left: '50%',
              transform: 'translateX(-50%)',
            }}>
              <div style={{
                width: '4px',
                height: '4px',
                background: '#1a202c',
                borderRadius: '50%',
              }} />
              <div style={{
                width: '4px',
                height: '4px',
                background: '#1a202c',
                borderRadius: '50%',
              }} />
            </div>
          </div>

          <span style={{
            fontWeight: '700',
            fontSize: '24px',
            color: 'var(--color-primary-pink)',
            fontFamily: '"Inter", -apple-system, sans-serif',
          }}>
            Agora
          </span>
        </div>

        {/* Compact Search Bar (center) - Show for full and journey variants */}
        {(variant === 'full' || variant === 'journey') && onSearch && (
          <div className="header-search" style={{
            flex: 1,
            maxWidth: variant === 'journey' ? '400px' : '500px',
            margin: '0 auto',
          }}>
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              background: 'white',
              border: '2px solid #E2E8F0',
              borderRadius: '20px',
              padding: '4px',
              transition: 'all 0.2s ease',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#F5A5B8';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#E2E8F0';
            }}
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    onSearch?.(searchQuery);
                  }
                }}
                placeholder="What are you looking for?"
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  padding: '6px 12px',
                  fontSize: '15px',
                  fontFamily: 'inherit',
                  background: 'transparent',
                }}
              />
              <button
                onClick={() => searchQuery.trim() && onSearch?.(searchQuery)}
                style={{
                  width: '36px',
                  height: '36px',
                  background: 'linear-gradient(135deg, #F5A5B8 0%, #E8879C 100%)',
                  border: 'none',
                  borderRadius: '50%',
                  cursor: searchQuery.trim() ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(245, 165, 184, 0.3)',
                  opacity: searchQuery.trim() ? 1 : 0.5,
                }}
                onMouseEnter={(e) => {
                  if (searchQuery.trim()) {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 165, 184, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(245, 165, 184, 0.3)';
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Right side icons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          {variant === 'journey' ? (
            /* Journey variant navigation - Icon only */
            <>
              <button
                onClick={() => navigate('/')}
                style={{
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  background: 'transparent',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  color: '#718096',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F9F9F9';
                  e.currentTarget.style.color = '#F5A5B8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#718096';
                }}
              >
                <Compass size={18} strokeWidth={2} />
              </button>

              <button
                onClick={() => navigate('/browse')}
                style={{
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  background: 'transparent',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  color: '#718096',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F9F9F9';
                  e.currentTarget.style.color = '#F5A5B8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#718096';
                }}
              >
                <LayoutGrid size={18} strokeWidth={2} />
              </button>

              <button
                style={{
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  background: 'transparent',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  color: '#718096',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F9F9F9';
                  e.currentTarget.style.color = '#F5A5B8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#718096';
                }}
              >
                <UserCircle size={18} strokeWidth={2} />
              </button>
            </>
          ) : (
            /* Default variant icons */
            <>
              {/* Calendar icon */}
              <button
                style={{
                  width: '40px',
                  height: '40px',
                  border: 'none',
                  background: 'transparent',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#718096',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F9F9F9';
                  e.currentTarget.style.color = '#F5A5B8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#718096';
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </button>

              {/* User icon */}
              <button
                style={{
                  width: '40px',
                  height: '40px',
                  border: 'none',
                  background: 'transparent',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#718096',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F9F9F9';
                  e.currentTarget.style.color = '#F5A5B8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#718096';
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </button>

              {/* Merchant Portal Link - Subtle, at the end */}
              <button
                onClick={() => navigate('/merchant/login')}
                className="merchant-link"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#a0aec0',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  fontFamily: 'inherit',
                  padding: '6px 8px',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#718096';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#a0aec0';
                }}
              >
                Merchant
              </button>
            </>
          )}
        </div>
      </div>

      <style>{`
        /* Tablet and below */
        @media (max-width: 1024px) {
          .header-container {
            padding: 16px 24px !important;
            gap: 16px !important;
          }

          .header-search {
            max-width: 400px !important;
          }
        }

        /* Mobile */
        @media (max-width: 768px) {
          .header-container {
            padding: 12px 16px !important;
            gap: 8px !important;
          }

          .header-search {
            display: none !important;
          }

          .merchant-link {
            font-size: 11px !important;
            padding: 4px 6px !important;
          }
        }
      `}</style>
    </header>
  );
}
