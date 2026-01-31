import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Dna, 
  Check, 
  Plus, 
  X, 
  Save,
  LayoutGrid,
  Sliders,
  Package,
  Heart,
  Settings,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useThemeColors } from '../hooks/useThemeColors';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/common/Header/Header';
import ColorPickerModal from '../components/common/ColorPickerModal';
import AddBrandModal from '../components/common/AddBrandModal';
import SelectVibeModal from '../components/common/SelectVibeModal';

const StyleProfilePage = () => {
  const colors = useThemeColors();
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const userName = user?.full_name || user?.merchant_name || 'Shopper';
  const joinDate = new Date(user?.created_at || Date.now()).getFullYear();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const [selectedVibes, setSelectedVibes] = useState([
    { name: 'Minimalist', image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=400&auto=format&fit=crop' },
    { name: 'Classic Chic', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=400&auto=format&fit=crop' }
  ]);
  const [selectedFit, setSelectedFit] = useState('Regular');
  const [brands, setBrands] = useState(['Zara', 'Aritzia', 'Reformation', 'COS']);
  const [budget, setBudget] = useState(2);

  // Color Preferences State
  const [lovedColors, setLovedColors] = useState(['#000000', '#F5F5F4', '#1E3A8A', '#047857']);
  const [avoidedColors, setAvoidedColors] = useState(['#FACC15', '#9333EA']);
  
  // Modal State
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [colorPickerType, setColorPickerType] = useState(null); // 'loved' | 'avoided'
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [isVibeModalOpen, setIsVibeModalOpen] = useState(false);

  const handleOpenColorPicker = (type) => {
    setColorPickerType(type);
    setIsColorPickerOpen(true);
  };

  const handleAddBrand = (newBrand) => {
    setBrands([...brands, newBrand]);
  };

  const handleAddVibe = (vibe) => {
    if (selectedVibes.length < 4) {
      setSelectedVibes([...selectedVibes, vibe]);
    }
  };

  const removeVibe = (vibeName) => {
    setSelectedVibes(selectedVibes.filter(v => v.name !== vibeName));
  };

  const handleColorSelect = (newColor) => {
    if (colorPickerType === 'loved') {
      if (!lovedColors.includes(newColor)) {
        setLovedColors([...lovedColors, newColor]);
      }
    } else if (colorPickerType === 'avoided') {
      if (!avoidedColors.includes(newColor)) {
        setAvoidedColors([...avoidedColors, newColor]);
      }
    }
  };
  
  const removeLovedColor = (color) => {
      setLovedColors(lovedColors.filter(c => c !== color));
  };
  
  const removeAvoidedColor = (color) => {
      setAvoidedColors(avoidedColors.filter(c => c !== color));
  };

  const removeBrand = (brandToRemove) => {
    setBrands(brands.filter(brand => brand !== brandToRemove));
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
            <span style={{ color: colors.text.primary, fontWeight: '500' }}>Style Profile</span>
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
                      style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  </div>
                  <h2 style={{ fontSize: '18px', fontWeight: '700', color: colors.text.primary, marginBottom: '4px' }}>{userName}</h2>
                  <p style={{ fontSize: '12px', color: colors.text.secondary }}>Member since {joinDate}</p>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {[ 
                    { icon: LayoutGrid, label: 'Overview', active: false, path: '/profile' },
                    { icon: Dna, label: 'Style Profile', active: true, path: '/style-profile' },
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
            <div style={{ gridColumn: 'span 9' }} className="col-span-12 lg:col-span-9">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* DNA Summary Hero */}
                <div style={{
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #5B21B6 100%)',
                  borderRadius: '24px',
                  padding: '32px',
                  color: '#FFFFFF',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
                }}>
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    height: '100%',
                    width: '50%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    transform: 'skewX(12deg) translateX(48px)'
                  }} />
                  
                  <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#FFFFFF', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <Dna size={16} /> Your Style Archetype
                      </div>
                      <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>The Modern Minimalist</h1>
                      <p style={{ opacity: 0.8, fontSize: '14px', lineHeight: '1.6', maxWidth: '480px' }}>
                        You lean towards clean lines, neutral palettes, and high-quality basics. You prioritize fit and fabric over flashy prints.
                      </p>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '72px',
                        height: '72px',
                        borderRadius: '50%',
                        border: '4px solid rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative'
                      }}>
                         <div style={{
                           position: 'absolute',
                           inset: -4,
                           borderRadius: '50%',
                           border: '4px solid white',
                           borderTopColor: 'transparent',
                           transform: 'rotate(-45deg)'
                         }} />
                         <span style={{ fontSize: '20px', fontWeight: '800', color: 'white' }}>85%</span>
                      </div>
                      <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.8)', textTransform: 'uppercase', fontWeight: '700' }}>Profile Strength</div>
                    </div>
                  </div>
                </div>

                {/* Section 1: Aesthetic Selection */}
                <div style={{
                  background: colors.card.background,
                  borderRadius: '24px',
                  padding: '32px',
                  boxShadow: colors.shadow.sm,
                  border: `1px solid ${colors.border.subtle}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: colors.text.primary }}>Which vibes resonate with you?</h3>
                    <span style={{ fontSize: '12px', color: colors.text.secondary }}>Select up to 4</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
                    {selectedVibes.map((vibe) => (
                      <div 
                        key={vibe.name}
                        style={{
                          borderRadius: '16px',
                          border: `2px solid ${colors.primary.eggPink}`,
                          overflow: 'hidden',
                          position: 'relative',
                          transition: 'all 0.2s',
                          background: colors.primary.eggPinkLight
                        }}
                      >
                        <div style={{ height: '120px', overflow: 'hidden' }}>
                          <img 
                            src={vibe.image} 
                            alt={vibe.name} 
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'cover',
                              objectPosition: vibe.position || 'center'
                            }} 
                          />
                        </div>
                        <div style={{ padding: '12px', textAlign: 'center', background: colors.card.background, fontWeight: '700', fontSize: '14px', color: colors.text.primary }}>
                          {vibe.name}
                        </div>
                        <button 
                          onClick={() => removeVibe(vibe.name)}
                          style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            width: '24px',
                            height: '24px',
                            background: 'rgba(0,0,0,0.5)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          <X size={14} strokeWidth={3} />
                        </button>
                      </div>
                    ))}

                    {selectedVibes.length < 4 && (
                      <div 
                        onClick={() => setIsVibeModalOpen(true)}
                        style={{
                          height: '164px',
                          borderRadius: '16px',
                          border: `2px dashed ${colors.border.subtle}`,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          color: colors.text.muted,
                          gap: '8px',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = colors.primary.eggPink;
                          e.currentTarget.style.color = colors.primary.eggPink;
                          e.currentTarget.style.background = colors.primary.eggPinkLight + '20';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = colors.border.subtle;
                          e.currentTarget.style.color = colors.text.muted;
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <Plus size={32} />
                        <span style={{ fontSize: '14px', fontWeight: '700' }}>Add Vibe</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section 2: Details Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                  
                  {/* Color Palette */}
                  <div style={{
                    background: colors.card.background,
                    borderRadius: '24px',
                    padding: '24px',
                    boxShadow: colors.shadow.sm,
                    border: `1px solid ${colors.border.subtle}`
                  }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: colors.text.primary, marginBottom: '16px' }}>Color Preferences</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '700', color: colors.text.muted, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>I Love</label>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {lovedColors.map((color, index) => (
                            <div key={index} style={{ position: 'relative', width: '32px', height: '32px' }}>
                              <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: color, border: '1px solid rgba(0,0,0,0.1)' }} />
                              <button 
                                onClick={() => removeLovedColor(color)}
                                style={{ 
                                  position: 'absolute', 
                                  top: -4, 
                                  right: -4, 
                                  width: '16px', 
                                  height: '16px', 
                                  background: colors.card.background, 
                                  borderRadius: '50%', 
                                  border: `1px solid ${colors.border.light}`, 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  color: colors.text.secondary,
                                  padding: 0
                                }}
                              >
                                <X size={10} />
                              </button>
                            </div>
                          ))}
                          <button 
                            onClick={() => handleOpenColorPicker('loved')}
                            style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px dashed #D1D5DB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', background: 'transparent', cursor: 'pointer', padding: 0 }}
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '700', color: colors.text.muted, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>I Avoid</label>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {avoidedColors.map((color, index) => (
                            <div key={index} style={{ position: 'relative', width: '32px', height: '32px' }}>
                              <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: color, border: '1px solid rgba(0,0,0,0.1)' }} />
                               <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }}>
                                <X size={16} color="white" style={{ opacity: 0.7 }} />
                               </div>
                              <button 
                                onClick={() => removeAvoidedColor(color)}
                                style={{ 
                                  position: 'absolute', 
                                  top: -4, 
                                  right: -4, 
                                  width: '16px', 
                                  height: '16px', 
                                  background: colors.card.background, 
                                  borderRadius: '50%', 
                                  border: `1px solid ${colors.border.light}`, 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  color: colors.text.secondary,
                                  padding: 0
                                }}
                              >
                                <X size={10} />
                              </button>
                            </div>
                          ))}
                          <button 
                            onClick={() => handleOpenColorPicker('avoided')}
                            style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px dashed #D1D5DB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', background: 'transparent', cursor: 'pointer', padding: 0 }}
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fit & Budget */}
                  <div style={{
                    background: colors.card.background,
                    borderRadius: '24px',
                    padding: '24px',
                    boxShadow: colors.shadow.sm,
                    border: `1px solid ${colors.border.subtle}`,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ marginBottom: '24px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '700', color: colors.text.primary, marginBottom: '16px' }}>Fit Preference</h3>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {['Tight', 'Regular', 'Oversized'].map((fit) => (
                          <button
                            key={fit}
                            onClick={() => setSelectedFit(fit)}
                            style={{
                              padding: '8px 16px',
                              borderRadius: '99px',
                              border: `1px solid ${selectedFit === fit ? colors.primary.eggPink : colors.border.light}`,
                              background: selectedFit === fit ? colors.primary.eggPink : 'transparent',
                              color: selectedFit === fit ? 'white' : colors.text.secondary,
                              fontSize: '14px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                          >
                            {fit}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: '700', color: colors.text.primary, marginBottom: '16px' }}>Typical Budget (per item)</h3>
                      <div style={{ padding: '0 8px' }}>
                        <input 
                          type="range" 
                          min="1" 
                          max="4" 
                          value={budget} 
                          onChange={(e) => setBudget(parseInt(e.target.value))}
                          style={{ 
                            width: '100%', 
                            accentColor: colors.primary.eggPink,
                            cursor: 'pointer'
                          }} 
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '12px', fontWeight: '700', color: colors.text.muted }}>
                          <span style={{ color: budget >= 1 ? colors.text.primary : 'inherit' }}>$</span>
                          <span style={{ color: budget >= 2 ? colors.text.primary : 'inherit' }}>$$</span>
                          <span style={{ color: budget >= 3 ? colors.text.primary : 'inherit' }}>$$$</span>
                          <span style={{ color: budget >= 4 ? colors.text.primary : 'inherit' }}>$$$$</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: Favorite Brands */}
                <div style={{
                  background: colors.card.background,
                  borderRadius: '24px',
                  padding: '32px',
                  boxShadow: colors.shadow.sm,
                  border: `1px solid ${colors.border.subtle}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: colors.text.primary }}>Brands you love</h3>
                    <button 
                      onClick={() => setIsBrandModalOpen(true)}
                      style={{ fontSize: '14px', fontWeight: '700', color: colors.primary.eggPink, background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      + Add Brand
                    </button>
                  </div>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    {brands.map((brand) => (
                      <div key={brand} style={{
                        padding: '8px 16px',
                        borderRadius: '12px',
                        background: colors.card.backgroundAlt,
                        border: `1px solid ${colors.border.light}`,
                        color: colors.text.primary,
                        fontWeight: '500',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        {brand}
                        <button 
                          onClick={() => removeBrand(brand)}
                          style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', color: colors.text.muted }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Save Action */}
                <div style={{ position: 'sticky', bottom: '20px', display: 'flex', justifyContent: 'flex-end', zIndex: 20 }}>
                  <button 
                    onClick={() => navigate('/profile')}
                    style={{
                      background: colors.primary.eggPink,
                      color: 'white',
                      padding: '16px 32px',
                      borderRadius: '99px',
                      fontWeight: '700',
                      fontSize: '16px',
                      border: 'none',
                      boxShadow: '0 10px 25px -5px rgba(244, 114, 182, 0.5)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <Save size={20} />
                    Save Style Profile
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @media (max-width: 1023px) {
          .profile-sidebar {
            display: none !important;
          }
          .col-span-12 {
            grid-column: span 12 !important;
          }
        }
      `}</style>

      <ColorPickerModal 
        isOpen={isColorPickerOpen}
        onClose={() => setIsColorPickerOpen(false)}
        onSelect={handleColorSelect}
        title={colorPickerType === 'loved' ? 'Add Color You Love' : 'Add Color to Avoid'}
      />

      <AddBrandModal
        isOpen={isBrandModalOpen}
        onClose={() => setIsBrandModalOpen(false)}
        onAdd={handleAddBrand}
        currentBrands={brands}
      />

      <SelectVibeModal
        isOpen={isVibeModalOpen}
        onClose={() => setIsVibeModalOpen(false)}
        onAdd={handleAddVibe}
        currentVibes={selectedVibes}
      />
    </div>
  );
};

export default StyleProfilePage;
