import React, { useState, useEffect } from 'react';
import { useThemeColors } from '../../hooks/useThemeColors';
import { X, Search } from 'lucide-react';

const SelectVibeModal = ({ isOpen, onClose, onAdd, currentVibes = [] }) => {
  const colors = useThemeColors();
  const [searchTerm, setSearchTerm] = useState('');
  const [customVibe, setCustomVibe] = useState('');
  const [hoveredVibe, setHoveredVibe] = useState(null);

  const allVibes = [
    { name: 'Romantic', description: 'Soft, dreamy, and feminine aesthetics', image: '/vibe_photos.png', position: '0% 0%' },
    { name: 'Chic', description: 'Modern, polished, and sophisticated style', image: '/vibe_photos.png', position: '100% 0%' },
    { name: 'Edgy', description: 'Bold, daring, and unconventional looks', image: '/vibe_photos.png', position: '0% 100%' },
    { name: 'Boho', description: 'Relaxed, free-spirited, and eclectic vibes', image: '/vibe_photos.png', position: '100% 100%' },
    { name: 'Minimalist', description: 'Clean lines, neutral tones, intentional simplicity', image: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=800' },
    { name: 'Classic Chic', description: 'Timeless tailoring with effortless elegance', image: 'https://images.unsplash.com/photo-1539106397003-501daca7f15c?auto=format&fit=crop&q=80&w=800' },
    { name: 'Preppy', description: 'Polished, collegiate, and traditionally styled', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800' },
    { name: 'Normcore', description: 'Deliberately ordinary with understated cool', image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&q=80&w=800' },
    { name: 'Modern Tailoring', description: 'Sharp structure with contemporary proportions', image: 'https://images.unsplash.com/photo-1594932224033-246457bb1443?auto=format&fit=crop&q=80&w=800' },
    { name: 'Streetwear', description: 'Relaxed silhouettes driven by youth culture', image: 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&q=80&w=800' },
    { name: 'Skater', description: 'Loose, functional, and effortlessly rebellious', image: 'https://images.unsplash.com/photo-1520156584189-1e76f04df551?auto=format&fit=crop&q=80&w=800' },
    { name: 'Techwear', description: 'Futuristic utility with performance-focused design', image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800' },
    { name: 'Athleisure', description: 'Sport-inspired comfort designed for everyday wear', image: 'https://images.unsplash.com/photo-1483721310020-03333e577078?auto=format&fit=crop&q=80&w=800' },
    { name: 'Y2K', description: 'Early-2000s nostalgia with playful, flashy details', image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&q=80&w=800' },
    { name: 'Cottagecore', description: 'Soft, pastoral, romantic countryside aesthetics', image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=800' },
    { name: 'Coquette', description: 'Delicate, flirtatious, vintage-inspired femininity', image: 'https://images.unsplash.com/photo-1581067723502-466296ca1481?auto=format&fit=crop&q=80&w=800' },
    { name: 'Romantic Goth', description: 'Dark elegance mixed with softness and drama', image: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&q=80&w=800' },
    { name: 'Ethereal', description: 'Light, airy, and otherworldly silhouettes', image: 'https://images.unsplash.com/photo-1534126416832-a88fdf98a13a?auto=format&fit=crop&q=80&w=800' },
    { name: 'Avant-Garde', description: 'Experimental forms that challenge conventions', image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=800' },
    { name: 'Maximalist', description: 'Bold layering, color, and expressive excess', image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=800' },
    { name: 'Camp', description: 'Exaggerated, theatrical, and knowingly over-the-top', image: 'https://images.unsplash.com/photo-1516575334481-f8528e97dd82?auto=format&fit=crop&q=80&w=800' },
    { name: 'Gender-Fluid', description: 'Style unconstrained by traditional gender norms', image: 'https://images.unsplash.com/photo-1552664199-8d9702f76d47?auto=format&fit=crop&q=80&w=800' },
    { name: 'Vintage Revival', description: 'Old-era fashion reinterpreted for today', image: 'https://images.unsplash.com/photo-1523260572679-8e2fe2229b32?auto=format&fit=crop&q=80&w=800' },
    { name: 'Retro Futurism', description: 'Past visions of the future reimagined', image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=800' },
    { name: 'Heritage Workwear', description: 'Durable classics rooted in craftsmanship', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800' },
    { name: 'Bohemian', description: 'Artistic, relaxed, and free-spirited styling', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800' },
    { name: 'Quiet Luxury', description: 'Subtle refinement without obvious branding', image: 'https://images.unsplash.com/photo-1539106397003-501daca7f15c?auto=format&fit=crop&q=80&w=800' },
    { name: 'High-Fashion Editorial', description: 'Dramatic, conceptual, runway-driven looks', image: 'https://images.unsplash.com/photo-1537368937627-687569dca29d?auto=format&fit=crop&q=80&w=800' },
    { name: 'Resort Luxe', description: 'Relaxed elegance suited for leisure and travel', image: 'https://images.unsplash.com/photo-1590603740183-980e7f6920eb?auto=format&fit=crop&q=80&w=800' },
    { name: 'Dark Academia', description: 'Scholarly, moody, and literature-inspired style', image: 'https://images.unsplash.com/photo-1510070112810-d4e9a46d9e91?auto=format&fit=crop&q=80&w=800' },
    { name: 'Gorpcore', description: 'Outdoor utility worn in an urban context', image: 'https://images.unsplash.com/photo-1520255870062-bd79d3865ee7?auto=format&fit=crop&q=80&w=800' }
  ];


  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setCustomVibe('');
    }
  }, [isOpen]);

  const filteredVibes = allVibes.filter(vibe => 
    vibe.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
    !currentVibes.some(cv => cv.name === vibe.name)
  );

  const handleSelect = (vibe) => {
    onAdd(vibe);
    onClose();
  };

  const handleCustomAdd = () => {
    if (customVibe.trim()) {
      onAdd({ 
        name: customVibe.trim(), 
        description: 'Your custom defined style.',
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800'
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, backdropFilter: 'blur(4px)'
    }} onClick={onClose}>
      <div style={{
        background: colors.card.background,
        borderRadius: '32px',
        padding: '40px',
        width: '90%',
        maxWidth: '1100px',
        maxHeight: '90vh',
        boxShadow: colors.shadow.xl,
        border: `1px solid ${colors.border.subtle}`,
        display: 'flex',
        flexDirection: 'column'
      }} onClick={e => e.stopPropagation()}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
          <div>
            <h3 style={{ fontSize: '28px', fontWeight: '800', color: colors.text.primary, marginBottom: '8px' }}>Select Style Vibes</h3>
            <p style={{ fontSize: '16px', color: colors.text.secondary }}>Choose up to 4 aesthetics that define your look.</p>
          </div>
          <button 
            onClick={onClose} 
            style={{ 
              background: colors.card.backgroundAlt, 
              border: 'none', 
              cursor: 'pointer', 
              color: colors.text.secondary,
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
          >
            <X size={24} />
          </button>
        </div>

        <div style={{ position: 'relative', marginBottom: '32px' }}>
          <Search size={22} color={colors.text.tertiary} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search aesthetics..."
            style={{
              width: '100%', 
              padding: '18px 18px 18px 60px',
              borderRadius: '20px', 
              border: `1px solid ${colors.border.light}`,
              background: colors.card.backgroundAlt, 
              color: colors.text.primary,
              fontSize: '18px', 
              outline: 'none'
            }}
          />
        </div>

        {/* Scrollable Grid */}
        <div style={{ 
          flexGrow: 1, 
          overflowY: 'auto', 
          marginBottom: '32px', 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
          gap: '24px', 
          padding: '4px'
        }}>
          {filteredVibes.map((vibe) => (
            <div 
              key={vibe.name}
              onClick={() => handleSelect(vibe)}
              onMouseEnter={() => setHoveredVibe(vibe.name)}
              onMouseLeave={() => setHoveredVibe(null)}
              style={{
                cursor: 'pointer', 
                borderRadius: '24px', 
                overflow: 'hidden',
                border: `4px solid ${hoveredVibe === vibe.name ? colors.gradient.start : 'transparent'}`, 
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                background: colors.card.backgroundAlt,
                position: 'relative',
                height: '240px',
                transform: hoveredVibe === vibe.name ? 'scale(1.02)' : 'scale(1)',
                boxShadow: hoveredVibe === vibe.name ? colors.shadow.lg : 'none'
              }}
            >
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
              
              {/* Permanent Name & Description Overlay */}
              <div style={{
                position: 'absolute', 
                inset: 0, 
                background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)',
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '24px'
              }}>
                <div style={{ 
                  color: 'white', 
                  fontSize: '22px', 
                  fontWeight: '900', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.05em',
                  textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                  marginBottom: '4px'
                }}>
                  {vibe.name}
                </div>
                <div style={{ 
                  color: 'rgba(255,255,255,0.9)', 
                  fontSize: '13px', 
                  fontWeight: '500', 
                  lineHeight: '1.4',
                  maxWidth: '90%',
                  opacity: hoveredVibe === vibe.name ? 1 : 0,
                  transform: hoveredVibe === vibe.name ? 'translateY(0)' : 'translateY(10px)',
                  transition: 'all 0.3s'
                }}>
                  {vibe.description}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ borderTop: `1px solid ${colors.border.light}`, paddingTop: '24px' }}>
          <label style={{ fontSize: '12px', fontWeight: '800', color: colors.text.muted, textTransform: 'uppercase', marginBottom: '12px', display: 'block' }}>Add a custom vibe</label>
          <div style={{ display: 'flex', gap: '16px' }}>
            <input 
              type="text" 
              value={customVibe}
              onChange={(e) => setCustomVibe(e.target.value)}
              placeholder="e.g. Neo-Gothic"
              style={{
                flex: 1, padding: '16px', borderRadius: '16px',
                border: `1px solid ${colors.border.light}`, background: colors.card.backgroundAlt,
                color: colors.text.primary, fontSize: '16px', outline: 'none'
              }}
            />
            <button 
              onClick={handleCustomAdd}
              disabled={!customVibe.trim()}
              style={{
                padding: '0 32px', borderRadius: '16px', border: 'none',
                background: colors.gradient.start, color: 'white',
                fontWeight: '800', fontSize: '16px', cursor: 'pointer',
                opacity: customVibe.trim() ? 1 : 0.5
              }}
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectVibeModal;
