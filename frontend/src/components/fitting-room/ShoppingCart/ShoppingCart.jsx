import React from 'react';
import { ShoppingCart as ShoppingCartIcon } from 'lucide-react';

const ShoppingCart = ({ items = [], onCheckout }) => {
  const total = items.reduce((sum, item) => sum + item.price, 0);

  const containerStyle = {
    backgroundColor: '#fff',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
  };

  const titleStyle = {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1a202c',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const outfitImageAreaStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '6px',
    marginBottom: '20px',
    borderRadius: '10px',
    overflow: 'hidden',
    backgroundColor: '#f7f7f7',
    minHeight: '120px',
  };

  const outfitImgStyle = {
    width: '100%',
    height: '80px',
    objectFit: 'cover',
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: '12px',
    borderBottom: '1px solid #f0f0f0',
  };

  const itemNameStyle = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
  };

  const itemDescStyle = {
    fontSize: '12px',
    color: '#888',
    marginTop: '2px',
  };

  const itemPriceStyle = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
    whiteSpace: 'nowrap',
    marginLeft: '12px',
  };

  const totalRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 0',
    borderTop: '2px solid #eee',
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
        <ShoppingCartIcon size={20} color="#7B3FA0" />
        Shopping Cart
      </div>

      {items.length === 0 ? (
        <div style={emptyStyle}>
          Select items to add them to your cart
        </div>
      ) : (
        <>
          {/* Composite outfit images */}
          <div style={outfitImageAreaStyle}>
            {items.slice(0, 4).map((item) => (
              <img
                key={item.id}
                src={item.image}
                alt={item.name}
                style={outfitImgStyle}
              />
            ))}
          </div>

          {/* Line items */}
          <div style={lineItemsStyle}>
            {items.map((item) => (
              <div key={item.id} style={lineItemStyle}>
                <div>
                  <div style={itemNameStyle}>{item.brand}</div>
                  <div style={itemDescStyle}>{item.name}</div>
                </div>
                <div style={itemPriceStyle}>${item.price.toFixed(2)} AUD</div>
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
