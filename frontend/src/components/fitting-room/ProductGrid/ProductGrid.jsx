import React from 'react';
import ProductCard from '../ProductCard/ProductCard';

const ProductGrid = ({
  products,
  columns = 3,
  onProductClick,
  onAddToQueue,
  onToggleFavorite,
  favoriteProducts = []
}) => {
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: '24px',
    padding: '24px',
  };

  // Responsive grid
  const responsiveGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '24px',
    padding: '24px',
  };

  return (
    <div style={responsiveGridStyle}>
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          showActions={true}
          onAddToQueue={onAddToQueue}
          onToggleFavorite={onToggleFavorite}
          isFavorite={favoriteProducts.includes(product.id)}
        />
      ))}
      {products.length === 0 && (
        <div style={{
          gridColumn: '1 / -1',
          textAlign: 'center',
          padding: '60px 20px',
          color: '#666666',
          fontSize: '16px',
        }}>
          No products found in this category.
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
