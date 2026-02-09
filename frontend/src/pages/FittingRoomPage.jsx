import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFittingRoom } from '../contexts/FittingRoomContext';
import { fetchFittingRoomProducts } from '../services/fittingRoomService';
import Header from '../components/common/Header/Header';
import OutfitGallery from '../components/fitting-room/OutfitGallery/OutfitGallery';
import VirtualModel from '../components/fitting-room/VirtualModel/VirtualModel';
import ProductStrip from '../components/fitting-room/ProductStrip/ProductStrip';
import ShoppingCart from '../components/fitting-room/ShoppingCart/ShoppingCart';
import Mascot from '../components/common/Mascot/Mascot';
import AIChat from '../components/fitting-room/AIChat/AIChat';

const FittingRoomPage = () => {
  const navigate = useNavigate();
  const {
    queue,
    addToQueue,
    removeFromQueue,
    buyOutfit,
    generateLookbook,
    fittingSets,
    isGenerating,
    sendChatMessage,
    chatMessages,
    isTyping,
  } = useFittingRoom();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load all products on mount
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const data = await fetchFittingRoomProducts('current');
        setProducts(data);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  // Trigger backend fitting assistant on mount when queue has items
  useEffect(() => {
    const items = queue.filter(s => s.product);
    if (items.length > 0 && fittingSets.length === 0 && !isGenerating) {
      generateLookbook();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Derive outfit items from queue
  const outfitItems = queue
    .filter(s => s.product)
    .map(s => s.product);

  const selectedProductIds = outfitItems.map(p => p.id);

  // Derive mascot message from the latest AI chat message
  const lastAiMessage = [...chatMessages].reverse().find(m => m.role === 'ai');
  const mascotMessage = lastAiMessage ? lastAiMessage.content : 'Add items to start styling!';

  const handleToggleProduct = (product) => {
    const slotIndex = queue.findIndex(s => s.product && s.product.id === product.id);
    if (slotIndex !== -1) {
      removeFromQueue(slotIndex);
    } else {
      const success = addToQueue(product);
      if (!success) {
        alert('Outfit is full! Remove an item to add a new one.');
      }
    }
  };

  const handleRemoveFromOutfit = (productId) => {
    const slotIndex = queue.findIndex(s => s.product && s.product.id === productId);
    if (slotIndex !== -1) {
      removeFromQueue(slotIndex);
    }
  };

  const handleCheckout = () => {
    buyOutfit();
  };

  const handleRefineSearch = () => {
    navigate('/curate-my-fit');
  };

  const pageStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #FDE8EF 0%, #E8D5F0 50%, #F0E6F6 100%)',
    display: 'flex',
    flexDirection: 'column',
  };

  const mainLayoutStyle = {
    display: 'grid',
    gridTemplateColumns: '350px 1fr 340px',
    flex: 1,
    padding: '20px',
    gap: '20px',
    overflow: 'hidden',
    height: 'calc(100vh - 80px)',
  };

  const centerColumnStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    overflow: 'hidden',
  };

  const titleStyle = {
    fontSize: '28px',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #E8B4CB, #7B3FA0)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '8px',
    textAlign: 'center',
  };

  const refineSearchStyle = {
    fontSize: '14px',
    color: '#7B3FA0',
    textDecoration: 'underline',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    fontWeight: '500',
    marginTop: '8px',
  };

  const mascotAreaStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: '12px',
  };

  const mediaQueryStyle = `
    @media (max-width: 1200px) {
      .fitting-room-layout {
        grid-template-columns: 1fr 340px !important;
      }
      .outfit-gallery-column {
        display: none !important;
      }
    }

    @media (max-width: 768px) {
      .fitting-room-layout {
        grid-template-columns: 1fr !important;
        height: auto !important;
        overflow: visible !important;
      }
      .shopping-cart-column {
        max-height: 400px;
      }
    }
  `;

  return (
    <div style={pageStyle}>
      <style>{mediaQueryStyle}</style>

      <Header compact={true} />

      <div style={mainLayoutStyle} className="fitting-room-layout">
        {/* Left column: Try On Queue */}
        <div className="outfit-gallery-column">
          <OutfitGallery
            items={outfitItems}
            onRemoveItem={handleRemoveFromOutfit}
            fittingSets={fittingSets}
            isGenerating={isGenerating}
          />
        </div>

        {/* Center column: Mannequin + Product Strip + Mascot */}
        <div style={centerColumnStyle}>
          <h1 style={titleStyle}>Fitting Room</h1>

          <VirtualModel outfit={queue} />

          <ProductStrip
            products={products}
            selectedProductIds={selectedProductIds}
            onToggleProduct={handleToggleProduct}
            loading={loading}
          />

          <div style={mascotAreaStyle}>
            <Mascot
              variant="default"
              position="relative"
              message={mascotMessage}
            />
            <button
              style={refineSearchStyle}
              onClick={handleRefineSearch}
            >
              Refine your search
            </button>
          </div>
        </div>

        {/* Right column: Shopping Cart + AI Chat */}
        <div className="shopping-cart-column" style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflow: 'hidden' }}>
          <ShoppingCart
            items={outfitItems}
            onCheckout={handleCheckout}
          />
          <AIChat
            messages={chatMessages}
            onSendMessage={sendChatMessage}
            isTyping={isTyping}
          />
        </div>
      </div>
    </div>
  );
};

export default FittingRoomPage;
