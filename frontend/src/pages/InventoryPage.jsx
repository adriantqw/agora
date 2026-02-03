import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shirt, LogIn, Filter, Search, Plus, Heart, MoreVertical, Wand2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useThemeColors } from '../hooks/useThemeColors';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/common/Header/Header';
import journeyService from '../services/journeyService';
import { getIconByName } from '../utils/iconMapper';

const ITEMS_PER_PAGE = 16;

const InventoryPage = () => {
  const colors = useThemeColors();
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState('Outfits'); // 'Outfits' | 'Pieces'
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [journeys, setJourneys] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch journeys from backend
  useEffect(() => {
    const fetchJourneys = async () => {
      if (isAuthenticated) {
        try {
          const data = await journeyService.getJourneys();
          if (data) {
            const processed = data.map(j => ({
              ...j,
              // Map backend snake_case to frontend camelCase expectation or keep snake_case and map later
              // For consistency with existing component logic, let's map to camelCase here
              statusColor: j.status_color,
              statusLabel: j.status_label,
              outfits: j.outfits.map(o => ({
                ...o,
                imageUrl: o.image_url,
                icon: getIconByName(o.icon_name),
                iconColor: o.icon_color,
                backgroundColor: o.background_color,
                isAIPick: o.is_ai_pick
              }))
            }));
            setJourneys(processed);
          }
        } catch (err) {
          console.error("Failed to fetch inventory data", err);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchJourneys();
  }, [isAuthenticated]);

  // Flatten all outfits from journeys to simulate pieces with randomized categories
  const allPieces = useMemo(() => {
    return journeys.flatMap(journey => journey.outfits.map((outfit, index) => {
      // Simple randomization based on char code to be deterministic but varied
      const rand = (outfit.label.charCodeAt(0) + index) % 10;
      let category = 'Clothing';
      
      if (outfit.label.toLowerCase().includes('shoe') || outfit.label.toLowerCase().includes('boot') || outfit.label.toLowerCase().includes('heel') || outfit.label.toLowerCase().includes('flat') || rand === 3) {
        category = 'Shoes';
      } else if (outfit.label.toLowerCase().includes('bag') || outfit.label.toLowerCase().includes('clutch') || outfit.label.toLowerCase().includes('earring') || outfit.label.toLowerCase().includes('necklace') || outfit.label.toLowerCase().includes('hat') || outfit.label.toLowerCase().includes('belt') || rand === 5) {
        category = 'Accessories';
      } else if (rand > 7) {
        category = 'Accessories'; // Randomly assign some as accessories
      }

      return {
        ...outfit,
        journeyName: journey.title,
        category
      };
    }));
  }, [journeys]);

  // Use journeys themselves as outfits
  const allOutfits = useMemo(() => {
    return journeys.map(journey => ({
      id: journey.id,
      label: journey.title,
      subtext: journey.statusLabel,
      itemCount: journey.outfits.length,
      items: journey.outfits,
      statusColor: journey.statusColor,
      isAIPick: journey.outfits.some(o => o.isAIPick)
    }));
  }, [journeys]);

  const filteredItems = useMemo(() => {
    const source = activeTab === 'Pieces' ? allPieces : allOutfits;
    return source.filter(item => {
      const matchesCategory = activeTab === 'Outfits' || activeCategory === 'All' || item.category === activeCategory;
      const matchesSearch = item.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (item.subtext && item.subtext.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [activeTab, activeCategory, searchQuery, allPieces, allOutfits]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, activeCategory, searchQuery]);

  const categories = ['All', 'Clothing', 'Shoes', 'Accessories'];
  const tabs = [
    { name: 'Outfits', icon: Wand2 },
    { name: 'Pieces', icon: Shirt }
  ];

  if (!isAuthenticated) {
    return (
      <div style={{ background: colors.page.background, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header variant="full" showNav={true} />
        <main style={{ 
          flexGrow: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '40px 20px',
          minHeight: 'calc(100vh - 80px)'
        }}>
          <div style={{
            textAlign: 'center',
            maxWidth: '500px',
            padding: '48px',
            background: colors.card.background,
            borderRadius: '32px',
            boxShadow: colors.shadow.md,
            border: isDark ? `1px solid ${colors.border.subtle}` : 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '24px',
              background: colors.gradient.light,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: colors.gradient.start,
              marginBottom: '8px'
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 21C4.45 21 3.975 20.8083 3.575 20.425C3.19167 20.025 3 19.55 3 19V5C3 4.45 3.19167 3.98333 3.575 3.6C3.975 3.2 4.45 3 5 3H19C19.55 3 20.0167 3.2 20.4 3.6C20.8 3.98333 21 4.45 21 5V19C21 19.55 20.8 20.025 20.4 20.425C20.0167 20.8083 19.55 21 19 21H5ZM12 16C12.6333 16 13.2083 15.8167 13.725 15.45C14.2417 15.0833 14.6 14.6 14.8 14H19V5H5V14H9.2C9.4 14.6 9.75833 15.0833 10.275 15.45C10.7917 15.8167 11.3667 16 12 16Z" fill="currentColor"/>
              </svg>
            </div>

            <h1 style={{ fontSize: '28px', fontWeight: '700', color: colors.text.primary, margin: 0 }}>Your Inventory is Empty</h1>
            <p style={{ color: colors.text.secondary, fontSize: '16px', lineHeight: '1.6', margin: 0 }}>
              Build your virtual inventory and see how everything fits together. Please log in to access your saved items and outfits.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', marginTop: '8px' }}>
              <button 
                onClick={() => navigate('/login')}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: colors.gradient.pink,
                  color: 'white',
                  border: 'none',
                  borderRadius: '9999px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: `0 4px 14px ${colors.gradient.end}66`,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'transform 0.1s'
                }}
              >
                <LogIn size={20} />
                <span>Log In to View</span>
              </button>

              <button 
                onClick={() => navigate('/')}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'transparent',
                  color: colors.text.secondary,
                  border: `1px solid ${colors.border.subtle}`,
                  borderRadius: '9999px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
              >
                <span>Back to Home</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ background: colors.page.background, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header variant="full" showNav={true} />

      <main style={{ flexGrow: 1, padding: '32px 20px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          
          {/* Page Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: '800', color: colors.text.primary, marginBottom: '8px' }}>My Inventory</h1>
              <p style={{ color: colors.text.secondary, fontSize: '16px' }}>
                {allPieces.length} pieces collected across {allOutfits.length} journeys
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button style={{
                background: colors.gradient.start,
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '99px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: `0 4px 12px ${colors.gradient.end}66`
              }}>
                <Plus size={20} />
                Add Item
              </button>
            </div>
          </div>

          {/* Tab Switcher & Search */}
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            justifyContent: 'space-between', 
            alignItems: 'center', 
            gap: '24px', 
            marginBottom: '32px',
          }}>
            <div style={{ 
              display: 'flex', 
              background: colors.card.background,
              padding: '4px',
              borderRadius: '16px',
              border: `1px solid ${colors.border.subtle}`,
              width: 'fit-content',
              boxShadow: colors.shadow.sm
            }}>
              {tabs.map(tab => (
                <button
                  key={tab.name}
                  onClick={() => {
                    setActiveTab(tab.name);
                    setActiveCategory('All');
                  }}
                  style={{
                    padding: '12px 28px',
                    borderRadius: '12px',
                    border: 'none',
                    fontSize: '15px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    background: activeTab === tab.name ? colors.gradient.light : 'transparent',
                    color: activeTab === tab.name ? colors.gradient.start : colors.text.secondary,
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <tab.icon size={18} strokeWidth={activeTab === tab.name ? 2.5 : 2} />
                  {tab.name}
                </button>
              ))}
            </div>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              background: colors.card.background, 
              border: `1px solid ${colors.border.subtle}`,
              borderRadius: '99px',
              padding: '8px 20px',
              width: '100%',
              maxWidth: '400px',
              boxShadow: colors.shadow.sm
            }}>
              <Search size={18} color={colors.text.tertiary} style={{ marginRight: '12px' }} />
              <input 
                type="text" 
                placeholder={`Search ${activeTab.toLowerCase()}...`} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  color: colors.text.primary,
                  fontSize: '15px',
                  width: '100%'
                }}
              />
            </div>
          </div>

          {/* Sub-categories (Only for Pieces) */}
          {activeTab === 'Pieces' && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', overflowX: 'auto', paddingBottom: '4px' }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '99px',
                    border: activeCategory === cat ? 'none' : `1px solid ${colors.border.subtle}`,
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    background: activeCategory === cat ? colors.text.primary : colors.card.background,
                    color: activeCategory === cat ? colors.card.background : colors.text.secondary,
                    transition: 'all 0.2s'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Grid */}
          {paginatedItems.length > 0 ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '32px', minHeight: '400px' }}>
                {paginatedItems.map((item, index) => {
                  const isOutfit = activeTab === 'Outfits';
                  const Icon = item.icon || (isOutfit ? Wand2 : Shirt);
                  
                  return (
                    <div key={`${item.id}-${index}`} className="group" style={{
                      background: colors.card.background,
                      borderRadius: '24px',
                      overflow: 'hidden',
                      border: `1px solid ${colors.border.subtle}`,
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)';
                      e.currentTarget.style.boxShadow = colors.shadow.md;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    >
                      <div style={{
                        aspectRatio: '1/1',
                        background: isDark ? colors.card.backgroundAlt : (item.backgroundColor || '#f8f9fb'),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ textAlign: 'center' }}>
                            <Icon size={isOutfit ? 80 : 64} color={item.iconColor || colors.text.tertiary} strokeWidth={1} />
                            {isOutfit && (
                              <div style={{ marginTop: '12px', fontSize: '12px', fontWeight: '700', color: colors.text.muted }}>
                                {item.itemCount} PIECES
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div style={{
                          position: 'absolute',
                          top: '16px',
                          right: '16px',
                          background: 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(4px)',
                          borderRadius: '50%',
                          padding: '10px',
                          cursor: 'pointer',
                          opacity: 0,
                          transform: 'translateY(10px)',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                        className="action-btn"
                        >
                          <Heart size={18} color="#EF4444" />
                        </div>
                      </div>
                      
                      <div style={{ padding: '24px' }}>
                        <div style={{ marginBottom: '4px' }}>
                          <h3 style={{ fontSize: '18px', fontWeight: '700', color: colors.text.primary, margin: 0 }}>{item.label}</h3>
                        </div>
                        <p style={{ fontSize: '14px', color: colors.text.secondary, margin: 0 }}>{item.subtext}</p>
                        
                        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '18px', fontWeight: '800', color: isDark ? colors.gradient.start : '#1F2937' }}>
                            {isOutfit ? `Outfit #${index + 1}` : `$${item.price.toFixed(2)}`}
                          </span>
                          
                          {item.isAIPick && (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: isDark ? 'rgba(124, 58, 237, 0.15)' : '#F5F3FF', padding: '6px 12px', borderRadius: '99px', border: `1px solid ${isDark ? 'rgba(124, 58, 237, 0.3)' : '#DDD6FE'}` }}>
                              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#7C3AED' }} />
                              <span style={{ fontSize: '11px', fontWeight: '800', color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.02em' }}>AI Pick</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '48px', gap: '16px' }}>
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
            </>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '80px 0', 
              color: colors.text.secondary 
            }}>
              <div style={{ 
                background: colors.card.background, 
                width: '80px', 
                height: '80px', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 24px',
                border: `1px solid ${colors.border.subtle}`
              }}>
                <Search size={32} color={colors.text.tertiary} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: colors.text.primary, marginBottom: '8px' }}>No items found</h3>
              <p>Try adjusting your search or category filters.</p>
            </div>
          )}
        </div>
      </main>
      <style>{`
        .group:hover .action-btn {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
      `}</style>
    </div>
  );
};

export default InventoryPage;