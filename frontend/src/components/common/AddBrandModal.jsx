import React, { useState, useEffect, useRef } from 'react';
import { useThemeColors } from '../../hooks/useThemeColors';
import { X, Search, Check } from 'lucide-react';

const AddBrandModal = ({ isOpen, onClose, onAdd, currentBrands = [] }) => {
  const colors = useThemeColors();
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const inputRef = useRef(null);

  // Mock database of brands
  const allBrands = [
    'Zara', 'H&M', 'Uniqlo', 'Aritzia', 'Reformation', 'COS', 'Nike', 'Adidas',
    'Lululemon', 'Gymshark', 'Mango', 'Massimo Dutti', 'Levi\'s', 'Abercrombie & Fitch',
    'Gap', 'Banana Republic', 'Everlane', 'Madewell', 'J.Crew', 'Anthropologie',
    'Free People', 'Urban Outfitters', 'Sezane', 'Rouje', 'Ganni', 'Acne Studios',
    'Toteme', 'The Row', 'Gucci', 'Prada', 'Miu Miu', 'Saint Laurent', 'Celine',
    'Loewe', 'Bottega Veneta', 'Jacquemus', 'Isabel Marant', 'Sandro', 'Maje'
  ];

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSuggestions([]);
      // Focus input on open
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSuggestions([]);
      return;
    }

    const filtered = allBrands.filter(brand => 
      brand.toLowerCase().includes(searchTerm.toLowerCase()) && 
      !currentBrands.includes(brand)
    );
    setSuggestions(filtered);
  }, [searchTerm, currentBrands]);

  const handleSelect = (brand) => {
    onAdd(brand);
    onClose();
  };

  const handleCustomAdd = () => {
    if (searchTerm.trim() && !currentBrands.includes(searchTerm.trim())) {
      onAdd(searchTerm.trim());
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    }} onClick={onClose}>
      <div style={{
        background: colors.card.background,
        borderRadius: '24px',
        padding: '32px',
        width: '100%',
        maxWidth: '480px',
        boxShadow: colors.shadow.lg,
        border: `1px solid ${colors.border.subtle}`,
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '80vh'
      }} onClick={e => e.stopPropagation()}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '700', color: colors.text.primary }}>Add a Brand</h3>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: colors.text.secondary }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', marginBottom: '24px' }}>
          <Search size={20} color={colors.text.secondary} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            ref={inputRef}
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for brands..."
            style={{
              width: '100%',
              padding: '16px 16px 16px 48px',
              borderRadius: '16px',
              border: `1px solid ${colors.border.light}`,
              background: colors.card.backgroundAlt,
              color: colors.text.primary,
              fontSize: '16px',
              outline: 'none'
            }}
          />
        </div>

        {/* Suggestions List */}
        <div style={{ flexGrow: 1, overflowY: 'auto', marginBottom: '24px', minHeight: '100px' }}>
          {searchTerm && suggestions.length === 0 && (
             <div 
               onClick={handleCustomAdd}
               style={{
                 padding: '16px',
                 borderRadius: '12px',
                 cursor: 'pointer',
                 display: 'flex',
                 alignItems: 'center',
                 gap: '12px',
                 color: colors.text.primary,
                 background: colors.card.backgroundAlt
               }}
             >
               <Check size={18} color={colors.primary.eggPink} />
               <span>Add custom brand "<strong>{searchTerm}</strong>"</span>
             </div>
          )}

          {suggestions.map((brand) => (
            <button
              key={brand}
              onClick={() => handleSelect(brand)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '12px 16px',
                borderRadius: '12px',
                background: 'transparent',
                border: 'none',
                color: colors.text.primary,
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = colors.card.backgroundAlt}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              {brand}
            </button>
          ))}
          
          {!searchTerm && (
            <div style={{ textAlign: 'center', color: colors.text.secondary, fontSize: '14px', marginTop: '20px' }}>
              Start typing to find brands...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddBrandModal;
