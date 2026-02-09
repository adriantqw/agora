import React from 'react';
import { Plus } from 'lucide-react';
import ItemCard from './ItemCard';

const ItemGrid = ({ items, onAddToQueue, onAddAllToQueue, onItemClick }) => {
  const containerStyle = {
    background: 'rgba(255, 255, 255, 0.4)', // Semi-transparent
    backdropFilter: 'blur(12px)',           // The "Frosted" effect
    WebkitBackdropFilter: 'blur(12px)',     // Safari support
    borderRadius: '24px',                   // Softer, rounder corners
    padding: '24px',
    border: '1px solid rgba(255, 255, 255, 0.3)', // Subtle highlight edge
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.03)',  // Very soft, large shadow
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
    flexShrink: 0,
  };

  const gridStyle = {
    display: 'flex',
    flexDirection: 'row',
    gap: '12px',
    flexWrap: 'nowrap',
    alignItems: 'stretch',
    flex: 1,
    minHeight: 0,
    overflowX: 'auto',
  };

  const handleFitAll = () => {
    if (onAddAllToQueue) {
      onAddAllToQueue(items);
    } else {
      for (const item of items) {
        const wasAdded = onAddToQueue(item);
        if (!wasAdded) break;
      }
    }
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1A202C', margin: 0 }}>
          Items ({items.length})
        </h3>
        <button
          onClick={handleFitAll}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12px',
            fontWeight: '600',
            color: '#793DB0',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.7'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
        >
          <Plus size={14} strokeWidth={2.5} />
          Fit all
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
