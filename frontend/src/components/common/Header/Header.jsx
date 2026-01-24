import { useNavigate } from 'react-router-dom';

export default function Header({
  variant = 'full',
  showNav = true,
  onQuizClick,
}) {
  const navigate = useNavigate();
  const navItems = ['Wardrobe', 'Kitchen', 'Office', 'Bedroom'];

  return (
    <header style={{
      background: 'white',
      borderBottom: '1px solid #EEEEEE',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div className="header-container" style={{
        padding: '20px 48px',
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
            color: '#1a202c',
            fontFamily: '"Inter", -apple-system, sans-serif',
          }}>
            egg-ora
          </span>
        </div>

        {/* Navigation Items (center) */}
        {showNav && variant === 'full' && (
          <nav style={{
            display: 'flex',
            gap: '32px',
            flex: 1,
            justifyContent: 'center',
          }}>
            {navItems.map((item) => (
              <a
                key={item}
                href="#"
                style={{
                  fontSize: '15px',
                  fontWeight: '500',
                  color: '#4a5568',
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#F5A5B8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#4a5568';
                }}
              >
                {item}
              </a>
            ))}
          </nav>
        )}

        {/* Right side icons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}>
          {/* Merchant Portal Link */}
          <button
            onClick={() => navigate('/merchant/login')}
            className="merchant-link"
            style={{
              background: 'none',
              border: 'none',
              color: '#718096',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              textDecoration: 'none',
              fontFamily: 'inherit',
              padding: '6px 12px',
              borderRadius: '6px',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#F7FAFC';
              e.currentTarget.style.color = '#4a5568';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
              e.currentTarget.style.color = '#718096';
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
            Merchant
          </button>

          {/* Take the quiz link */}
          <button
            onClick={onQuizClick}
            className="quiz-button"
            style={{
              background: 'none',
              border: 'none',
              color: '#F5A5B8',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              textDecoration: 'none',
              fontFamily: 'inherit',
              padding: '8px 16px',
              borderRadius: '8px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#FFF5F7';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
            }}
          >
            Take the quiz
          </button>

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
        </div>
      </div>

      <style>{`
        /* Tablet and below */
        @media (max-width: 1024px) {
          .header-container {
            padding: 16px 24px !important;
            gap: 16px !important;
          }

          .header-container nav {
            display: none !important;
          }
        }

        /* Mobile */
        @media (max-width: 768px) {
          .header-container {
            padding: 12px 16px !important;
            gap: 12px !important;
          }

          .header-container .quiz-button {
            display: none !important;
          }

          .merchant-link {
            font-size: 0 !important;
            padding: 6px !important;
          }

          .merchant-link svg {
            margin: 0 !important;
          }
        }
      `}</style>
    </header>
  );
}
