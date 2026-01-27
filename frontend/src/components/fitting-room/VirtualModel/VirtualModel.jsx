import React from 'react';

const VirtualModel = ({ outfit = [], onLoad }) => {
  const categoryIcons = {
    dress: '👗',
    top: '👕',
    bottom: '👖',
    accessories: '👜',
    shoes: '👞',
  };

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    padding: '20px',
  };

  const modelPlaceholderStyle = {
    width: '200px',
    height: '400px',
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '64px',
    border: '2px dashed rgba(255,255,255,0.5)',
  };

  const outfitItemsStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    justifyContent: 'center',
    maxWidth: '250px',
  };

  const outfitThumbnailStyle = {
    width: '60px',
    height: '80px',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  };

  const emptyStateStyle = {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.8)',
    fontSize: '14px',
    padding: '20px',
  };

  // Filter out null/empty items from outfit
  const validOutfitItems = outfit.filter(item => item && item.product);

  React.useEffect(() => {
    if (onLoad) {
      onLoad();
    }
  }, [onLoad]);

  return (
    <div style={containerStyle}>
      <div style={modelPlaceholderStyle}>
        👤
      </div>
      {validOutfitItems.length > 0 ? (
        <div style={outfitItemsStyle}>
          {validOutfitItems.map((item, index) => (
            <div key={index} style={outfitThumbnailStyle} title={item.product.name}>
              {categoryIcons[item.product.category] || '👕'}
            </div>
          ))}
        </div>
      ) : (
        <div style={emptyStateStyle}>
          Add items to your queue to see your outfit
        </div>
      )}
    </div>
  );
};

export default VirtualModel;
