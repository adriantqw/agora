import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutGrid, 
  Sliders, 
  Package, 
  Heart, 
  Settings, 
  LogOut, 
  Edit2, 
  Camera, 
  Mail,
  Upload,
  Plus,
  Trash2,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useThemeColors } from '../hooks/useThemeColors';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/common/Header/Header';
import Modal from '../components/common/Modal';
import AvatarSelectionModal from '../components/common/AvatarSelectionModal';

const ConsumerSettingsPage = () => {
  const colors = useThemeColors();
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState('account'); // 'account' | 'fitting'
  const [firstName, setFirstName] = useState('Sarah');
  const [lastName, setLastName] = useState('Jenkins');
  const [email] = useState('sarah.jenkins@example.com'); // Read-only
  const [personality, setPersonality] = useState('Friendly');
  const [showModal, setShowModal] = useState(false);

  const userName = user?.full_name || user?.merchant_name || 'Shopper';
  const joinDate = new Date(user?.created_at || Date.now()).getFullYear();

  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState(`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}&backgroundColor=ffdfbf`);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleCancel = () => {
    setFirstName('Sarah');
    setLastName('Jenkins');
    setPersonality('Friendly');
  };

  const handleSave = () => {
    // Logic to save settings
    setShowModal(true);
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
            <span style={{ color: colors.text.primary, fontWeight: '500' }}>Settings</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '32px' }}>
            
            {/* Sidebar (3 cols) - Visible on large screens */}
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
                      src={currentAvatar} 
                      alt="Profile" 
                      style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <button 
                      onClick={() => setIsAvatarModalOpen(true)}
                      style={{
                      position: 'absolute',
                      bottom: '4px',
                      right: '4px',
                      width: '32px',
                      height: '32px',
                      background: colors.primary.eggPink,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `2px solid ${colors.card.background}`,
                      color: 'white',
                      cursor: 'pointer'
                    }}>
                      <Edit2 size={16} />
                    </button>
                  </div>
                  <h2 style={{ fontSize: '18px', fontWeight: '700', color: colors.text.primary, marginBottom: '4px' }}>{userName}</h2>
                  <p style={{ fontSize: '12px', color: colors.text.secondary }}>Member since {joinDate}</p>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {[ 
                    { icon: LayoutGrid, label: 'Overview', active: false, path: '/profile' },
                    { icon: Sliders, label: 'Style Profile', active: false, path: '/style-profile' },
                    { icon: Package, label: 'Orders & Returns', active: false, path: '/orders' },
                    { icon: Heart, label: 'Wishlist', badge: 12, active: false, path: '/wishlist' },
                    { icon: Settings, label: 'Settings', active: true, path: '/settings' }
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
            <div style={{ gridColumn: 'span 9' }} className="settings-content">
              
              {/* Header & Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h1 style={{ fontSize: '32px', fontWeight: '800', color: colors.text.primary, marginBottom: '4px' }}>Settings</h1>
                  <p style={{ color: colors.text.secondary, fontSize: '14px' }}>Manage your account and preferences.</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={handleCancel}
                    style={{
                    padding: '10px 20px',
                    borderRadius: '99px',
                    background: colors.card.background,
                    border: `1px solid ${colors.border.subtle}`,
                    color: colors.text.secondary,
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = colors.card.backgroundAlt}
                  onMouseLeave={(e) => e.currentTarget.style.background = colors.card.background}
                  >Cancel</button>
                  <button 
                    onClick={handleSave}
                    style={{
                    padding: '10px 20px',
                    borderRadius: '99px',
                    background: colors.primary.eggPink,
                    border: 'none',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: `0 4px 12px ${colors.primary.pink}66`,
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >Save Changes</button>
                </div>
              </div>

              {/* Settings Card */}
              <div style={{
                background: colors.card.background,
                borderRadius: '24px',
                padding: '32px',
                boxShadow: colors.shadow.sm,
                border: `1px solid ${colors.border.subtle}`
              }}>
                
                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: `1px solid ${colors.border.light}`, marginBottom: '32px' }}>
                  <button 
                    onClick={() => handleTabChange('account')}
                    style={{
                      paddingBottom: '16px',
                      paddingLeft: '16px',
                      paddingRight: '16px',
                      background: 'none',
                      border: 'none',
                      borderBottom: `2px solid ${activeTab === 'account' ? colors.primary.eggPink : 'transparent'}`,
                      color: activeTab === 'account' ? colors.primary.eggPink : colors.text.secondary,
                      fontWeight: activeTab === 'account' ? '600' : '500',
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    Account Details
                  </button>
                  <button 
                    onClick={() => handleTabChange('fitting')}
                    style={{
                      paddingBottom: '16px',
                      paddingLeft: '16px',
                      paddingRight: '16px',
                      background: 'none',
                      border: 'none',
                      borderBottom: `2px solid ${activeTab === 'fitting' ? colors.primary.eggPink : 'transparent'}`,
                      color: activeTab === 'fitting' ? colors.primary.eggPink : colors.text.secondary,
                      fontWeight: activeTab === 'fitting' ? '600' : '500',
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    Fitting Room
                  </button>
                  <button 
                    onClick={() => handleTabChange('personality')}
                    style={{
                      paddingBottom: '16px',
                      paddingLeft: '16px',
                      paddingRight: '16px',
                      background: 'none',
                      border: 'none',
                      borderBottom: `2px solid ${activeTab === 'personality' ? colors.primary.eggPink : 'transparent'}`,
                      color: activeTab === 'personality' ? colors.primary.eggPink : colors.text.secondary,
                      fontWeight: activeTab === 'personality' ? '600' : '500',
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    Eggora-chan
                  </button>
                </div>

                {/* Content: Account Details */}
                {activeTab === 'account' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: colors.text.muted, letterSpacing: '0.05em' }}>First Name</label>
                      <input 
                        type="text" 
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          border: `1px solid ${colors.input.border}`,
                          background: colors.input.background,
                          color: colors.text.primary,
                          fontSize: '14px',
                          fontWeight: '500',
                          outline: 'none'
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: colors.text.muted, letterSpacing: '0.05em' }}>Last Name</label>
                      <input 
                        type="text" 
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          border: `1px solid ${colors.input.border}`,
                          background: colors.input.background,
                          color: colors.text.primary,
                          fontSize: '14px',
                          fontWeight: '500',
                          outline: 'none'
                        }}
                      />
                    </div>
                    <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: colors.text.muted, letterSpacing: '0.05em' }}>Email Address</label>
                      <div style={{ position: 'relative' }}>
                        <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: colors.text.tertiary }} />
                        <input 
                          type="email" 
                          value={email}
                          disabled
                          style={{
                            width: '100%',
                            padding: '12px 16px 12px 44px',
                            borderRadius: '12px',
                            border: 'none',
                            background: colors.card.backgroundAlt,
                            color: colors.text.muted,
                            fontSize: '14px',
                            fontWeight: '500',
                            outline: 'none',
                            cursor: 'not-allowed'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Content: Fitting Room */}
                {activeTab === 'fitting' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    
                    {/* Info Banner */}
                    <div style={{
                      background: `linear-gradient(to right, ${colors.primary.eggPinkLight}, ${colors.card.backgroundAlt})`,
                      borderRadius: '16px',
                      padding: '24px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px',
                      border: `1px solid ${colors.primary.eggPink}30`
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          background: colors.card.background,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: colors.primary.eggPink,
                          boxShadow: colors.shadow.sm
                        }}>
                          <Camera size={24} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '16px', fontWeight: '700', color: colors.text.primary }}>Virtual Fitting Room</h3>
                          <p style={{ fontSize: '14px', color: colors.text.secondary, marginTop: '4px' }}>Upload full-body photos to see how items fit you specifically. These photos are private.</p>
                        </div>
                      </div>
                    </div>

                    {/* Upload Zone */}
                    <div style={{
                      border: `2px dashed ${colors.border.subtle}`,
                      borderRadius: '24px',
                      padding: '40px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      background: colors.card.background
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = colors.primary.eggPink;
                      e.currentTarget.style.backgroundColor = colors.primary.eggPinkLight + '40';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = colors.border.subtle;
                      e.currentTarget.style.backgroundColor = colors.card.background;
                    }}
                    >
                      <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        background: colors.card.backgroundAlt,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: colors.text.muted,
                        marginBottom: '16px'
                      }}>
                        <Upload size={24} />
                      </div>
                      <h4 style={{ fontSize: '16px', fontWeight: '700', color: colors.text.primary }}>Click or Drag to Upload</h4>
                      <p style={{ fontSize: '12px', color: colors.text.secondary, marginTop: '4px' }}>Supports JPG, PNG (Max 10MB)</p>
                    </div>

                    {/* Photo Grid */}
                    <div>
                      <h4 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: colors.text.muted, letterSpacing: '0.05em', marginBottom: '16px' }}>Your Body Profile Photos</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px' }}>
                        {/* Photo 1 */}
                        <div className="group" style={{ aspectRatio: '3/4', borderRadius: '12px', overflow: 'hidden', position: 'relative', background: colors.card.backgroundAlt }}>
                          <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" alt="Front View" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }} />
                          <button style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'white',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#EF4444',
                            opacity: 0,
                            cursor: 'pointer',
                            transition: 'opacity 0.2s',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                          className="delete-btn"
                          >
                            <Trash2 size={16} />
                          </button>
                          <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '10px', fontWeight: '600', padding: '4px 8px', borderRadius: '4px' }}>Front</div>
                        </div>

                        {/* Photo 2 */}
                        <div className="group" style={{ aspectRatio: '3/4', borderRadius: '12px', overflow: 'hidden', position: 'relative', background: colors.card.backgroundAlt }}>
                          <img src="https://images.unsplash.com/photo-1529139574466-a302d20539ba?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" alt="Side View" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }} />
                          <button style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'white',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#EF4444',
                            opacity: 0,
                            cursor: 'pointer',
                            transition: 'opacity 0.2s',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                          className="delete-btn"
                          >
                            <Trash2 size={16} />
                          </button>
                          <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '10px', fontWeight: '600', padding: '4px 8px', borderRadius: '4px' }}>Side</div>
                        </div>

                        {/* Add New */}
                        <div style={{ 
                          aspectRatio: '3/4', 
                          borderRadius: '12px', 
                          border: `1px solid ${colors.border.subtle}`, 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          cursor: 'pointer', 
                          color: colors.text.muted,
                          background: colors.card.background,
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = colors.card.backgroundAlt}
                        onMouseLeave={(e) => e.currentTarget.style.background = colors.card.background}
                        >
                          <Plus size={24} />
                          <span style={{ fontSize: '12px', fontWeight: '600', marginTop: '8px' }}>Add Angle</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Content: Personality */}
                {activeTab === 'personality' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    
                    {/* Info Banner */}
                    <div style={{
                      background: `linear-gradient(to right, ${colors.primary.eggPinkLight}, ${colors.card.backgroundAlt})`,
                      borderRadius: '16px',
                      padding: '24px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px',
                      border: `1px solid ${colors.primary.eggPink}30`
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          background: colors.card.background,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: colors.primary.eggPink,
                          boxShadow: colors.shadow.sm
                        }}>
                          <Sparkles size={24} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '16px', fontWeight: '700', color: colors.text.primary }}>Eggora-chan's Personality</h3>
                          <p style={{ fontSize: '14px', color: colors.text.secondary, marginTop: '4px' }}>Choose how Eggora-chan interacts with you. This affects her tone and style recommendations.</p>
                        </div>
                      </div>
                    </div>

                    {/* Options Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                      {['Friendly', 'Professional', 'Sassy'].map((option) => (
                        <div 
                          key={option}
                          onClick={() => setPersonality(option)}
                          style={{
                            border: `2px solid ${personality === option ? colors.primary.eggPink : colors.border.subtle}`,
                            borderRadius: '16px',
                            padding: '24px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            background: personality === option ? colors.primary.eggPinkLight + '20' : colors.card.background,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                          }}
                        >
                          <div style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            border: `2px solid ${personality === option ? colors.primary.eggPink : colors.border.subtle}`,
                            background: personality === option ? colors.primary.eggPink : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            alignSelf: 'flex-end'
                          }}>
                            {personality === option && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white' }} />}
                          </div>
                          
                          <h4 style={{ fontSize: '16px', fontWeight: '700', color: colors.text.primary }}>{option}</h4>
                          <p style={{ fontSize: '13px', color: colors.text.secondary, lineHeight: '1.5' }}>
                            {option === 'Friendly' && "Warm, casual, and supportive. Like shopping with your best friend."}
                            {option === 'Professional' && "Efficient, polite, and direct. Focused on getting you the best results."}
                            {option === 'Sassy' && "Bold, honest, and fun. Won't hesitate to tell you what's hot and what's not."}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </main>
      <style>{`
        .group:hover .delete-btn {
          opacity: 1 !important;
        }
        @media (max-width: 1023px) {
          .profile-sidebar {
            display: none !important;
          }
          .settings-content {
            grid-column: span 12 !important;
          }
        }
      `}</style>
      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title="Settings Saved" 
        message="Your account preferences have been successfully updated." 
      />
      <AvatarSelectionModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        onSelect={handleAvatarSelect}
        currentAvatar={currentAvatar}
      />
    </div>
  );
};

export default ConsumerSettingsPage;
