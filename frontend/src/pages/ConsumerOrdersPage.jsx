import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutGrid, 
  Dna, 
  Package, 
  Heart, 
  Settings, 
  LogOut, 
  ChevronRight,
  Scissors,
  Sparkles,
  ArrowLeft,
  Edit2
} from 'lucide-react';
import { useThemeColors } from '../hooks/useThemeColors';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/common/Header/Header';
import AvatarSelectionModal from '../components/common/AvatarSelectionModal';

const ConsumerOrdersPage = () => {
  const colors = useThemeColors();
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const userName = user?.full_name || user?.merchant_name || 'Shopper';
  const joinDate = new Date(user?.created_at || Date.now()).getFullYear();

  // Avatar state
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState(`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}&backgroundColor=ffdfbf`);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleAvatarSelect = (newAvatar) => {
    setCurrentAvatar(newAvatar);
  };

  return (
    <div style={{ background: colors.page.background, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header variant="full" showNav={true} />

      <main style={{ flexGrow: 1, padding: '32px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Breadcrumbs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: colors.text.secondary, marginBottom: '24px' }}>
            <span style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>Home</span>
            <ChevronRight size={12} />
            <span style={{ cursor: 'pointer' }} onClick={() => navigate('/profile')}>My Account</span>
            <ChevronRight size={12} />
            <span style={{ color: colors.text.primary, fontWeight: '500' }}>Orders & Returns</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '32px' }}>
            
            {/* Sidebar (3 cols) */}
            <div style={{ gridColumn: 'span 3' }} className="profile-sidebar">
              <div style={{
                background: colors.card.background,
                borderRadius: '24px',
                padding: '24px',
                boxShadow: colors.shadow.sm,
                position: 'sticky',
                top: '100px',
                border: `1px solid ${colors.border.subtle}`
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
                  <div style={{ 
                    width: '96px', 
                    height: '96px', 
                    borderRadius: '50%', 
                    padding: '4px', 
                    background: colors.gradient.light,
                    marginBottom: '12px',
                    position: 'relative'
                  }}>
                    <img 
                      src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}&backgroundColor=ffdfbf`} 
                      alt="Profile" 
                      style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  </div>
                  <h2 style={{ fontSize: '18px', fontWeight: '700', color: colors.text.primary, marginBottom: '4px' }}>{userName}</h2>
                  <p style={{ fontSize: '12px', color: colors.text.secondary }}>Member since {joinDate}</p>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {[ 
                    { icon: LayoutGrid, label: 'Overview', active: false, path: '/profile' },
                    { icon: Dna, label: 'Style Profile', active: false, path: '/style-profile' },
                    { icon: Package, label: 'Orders & Returns', active: true, path: '/orders' },
                    { icon: Heart, label: 'Wishlist', active: false, path: '/wishlist' },
                    { icon: Settings, label: 'Settings', active: false, path: '/settings' }
                  ].map((item, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => item.path !== '#' && navigate(item.path)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: 'none',
                        color: item.active ? colors.gradient.start : colors.text.secondary,
                        background: item.active ? colors.gradient.light : 'transparent',
                        fontWeight: item.active ? '700' : '500',
                        textDecoration: 'none',
                        transition: 'all 0.2s',
                        fontSize: '14px',
                        cursor: 'pointer',
                        width: '100%',
                        textAlign: 'left'
                      }}
                      onMouseEnter={(e) => {
                        if (!item.active) e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : '#F9FAFB';
                      }}
                      onMouseLeave={(e) => {
                        if (!item.active) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <item.icon size={18} fill={item.active ? 'currentColor' : 'none'} />
                      <span style={item.active ? {
                        background: colors.gradient.consumer,
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        color: 'transparent',
                      } : {}}>{item.label}</span>
                      {item.badge && (
                        <span style={{ 
                          marginLeft: 'auto', 
                          background: colors.gradient.start, 
                          color: 'white', 
                          fontSize: '10px', 
                          fontWeight: '700', 
                          padding: '2px 8px', 
                          borderRadius: '99px' 
                        }}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>

                <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: `1px solid ${colors.border.light}` }}>
                  <button 
                    onClick={handleLogout}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 16px',
                      width: '100%',
                      border: 'none',
                      borderRadius: '12px',
                      background: 'transparent',
                      color: colors.status.error.text,
                      fontWeight: '600',
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = isDark ? 'rgba(239, 68, 68, 0.1)' : '#FEF2F2';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <LogOut size={18} />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content (9 cols) */}
            <div style={{ gridColumn: 'span 9' }} className="col-span-12 lg:col-span-9">
              
              <div style={{
                background: colors.card.background,
                borderRadius: '32px',
                padding: '48px',
                boxShadow: colors.shadow.sm,
                border: `1px solid ${colors.border.subtle}`,
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '600px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                
                {/* Background Pattern */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0.03,
                  backgroundImage: `radial-gradient(${colors.gradient.start} 1px, transparent 1px)`,
                  backgroundSize: '24px 24px',
                  pointerEvents: 'none'
                }} />

                {/* Floating Graphic */}
                <div style={{
                  position: 'relative',
                  width: '192px',
                  height: '192px',
                  marginBottom: '40px',
                  animation: 'float 6s ease-in-out infinite'
                }}>
                  {/* Background Circle */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: colors.gradient.consumer,
                    borderRadius: '50%',
                    opacity: 0.3
                  }} />
                  <div style={{
                    position: 'absolute',
                    inset: '16px',
                    background: colors.card.background,
                    borderRadius: '50%',
                    border: `4px dashed ${colors.gradient.start}40`
                  }} />
                  
                  {/* Icon */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: colors.gradient.start
                  }}>
                    <Scissors size={72} />
                  </div>
                  
                  {/* Decorative Icons */}
                  <div style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '16px',
                    color: colors.gradient.start,
                    animation: 'pulse 2s infinite'
                  }}>
                    <Sparkles size={32} fill="currentColor" />
                  </div>
                  <div style={{
                    position: 'absolute',
                    bottom: '16px',
                    left: '-8px',
                    color: colors.gradient.end,
                  }}>
                    <Scissors size={32} fill="currentColor" />
                  </div>
                </div>

                {/* Badge */}
                <div style={{
                  display: 'inline-block',
                  padding: '6px 16px',
                  borderRadius: '99px',
                  background: colors.gradient.consumer,
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '24px',
                  boxShadow: `0 4px 12px ${colors.gradient.start}40`
                }}>
                  Coming Soon
                </div>

                <h1 style={{ 
                  fontSize: '36px', 
                  fontWeight: '800', 
                  color: colors.text.primary, 
                  marginBottom: '16px',
                  lineHeight: '1.2'
                }}>
                  We're stitching this feature together.
                </h1>
                
                <p style={{ 
                  color: colors.text.secondary, 
                  fontSize: '18px', 
                  maxWidth: '560px', 
                  lineHeight: '1.6', 
                  marginBottom: '40px' 
                }}>
                  Our Order Tracking & Returns portal is currently being tailored to fit your needs perfectly. Check back soon for a seamless experience.
                </p>

                <div style={{ 
                  display: 'flex', 
                  gap: '16px',
                  justifyContent: 'center',
                  flexWrap: 'wrap'
                }}>
                  <button 
                    onClick={() => navigate('/profile')}
                    style={{
                      padding: '14px 32px',
                      borderRadius: '99px',
                      border: 'none',
                      background: colors.gradient.consumer,
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: `0 10px 20px -5px ${colors.gradient.start}66`,
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = `0 12px 25px -5px ${colors.gradient.start}80`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = `0 10px 20px -5px ${colors.gradient.start}66`;
                    }}
                  >
                    <LayoutGrid size={18} strokeWidth={2.5} />
                    Back to Account Overview
                  </button>
                </div>

              </div>

            </div>
          </div>
        </div>
      </main>
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @media (max-width: 1023px) {
          .profile-sidebar {
            display: none !important;
          }
          .col-span-12 {
            grid-column: span 12 !important;
          }
        }
      `}</style>
      
      {/* Hidden Modal for consistent state management if needed in future */}
      <AvatarSelectionModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        onSelect={handleAvatarSelect}
        currentAvatar={currentAvatar}
      />
    </div>
  );
};

export default ConsumerOrdersPage;