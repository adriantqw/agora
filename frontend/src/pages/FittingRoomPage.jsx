import React, { useMemo, useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, ChevronDown, MessageCircle, ArrowRight, X } from 'lucide-react';
import Markdown from 'react-markdown';
import { useFittingRoom } from '../contexts/FittingRoomContext';
import Header from '../components/common/Header/Header';
import OutfitGallery from '../components/fitting-room/OutfitGallery/OutfitGallery';
import ShoppingCart from '../components/fitting-room/ShoppingCart/ShoppingCart';
import Mascot from '../components/common/Mascot/Mascot';

function ThinkingDropdown({ text, isActive, startTime }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const contentRef = useRef(null);

  useEffect(() => {
    if (!isActive && text) {
      const timer = setTimeout(() => setIsExpanded(false), 600);
      return () => clearTimeout(timer);
    }
    if (isActive) setIsExpanded(true);
  }, [isActive, text]);

  useEffect(() => {
    if (isExpanded && contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [text, isExpanded]);

  const elapsed = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;

  if (!text && !isActive) return null;

  return (
    <div style={{
      marginBottom: isExpanded ? '16px' : '8px',
      borderRadius: isExpanded ? '12px' : '20px',
      border: isExpanded ? '1px solid rgba(139, 92, 246, 0.15)' : 'none',
      background: isExpanded ? 'rgba(139, 92, 246, 0.04)' : 'transparent',
      overflow: 'hidden',
      animation: 'fadeIn 0.3s ease-out',
      maxWidth: isExpanded ? '100%' : 'fit-content',
      transition: 'all 0.3s ease',
    }}>
      <button
        onClick={() => setIsExpanded(prev => !prev)}
        style={{
          width: isExpanded ? '100%' : 'auto',
          display: 'inline-flex',
          alignItems: 'center',
          gap: isExpanded ? '8px' : '5px',
          padding: isExpanded ? '10px 14px' : '5px 12px',
          background: isExpanded ? 'none' : 'rgba(139, 92, 246, 0.08)',
          border: isExpanded ? 'none' : '1px solid rgba(139, 92, 246, 0.12)',
          borderRadius: isExpanded ? '0' : '20px',
          cursor: 'pointer',
          fontSize: isExpanded ? '13px' : '11px',
          fontWeight: '600',
          color: '#793DB0',
          transition: 'all 0.3s ease',
        }}
      >
        <Sparkles size={isExpanded ? 14 : 11} />
        <span style={{ textAlign: 'left' }}>
          {isActive ? 'Thinking' : `Thought for ${elapsed}s`}
        </span>
        {isActive && (
          <span style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                width: '4px', height: '4px',
                backgroundColor: '#793DB0', borderRadius: '50%',
                animation: `wiggle 1.4s ease-in-out infinite ${i * 0.2}s`,
              }} />
            ))}
          </span>
        )}
        <ChevronDown
          size={isExpanded ? 13 : 10}
          style={{
            transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
            transition: 'transform 0.3s ease',
          }}
        />
      </button>
      {isExpanded && (
        <div
          ref={contentRef}
          style={{
            padding: '8px 14px 12px',
            maxHeight: '140px',
            overflowY: 'auto',
            fontSize: '12px',
            lineHeight: '1.6',
            color: '#6B5B7A',
          }}
        >
          <Markdown>{text}</Markdown>
        </div>
      )}
    </div>
  );
}

const FittingRoomPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    queue,
    addMultipleToQueue,
    buyOutfit,
    generateLookbook,
    refineLookbook,
    fittingSets,
    isGenerating,
    isThinking,
    thinkingText,
    chatMessages,
    setJourneyId,
    setStylistThreadId,
  } = useFittingRoom();

  const [selectedSetIndex, setSelectedSetIndex] = useState(0);
  const [thinkingStartTime, setThinkingStartTime] = useState(null);
  const [showRefineInput, setShowRefineInput] = useState(false);
  const [refineText, setRefineText] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const navQueueItems = location.state?.queueItems || [];

  const productMap = useMemo(() => {
    return new Map(navQueueItems.map(item => [item.id, item]));
  }, [navQueueItems]);

  useEffect(() => {
    if (isThinking) {
      setThinkingStartTime(Date.now());
    }
  }, [isThinking]);

  useEffect(() => {
    if (!isGenerating) {
      setIsRefining(false);
    }
  }, [isGenerating]);

  // Load queue items and journey context from navigation state
  const hasInitialised = useRef(false);
  useEffect(() => {
    if (hasInitialised.current) return;
    hasInitialised.current = true;

    if (location.state?.journeyId) setJourneyId(location.state.journeyId);
    if (location.state?.stylistThreadId) setStylistThreadId(location.state.stylistThreadId);

    const navItems = location.state?.queueItems;
    if (navItems && navItems.length > 0) {
      addMultipleToQueue(navItems);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Trigger backend once queue is populated (waits for addMultipleToQueue to flush)
  const hasTriggeredGenerate = useRef(false);
  useEffect(() => {
    if (hasTriggeredGenerate.current) return;
    const items = queue.filter(s => s.product);
    if (items.length > 0 && fittingSets.length === 0 && !isGenerating) {
      hasTriggeredGenerate.current = true;
      generateLookbook();
    }
  }, [queue]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (selectedSetIndex >= fittingSets.length) {
      setSelectedSetIndex(0);
    }
  }, [fittingSets, selectedSetIndex]);

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [selectedSetIndex, fittingSets]);

  const selectedSet = fittingSets[selectedSetIndex] || null;
  const imagePaths = selectedSet?.imagePaths || (selectedSet?.imagePath ? [selectedSet.imagePath] : []);

  const resolvedProducts = (selectedSet?.productIds || [])
    .map(id => productMap.get(id))
    .filter(Boolean);

  const mascotMessage = [...chatMessages].reverse().find(m => m.role === 'ai')?.content
    || 'Ready to refine your fit?';

  const handleRefineSubmit = () => {
    if (!refineText.trim() || isRefining) return;
    setShowRefineInput(false);
    setIsRefining(true);
    refineLookbook(refineText.trim());
    setRefineText('');
  };

  const handleAddToCart = (product) => {
    setCartItems(prev => {
      if (prev.some(p => p.id === product.id)) return prev;
      return [...prev, product];
    });
  };

  const handleRemoveFromCart = (productId) => {
    setCartItems(prev => prev.filter(p => p.id !== productId));
  };

  const handleCheckout = () => {
    buyOutfit();
  };

  const handleRefineSearch = () => {
    setShowRefineInput(true);
  };

  const handleCloseRefine = () => {
    setShowRefineInput(false);
    setRefineText('');
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
    alignItems: 'stretch',
    overflowY: 'auto',
    minHeight: 0,
    gap: '16px',
  };

  const titleStyle = {
    fontSize: '28px',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #E8B4CB, #7B3FA0)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '4px',
    textAlign: 'left',
  };

  const shimmerCardStyle = {
    height: '180px',
    borderRadius: '16px',
    background: 'linear-gradient(90deg, #f3e9f7 25%, #ead7f1 50%, #f3e9f7 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.4s infinite',
  };

  const setCardStyle = {
    background: 'rgba(255, 255, 255, 0.92)',
    borderRadius: '16px',
    border: '1px solid var(--border-color)',
    padding: '18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  };

  const setTitleStyle = {
    fontSize: '18px',
    fontWeight: '700',
    color: '#2d1a3a',
    margin: 0,
  };

  const setDescStyle = {
    fontSize: '13px',
    color: '#6b5b7a',
    lineHeight: '1.6',
    margin: 0,
  };

  const imageContainerStyle = {
    position: 'relative',
    width: '100%',
    borderRadius: '16px',
    overflow: 'hidden',
    background: '#f7f2fa',
    minHeight: '240px',
  };

  const imageStyle = {
    width: '100%',
    height: '360px',
    objectFit: 'cover',
    display: 'block',
  };

  const arrowButtonStyle = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    border: 'none',
    background: 'rgba(255, 255, 255, 0.9)',
    boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#7B3FA0',
  };

  const itemsStripStyle = {
    display: 'flex',
    gap: '12px',
    overflowX: 'auto',
    paddingBottom: '6px',
  };

  const itemCardStyle = {
    minWidth: '160px',
    background: '#fff',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
    padding: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  };

  const addButtonStyle = {
    marginTop: 'auto',
    padding: '8px 10px',
    borderRadius: '999px',
    border: 'none',
    background: 'linear-gradient(135deg, #E8B4CB, #C9A0DC)',
    color: '#fff',
    fontWeight: '700',
    fontSize: '12px',
    cursor: 'pointer',
  };

  const refineInputStyle = {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    marginTop: '8px',
  };

  const refineTextStyle = {
    flex: 1,
    padding: '10px 14px',
    borderRadius: '999px',
    border: '1px solid #E8B4CB',
    fontSize: '13px',
    outline: 'none',
  };

  const refineButtonStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: 'none',
    background: 'linear-gradient(135deg, #7B3FA0 0%, #9F6AD6 100%)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  };

  const refineCtaStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(123, 63, 160, 0.08)',
    color: '#7B3FA0',
    padding: '8px 14px',
    borderRadius: '999px',
    fontWeight: '600',
    fontSize: '13px',
    border: '1px solid rgba(123, 63, 160, 0.2)',
    cursor: 'pointer',
  };

  const mascotAreaStyle = {
    display: 'flex',
    gap: '14px',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: '4px',
    flexWrap: 'wrap',
  };

  const mediaQueryStyle = `
    @media (max-width: 1200px) {
      .fitting-room-layout {
        grid-template-columns: 1fr 340px !important;
      }
      .fitting-sets-column {
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

    @keyframes shimmer {
      from { background-position: -200% 0; }
      to { background-position: 200% 0; }
    }

    @keyframes wiggle {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-6px); }
    }
  `;

  return (
    <div style={pageStyle}>
      <style>{mediaQueryStyle}</style>

      <Header compact={true} />

      <div style={mainLayoutStyle} className="fitting-room-layout">
        {/* Left column: Fitting sets list */}
        <div className="fitting-sets-column">
          <OutfitGallery
            fittingSets={fittingSets}
            selectedIndex={selectedSetIndex}
            onSelectSet={setSelectedSetIndex}
            isGenerating={isGenerating}
          />
        </div>

        {/* Center column: Lookbook display */}
        <div style={centerColumnStyle}>
          <div>
            <h1 style={titleStyle}>Fitting Room</h1>
            <ThinkingDropdown text={thinkingText} isActive={isGenerating || isThinking} startTime={thinkingStartTime} />
          </div>

          {isGenerating && fittingSets.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={shimmerCardStyle} />
              ))}
            </div>
          ) : (
            <div style={setCardStyle}>
              <div>
                <h2 style={setTitleStyle}>{selectedSet?.title || 'Your Lookbook Set'}</h2>
                {selectedSet?.description && <p style={setDescStyle}>{selectedSet.description}</p>}
              </div>

              <div style={imageContainerStyle}>
                {imagePaths.length > 0 ? (
                  <>
                    <img
                      src={imagePaths[selectedImageIndex]}
                      alt={selectedSet?.title || 'Fitting set'}
                      style={imageStyle}
                    />
                    {imagePaths.length > 1 && (
                      <>
                        <button
                          style={{ ...arrowButtonStyle, left: '12px' }}
                          onClick={() => setSelectedImageIndex((prev) => Math.max(0, prev - 1))}
                          disabled={selectedImageIndex === 0}
                        >
                          <ArrowRight size={16} style={{ transform: 'rotate(180deg)' }} />
                        </button>
                        <button
                          style={{ ...arrowButtonStyle, right: '12px' }}
                          onClick={() => setSelectedImageIndex((prev) => Math.min(imagePaths.length - 1, prev + 1))}
                          disabled={selectedImageIndex === imagePaths.length - 1}
                        >
                          <ArrowRight size={16} />
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div style={{ ...imageStyle, height: '280px' }} />
                )}
              </div>

              {resolvedProducts.length > 0 && (
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#6b5b7a', marginBottom: '8px' }}>
                    Items in this set
                  </div>
                  <div style={itemsStripStyle}>
                    {resolvedProducts.map((product) => (
                      <div key={product.id} style={itemCardStyle}>
                        <img
                          src={product.image}
                          alt={product.name}
                          style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '10px' }}
                        />
                        <div style={{ fontSize: '12px', fontWeight: '700', color: '#2d1a3a' }}>{product.name}</div>
                        <div style={{ fontSize: '11px', color: '#6b5b7a' }}>{product.brand}</div>
                        <div style={{ fontSize: '12px', fontWeight: '700', color: '#7B3FA0' }}>
                          {product.price != null ? `$${Number(product.price).toFixed(2)}` : 'Price on request'}
                        </div>
                        <button style={addButtonStyle} onClick={() => handleAddToCart(product)}>
                          + Add to Cart
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={mascotAreaStyle}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <Mascot variant="default" position="relative" message={mascotMessage} />
                </div>

                <div>
                  {!showRefineInput ? (
                    <button style={refineCtaStyle} onClick={handleRefineSearch}>
                      <MessageCircle size={14} />
                      Refine Fit
                    </button>
                  ) : (
                    <div style={refineInputStyle}>
                      <input
                        type="text"
                        value={refineText}
                        onChange={(e) => setRefineText(e.target.value)}
                        placeholder="Tell me what to adjust..."
                        style={refineTextStyle}
                      />
                      <button style={refineButtonStyle} onClick={handleRefineSubmit} disabled={isRefining}>
                        <ArrowRight size={16} />
                      </button>
                      <button
                        onClick={handleCloseRefine}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          border: '1px solid #E8B4CB',
                          background: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <X size={14} color="#7B3FA0" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right column: Shopping Cart */}
        <div className="shopping-cart-column">
          <ShoppingCart
            items={cartItems}
            onRemoveItem={handleRemoveFromCart}
            onCheckout={handleCheckout}
          />
        </div>
      </div>
    </div>
  );
};

export default FittingRoomPage;
