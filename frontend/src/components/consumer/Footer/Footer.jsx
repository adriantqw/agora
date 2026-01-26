import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeColors } from '../../../hooks/useThemeColors';

/**
 * Footer Component
 *
 * Site footer with:
 * - 4-column grid: Brand, My Activity, Experience, Support
 * - Agora branding with tagline
 * - Footer bottom bar with merchant portal link
 * - Privacy/Terms links
 * - Responsive: 4 cols → 2 cols on tablet → 1 col on mobile
 */
const Footer = () => {
  const colors = useThemeColors();
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <footer
      style={{
        background: colors.page.background,
        color: colors.text.primary,
        padding: '60px 6% 0',
        marginTop: '80px',
        borderTop: `2px solid ${colors.border.divider}`,
      }}
    >
      {/* Footer Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '40px',
          marginBottom: '48px',
        }}
        className="footer-grid"
      >
        {/* Brand Column */}
        <div>
          <h3
            style={{
              fontSize: '24px',
              fontWeight: '700',
              marginBottom: '12px',
              color: 'var(--color-primary-pink)',
            }}
          >
            Agora
          </h3>
          <p
            style={{
              fontSize: '14px',
              color: colors.text.secondary,
              lineHeight: '1.6',
              maxWidth: '280px',
            }}
          >
            Your personal AI shopping assistant for every occasion. Curate, discover, and express your unique style journey.
          </p>
        </div>

        {/* My Activity Column */}
        <div>
          <h4
            style={{
              fontSize: '14px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '16px',
              color: colors.text.primary,
            }}
          >
            My Activity
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {[
              { label: 'Journeys', path: '/' },
              { label: 'My Closets', path: '/browse' },
              { label: 'Saved Items', path: '/browse' },
              { label: 'Orders', path: '/browse' },
            ].map((item) => (
              <li key={item.label} style={{ marginBottom: '12px' }}>
                <button
                  onClick={() => handleNavigate(item.path)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: colors.text.secondary,
                    fontSize: '14px',
                    cursor: 'pointer',
                    padding: 0,
                    textAlign: 'left',
                    transition: 'color 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#F5A5B8';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = colors.text.secondary;
                  }}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Experience Column */}
        <div>
          <h4
            style={{
              fontSize: '14px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '16px',
              color: colors.text.primary,
            }}
          >
            Experience
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {[
              { label: 'Start a Journey', path: '/journey' },
              { label: 'Browse Styles', path: '/browse' },
              { label: 'Virtual Fitting Room', path: '/fitting-room' },
              { label: 'AI Shopping Assistant', path: '/journey' },
            ].map((item) => (
              <li key={item.label} style={{ marginBottom: '12px' }}>
                <button
                  onClick={() => handleNavigate(item.path)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: colors.text.secondary,
                    fontSize: '14px',
                    cursor: 'pointer',
                    padding: 0,
                    textAlign: 'left',
                    transition: 'color 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#F5A5B8';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = colors.text.secondary;
                  }}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Support Column */}
        <div>
          <h4
            style={{
              fontSize: '14px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '16px',
              color: colors.text.primary,
            }}
          >
            Support
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {[
              { label: 'Help Center', path: '/' },
              { label: 'Contact Us', path: '/' },
              { label: 'Size Guide', path: '/' },
              { label: 'Returns', path: '/' },
            ].map((item) => (
              <li key={item.label} style={{ marginBottom: '12px' }}>
                <button
                  onClick={() => handleNavigate(item.path)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: colors.text.secondary,
                    fontSize: '14px',
                    cursor: 'pointer',
                    padding: 0,
                    textAlign: 'left',
                    transition: 'color 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#F5A5B8';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = colors.text.secondary;
                  }}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer Bottom Bar */}
      <div
        style={{
          borderTop: `2px solid ${colors.border.divider}`,
          padding: '24px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        {/* Copyright and Legal Links */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            flexWrap: 'wrap',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: '13px',
              color: colors.text.muted,
            }}
          >
            © 2026 Agora. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button
              onClick={() => handleNavigate('/')}
              style={{
                background: 'transparent',
                border: 'none',
                color: colors.text.muted,
                fontSize: '13px',
                cursor: 'pointer',
                padding: 0,
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = colors.text.secondary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = colors.text.muted;
              }}
            >
              Privacy Policy
            </button>
            <button
              onClick={() => handleNavigate('/')}
              style={{
                background: 'transparent',
                border: 'none',
                color: colors.text.muted,
                fontSize: '13px',
                cursor: 'pointer',
                padding: 0,
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = colors.text.secondary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = colors.text.muted;
              }}
            >
              Terms of Service
            </button>
          </div>
        </div>

        {/* Merchant Portal Link */}
        <button
          onClick={() => handleNavigate('/merchant/login')}
          style={{
            background: colors.primary.blue,
            border: 'none',
            color: '#ffffff',
            padding: '8px 20px',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(66, 153, 225, 0.3)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.primary.blueDark;
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(66, 153, 225, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = colors.primary.blue;
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(66, 153, 225, 0.3)';
          }}
        >
          Merchant Portal
        </button>
      </div>

      {/* Responsive Grid Styles */}
      <style>
        {`
          @media (max-width: 768px) {
            .footer-grid {
              grid-template-columns: repeat(2, 1fr);
            }
          }

          @media (max-width: 480px) {
            .footer-grid {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>
    </footer>
  );
};

export default Footer;
