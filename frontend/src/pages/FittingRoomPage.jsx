import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFittingRoom } from '../contexts/FittingRoomContext';
import { fetchFittingRoomProducts } from '../services/fittingRoomService';
import Header from '../components/common/Header/Header';
import CategoryTabs from '../components/fitting-room/CategoryTabs/CategoryTabs';
import ProductGrid from '../components/fitting-room/ProductGrid/ProductGrid';
import TryOnQueue from '../components/fitting-room/TryOnQueue/TryOnQueue';
import FittingRoomPanel from '../components/fitting-room/FittingRoomPanel/FittingRoomPanel';
import Mascot from '../components/common/Mascot/Mascot';

const FittingRoomPage = () => {
  const navigate = useNavigate();
  const {
    queue,
    activeCategory,
    chatMessages,
    isTyping,
    addToQueue,
    removeFromQueue,
    reorderQueue,
    toggleFavorite,
    setActiveCategory,
    sendChatMessage,
    resetOutfit,
    buyOutfit,
  } = useFittingRoom();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoriteProducts, setFavoriteProducts] = useState([]);

  // Load products when category changes
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const data = await fetchFittingRoomProducts(activeCategory);
        setProducts(data);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [activeCategory]);

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
  };

  const handleAddToQueue = (product) => {
    const success = addToQueue(product);
    if (!success) {
      alert('Queue is full! Remove an item to add a new one.');
    }
  };

  const handleToggleProductFavorite = (product) => {
    setFavoriteProducts(prev => {
      if (prev.includes(product.id)) {
        return prev.filter(id => id !== product.id);
      } else {
        return [...prev, product.id];
      }
    });
  };

  const handleUpdateSearch = () => {
    navigate('/journey');
  };

  const pageStyle = {
    minHeight: '100vh',
    backgroundColor: '#FAFAFA',
    display: 'flex',
    flexDirection: 'column',
  };

  const mainLayoutStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 200px 400px',
    flex: 1,
    height: 'calc(100vh - 200px)', // Account for header and footer
    overflow: 'hidden',
  };

  const productColumnStyle = {
    overflowY: 'auto',
    height: '100%',
  };

  const queueColumnStyle = {
    overflowY: 'auto',
    height: '100%',
  };

  const panelColumnStyle = {
    overflowY: 'auto',
    height: '100%',
  };

  const footerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 40px',
    backgroundColor: '#FFFFFF',
    borderTop: '1px solid #EEEEEE',
  };

  const updateButtonStyle = {
    padding: '12px 24px',
    borderRadius: '8px',
    border: '2px solid #F5A5B8',
    backgroundColor: '#FFFFFF',
    color: '#F5A5B8',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  // Responsive styles for mobile/tablet
  const mediaQueryStyle = `
    @media (max-width: 1024px) {
      .main-layout {
        grid-template-columns: 1fr 250px !important;
      }
      .fitting-room-panel {
        display: none;
      }
    }

    @media (max-width: 768px) {
      .main-layout {
        grid-template-columns: 1fr !important;
      }
      .try-on-queue {
        display: none;
      }
      .fitting-room-panel {
        display: none;
      }
    }
  `;

  return (
    <div style={pageStyle}>
      <style>{mediaQueryStyle}</style>

      <Header compact={true} />

      <CategoryTabs
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      <div style={mainLayoutStyle} className="main-layout">
        <div style={productColumnStyle}>
          {loading ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '400px',
              fontSize: '16px',
              color: '#666666',
            }}>
              Loading products...
            </div>
          ) : (
            <ProductGrid
              products={products}
              onAddToQueue={handleAddToQueue}
              onToggleFavorite={handleToggleProductFavorite}
              favoriteProducts={favoriteProducts}
            />
          )}
        </div>

        <div style={queueColumnStyle} className="try-on-queue">
          <TryOnQueue
            slots={queue}
            onReorder={reorderQueue}
            onRemove={removeFromQueue}
            onToggleFavorite={toggleFavorite}
          />
        </div>

        <div style={panelColumnStyle} className="fitting-room-panel">
          <FittingRoomPanel
            outfit={queue}
            onReset={resetOutfit}
            onBuyOutfit={buyOutfit}
            chatMessages={chatMessages}
            onSendMessage={sendChatMessage}
            isTyping={isTyping}
          />
        </div>
      </div>

      <div style={footerStyle}>
        <button onClick={handleUpdateSearch} style={updateButtonStyle}>
          Update Search Criteria
        </button>
        <Mascot size="small" />
      </div>
    </div>
  );
};

export default FittingRoomPage;
