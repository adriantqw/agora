import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Trash2, 
  ChevronLeft,
  ChevronRight,
  Share2,
  LayoutGrid,
  Sliders,
  Package,
  Settings,
  LogOut,
  ShoppingBag
} from 'lucide-react';
import { useThemeColors } from '../hooks/useThemeColors';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/common/Header/Header';
import ShareModal from '../components/common/ShareModal';

const WishlistPage = () => {
  const colors = useThemeColors();
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const userName = user?.full_name || user?.merchant_name || 'Shopper';
  const joinDate = new Date(user?.created_at || Date.now()).getFullYear();
  
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Mock Data - Expanded to 12 items
  const [items, setItems] = useState([
    { id: 1, name: 'Silk Midi Dress', price: 245.00, brand: 'Reformation', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000&auto=format&fit=crop', inStock: true, onSale: true, originalPrice: 306.00 },
    { id: 2, name: 'Leather Tote Bag', price: 180.00, brand: 'Cuyana', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1000&auto=format&fit=crop', inStock: true, lowStock: true },
    { id: 3, name: 'Classic White Sneakers', price: 120.00, brand: 'Veja', image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=80&w=1000&auto=format&fit=crop', inStock: false },
    { id: 4, name: 'Gold Hoop Earrings', price: 85.00, brand: 'Mejuri', image: 'https://images.unsplash.com/photo-1635767798638-3e2523422dc7?q=80&w=1000&auto=format&fit=crop', inStock: true },
    { id: 5, name: 'Wool Blend Coat', price: 350.00, brand: 'Aritzia', image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=1000&auto=format&fit=crop', inStock: true },
    { id: 6, name: 'High-Waist Jeans', price: 98.00, brand: 'Levi\'s', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1000&auto=format&fit=crop', inStock: true },
    { id: 7, name: 'Cashmere Sweater', price: 145.00, brand: 'Everlane', image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1000&auto=format&fit=crop', inStock: true },
    { id: 8, name: 'Puffer Jacket', price: 220.00, brand: 'North Face', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1000&auto=format&fit=crop', inStock: true, onSale: true, originalPrice: 275.00 },
    { id: 9, name: 'Chelsea Boots', price: 195.00, brand: 'Dr. Martens', image: 'https://images.unsplash.com/photo-1608256246200-53e635b5b69f?q=80&w=1000&auto=format&fit=crop', inStock: true },
    { id: 10, name: 'Wide Brim Hat', price: 58.00, brand: 'Lack of Color', image: 'https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?q=80&w=1000&auto=format&fit=crop', inStock: true },
    { id: 11, name: 'Crossbody Bag', price: 150.00, brand: 'Madewell', image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=1000&auto=format&fit=crop', inStock: true, lowStock: true },
    { id: 12, name: 'Statement Necklace', price: 78.00, brand: 'Gorjana', image: 'https://images.unsplash.com/photo-1599643478518-17488fbbcd75?q=80&w=1000&auto=format&fit=crop', inStock: true }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const handleRemove = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const currentItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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
            <span style={{ color: colors.text.primary, fontWeight: '500' }}>Wishlist</span>
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
                  </div>
                  <h2 style={{ fontSize: '18px', fontWeight: '700', color: colors.text.primary, marginBottom: '4px' }}>{userName}</h2>
                  <p style={{ fontSize: '12px', color: colors.text.secondary }}>Member since {joinDate}</p>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {[ 
                    { icon: LayoutGrid, label: 'Overview', active: false, path: '/profile' },
                    { icon: Sliders, label: 'Style Profile', active: false, path: '/style-profile' },
                    { icon: Package, label: 'Orders & Returns', active: false, path: '/orders' },
                    { icon: Heart, label: 'Wishlist', badge: items.length, active: true, path: '/wishlist' },
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
                          background: colors.primary.eggPink, 
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
            <div style={{ gridColumn: 'span 9' }} className="wishlist-content">
              
              {/* Header & Controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h1 style={{ fontSize: '32px', fontWeight: '800', color: colors.text.primary, marginBottom: '4px' }}>My Wishlist</h1>
                  <p style={{ color: colors.text.secondary, fontSize: '14px' }}>
                    {items.length} items saved
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => setIsShareModalOpen(true)}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '99px',
                      background: colors.primary.eggPink,
                      border: 'none',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: `0 4px 12px ${colors.primary.pink}66`,
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <Share2 size={16} strokeWidth={2.5} />
                    Share
                  </button>
                </div>
              </div>

              {/* Quick Filters */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px' }}>
                <button style={{ padding: '6px 16px', borderRadius: '99px', background: colors.text.primary, color: colors.card.background, fontSize: '12px', fontWeight: '700', border: 'none', cursor: 'pointer' }}>All Items</button>
              </div>

              {/* Items Grid */}
              <div className="wishlist-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                {currentItems.map((item) => (
                  <div 
                    key={item.id} 
                    className="group"
                    style={{
                      background: colors.card.background,
                      borderRadius: '16px',
                      padding: '12px',
                      boxShadow: colors.shadow.sm,
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = colors.shadow.md;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = colors.shadow.sm;
                    }}
                  >
                    {/* Image */}
                    <div style={{ 
                      position: 'relative', 
                      aspectRatio: '3/4', 
                      overflow: 'hidden', 
                      borderRadius: '12px',
                      marginBottom: '12px',
                      background: colors.card.backgroundAlt
                    }}>
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      
                      {/* Hover Actions */}
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleRemove(item.id); }}
                        className="action-btn"
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'rgba(255, 255, 255, 0.9)',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          color: colors.text.tertiary,
                          opacity: 0,
                          transform: 'scale(0.9)',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#EF4444'}
                        onMouseLeave={(e) => e.currentTarget.style.color = colors.text.tertiary}
                      >
                        <Trash2 size={16} />
                      </button>

                      <div className="action-btn" style={{
                        position: 'absolute',
                        bottom: '0',
                        left: '0',
                        right: '0',
                        padding: '16px',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)',
                        opacity: 0,
                        transition: 'opacity 0.2s',
                        display: 'flex',
                        justifyContent: 'center'
                      }}>
                        <button style={{
                          background: 'white',
                          color: '#1A202C',
                          fontSize: '12px',
                          fontWeight: '700',
                          padding: '8px 16px',
                          borderRadius: '99px',
                          border: 'none',
                          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = colors.primary.eggPink;
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'white';
                          e.currentTarget.style.color = '#1A202C';
                        }}
                        >
                          Add to Bag
                        </button>
                      </div>
                    </div>

                    {/* Details */}
                    <div>
                      <div style={{ fontSize: '12px', color: colors.text.tertiary, marginBottom: '2px' }}>{item.brand}</div>
                      <h3 style={{ fontSize: '14px', fontWeight: '700', color: colors.text.primary, marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '700', color: item.onSale ? '#EF4444' : colors.text.primary }}>
                          ${item.price.toFixed(2)}
                        </span>
                        {item.onSale && (
                          <span style={{ fontSize: '12px', textDecoration: 'line-through', color: colors.text.muted }}>
                            ${item.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '40px', gap: '16px' }}>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      border: `1px solid ${colors.border.subtle}`,
                      background: colors.card.background,
                      color: colors.text.primary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      opacity: currentPage === 1 ? 0.5 : 1,
                      transition: 'all 0.2s'
                    }}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  
                  <span style={{ fontSize: '14px', fontWeight: '600', color: colors.text.secondary }}>
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      border: `1px solid ${colors.border.subtle}`,
                      background: colors.card.background,
                      color: colors.text.primary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      opacity: currentPage === totalPages ? 0.5 : 1,
                      transition: 'all 0.2s'
                    }}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      </main>
      <style>{`
        .group:hover .action-btn {
          opacity: 1 !important;
          transform: scale(1) !important;
        }
        @media (max-width: 1023px) {
          .profile-sidebar {
            display: none !important;
          }
          .wishlist-content {
            grid-column: span 12 !important;
          }
          .wishlist-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 640px) {
          .wishlist-grid {
            grid-template-columns: 1fr !important;
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

export default WishlistPage;
