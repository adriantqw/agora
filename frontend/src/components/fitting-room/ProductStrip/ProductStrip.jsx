import React from 'react';
import { Check } from 'lucide-react';

const ProductStrip = ({ products = [], selectedProductIds = [], onToggleProduct, loading = false }) => {
  const containerStyle = {
    display: 'flex',
    gap: '12px',
    overflowX: 'auto',
    padding: '12px 4px',
    scrollbarWidth: 'thin',
  };

  const cardStyle = (isSelected) => ({
    width: '120px',
    minWidth: '120px',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: '10px',
    overflow: 'hidden',
    cursor: 'pointer',
    border: isSelected ? '2px solid #7B3FA0' : '2px solid transparent',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    transition: 'all 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
  });

  const imageStyle = {
    width: '100%',
    height: '100px',
    objectFit: 'cover',
  };

  const infoStyle = {
    padding: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  };

  const brandStyle = {
    fontSize: '11px',
    fontWeight: '600',
    color: '#333',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const priceStyle = {
    fontSize: '12px',
    color: '#7B3FA0',
    fontWeight: '700',
  };

  const checkboxRowStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px',
    borderTop: '1px solid #f0e6f6',
  };

  const checkboxStyle = (isSelected) => ({
    width: '20px',
    height: '20px',
    borderRadius: '4px',
    border: isSelected ? 'none' : '2px solid #ccc',
    backgroundColor: isSelected ? '#7B3FA0' : '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  });

  if (loading) {
    return (
      <div style={{ ...containerStyle, justifyContent: 'center' }}>
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>Loading products...</span>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {products.map((product) => {
        const isSelected = selectedProductIds.includes(product.id);
        return (
          <div
            key={product.id}
            style={cardStyle(isSelected)}
            onClick={() => onToggleProduct(product)}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <img
              src={product.image}
              alt={product.name}
              style={imageStyle}
            />
            <div style={infoStyle}>
              <div style={brandStyle}>{product.brand}</div>
              <div style={priceStyle}>${product.price.toFixed(2)}</div>
            </div>
            <div style={checkboxRowStyle}>
              <div style={checkboxStyle(isSelected)}>
                {isSelected && <Check size={14} color="#fff" />}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProductStrip;
