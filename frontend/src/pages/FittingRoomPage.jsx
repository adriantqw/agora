import React, { useMemo, useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, ChevronDown, MessageCircle, ArrowRight, X, Plus } from 'lucide-react';
import Markdown from 'react-markdown';
import { useFittingRoom } from '../contexts/FittingRoomContext';
import Header from '../components/common/Header/Header';
import Growl from '../components/common/Growl/Growl';
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
      borderRadius: isExpanded ? '16px' : '20px',
      border: isExpanded ? '1px solid rgba(255, 255, 255, 0.3)' : 'none',
      background: isExpanded ? 'rgba(255, 255, 255, 0.7)' : 'transparent',
      boxShadow: isExpanded ? '0 10px 30px rgba(0, 0, 0, 0.03)' : 'none',
      backdropFilter: isExpanded ? 'blur(12px)' : 'none',
      WebkitBackdropFilter: isExpanded ? 'blur(12px)' : 'none',
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
          background: isExpanded ? 'none' : 'rgba(121, 61, 176, 0.08)',
          border: isExpanded ? 'none' : '1px solid rgba(121, 61, 176, 0.12)',
          borderRadius: isExpanded ? '0' : '20px',
          cursor: 'pointer',
          fontSize: isExpanded ? '13px' : '11px',
          fontWeight: '600',
          color: '#793DB0',
          fontFamily: '"Readex Pro", -apple-system, sans-serif',
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
            color: '#666',
            fontFamily: '"Readex Pro", -apple-system, sans-serif',
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
    initializeFromNavigation,
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
  const [selectedItems, setSelectedItems] = useState(() => new Set());
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [hoveredItemId, setHoveredItemId] = useState(null);
  const [growl, setGrowl] = useState({
    show: false,
    message: '',
    type: 'success',
  });

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
      initializeFromNavigation(navItems);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Trigger backend once queue is populated (waits for navigation init to flush)
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

  useEffect(() => {
    setSelectedItems(new Set());
  }, [selectedSetIndex, fittingSets]);

  const selectedSet = fittingSets[selectedSetIndex] || null;
  const imagePaths = selectedSet?.imagePaths || (selectedSet?.imagePath ? [selectedSet.imagePath] : []);

  const resolvedProducts = (selectedSet?.productIds || [])
    .map(id => productMap.get(id))
    .filter(Boolean);

  useEffect(() => {
    if (selectedSet) {
      console.log('[FittingRoom] productIds:', selectedSet.productIds);
      console.log('[FittingRoom] productMap keys:', [...productMap.keys()]);
      (selectedSet.productIds || []).forEach(id => {
        console.log(`[FittingRoom] ID "${id}" -> ${productMap.get(id) ? 'FOUND' : 'NOT FOUND'}`);
      });
    }
  }, [selectedSet, productMap]);

  const mascotMessage = [...chatMessages].reverse().find(m => m.role === 'ai')?.content
    || 'Ready to refine your fit?';

  const handleRefineSubmit = () => {
    if (!refineText.trim() || isRefining) return;
    setShowRefineInput(false);
    setIsRefining(true);
    refineLookbook(refineText.trim());
    setRefineText('');
  };

  const handleToggleRefine = () => {
    setShowRefineInput(prev => !prev);
    setRefineText('');
  };

  const handleRefineKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleRefineSubmit();
    }
  };

  const handleAddToCart = (product) => {
    setCartItems(prev => {
      if (prev.some(p => p.id === product.id)) return prev;
      return [...prev, product];
    });
  };

  const handleToggleItemSelection = (productId) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const handleAddSelectedToCart = () => {
    if (selectedItems.size === 0) return;
    setCartItems(prev => {
      const next = [...prev];
      selectedItems.forEach((id) => {
        const product = resolvedProducts.find(p => p.id === id);
        if (product && !next.some(p => p.id === product.id)) {
          next.push(product);
        }
      });
      return next;
    });
    setSelectedItems(new Set());
  };

  const handleRemoveFromCart = (productId) => {
    setCartItems(prev => prev.filter(p => p.id !== productId));
  };

  const handleCheckout = () => {
    setGrowl({ show: true, message: 'Checkout successful', type: 'success' });
    setTimeout(() => setGrowl({ show: false, message: '', type: 'success' }), 3000);
  };

  const designTokens = {
    fontFamily: '"Readex Pro", -apple-system, sans-serif',
    primary: '#793DB0',
    border: '#E2E8F0',
    frostedBg: 'rgba(255, 255, 255, 0.7)',
    frostedBorder: '1px solid rgba(255, 255, 255, 0.3)',
    shadowSoft: '0 10px 30px rgba(0, 0, 0, 0.03)',
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
    fontFamily: designTokens.fontFamily,
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
    gap: '12px',
  };

  const titleStyle = {
    fontSize: '28px',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #7B3FA0, #4A1D6A)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '4px',
    textAlign: 'left',
  };

  const shimmerCardStyle = {
    height: '180px',
    borderRadius: '24px',
    background: 'linear-gradient(90deg, #f0e6f6 25%, #e8d5f5 50%, #f0e6f6 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.4s infinite',
    border: designTokens.frostedBorder,
    boxShadow: designTokens.shadowSoft,
  };

  const setCardStyle = {
    background: designTokens.frostedBg,
    borderRadius: '24px',
    border: designTokens.frostedBorder,
    boxShadow: designTokens.shadowSoft,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
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
    background: '#FFFFFF',
    border: `1px solid ${designTokens.border}`,
    minHeight: '240px',
  };

  const imageStyle = {
    width: '100%',
    height: '360px',
    objectFit: 'contain',
    display: 'block',
  };

  const arrowButtonStyle = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    border: 'none',
    background: '#FFFFFF',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#4A5568',
  };

  const itemsStripStyle = {
    display: 'flex',
    gap: '12px',
    overflowX: 'auto',
    paddingBottom: '6px',
  };

  const itemCardStyle = {
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    minWidth: '140px',
    maxWidth: '180px',
    flex: '0 0 auto',
    height: '100%',
  };

  const itemImageContainerStyle = {
    position: 'relative',
    flex: '1',
    minHeight: '0',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    overflow: 'hidden',
    marginBottom: '8px',
    border: `1px solid ${designTokens.border}`,
    transition: 'all 0.2s ease',
  };

  const itemImageStyle = {
    width: '100%',
    height: '120px',
    objectFit: 'contain',
    transition: 'transform 0.3s ease',
    background: '#FFFFFF',
  };

  const itemAddButtonStyle = (isHovered) => ({
    position: 'absolute',
    top: '6px',
    right: '6px',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: isHovered ? designTokens.primary : '#FFFFFF',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    opacity: isHovered ? 1 : 0,
  });

  const addAllButtonStyle = {
    marginTop: '10px',
    padding: '8px 16px',
    borderRadius: '999px',
    border: 'none',
    background: 'linear-gradient(135deg, #7B3FA0 0%, #9F6AD6 100%)',
    color: '#fff',
    fontWeight: '700',
    fontSize: '12px',
    cursor: 'pointer',
  };

  const chatInputStyle = {
    flex: '1',
    padding: '0 20px',
    borderRadius: '24px',
    border: `1px solid ${designTokens.border}`,
    fontSize: '14px',
    outline: 'none',
    height: '44px',
    boxSizing: 'border-box',
    fontFamily: designTokens.fontFamily,
  };

  const sendButtonStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: '#793DB0',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s',
  };

  const refineTextStyle = {
    fontSize: '14px',
    color: '#4A5568',
    margin: 0,
  };

  const refineButtonStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '2px solid transparent',
    background: 'white',
    backgroundClip: 'padding-box',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    position: 'relative',
  };

  const bottomMascotAreaStyle = {
    display: 'flex',
    gap: '14px',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
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
            <>
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
                      {resolvedProducts.map((product) => {
                        const isSelected = selectedItems.has(product.id);
                        const isHovered = hoveredItemId === product.id;
                        return (
                          <div
                            key={product.id}
                            style={{
                              ...itemCardStyle,
                              transform: isHovered && !isSelected ? 'scale(1.02)' : 'scale(1)',
                            }}
                            onClick={() => handleToggleItemSelection(product.id)}
                            onMouseEnter={() => setHoveredItemId(product.id)}
                            onMouseLeave={() => setHoveredItemId(null)}
                          >
                            <div
                              style={{
                                ...itemImageContainerStyle,
                                border: isSelected ? `2px solid ${designTokens.primary}` : itemImageContainerStyle.border,
                                boxShadow: isSelected ? '0 4px 12px rgba(121, 61, 176, 0.2)' : 'none',
                              }}
                            >
                              <img
                                src={product.image}
                                alt={product.name}
                                style={{
                                  ...itemImageStyle,
                                  transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                                }}
                              />
                              <button
                                style={itemAddButtonStyle(isHovered)}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleAddToCart(product);
                                  setSelectedItems(prev => {
                                    const next = new Set(prev);
                                    next.delete(product.id);
                                    return next;
                                  });
                                }}
                                aria-label="Add to cart"
                              >
                                <Plus
                                  size={14}
                                  color={isHovered ? '#FFFFFF' : '#4A5568'}
                                />
                              </button>
                            </div>
                            <div style={{ fontSize: '11px', fontWeight: '600', color: '#1A202C', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {product.name}
                            </div>
                            <div style={{ fontSize: '12px', fontWeight: '700', color: '#793DB0' }}>
                              {product.price != null ? `$${Number(product.price).toFixed(2)}` : 'Price on request'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {selectedItems.size > 0 && (
                      <button style={addAllButtonStyle} onClick={handleAddSelectedToCart}>
                        Add {selectedItems.size} items to Cart
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div style={bottomMascotAreaStyle}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flex: 1, minWidth: 0 }}>
                  <Mascot variant="avatar" size={60} />
                  <div style={{
                    background: 'white',
                    border: '2px solid #F5A5B8',
                    borderRadius: '16px 16px 16px 4px',
                    padding: '12px 16px',
                    flex: 1,
                    maxWidth: '100%',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#1a202c',
                    boxShadow: '0 4px 12px rgba(245, 165, 184, 0.25)',
                    lineHeight: '1.5',
                  }}>
                    {mascotMessage}
                  </div>
                </div>

                {!isGenerating && !isRefining && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      justifyContent: 'flex-end',
                      marginTop: 'auto',
                      height: '44px',
                      fontFamily: designTokens.fontFamily,
                    }}>
                    {showRefineInput && (
                      <input
                        type="text"
                        value={refineText}
                        onChange={(e) => setRefineText(e.target.value)}
                        onKeyDown={handleRefineKeyDown}
                        placeholder="Tell me what you'd like..."
                        style={chatInputStyle}
                        autoFocus
                      />
                    )}

                    {!showRefineInput && (
                      <p style={{ ...refineTextStyle, cursor: 'pointer' }} onClick={handleToggleRefine}>
                        Not quite right? Refine your search
                      </p>
                    )}

                    {showRefineInput && (
                      <button
                        onClick={handleRefineSubmit}
                        style={sendButtonStyle}
                        disabled={!refineText.trim() || isRefining}
                        aria-label="Send refine request"
                      >
                        <ArrowRight size={20} />
                      </button>
                    )}

                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #793DB0 0%, #9F6AD6 100%)',
                        padding: '2px',
                        flexShrink: 0,
                        cursor: 'pointer',
                      }}
                      onClick={handleToggleRefine}
                    >
                      <button
                        style={{
                          ...refineButtonStyle,
                          width: '100%',
                          height: '100%',
                          background: 'white',
                          border: 'none',
                        }}
                        aria-label={showRefineInput ? 'Close refine' : 'Refine fit'}
                        onMouseEnter={(event) => { event.currentTarget.style.background = '#F7FAFC'; }}
                        onMouseLeave={(event) => { event.currentTarget.style.background = 'white'; }}
                      >
                        {showRefineInput ? (
                          <X size={18} color="#793DB0" />
                        ) : (
                          <MessageCircle
                            size={20}
                            style={{
                              background: 'linear-gradient(135deg, #793DB0 0%, #9F6AD6 100%)',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              backgroundClip: 'text',
                            }}
                          />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
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

      {/* Growl Notification */}
      <Growl
        message={growl.message}
        type={growl.type}
        show={growl.show}
        onClose={() => setGrowl({ show: false, message: '', type: 'success' })}
        customStyle={{
          background: '#FFFFFF',
          textColor: '#1A202C',
          border: '#E2E8F0',
        }}
      />
    </div>
  );
};

export default FittingRoomPage;
