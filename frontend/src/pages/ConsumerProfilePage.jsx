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
  Map,
  Dna,
  Loader
} from 'lucide-react';
import { useThemeColors } from '../hooks/useThemeColors';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/common/Header/Header';
import ShareModal from '../components/common/ShareModal';
import wishlistService from '../services/wishlistService';
import journeyService from '../services/journeyService';
import styleProfileService from '../services/styleProfileService';

const ConsumerProfilePage = () => {
  const colors = useThemeColors();
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoadingWishlist, setIsLoadingWishlist] = useState(true);
  const [stats, setStats] = useState({ journeys: 0, inventory: 0 });
  const [shareLink, setShareLink] = useState('');
  const [styleProfile, setStyleProfile] = useState(null);
  const [isLoadingStyleProfile, setIsLoadingStyleProfile] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleShare = async () => {
    try {
      const result = await wishlistService.createShareLink();
      const link = `${window.location.origin}/shared-wishlist/${result.share_token}`;
      setShareLink(link);
      setIsShareModalOpen(true);
    } catch (err) {
      console.error('Error creating share link:', err);
      // Fallback if API fails
      setShareLink(`${window.location.origin}/shared-wishlist/error`);
      setIsShareModalOpen(true);
    }
  };

  const getDisplayName = () => {
    const individualName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim();
    if (individualName) return individualName;
    if (user?.full_name) return user.full_name;
    return user?.merchant_name || 'Shopper';
  };

  const userName = getDisplayName();
  const joinDate = new Date(user?.created_at || Date.now()).getFullYear();

  // Fetch dashboard data
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Wishlist
        setIsLoadingWishlist(true);
        const wishlistData = await wishlistService.getWishlist(1, 4);
        if (wishlistData) {
          const mappedItems = wishlistData.items.map(item => ({
            id: item.id,
            name: item.product?.name || 'Unknown',
            price: item.product?.price || 0,
            brand: item.product?.tags?.[0] || 'Unknown',
            image: item.product?.image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1000&auto=format&fit=crop'
          }));
          setWishlistItems(mappedItems);
        }

        // Fetch Journeys for stats
        const journeyData = await journeyService.getJourneys();
        if (journeyData) {
          const totalPieces = journeyData.reduce((acc, journey) => acc + (journey.outfits?.length || 0), 0);
          setStats({
            journeys: journeyData.length,
            inventory: totalPieces
          });
        }

        // Fetch Style Profile
        setIsLoadingStyleProfile(true);
        const profileData = await styleProfileService.getStyleProfile();
        if (profileData) {
          setStyleProfile(profileData);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setIsLoadingWishlist(false);
        setIsLoadingStyleProfile(false);
      }
    };

    fetchData();
  }, []);

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
e.currentTarget.style.borderColor = colors.gradient.start;
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
                    { icon: LayoutGrid, label: 'Overview', active: true, path: '/profile' },
                    { icon: Dna, label: 'Style Profile', active: false, path: '/style-profile' },
                    { icon: Package, label: 'Orders & Returns', active: false, path: '/orders' },
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
                  background: colors.card.background,
                  borderRadius: '24px',
                  padding: '32px',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: `0 10px 30px -5px ${colors.gradient.start}26`,
                  border: `1px solid ${isDark ? `${colors.gradient.start}4D` : `${colors.gradient.start}1A`}`,
                }}>
                  <div style={{ 
                    position: 'relative', 
                    zIndex: 10, 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    gap: '32px',
                    flexWrap: 'wrap'
                  }}>
                    <div style={{ flex: 1, minWidth: '300px' }}>
                      <h1 style={{
                        fontSize: '32px',
                        fontWeight: '900',
                        marginBottom: '8px',
                        background: colors.gradient.consumer,
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        color: 'transparent',
                      }}>Hello, {userName.split(' ')[0]}! ✨</h1>
                      <p style={{ 
                        maxWidth: '480px', 
                        lineHeight: '1.5', 
                        color: colors.text.primary,
                        fontWeight: '600',
                        opacity: 0.9
                      }}>
                        Your closet analysis is complete. Based on the "Spring Collection" trends, we've found 5 items you might love.
                      </p>
                    </div>
                    <button style={{
                      background: colors.gradient.consumer,
                      color: 'white',
                      border: 'none',
                      padding: '14px 32px',
                      borderRadius: '99px',
                      fontWeight: '800',
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: `0 4px 15px ${colors.gradient.start}66`,
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap',
                      flexShrink: 0
                    }}
                    onClick={() => navigate('/recommendations')}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = `0 6px 20px ${colors.gradient.start}80`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = `0 4px 15px ${colors.gradient.start}66`;
                    }}
                    >
                      View Recommendations <ArrowRight size={16} strokeWidth={3} />
                    </button>
                  </div>
                  
                  {/* Decorative Subtle Pattern */}
                  <div style={{
                    position: 'absolute',
                    right: '-5%',
                    top: '-10%',
                    width: '30%',
                    height: '120%',
                    background: `radial-gradient(circle, ${colors.gradient.start}0D 0%, transparent 70%)`,
                    transform: 'skewX(-15deg)',
                    pointerEvents: 'none'
                  }} />
                </div>

                {/* Stats Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <StatCard 
                    icon={JourneyIcon} 
                    value={stats.journeys} 
                    label="Journeys" 
                    iconColor="#F97316" // Orange
                    onClick={() => navigate('/journeys')}
                  />
                  <StatCard 
                    icon={InventoryIcon} 
                    value={stats.inventory} 
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
                      <h3 style={{ fontSize: '20px', fontWeight: '700', color: colors.text.primary, marginBottom: '4px' }}>Style Profile</h3>
                      <p style={{ fontSize: '14px', color: colors.text.secondary }}>Based on your recent interactions</p>
                    </div>
                    <button 
                      onClick={() => navigate('/style-profile')}
                      style={{ 
                      background: 'none', 
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      color: colors.gradient.start, 
                      fontWeight: '600', 
                      fontSize: '14px', 
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = colors.gradient.light;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'none';
                    }}
                    >
                      Edit Profile
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
                    
                    {/* Archetype Card - DNA Summary Hero Style */}
                    <div 
                      onClick={() => navigate('/style-profile')}
                      style={{
                      background: colors.gradient.consumer,
                      borderRadius: '20px',
                      padding: '24px',
                      color: '#FFFFFF',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: `0 8px 20px -4px ${colors.gradient.start}4D`,
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease',
                        minHeight: '140px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.01)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      {isLoadingStyleProfile ? (
                        <div style={{ width: '100%', textAlign: 'center', opacity: 0.7 }}>
                          <Loader size={24} style={{ animation: 'spin 1s linear infinite' }} />
                        </div>
                      ) : (
                        <>
                          <div style={{
                            position: 'absolute',
                            right: 0,
                            top: 0,
                            height: '100%',
                            width: '50%',
                            background: 'rgba(255, 255, 255, 0.05)',
                            transform: 'skewX(12deg) translateX(48px)'
                          }} />
                          
                          <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap', width: '100%' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', color: '#FFFFFF', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                <Dna size={14} /> Your Style Archetype
                              </div>
                              <h4 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px', color: '#FFFFFF' }}>
                                {styleProfile?.style_archetype || 'Discovering Your Style...'}
                              </h4>
                              <p style={{ opacity: 0.8, fontSize: '13px', lineHeight: '1.5', maxWidth: '400px', color: '#FFFFFF', margin: 0 }}>
                                {styleProfile ? (
                                  styleProfile.profile_strength < 100 
                                    ? 'Keep refining your profile to unlock deeper insights.'
                                    : 'You lean towards clean lines, neutral palettes, and high-quality basics.'
                                ) : 'Complete your style profile to get personalized recommendations.'}
                              </p>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                              <div style={{
                                width: '52px',
                                height: '52px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative'
                              }}>
                                 <svg width="52" height="52" viewBox="0 0 52 52" style={{ transform: 'rotate(-90deg)' }}>
                                   {/* Background Track */}
                                   <circle
                                     cx="26"
                                     cy="26"
                                     r="23"
                                     fill="none"
                                     stroke="rgba(255, 255, 255, 0.1)"
                                     strokeWidth="4"
                                   />
                                   {/* Progress Bar */}
                                   <circle
                                     cx="26"
                                     cy="26"
                                     r="23"
                                     fill="none"
                                     stroke="white"
                                     strokeWidth="4"
                                     strokeDasharray={2 * Math.PI * 23}
                                     strokeDashoffset={2 * Math.PI * 23 * (1 - (styleProfile?.profile_strength || 0) / 100)}
                                     strokeLinecap="round"
                                     style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                                   />
                                 </svg>
                                 <span style={{ position: 'absolute', fontSize: '14px', fontWeight: '800', color: 'white' }}>{styleProfile?.profile_strength || 0}%</span>
                              </div>
                              <div style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.8)', textTransform: 'uppercase', fontWeight: '700' }}>Strength</div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Quick Tags */}
                    {!isLoadingStyleProfile && styleProfile && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                        {styleProfile.vibes?.length > 0 && (
                          <>
                            <span style={{ fontSize: '12px', fontWeight: '700', color: colors.text.muted, textTransform: 'uppercase', marginRight: '4px' }}>Vibes:</span>
                            {styleProfile.vibes.map((tag) => (
                              <span key={tag} style={{
                                padding: '6px 12px',
                                borderRadius: '8px',
                                fontSize: '13px',
                                fontWeight: '600',
                                background: colors.card.background,
                                border: `1px solid ${colors.border.light}`,
                                color: colors.text.primary
                              }}>
                                {tag}
                              </span>
                            ))}
                          </>
                        )}
                        
                        {styleProfile.vibes?.length > 0 && styleProfile.favorite_brands?.length > 0 && (
                          <div style={{ width: '1px', height: '20px', background: colors.border.light, margin: '0 8px' }}></div>
                        )}

                        {styleProfile.favorite_brands?.length > 0 && (
                          <>
                            <span style={{ fontSize: '12px', fontWeight: '700', color: colors.text.muted, textTransform: 'uppercase', marginRight: '4px' }}>Brands:</span>
                            {styleProfile.favorite_brands.map((tag) => (
                              <span key={tag} style={{
                                padding: '6px 12px',
                                borderRadius: '8px',
                                fontSize: '13px',
                                fontWeight: '600',
                                background: colors.card.background,
                                border: `1px solid ${colors.border.light}`,
                                color: colors.text.primary
                              }}>
                                {tag}
                              </span>
                            ))}
                          </>
                        )}
                      </div>
                    )}

                    {!isLoadingStyleProfile && !styleProfile && (
                      <div style={{ textAlign: 'center', padding: '20px', background: colors.card.backgroundAlt, borderRadius: '16px', border: `1px dashed ${colors.border.subtle}` }}>
                        <p style={{ fontSize: '14px', color: colors.text.secondary, margin: 0 }}>
                          No style profile data yet. <span onClick={() => navigate('/style-profile')} style={{ color: colors.gradient.start, fontWeight: '600', cursor: 'pointer' }}>Create yours now &rarr;</span>
                        </p>
                      </div>
                    )}

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
                        style={{ 
                          padding: '8px 16px', 
                          borderRadius: '99px', 
                          border: `1px solid ${colors.border.subtle}`, 
                          background: 'transparent', 
                          color: colors.text.secondary, 
                          fontSize: '12px', 
                          fontWeight: '600', 
                          cursor: 'pointer', 
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => { 
                          e.currentTarget.style.background = colors.gradient.consumer;
                          e.currentTarget.style.color = 'white';
                          e.currentTarget.style.borderColor = colors.gradient.consumer;
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = `0 4px 12px ${colors.gradient.start}66`;
                        }}
                        onMouseLeave={(e) => { 
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = colors.text.secondary;
                          e.currentTarget.style.borderColor = colors.border.subtle;
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        View All
                      </button>
                      <button 
                        onClick={handleShare}
                        style={{ 
                          width: '32px', 
                          height: '32px', 
                          borderRadius: '50%', 
                          border: 'none', 
                          background: colors.card.backgroundAlt, 
                          color: colors.text.secondary, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          cursor: 'pointer', 
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => { 
                          e.currentTarget.style.background = colors.gradient.consumer;
                          e.currentTarget.style.color = 'white';
                          e.currentTarget.style.transform = 'scale(1.1)';
                          e.currentTarget.style.boxShadow = `0 4px 12px ${colors.gradient.start}66`;
                        }}
                        onMouseLeave={(e) => { 
                          e.currentTarget.style.background = colors.card.backgroundAlt;
                          e.currentTarget.style.color = colors.text.secondary;
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                        title="Share Wishlist"
                      >
                        <Share2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                    {isLoadingWishlist ? (
                      [...Array(4)].map((_, i) => (
                        <div key={i} style={{ 
                          background: colors.card.background,
                          borderRadius: '16px',
                          padding: '12px',
                          boxShadow: colors.shadow.sm,
                          display: 'flex',
                          flexDirection: 'column',
                          height: '100%'
                        }}>
                          <div style={{ aspectRatio: '3/4', background: colors.card.backgroundAlt, borderRadius: '12px', animation: 'pulse 1.5s infinite', marginBottom: '12px' }} />
                          <div style={{ height: '10px', width: '40%', background: colors.card.backgroundAlt, borderRadius: '4px', marginBottom: '8px', animation: 'pulse 1.5s infinite' }} />
                          <div style={{ height: '14px', width: '80%', background: colors.card.backgroundAlt, borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
                        </div>
                      ))
                    ) : wishlistItems.length === 0 ? (
                      <div style={{ gridColumn: 'span 4', padding: '40px', textAlign: 'center', color: colors.text.secondary }}>
                        Your wishlist is empty
                      </div>
                    ) : wishlistItems.map((item) => (
                      <div 
                        key={item.id} 
                        style={{ 
                          cursor: 'pointer',
                          background: colors.card.background,
                          borderRadius: '16px',
                          padding: '12px',
                          boxShadow: colors.shadow.sm,
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          height: '100%',
                          width: '100%'
                        }} 
                        className="group"
                        onClick={() => navigate('/wishlist')}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-4px)';
                          e.currentTarget.style.boxShadow = colors.shadow.md;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = colors.shadow.sm;
                        }}
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
                          overflow: 'hidden',
                          flexShrink: 0
                        }}>
                          <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <div style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            width: '28px',
                            height: '28px',
                            background: colors.card.background,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: colors.gradient.start,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          }}>
                            <Heart size={14} fill="currentColor" />
                          </div>
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                          <div style={{ 
                            fontSize: '10px', 
                            color: colors.text.tertiary, 
                            textTransform: 'uppercase', 
                            fontWeight: '700', 
                            marginBottom: '2px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>{item.brand}</div>
                          <div style={{ 
                            fontSize: '13px', 
                            fontWeight: '700', 
                            color: colors.text.primary, 
                            whiteSpace: 'nowrap', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis'
                          }}>{item.name}</div>
                        </div>
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
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
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
        shareLink={shareLink}
      />
    </div>
  );
};

export default ConsumerProfilePage;