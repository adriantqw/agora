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
  Compass, 
  Leaf, 
  ChevronRight, 
  ChevronLeft,
  ShoppingBag,
  Footprints,
  Glasses,
  ArrowRight,
  Share2,
  Map
} from 'lucide-react';
import { useThemeColors } from '../hooks/useThemeColors';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/common/Header/Header';
import ShareModal from '../components/common/ShareModal';

const ConsumerProfilePage = () => {
  const colors = useThemeColors();
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const userName = user?.full_name || user?.merchant_name || 'Shopper';
  const joinDate = new Date(user?.created_at || Date.now()).getFullYear();

  // Mock wishlist data (subset for profile view)
  const wishlistItems = [
    { id: 1, name: 'Silk Midi Dress', price: 245.00, brand: 'Reformation', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000&auto=format&fit=crop' },
    { id: 2, name: 'Leather Tote Bag', price: 180.00, brand: 'Cuyana', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1000&auto=format&fit=crop' },
    { id: 3, name: 'Classic White Sneakers', price: 120.00, brand: 'Veja', image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=80&w=1000&auto=format&fit=crop' },
    { id: 4, name: 'Gold Hoop Earrings', price: 85.00, brand: 'Mejuri', image: 'https://images.unsplash.com/photo-1635767798638-3e2523422dc7?q=80&w=1000&auto=format&fit=crop' },
    { id: 5, name: 'Wool Blend Coat', price: 350.00, brand: 'Aritzia', image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=1000&auto=format&fit=crop' },
    { id: 6, name: 'High-Waist Jeans', price: 98.00, brand: 'Levi\'s', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1000&auto=format&fit=crop' },
  ];

  // Custom Icons matching Header
  const JourneyIcon = ({ size = 20, color = "currentColor", ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M5 21V4C5 4 5 3 7 3C9 3 10 4 12 4C14 4 15 3 17 3C19 3 19 4 19 4V14C19 14 19 15 17 15C15 15 14 14 12 14C10 14 9 15 7 15C5 15 5 14 5 14" fill={color} opacity="0.8"/>
      <path d="M7 14V21H5V14H7Z" fill={color}/>
    </svg>
  );

  const InventoryIcon = ({ size = 20, color = "currentColor", ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M5 21C4.45 21 3.975 20.8083 3.575 20.425C3.19167 20.025 3 19.55 3 19V5C3 4.45 3.19167 3.98333 3.575 3.6C3.975 3.2 4.45 3 5 3H19C19.55 3 20.0167 3.2 20.4 3.6C20.8 3.98333 21 4.45 21 5V19C21 19.55 20.8 20.025 20.4 20.425C20.0167 20.8083 19.55 21 19 21H5ZM12 16C12.6333 16 13.2083 15.8167 13.725 15.45C14.2417 15.0833 14.6 14.6 14.8 14H19V5H5V14H9.2C9.4 14.6 9.75833 15.0833 10.275 15.45C10.7917 15.8167 11.3667 16 12 16Z" fill={color}/>
    </svg>
  );

  const StatCard = ({ icon: Icon, value, label, colorClass, iconColor, onClick }) => (
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
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.2s ease',
    }}
    onClick={onClick}
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
        <Icon size={20} color={iconColor} />
      </div>
      <div style={{ fontSize: '24px', fontWeight: '700', color: colors.text.primary, marginBottom: '4px' }}>{value}</div>
      <div style={{ fontSize: '12px', color: colors.text.secondary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
    </div>
  );

  return (
    <div style={{ background: colors.page.background, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header variant="full" showNav={true} />

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
                  </div>
                  <h2 style={{ fontSize: '18px', fontWeight: '700', color: colors.text.primary, marginBottom: '4px' }}>{userName}</h2>
                  <p style={{ fontSize: '12px', color: colors.text.secondary }}>Member since {joinDate}</p>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {[ 
                    { icon: LayoutGrid, label: 'Overview', active: true, path: '/profile' },
                    { icon: Sliders, label: 'Style Profile', active: false, path: '/style-profile' },
                    { icon: Package, label: 'Orders & Returns', active: false, path: '/orders' },
                    { icon: Heart, label: 'Wishlist', badge: 12, active: false, path: '/wishlist' },
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
                        color: item.active ? colors.primary.eggPink : colors.text.secondary,
                        background: item.active ? colors.primary.eggPinkLight : 'transparent',
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
            <div style={{ gridColumn: 'span 9' }} className="profile-content">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Welcome Banner */}
                <div style={{
                  background: colors.gradient.pink,
                  borderRadius: '24px',
                  padding: '32px',
                  color: '#FFFFFF',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: isDark ? '0 10px 30px -10px rgba(0, 0, 0, 0.5)' : `0 10px 30px -10px ${colors.primary.pink}80`
                }}>
                  <div style={{ position: 'relative', zIndex: 10 }}>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>Hello, {userName.split(' ')[0]}! ✨</h1>
                    <p style={{ 
                      opacity: 0.9, 
                      maxWidth: '480px', 
                      marginBottom: '24px', 
                      lineHeight: '1.5', 
                      color: '#FFFFFF' 
                    }}>
                      Your closet analysis is complete. Based on the "Spring Collection" trends, we've found 5 items you might love.
                    </p>
                    <button style={{
                      background: 'white',
                      color: colors.primary.eggPink,
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
                    onClick={() => navigate('/recommendations')}
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
                    opacity: 0.2,
                    transform: 'rotate(12deg)'
                  }} />
                </div>

                {/* Stats Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <StatCard 
                    icon={JourneyIcon} 
                    value="28" 
                    label="Journeys" 
                    iconColor="#F97316" // Orange
                    onClick={() => navigate('/journeys')}
                  />
                  <StatCard 
                    icon={InventoryIcon} 
                    value="142" 
                    label="Inventory Items" 
                    iconColor="#14B8A6" // Teal
                    onClick={() => navigate('/inventory')}
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
                    <button 
                      onClick={() => navigate('/style-profile')}
                      style={{ 
                      background: 'none', 
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      color: colors.primary.eggPink, 
                      fontWeight: '600', 
                      fontSize: '14px', 
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = colors.primary.eggPinkLight;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'none';
                    }}
                    >
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
                        background: idx === 0 ? colors.primary.eggPinkLight : colors.card.backgroundAlt,
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
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = colors.primary.eggPinkLight;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = colors.card.background;
                      }}
                      >
                        Upload
                      </button>
                    </div>
                  </div>
                </div>

                {/* My Wishlist (Formerly Recent Favorites) */}
                <div style={{
                  background: colors.card.background,
                  borderRadius: '24px',
                  padding: '32px',
                  boxShadow: colors.shadow.sm,
                  border: `1px solid ${colors.border.subtle}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', color: colors.text.primary }}>My Wishlist</h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => navigate('/wishlist')}
                        style={{ padding: '8px 16px', borderRadius: '99px', border: `1px solid ${colors.border.subtle}`, background: 'transparent', color: colors.text.secondary, fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = colors.primary.eggPink; e.currentTarget.style.color = colors.primary.eggPink; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = colors.border.subtle; e.currentTarget.style.color = colors.text.secondary; }}
                      >
                        View All
                      </button>
                      <button 
                        onClick={() => setIsShareModalOpen(true)}
                        style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', background: colors.card.backgroundAlt, color: colors.text.secondary, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = colors.primary.eggPink; e.currentTarget.style.color = 'white'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = colors.card.backgroundAlt; e.currentTarget.style.color = colors.text.secondary; }}
                        title="Share Wishlist"
                      >
                        <Share2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
                    {wishlistItems.slice(0, 5).map((item) => (
                      <div 
                        key={item.id} 
                        style={{ cursor: 'pointer' }} 
                        className="group"
                        onClick={() => navigate('/wishlist')}
                      >
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
                          <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                            color: colors.primary.eggPink,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          }}>
                            <Heart size={16} fill="currentColor" />
                          </div>
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: colors.text.primary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </main>

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
      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        shareLink={`${window.location.origin}/wishlist/share/${user?.id || 'guest'}`}
      />
    </div>
  );
};

export default ConsumerProfilePage;