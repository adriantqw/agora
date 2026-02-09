import React from 'react';
import { ShoppingCart as ShoppingCartIcon, X } from 'lucide-react';

const ShoppingCart = ({ items = [], onCheckout, onRemoveItem }) => {
  const total = items.reduce((sum, item) => sum + item.price, 0);

  const containerStyle = {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.03)',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
  };

  const titleStyle = {
    fontSize: '18px',
    fontWeight: '700',
    color: '#793DB0',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const lineItemsStyle = {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '16px',
  };

  const lineItemStyle = {
    display: 'flex',
    gap: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '12px',
    border: '1px solid #E2E8F0',
    transition: 'all 0.2s ease',
  };

  const thumbnailStyle = {
    width: '64px',
    height: '64px',
    borderRadius: '8px',
    objectFit: 'cover',
    flexShrink: 0,
  };

  const infoStyle = {
    flex: '1',
    minWidth: '0',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  };

  const itemNameStyle = {
    fontSize: '14px',
    fontWeight: '500',
    color: '#1A202C',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const brandStyle = {
    fontSize: '12px',
    color: '#718096',
  };

  const priceStyle = {
    fontSize: '14px',
    fontWeight: '700',
    color: '#793DB0',
  };

  const removeButtonStyle = {
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    flexShrink: 0,
  };

  const totalRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 0',
    borderTop: '1px solid #E2E8F0',
    marginBottom: '16px',
  };

  const totalLabelStyle = {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1a202c',
  };

  const totalPriceStyle = {
    fontSize: '18px',
    fontWeight: '700',
    color: '#7B3FA0',
  };

  const checkoutButtonStyle = {
    width: '100%',
    padding: '14px',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(135deg, #E8B4CB, #C9A0DC)',
    color: '#fff',
    fontSize: '15px',
    fontWeight: '700',
    cursor: items.length > 0 ? 'pointer' : 'not-allowed',
    opacity: items.length > 0 ? 1 : 0.5,
    transition: 'all 0.2s ease',
    boxShadow: items.length > 0 ? '0 4px 12px rgba(201,160,220,0.4)' : 'none',
  };

  const emptyStyle = {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#aaa',
    fontSize: '14px',
    textAlign: 'center',
    padding: '40px 20px',
  };

  return (
    <div style={containerStyle}>
      <div style={titleStyle}>
        <ShoppingCartIcon size={20} color="#793DB0" />
        Shopping Cart
      </div>

      {items.length === 0 ? (
        <div style={emptyStyle}>
          Select items to add them to your cart
        </div>
      ) : (
        <>
          {/* Line items */}
          <div style={lineItemsStyle}>
            {items.map((item) => (
              <div key={item.id} style={lineItemStyle}>
                <img
                  src={item.image}
                  alt={item.name}
                  style={thumbnailStyle}
                />

                <div style={infoStyle}>
                  <p style={itemNameStyle}>{item.name}</p>
                  <p style={brandStyle}>{item.brand}</p>
                  <p style={priceStyle}>${item.price.toFixed(2)}</p>
                </div>

                <button
                  style={removeButtonStyle}
                  onClick={() => onRemoveItem(item.id)}
                  aria-label="Remove item"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <X size={16} color="#4A5568" />
                </button>
              </div>
            ))}
          </div>

          {/* Total */}
          <div style={totalRowStyle}>
            <span style={totalLabelStyle}>Total</span>
            <span style={totalPriceStyle}>${total.toFixed(2)} AUD</span>
          </div>
        </>
      )}

      <button
        style={checkoutButtonStyle}
        onClick={onCheckout}
        disabled={items.length === 0}
        onMouseEnter={(e) => {
          if (items.length > 0) {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(201,160,220,0.5)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = items.length > 0 ? '0 4px 12px rgba(201,160,220,0.4)' : 'none';
        }}
      >
        Proceed to checkout
      </button>
    </div>
  );
};

export default ShoppingCart;
