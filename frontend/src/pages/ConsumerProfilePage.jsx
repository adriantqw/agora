import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Edit2, 
  LayoutGrid, 
  Sliders, 
  Package, 
  Heart, 
  Settings, 
  LogOut, 
  Shirt, 
  Wand2, 
  Leaf, 
  ChevronRight, 
  ChevronLeft,
  ShoppingBag,
  Footprints,
  Glasses,
  ArrowRight
} from 'lucide-react';
import { useThemeColors } from '../hooks/useThemeColors';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/common/Header/Header';
import Footer from '../components/consumer/Footer/Footer';

const ConsumerProfilePage = () => {
  const colors = useThemeColors();
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const userName = user?.full_name || user?.merchant_name || 'Shopper';
  const joinDate = new Date(user?.created_at || Date.now()).getFullYear();

  // Mock data for recent saves
  const recentSaves = [
    { id: 1, name: 'Silk Midi Dress', price: 245.00, icon: Shirt },
    { id: 2, name: 'Leather Tote', price: 180.00, icon: ShoppingBag },
    { id: 3, name: 'Urban Runners', price: 120.00, icon: Footprints },
    { id: 4, name: 'Retro Frames', price: 85.00, icon: Glasses },
  ];

  const StatCard = ({ icon: Icon, value, label, colorClass, iconColor }) => (
    <div style={{
      background: colors.card.background,
      padding: '20px',
      borderRadius: '16px',
      boxShadow: colors.shadow.sm,
      border: `1px solid ${colors.border.light}`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = colors.primary.eggPink;
      e.currentTarget.style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = colors.border.light;
      e.currentTarget.style.transform = 'none';
    }}
    >
      <div style={{
        width: '40px',
        height: '40px',
        background: isDark ? `${iconColor}20` : `${iconColor}15`, // 20/15% opacity
        color: iconColor,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '12px',
      }}>
        <Icon size={20} fill={iconColor} fillOpacity={0.2} />
      </div>
      <div style={{ fontSize: '24px', fontWeight: '700', color: colors.text.primary, marginBottom: '4px' }}>{value}</div>
      <div style={{ fontSize: '12px', color: colors.text.secondary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
    </div>
  );

  return (
    <div style={{ background: colors.page.background, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header variant="landing" showNav={true} />

      <main style={{ flexGrow: 1, padding: '32px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Breadcrumbs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: colors.text.secondary, marginBottom: '24px' }}>
            <span style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>Home</span>
            <ChevronRight size={12} />
            <span style={{ color: colors.text.primary, fontWeight: '500' }}>My Account</span>
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
                    background: colors.primary.eggPinkLight,
                    marginBottom: '12px',
                    position: 'relative'
                  }}>
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}&backgroundColor=ffdfbf`} 
                      alt="Profile" 
                      style={{ width: '100%', height: '100%', borderRadius: '50%' }}
                    />
                    <div style={{
                      position: 'absolute',
                      bottom: '4px',
                      right: '4px',
                      width: '24px',
                      height: '24px',
                      background: colors.primary.eggPink,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `2px solid ${colors.card.background}`,
                      color: 'white'
                    }}>
                      <Edit2 size={12} />
                    </div>
                  </div>
                  <h2 style={{ fontSize: '18px', fontWeight: '700', color: colors.text.primary, marginBottom: '4px' }}>{userName}</h2>
                  <p style={{ fontSize: '12px', color: colors.text.secondary }}>Member since {joinDate}</p>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {[
                    { icon: LayoutGrid, label: 'Overview', active: true },
                    { icon: Sliders, label: 'Style Profile', active: false },
                    { icon: Package, label: 'Orders & Returns', active: false },
                    { icon: Heart, label: 'Wishlist', badge: 12, active: false },
                    { icon: Settings, label: 'Settings', active: false }
                  ].map((item, idx) => (
                    <a 
                      key={idx} 
                      href="#" 
                      onClick={(e) => e.preventDefault()}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        color: item.active ? colors.primary.eggPink : colors.text.secondary,
                        background: item.active ? (isDark ? 'rgba(245, 165, 184, 0.15)' : colors.primary.eggPinkLight) : 'transparent',
                        fontWeight: item.active ? '600' : '500',
                        textDecoration: 'none',
                        transition: 'all 0.2s',
                        fontSize: '14px'
                      }}
                      onMouseEnter={(e) => {
                        if (!item.active) e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : '#F9FAFB';
                      }}
                      onMouseLeave={(e) => {
                        if (!item.active) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <item.icon size={18} fill={item.active ? 'currentColor' : 'none'} />
                      {item.label}
                      {item.badge && (
                        <span style={{ 
                          marginLeft: 'auto', 
                          background: isDark ? 'rgba(255,255,255,0.1)' : '#F3F4F6', 
                          color: colors.text.secondary, 
                          fontSize: '10px', 
                          fontWeight: '700', 
                          padding: '2px 8px', 
                          borderRadius: '99px' 
                        }}>
                          {item.badge}
                        </span>
                      )}
                    </a>
                  ))}
                </nav>

                <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: `1px solid ${colors.border.light}` }}>
                  <button 
                    onClick={handleLogout}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '8px 16px',
                      width: '100%',
                      border: 'none',
                      background: 'transparent',
                      color: colors.status.error.text,
                      fontWeight: '600',
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'opacity 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                  >
                    <LogOut size={18} />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content (9 cols) */}
            <div style={{ gridColumn: 'span 9' }} className="profile-content">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Welcome Banner */}
                <div style={{
                  background: `linear-gradient(135deg, ${colors.primary.eggPink} 0%, ${colors.primary.eggPinkDark} 100%)`,
                  borderRadius: '24px',
                  padding: '32px',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 10px 30px -10px rgba(245, 165, 184, 0.5)'
                }}>
                  <div style={{ position: 'relative', zIndex: 10 }}>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>Hello, {userName.split(' ')[0]}! ✨</h1>
                    <p style={{ opacity: 0.9, maxWidth: '480px', marginBottom: '24px', lineHeight: '1.5' }}>
                      Your closet analysis is complete. Based on the "Spring Collection" trends, we've found 5 items you might love.
                    </p>
                    <button style={{
                      background: 'white',
                      color: colors.primary.eggPinkDark,
                      border: 'none',
                      padding: '10px 24px',
                      borderRadius: '99px',
                      fontWeight: '700',
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      View Recommendations <ArrowRight size={16} strokeWidth={3} />
                    </button>
                  </div>
                  {/* Abstract shapes */}
                  <div style={{
                    position: 'absolute',
                    top: '-50%',
                    right: '-10%',
                    width: '300px',
                    height: '300px',
                    background: 'white',
                    opacity: 0.1,
                    transform: 'rotate(12deg)'
                  }} />
                </div>

                {/* Stats Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <StatCard 
                    icon={Shirt} 
                    value="142" 
                    label="Closet Items" 
                    iconColor="#60A5FA" // Blue
                  />
                  <StatCard 
                    icon={Wand2} 
                    value="28" 
                    label="Journeys" 
                    iconColor="#A78BFA" // Purple
                  />
                  <StatCard 
                    icon={Leaf} 
                    value="High" 
                    label="Sustainability" 
                    iconColor="#34D399" // Green
                  />
                </div>

                {/* Style Profile Section */}
                <div style={{
                  background: colors.card.background,
                  borderRadius: '24px',
                  padding: '32px',
                  boxShadow: colors.shadow.sm,
                  border: `1px solid ${colors.border.subtle}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                      <h3 style={{ fontSize: '20px', fontWeight: '700', color: colors.text.primary, marginBottom: '4px' }}>Your Style DNA</h3>
                      <p style={{ fontSize: '14px', color: colors.text.secondary }}>Based on your recent interactions</p>
                    </div>
                    <button style={{ background: 'none', border: 'none', color: colors.primary.eggPink, fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
                      Edit Profile
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
                    {['Romantic Chic', 'Minimalist', 'Neutral Palette', 'Sustainable Fabrics'].map((tag, idx) => (
                      <span key={idx} style={{
                        padding: '8px 16px',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: idx === 0 ? '600' : '500',
                        background: idx === 0 ? (isDark ? 'rgba(245, 165, 184, 0.15)' : colors.primary.eggPinkLight) : colors.card.backgroundAlt,
                        color: idx === 0 ? colors.primary.eggPink : colors.text.secondary,
                        border: `1px solid ${idx === 0 ? colors.primary.eggPink : colors.border.light}`
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Progress Bar */}
                  <div style={{ background: colors.card.backgroundAlt, borderRadius: '16px', padding: '24px', border: `1px solid ${colors.border.light}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: colors.text.muted }}>Profile Completeness</span>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: colors.primary.eggPink }}>85%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: colors.border.light, borderRadius: '99px', marginBottom: '16px', overflow: 'hidden' }}>
                      <div style={{ width: '85%', height: '100%', background: colors.primary.eggPink, borderRadius: '99px' }}></div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ flexGrow: 1 }}>
                        <p style={{ fontSize: '14px', fontWeight: '500', color: colors.text.primary, marginBottom: '2px' }}>Add a body photo for better sizing accuracy.</p>
                        <p style={{ fontSize: '12px', color: colors.text.secondary }}>Only visible to your AI stylist.</p>
                      </div>
                      <button style={{
                        padding: '8px 16px',
                        background: colors.card.background,
                        border: `1px solid ${colors.border.color}`,
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '700',
                        color: colors.text.secondary,
                        cursor: 'pointer'
                      }}>
                        Upload
                      </button>
                    </div>
                  </div>
                </div>

                {/* Recent Favorites */}
                <div style={{
                  background: colors.card.background,
                  borderRadius: '24px',
                  padding: '32px',
                  boxShadow: colors.shadow.sm,
                  border: `1px solid ${colors.border.subtle}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', color: colors.text.primary }}>Recent Saves</h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', background: colors.card.backgroundAlt, color: colors.text.secondary, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><ChevronLeft size={16} strokeWidth={3} /></button>
                      <button style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', background: colors.card.backgroundAlt, color: colors.text.secondary, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><ChevronRight size={16} strokeWidth={3} /></button>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px' }}>
                    {recentSaves.map((item) => (
                      <div key={item.id} style={{ cursor: 'pointer' }} className="group">
                        <div style={{
                          aspectRatio: '3/4',
                          background: colors.card.backgroundAlt,
                          borderRadius: '12px',
                          marginBottom: '12px',
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden'
                        }}>
                          <item.icon size={48} color={colors.text.tertiary} strokeWidth={1} />
                          <div style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            width: '32px',
                            height: '32px',
                            background: colors.card.background,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: colors.status.error.text,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          }}>
                            <Heart size={16} fill="currentColor" />
                          </div>
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: colors.text.primary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                        <div style={{ fontSize: '12px', color: colors.text.secondary }}>${item.price.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <style>{`
        @media (max-width: 1023px) {
          .profile-sidebar {
            grid-column: span 12 !important;
          }
          .profile-content {
            grid-column: span 12 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ConsumerProfilePage;
