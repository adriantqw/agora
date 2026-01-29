import React, { useEffect, useState } from 'react';
import { X, Check } from 'lucide-react';
import { useThemeColors } from '../../hooks/useThemeColors';

const AvatarSelectionModal = ({ isOpen, onClose, onSelect, currentAvatar }) => {
  const colors = useThemeColors();
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar);
  const [displaySeeds, setDisplaySeeds] = useState([]);

  // Pre-defined seeds for avatars
  const defaultSeeds = [
    'Sarah', 'Felix', 'Bella', 'Jake', 
    'Molly', 'Leo', 'Coco', 'Max',
    'Sam', 'Zoe', 'Jack', 'Luna',
    'Oscar', 'Ruby', 'Charlie', 'Daisy',
    'Oliver', 'Mia', 'Jasper'
  ];
  
  useEffect(() => {
    if (isOpen) {
      setSelectedAvatar(currentAvatar);
      
      // Extract seed from currentAvatar URL if it exists
      const match = currentAvatar.match(/seed=([^&]+)/);
      const currentSeed = match ? match[1] : null;
      
      let newSeeds = [...defaultSeeds];
      if (currentSeed && !defaultSeeds.includes(currentSeed)) {
        newSeeds = [currentSeed, ...defaultSeeds];
      }
      setDisplaySeeds(newSeeds);
    }
  }, [isOpen, currentAvatar]);

  const handleSave = () => {
    onSelect(selectedAvatar);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        background: colors.card.background,
        borderRadius: '24px',
        padding: '32px',
        width: '90%',
        maxWidth: '500px',
        position: 'relative',
        boxShadow: colors.shadow.md,
        display: 'flex',
        flexDirection: 'column',
        animation: 'scaleIn 0.2s ease-out'
      }}>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: colors.text.tertiary,
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <X size={20} />
        </button>

        <h3 style={{ fontSize: '20px', fontWeight: '700', color: colors.text.primary, marginBottom: '24px' }}>
          Choose Your Look
        </h3>

        {/* Pre-defined Avatars */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: colors.text.muted, marginBottom: '16px', letterSpacing: '0.05em' }}>
            Select a character
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>
            {displaySeeds.map((seed) => {
              const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=ffdfbf`;
              const isSelected = selectedAvatar === avatarUrl;
              
              return (
                <button
                  key={seed}
                  onClick={() => setSelectedAvatar(avatarUrl)}
                  style={{
                    background: 'none',
                    border: isSelected ? `2px solid ${colors.primary.eggPink}` : '2px solid transparent',
                    borderRadius: '50%',
                    padding: '2px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                >
                  <img 
                    src={avatarUrl} 
                    alt={seed}
                    style={{ width: '100%', borderRadius: '50%', display: 'block' }} 
                  />
                  {isSelected && (
                    <div style={{
                      position: 'absolute',
                      bottom: '0',
                      right: '0',
                      background: colors.primary.eggPink,
                      color: 'white',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `2px solid ${colors.card.background}`
                    }}>
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '99px',
              border: `1px solid ${colors.border.subtle}`,
              background: 'transparent',
              color: colors.text.secondary,
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '99px',
              border: 'none',
              background: colors.primary.eggPink,
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: `0 4px 12px ${colors.primary.pink}66`
            }}
          >
            Save Avatar
          </button>
        </div>

      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default AvatarSelectionModal;