import React from 'react';

const CategoryTabs = ({ activeCategory, onCategoryChange }) => {
  const categories = [
    { id: 'current', label: 'Current', icon: '✨' },
    { id: 'outfits', label: 'Outfits', icon: '👔' },
    { id: 'tops', label: 'Tops', icon: '👕' },
    { id: 'bottoms', label: 'Bottoms', icon: '👖' },
    { id: 'accessories', label: 'Accessories', icon: '👜' },
  ];

  const containerStyle = {
    display: 'flex',
    gap: '12px',
    padding: '20px',
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid #EEEEEE',
    overflowX: 'auto',
  };

  const tabStyle = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
    background: isActive
      ? 'linear-gradient(180deg, #FFB6C1 0%, #FFA07A 100%)'
      : '#FFFFFF',
    color: isActive ? '#FFFFFF' : '#666666',
    boxShadow: isActive
      ? '0 4px 6px rgba(0,0,0,0.07)'
      : '0 2px 4px rgba(0,0,0,0.05)',
  });

  return (
    <div style={containerStyle}>
      {categories.map(category => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          style={tabStyle(activeCategory === category.id)}
        >
          <span>{category.icon}</span>
          <span>{category.label}</span>
        </button>
      ))}
    </div>
  );
};

export default CategoryTabs;
