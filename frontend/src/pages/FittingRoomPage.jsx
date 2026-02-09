import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFittingRoom } from '../contexts/FittingRoomContext';
import { fetchFittingRoomProducts } from '../services/fittingRoomService';
import Header from '../components/common/Header/Header';
import OutfitGallery from '../components/fitting-room/OutfitGallery/OutfitGallery';
import VirtualModel from '../components/fitting-room/VirtualModel/VirtualModel';
import ProductStrip from '../components/fitting-room/ProductStrip/ProductStrip';
import ShoppingCart from '../components/fitting-room/ShoppingCart/ShoppingCart';
import Mascot from '../components/common/Mascot/Mascot';

const FittingRoomPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Extract journey context and queue items from route state
  const routeQueueItems = location.state?.queueItems || [];
  const routeJourneyId = location.state?.journeyId;
  const routeStylistThreadId = location.state?.stylistThreadId;

  const {
    queue,
    addProductToQueue,
    addProductsToQueue,
    removeFromQueue,
    buyOutfit,
    generateLookbook,
    isGenerating,
    thinkingText,
    chatMessages,
    setJourneyId,
    setStylistThreadId,
  } = useFittingRoom();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fitDescription, setFitDescription] = useState('Your outfit looks amazing! This combination brings out your personal style perfectly.');

  // Set journey context from route state
  useEffect(() => {
    if (routeJourneyId) setJourneyId(routeJourneyId);
    if (routeStylistThreadId) setStylistThreadId(routeStylistThreadId);
  }, [routeJourneyId, routeStylistThreadId, setJourneyId, setStylistThreadId]);

  // Add queue items from route state to fitting room queue (run once on mount)
  useEffect(() => {
    if (routeQueueItems.length > 0) {
      addProductsToQueue(routeQueueItems);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
  // This runs AFTER journey IDs are set in the context
  useEffect(() => {
    const filledSlots = queue.filter(s => s.fittingSet);
    if (filledSlots.length > 0 && !isGenerating) {
      generateLookbook();
    }
  }, [routeJourneyId, routeStylistThreadId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Derive outfit items from queue (flatten sets to individual products)
  // Lookup full product details from products state for cart/model rendering
  const outfitItems = queue
    .filter(s => s.fittingSet)
    .flatMap(s => s.fittingSet.productIds.map(id => {
      // Try to find full product details from products state
      const fullProduct = products.find(p => p.id === id);
      return fullProduct || {
        id,
        name: 'Unknown Product',
        brand: '',
        price: 0,
        image: '',
      };
    }));

  const selectedProductIds = queue
    .filter(slot => slot.fittingSet !== null)
    .flatMap(slot => slot.fittingSet.productIds);

  // Derive mascot message from the latest AI chat message
  const lastAiMessage = [...chatMessages].reverse().find(m => m.role === 'ai');
  const mascotMessage = lastAiMessage ? lastAiMessage.content : 'Add items to start styling!';

  const handleToggleProduct = (product) => {
    // Check if product is in any set
    const slotIndex = queue.findIndex(slot =>
      slot.fittingSet && slot.fittingSet.productIds.includes(product.id)
    );

    if (slotIndex !== -1) {
      // Product exists in a set - remove entire set
      removeFromQueue(slotIndex);
    } else {
      // Add as temporary single-item set
      const success = addProductToQueue(product);
      if (!success) {
        alert('Outfit queue is full! Remove a set to add more.');
      }
    }
  };

  const handleRemoveFromOutfit = (slotIndex) => {
    removeFromQueue(slotIndex);
  };

  const handleCheckout = () => {
    buyOutfit();
  };

  const pageStyle = {
    minHeight: '100vh',
    backgroundColor: '#fff9f5',
    backgroundImage: `
      radial-gradient(circle at 0% 50%, #9dcaff 0%, transparent 60%),
      radial-gradient(circle at 50% 50%, #ffb6e6 0%, transparent 65%),
      radial-gradient(circle at 100% 0%, #ffecd9 0%, transparent 60%)
    `,
    backgroundAttachment: 'fixed',
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



  const mascotAreaStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    width: '100%',
    marginTop: 'auto',
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
            queue={queue}  // Changed from items + fittingSets
            onRemoveSet={handleRemoveFromOutfit}
            isGenerating={isGenerating}
            thinkingText={thinkingText}
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
              message={fitDescription}
              bubbleSize="large"
              alwaysFloat={true}
            />
          </div>
        </div>

        {/* Right column: Shopping Cart */}
        <div className="shopping-cart-column">
          <ShoppingCart
            items={outfitItems}
            onCheckout={handleCheckout}
            onRemoveItem={handleRemoveFromOutfit}
          />
        </div>
      </div>
    </div>
  );
};

export default FittingRoomPage;
