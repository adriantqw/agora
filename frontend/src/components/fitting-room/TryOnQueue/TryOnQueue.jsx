import React from 'react';
import TryOnSlot from '../TryOnSlot/TryOnSlot';

const TryOnQueue = ({ slots, onReorder, onRemove, onToggleFavorite }) => {
  const handleReorder = (e) => {
    if (e.detail && e.detail.fromIndex !== undefined && e.detail.toIndex !== undefined) {
      onReorder(e.detail.fromIndex, e.detail.toIndex);
    }
  };

  React.useEffect(() => {
    document.addEventListener('reorder', handleReorder);
    return () => {
      document.removeEventListener('reorder', handleReorder);
    };
  }, [onReorder]);

  const containerStyle = {
    width: '200px',
    padding: '20px',
    backgroundColor: '#FAFAFA',
    borderLeft: '1px solid #EEEEEE',
    height: '100%',
    overflowY: 'auto',
  };

  const titleStyle = {
    fontSize: '16px',
    fontWeight: '700',
    color: '#333333',
    marginBottom: '20px',
  };

  const queueStyle = {
    display: 'flex',
    flexDirection: 'column',
  };

  const handleMoveUp = (index) => {
    if (index > 0) {
      onReorder(index, index - 1);
    }
  };

  const handleMoveDown = (index) => {
    if (index < slots.length - 1) {
      onReorder(index, index + 1);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={titleStyle}>Try-On Queue</div>
      <div style={queueStyle}>
        {slots.map((slot, index) => (
          <TryOnSlot
            key={slot.slot}
            product={slot.product}
            position={index}
            isFavorite={slot.isFavorite}
            isFirst={index === 0}
            isLast={index === slots.length - 1}
            onMoveUp={() => handleMoveUp(index)}
            onMoveDown={() => handleMoveDown(index)}
            onToggleFavorite={() => onToggleFavorite(index)}
            onRemove={() => onRemove(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default TryOnQueue;
