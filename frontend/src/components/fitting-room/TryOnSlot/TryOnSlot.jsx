import React from 'react';

const TryOnSlot = ({
  fittingSet,
  position,
  onMoveUp,
  onMoveDown,
  onToggleFavorite,
  onRemove,
  isFavorite = false,
  isFirst = false,
  isLast = false
}) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [isDragOver, setIsDragOver] = React.useState(false);

  const handleDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('slotIndex', position.toString());
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const fromIndex = parseInt(e.dataTransfer.getData('slotIndex'));
    const toIndex = position;
    if (fromIndex !== toIndex) {
      // This will be handled by parent component
      e.currentTarget.dispatchEvent(new CustomEvent('reorder', {
        detail: { fromIndex, toIndex },
        bubbles: true
      }));
    }
  };

  const slotStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    height: '80px',
    backgroundColor: isDragOver ? '#FFF0F3' : '#FFFFFF',
    border: fittingSet ? '1px solid #EEEEEE' : '2px dashed #CCCCCC',
    borderRadius: '8px',
    marginBottom: '8px',
    transition: 'all 0.2s ease',
    opacity: isDragging ? 0.5 : 1,
    cursor: fittingSet ? 'move' : 'default',
    boxShadow: isDragOver ? '0 4px 8px rgba(245, 165, 184, 0.2)' : 'none',
  };

  const thumbnailStyle = {
    width: '56px',
    height: '56px',
    backgroundColor: '#F5F5F5',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    flexShrink: 0,
  };

  const contentStyle = {
    flex: 1,
    overflow: 'hidden',
  };

  const nameStyle = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333333',
    marginBottom: '4px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const priceStyle = {
    fontSize: '13px',
    fontWeight: '700',
    color: '#F5A5B8',
  };

  const actionsStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flexShrink: 0,
  };

  const iconButtonStyle = (isActive = false) => ({
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: isActive ? '#F5A5B8' : '#F5F5F5',
    color: isActive ? '#FFFFFF' : '#666666',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  });

  const emptySlotStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#999999',
    fontSize: '14px',
  };

  if (!fittingSet) {
    return (
      <div
        style={slotStyle}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div style={emptySlotStyle}>Slot {position + 1}</div>
      </div>
    );
  }

  // Display first image if available
  const imageUrl = fittingSet.imagePaths && fittingSet.imagePaths.length > 0
    ? fittingSet.imagePaths[0]
    : null;

  return (
    <div
      style={slotStyle}
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div style={thumbnailStyle}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={fittingSet.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '6px'
            }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          '👕'
        )}
      </div>
      <div style={contentStyle}>
        <div style={nameStyle}>{fittingSet.title}</div>
        <div style={priceStyle}>
          {fittingSet.productIds?.length || 0} item{fittingSet.productIds?.length !== 1 ? 's' : ''}
        </div>
      </div>
      <div style={actionsStyle}>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              !isFirst && onMoveUp && onMoveUp();
            }}
            style={{
              ...iconButtonStyle(),
              opacity: isFirst ? 0.3 : 1,
              cursor: isFirst ? 'not-allowed' : 'pointer',
            }}
            disabled={isFirst}
            title="Move up"
          >
            ↑
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              !isLast && onMoveDown && onMoveDown();
            }}
            style={{
              ...iconButtonStyle(),
              opacity: isLast ? 0.3 : 1,
              cursor: isLast ? 'not-allowed' : 'pointer',
            }}
            disabled={isLast}
            title="Move down"
          >
            ↓
          </button>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite && onToggleFavorite();
            }}
            style={iconButtonStyle(isFavorite)}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorite ? '❤️' : '🤍'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove && onRemove();
            }}
            style={iconButtonStyle()}
            title="Remove from queue"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
};

export default TryOnSlot;
