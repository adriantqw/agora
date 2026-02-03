import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../../ThemeToggle';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { useAuth } from '../../../contexts/AuthContext';

export default function Header({
  variant = 'full',
  showNav = true,
  searchQuery = '',
  onSearchChange,
  onSearch,
}) {
  const navigate = useNavigate();
  const colors = useThemeColors();
  const { user, isAuthenticated } = useAuth();

  const getDisplayName = () => {
    if (!isAuthenticated || !user) return 'Account';
    
    const individualName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
    if (individualName) return individualName.split(' ')[0];
    
    if (user.full_name) return user.full_name.split(' ')[0];
    
    return (user.merchant_name || 'Account').split(' ')[0];
  };

  // Custom SVGs for all Header variants
  const JourneyIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 21V4C5 4 5 3 7 3C9 3 10 4 12 4C14 4 15 3 17 3C19 3 19 4 19 4V14C19 14 19 15 17 15C15 15 14 14 12 14C10 14 9 15 7 15C5 15 5 14 5 14" fill="currentColor" opacity="0.8"/>
      <path d="M7 14V21H5V14H7Z" fill="currentColor"/>
    </svg>
  );

  const InventoryIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 21C4.45 21 3.975 20.8083 3.575 20.425C3.19167 20.025 3 19.55 3 19V5C3 4.45 3.19167 3.98333 3.575 3.6C3.975 3.2 4.45 3 5 3H19C19.55 3 20.0167 3.2 20.4 3.6C20.8 3.98333 21 4.45 21 5V19C21 19.55 20.8 20.025 20.4 20.425C20.0167 20.8083 19.55 21 19 21H5ZM12 16C12.6333 16 13.2083 15.8167 13.725 15.45C14.2417 15.0833 14.6 14.6 14.8 14H19V5H5V14H9.2C9.4 14.6 9.75833 15.0833 10.275 15.45C10.7917 15.8167 11.3667 16 12 16Z" fill="currentColor"/>
    </svg>
  );

  const ProfileIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5.85 17.1C6.7 16.45 7.65 15.9375 8.7 15.5625C9.75 15.1875 10.85 15 12 15C13.15 15 14.25 15.1875 15.3 15.5625C16.35 15.9375 17.3 16.45 18.15 17.1C18.7333 16.4167 19.1875 15.6417 19.5125 14.775C19.8375 13.9083 20 12.9833 20 12C20 9.78333 19.2208 7.89583 17.6625 6.3375C16.1042 4.77917 14.2167 4 12 4C9.78333 4 7.89583 4.77917 6.3375 6.3375C4.77917 7.89583 4 9.78333 4 12C4 12.9833 4.1625 13.9083 4.4875 14.775C4.8125 15.6417 5.26667 16.4167 5.85 17.1ZM12 13C11.0167 13 10.1875 12.6625 9.5125 11.9875C8.8375 11.3125 8.5 10.4833 8.5 9.5C8.5 8.51667 8.8375 7.6875 9.5125 7.0125C10.1875 6.3375 11.0167 6 12 6C12.9833 6 13.8125 6.3375 14.4875 7.0125C15.1625 7.6875 15.5 8.51667 15.5 9.5C15.5 10.4833 15.1625 11.3125 14.4875 11.9875C13.8125 12.6625 12.9833 13 12 13ZM12 22C10.6167 22 9.31667 21.7375 8.1 21.2125C6.88333 20.6875 5.825 19.975 4.925 19.075C4.025 18.175 3.3125 17.1167 2.7875 15.9C2.2625 14.6833 2 13.3833 2 12C2 10.6167 2.2625 9.31667 2.7875 8.1C3.3125 6.88333 4.025 5.825 4.925 4.925C5.825 4.025 6.88333 3.3125 8.1 2.7875C9.31667 2.2625 10.6167 2 12 2C13.3833 2 14.6833 2.2625 15.9 2.7875C17.1167 3.3125 18.175 4.025 19.075 4.925C19.975 5.825 20.6875 6.88333 21.2125 8.1C21.7375 9.31667 22 10.6167 22 12C22 13.3833 21.7375 14.6833 21.2125 15.9C20.6875 17.1167 19.975 18.175 19.075 19.075C18.175 19.975 17.1167 20.6875 15.9 21.2125C14.6833 21.7375 13.3833 22 12 22Z" fill="currentColor"/>
    </svg>
  );

  const isLanding = variant === 'landing';
  const textColor = isLanding ? '#4A5568' : colors.text.primary;
  const headerBg = isLanding ? 'transparent' : colors.card.background;
  const logoColor = colors.gradient.start;

  return (
    <header style={{
      background: headerBg,
      borderBottom: isLanding ? 'none' : `1px solid ${colors.border.subtle}`,
      position: isLanding ? 'absolute' : 'relative',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      backdropFilter: isLanding ? 'none' : 'blur(8px)',
    }}>
      <div className="header-container" style={{
        padding: '15px 6%',
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
          <div style={{
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}>
            <img 
              src="/egg-chan.svg" 
              alt="Egg-chan Logo" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
            />
          </div>

          <span style={{
            fontWeight: '800',
            fontSize: '24px',
            background: colors.gradient.consumer,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            fontFamily: '"Readex Pro", -apple-system, sans-serif',
            letterSpacing: '-0.5px',
          }}>
            Agora
          </span>
        </div>

        {/* Search Bar (Only for Journey/Full variants if needed) */}
        {!isLanding && variant === 'journey' && onSearch && (
          <div className="header-search" style={{
            flex: 1,
            maxWidth: '400px',
            margin: '0 auto',
          }}>
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              background: colors.card.backgroundAlt,
              border: `1px solid ${colors.border.subtle}`,
              borderRadius: '20px',
              padding: '4px',
              transition: 'all 0.2s ease',
            }}>
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
                  color: colors.text.primary,
                }}
              />
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <button
            onClick={() => navigate('/journeys')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0 12px',
              height: '40px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: textColor,
              fontSize: '15px',
              fontWeight: '600',
              transition: 'all 0.2s',
              borderRadius: '8px',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = colors.gradient.consumer}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <JourneyIcon />
            <span>Journeys</span>
          </button>

                        <button
                          onClick={() => navigate('/inventory')}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '0 12px',
                            height: '40px',
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            color: textColor,
                            fontSize: '15px',
                            fontWeight: '600',
                            transition: 'all 0.2s',
                            borderRadius: '8px',
                          }}
onMouseEnter={(e) => e.currentTarget.style.background = colors.gradient.consumer}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <InventoryIcon />
                          <span>Inventory</span>
                        </button>
          <button
            onClick={() => navigate('/login')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0 12px',
              height: '40px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: textColor,
              fontSize: '15px',
              fontWeight: '600',
              transition: 'all 0.2s',
              borderRadius: '8px',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = colors.gradient.consumer}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <ProfileIcon />
            <span>{getDisplayName()}</span>
          </button>

          {!isLanding && (
            <ThemeToggle
              size={40}
              borderRadius={isLanding ? '50%' : '8px'}
              iconColor={textColor}
              hoverBackground={isLanding ? 'rgba(0,0,0,0.05)' : colors.card.backgroundAlt}
              hoverIconColor={isLanding ? '#2D3748' : colors.text.primary}
            />
          )}
        </div>
      </div>
    </header>
  );
}