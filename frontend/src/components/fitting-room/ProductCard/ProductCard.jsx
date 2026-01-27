import React from 'react';

const ProductCard = ({
  product,
  showActions = true,
  onAddToQueue,
  onToggleFavorite,
  isFavorite = false
}) => {
  const categoryIcons = {
    dress: '👗',
    top: '👕',
    bottom: '👖',
    accessories: '👜',
    shoes: '👞',
  };

  const cardStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
    overflow: 'hidden',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    cursor: 'pointer',
    ':hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 6px 12px rgba(0,0,0,0.1)',
    }
  };

  const imageContainerStyle = {
    position: 'relative',
    width: '100%',
    paddingBottom: '133%', // 3:4 aspect ratio
    backgroundColor: '#F5F5F5',
    overflow: 'hidden',
  };

  const imagePlaceholderStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '48px',
  };

  const categoryBadgeStyle = {
    position: 'absolute',
    top: '10px',
    left: '10px',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: '8px',
    padding: '6px 10px',
    fontSize: '18px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  };

  const contentStyle = {
    padding: '16px',
  };

  const nameStyle = {
    fontSize: '16px',
    fontWeight: '600',
    color: '#333333',
    marginBottom: '4px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const brandStyle = {
    fontSize: '14px',
    color: '#666666',
    marginBottom: '8px',
  };

  const detailsStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  };

  const sizeStyle = {
    fontSize: '13px',
    color: '#666666',
  };

  const priceStyle = {
    fontSize: '16px',
    fontWeight: '700',
    color: '#F5A5B8',
  };

  const actionsStyle = {
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end',
  };

  const iconButtonStyle = (isActive = false) => ({
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: isActive ? '#F5A5B8' : '#F5F5F5',
    color: isActive ? '#FFFFFF' : '#666666',
    fontSize: '16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  });

  return (
    <div style={cardStyle}>
      <div style={imageContainerStyle}>
        <div style={imagePlaceholderStyle}>
          {categoryIcons[product.category] || '👕'}
        </div>
        <div style={categoryBadgeStyle}>
          {categoryIcons[product.category] || '👕'}
        </div>
      </div>
      <div style={contentStyle}>
        <div style={nameStyle}>{product.name}</div>
        <div style={brandStyle}>{product.brand}</div>
        <div style={detailsStyle}>
          <span style={sizeStyle}>Size: {product.size}</span>
          <span style={priceStyle}>${product.price}</span>
        </div>
        {showActions && (
          <div style={actionsStyle}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite && onToggleFavorite(product);
              }}
              style={iconButtonStyle(isFavorite)}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              {isFavorite ? '❤️' : '🤍'}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToQueue && onAddToQueue(product);
              }}
              style={iconButtonStyle()}
              title="Add to try-on queue"
            >
              ➕
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
