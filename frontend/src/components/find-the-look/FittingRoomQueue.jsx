import React from 'react';
import { Plus } from 'lucide-react';
import QueueItem from './QueueItem';

const FittingRoomQueue = ({ items, onRemoveItem }) => {
  const containerStyle = {
    minWidth: '320px',
    width: '450px',
    height: '100%',
    padding: '24px',
    background: 'linear-gradient(135deg, #E6E6FA 0%, #FFB6C1 100%)',
    borderRadius: '16px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  };

  const titleStyle = {
    fontSize: '20px',
    fontWeight: '700',
    color: '#793DB0',
    marginBottom: '24px',
    flexShrink: 0,
  };

  const itemsContainerStyle = {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
  };

  const emptyStateStyle = {
    border: '2px dashed rgba(255, 255, 255, 0.6)',
    borderRadius: '12px',
    padding: '48px 24px',
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  };

  const iconStyle = {
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: '16px',
  };

  const emptyTextStyle = {
    fontSize: '14px',
    color: '#FFFFFF',
    fontWeight: '500',
    margin: 0,
  };


  return (
    <div style={containerStyle}>
      <style>{`
        .fitting-room-items::-webkit-scrollbar {
          width: 6px;
        }
        .fitting-room-items::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }
        .fitting-room-items::-webkit-scrollbar-thumb {
          background: rgba(121, 61, 176, 0.4);
          border-radius: 3px;
        }
        .fitting-room-items::-webkit-scrollbar-thumb:hover {
          background: rgba(121, 61, 176, 0.6);
        }
      `}</style>
      <h2 style={titleStyle}>Fitting Room Queue</h2>

      {items.length === 0 ? (
        <div style={emptyStateStyle}>
          <Plus size={48} style={iconStyle} strokeWidth={1.5} />
          <p style={emptyTextStyle}>Add items to try on</p>
        </div>
      ) : (
        <div style={itemsContainerStyle} className="fitting-room-items">
          {items.map((item) => (
            <QueueItem
              key={item.id}
              item={item}
              onRemove={() => onRemoveItem(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FittingRoomQueue;
