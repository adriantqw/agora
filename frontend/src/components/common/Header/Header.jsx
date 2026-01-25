import { useNavigate } from 'react-router-dom';
import { Compass, LayoutGrid, UserCircle } from 'lucide-react';
import ThemeToggle from '../../ThemeToggle';
import { useThemeColors } from '../../../hooks/useThemeColors';

export default function Header({
  variant = 'full',
  showNav = true,
  searchQuery = '',
  onSearchChange,
  onSearch,
}) {
  const navigate = useNavigate();
  const colors = useThemeColors();

  return (
    <header style={{
      background: colors.gradient.pink,
      borderBottom: `2px solid ${colors.border.divider}`,
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div className="header-container" style={{
        padding: (variant === 'journey' || variant === 'landing') ? '12px 4%' : '20px 48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '32px',
      }}>
        {/* Logo */}
        <div 
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
          }}
        >
          {/* Egg icon - white background on pink header */}
          <div style={{
            width: '40px',
            height: '48px',
            background: 'white',
            borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
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
                background: colors.primary.eggPinkDark || '#E8879C',
                borderRadius: '50%',
              }} />
              <div style={{
                width: '4px',
                height: '4px',
                background: colors.primary.eggPinkDark || '#E8879C',
                borderRadius: '50%',
              }} />
            </div>
          </div>

          <span style={{
            fontWeight: '700',
            fontSize: '24px',
            color: 'white',
            fontFamily: '"Inter", -apple-system, sans-serif',
            textShadow: '0 2px 4px rgba(0,0,0,0.05)',
          }}>
            Agora
          </span>
        </div>

        {/* Compact Search Bar (center) - Show only for journey variant with search */}
        {variant === 'journey' && onSearch && (
          <div className="header-search" style={{
            flex: 1,
            maxWidth: '400px',
            margin: '0 auto',
          }}>
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              background: 'white',
              border: `2px solid rgba(255, 255, 255, 0.2)`,
              borderRadius: '20px',
              padding: '4px',
              transition: 'all 0.2s ease',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'white';
              e.currentTarget.style.boxShadow = '0 0 0 4px rgba(255, 255, 255, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.boxShadow = 'none';
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
          {variant === 'landing' ? (
            /* Landing variant navigation - Icon + Text */
            <>
              <button
                onClick={() => navigate('/journeys')}
                className="nav-button-landing"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  border: 'none',
                  background: 'transparent',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <Compass size={18} strokeWidth={2} />
                <span className="nav-label-landing">Journeys</span>
              </button>

              <button
                onClick={() => navigate('/closet')}
                className="nav-button-landing"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  border: 'none',
                  background: 'transparent',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <LayoutGrid size={18} strokeWidth={2} />
                <span className="nav-label-landing">Closet</span>
              </button>

              <button
                onClick={() => navigate('/login')}
                className="nav-button-landing"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  border: 'none',
                  background: 'transparent',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <UserCircle size={18} strokeWidth={2} />
                <span className="nav-label-landing">Profile</span>
              </button>
            </>
          ) : variant === 'journey' ? (
            /* Journey variant navigation - Icon only */
            <>
              <button
                onClick={() => navigate('/journeys')}
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
                  color: 'white',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <Compass size={18} strokeWidth={2} />
              </button>

              <button
                onClick={() => navigate('/closet')}
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
                  color: 'white',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <LayoutGrid size={18} strokeWidth={2} />
              </button>

              <button
                onClick={() => navigate('/login')}
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
                  color: 'white',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
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
                  color: 'white',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
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
                  color: 'white',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
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
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  fontFamily: 'inherit',
                  padding: '6px 8px',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                }}
              >
                Merchant
              </button>
            </>
          )}

          <ThemeToggle
            size={variant === 'journey' ? 36 : 40}
            borderRadius={variant === 'journey' ? '50%' : '8px'}
            iconColor="white"
            hoverBackground="rgba(255, 255, 255, 0.2)"
            hoverIconColor="white"
          />
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

          /* Hide text labels on mobile for landing variant */
          .nav-label-landing {
            display: none !important;
          }

          /* Make landing variant buttons icon-only on mobile */
          .nav-button-landing {
            width: 36px !important;
            height: 36px !important;
            padding: 0 !important;
            justify-content: center !important;
          }
        }
      `}</style>
    </header>
  );
}
