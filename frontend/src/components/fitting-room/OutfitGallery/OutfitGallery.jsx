import React from 'react';
import { Shirt } from 'lucide-react';

const OutfitGallery = ({ fittingSets, selectedIndex, onSelectSet, isGenerating }) => {
  const containerStyle = {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '24px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.03)',
    padding: '24px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    height: '100%',
    overflowY: 'auto',
  };

  const titleRowStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const titleStyle = {
    fontSize: '16px',
    fontWeight: '700',
    color: '#793DB0',
    textAlign: 'left',
    margin: 0,
  };

  const shimmerCardStyle = {
    height: '64px',
    borderRadius: '12px',
    background: 'linear-gradient(90deg, #f3e9f7 25%, #ead7f1 50%, #f3e9f7 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.4s infinite',
  };

  const cardStyle = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    borderRadius: '12px',
    border: isActive ? '2px solid #793DB0' : '1px solid #E2E8F0',
    backgroundColor: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
    boxShadow: isActive ? '0 4px 12px rgba(121, 61, 176, 0.2)' : 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  });

  const thumbStyle = {
    width: '52px',
    height: '52px',
    borderRadius: '10px',
    objectFit: 'contain',
    flexShrink: 0,
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
  };

  const textWrapStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    minWidth: 0,
  };

  const setTitleStyle = {
    fontSize: '12px',
    fontWeight: '700',
    color: '#1A202C',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const setSubtitleStyle = {
    fontSize: '11px',
    color: '#6b5b7a',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  return (
    <div style={containerStyle}>
      <div style={titleRowStyle}>
        <Shirt size={18} color="#7B3FA0" />
        <h3 style={titleStyle}>Lookbook Sets</h3>
      </div>

      {isGenerating && (!fittingSets || fittingSets.length === 0) ? (
        <>
          {[0, 1, 2].map(i => (
            <div key={i} style={shimmerCardStyle} />
          ))}
          <style>{`@keyframes shimmer { from { background-position: -200% 0; } to { background-position: 200% 0; } }`}</style>
        </>
      ) : (
        (fittingSets || []).map((set, index) => {
          const imagePath = Array.isArray(set.imagePaths) ? set.imagePaths[0] : set.imagePath;
          return (
            <div
              key={`${set.title || 'set'}-${index}`}
              style={cardStyle(index === selectedIndex)}
              onClick={() => onSelectSet(index)}
            >
              {imagePath ? (
                <img
                  src={imagePath}
                  alt={set.title || `Set ${index + 1}`}
                  style={thumbStyle}
                />
              ) : (
                <div style={thumbStyle} />
              )}
              <div style={textWrapStyle}>
                <div style={setTitleStyle}>{set.title || `Set ${index + 1}`}</div>
                <div style={setSubtitleStyle}>{set.description || 'Generated lookbook set'}</div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default OutfitGallery;
