import React from 'react';
import { Plus } from 'lucide-react';
import ItemCard from './ItemCard';

const ItemGrid = ({ items, onAddToQueue, onItemClick }) => {
  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  };

  const titleStyle = {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1A202C',
    margin: 0,
  };

  const fitAllButtonStyle = {
    background: 'transparent',
    padding: '12px 24px',
    borderRadius: '8px',
    color: '#793DB0',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
  };

  const containerStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '24px',
    paddingRight: '24px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  };

  const gridStyle = {
    display: 'flex',
    flexDirection: 'row',
    gap: '16px',
    flexWrap: 'nowrap',
    alignItems: 'stretch',
    height: '100%',
  };

  const handleFitAll = () => {
    items.forEach(item => onAddToQueue(item));
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h2 style={titleStyle}>Items</h2>

        <button
          style={fitAllButtonStyle}
          onClick={handleFitAll}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.7';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>Fit all</span>
        </button>
      </div>

      <div style={gridStyle}>
        {items.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            onAddToQueue={onAddToQueue}
            onClick={onItemClick}
          />
        ))}
      </div>
    </div>
  );
};

export default ItemGrid;
