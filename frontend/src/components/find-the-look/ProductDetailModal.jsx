import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const ProductDetailModal = ({ item, isOpen, onClose, onAddToQueue }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Reset state when item changes
  useEffect(() => {
    if (item) {
      setSelectedImage(0);
      setSelectedSize('');
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)',
  };

  const modalStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    maxWidth: '900px',
    width: '90%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2)',
    padding: '24px',
    position: 'relative',
  };

  const closeButtonStyle = {
    position: 'absolute',
    top: '16px',
    right: '16px',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#F7FAFC',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  const contentStyle = {
    display: 'flex',
    gap: '24px',
    marginTop: '24px',
  };

  const imageSectionStyle = {
    display: 'flex',
    gap: '16px',
    flexShrink: 0,
  };

  const thumbnailsStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  };

  const thumbnailStyle = (isSelected) => ({
    width: '80px',
    height: '80px',
    borderRadius: '8px',
    overflow: 'hidden',
    border: `2px solid ${isSelected ? '#793DB0' : '#E2E8F0'}`,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  });

  const thumbnailImageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  };

  const mainImageContainerStyle = {
    width: '384px',
    height: '500px',
    backgroundColor: '#F7FAFC',
    borderRadius: '8px',
    overflow: 'hidden',
  };

  const mainImageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  };

  const infoStyle = {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  };

  const brandStyle = {
    fontSize: '14px',
    color: '#718096',
    margin: 0,
  };

  const nameStyle = {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1A202C',
    margin: 0,
  };

  const priceStyle = {
    fontSize: '24px',
    fontWeight: '700',
    color: '#793DB0',
    margin: 0,
  };

  const labelStyle = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: '8px',
  };

  const colorOptionsStyle = {
    display: 'flex',
    gap: '8px',
  };

  const colorOptionStyle = (isSelected) => ({
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: `2px solid ${isSelected ? '#793DB0' : '#E2E8F0'}`,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  });

  const selectStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #E2E8F0',
    backgroundColor: '#FFFFFF',
    fontSize: '14px',
    color: '#1A202C',
    cursor: 'pointer',
    outline: 'none',
  };

  const descriptionStyle = {
    fontSize: '15px',
    lineHeight: '1.6',
    color: '#4A5568',
    margin: 0,
  };

  const addButtonStyle = {
    background: 'linear-gradient(135deg, #793DB0 0%, #9F6AD6 100%)',
    padding: '16px 32px',
    borderRadius: '8px',
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: '16px',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(121, 61, 176, 0.3)',
    transition: 'all 0.2s ease',
    marginTop: '16px',
  };

  const images = item.images && item.images.length > 0 ? item.images : [item.image];

  const handleAddToQueue = () => {
    const itemWithSize = { ...item, selectedSize };
    onAddToQueue(itemWithSize);
    onClose();
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          style={closeButtonStyle}
          onClick={onClose}
          aria-label="Close modal"
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#E2E8F0';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#F7FAFC';
          }}
        >
          <X size={20} color="#4A5568" />
        </button>

        <div style={contentStyle}>
          {/* Left: Image Gallery */}
          <div style={imageSectionStyle}>
            {/* Thumbnails */}
            {images.length > 1 && (
              <div style={thumbnailsStyle}>
                {images.map((img, index) => (
                  <button
                    key={index}
                    style={thumbnailStyle(index === selectedImage)}
                    onClick={() => setSelectedImage(index)}
                    aria-label={`View image ${index + 1}`}
                  >
                    <img
                      src={img}
                      alt={`${item.name} view ${index + 1}`}
                      style={thumbnailImageStyle}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image */}
            <div style={mainImageContainerStyle}>
              <img
                src={images[selectedImage] || item.image}
                alt={item.name}
                style={mainImageStyle}
              />
            </div>
          </div>

          {/* Right: Product Info */}
          <div style={infoStyle}>
            <p style={brandStyle}>{item.brand}</p>
            <h1 style={nameStyle}>{item.name}</h1>
            <p style={priceStyle}>${item.price}</p>

            {/* Color Options */}
            {item.color && (
              <div>
                <p style={labelStyle}>Colour</p>
                <div style={colorOptionsStyle}>
                  <button
                    style={colorOptionStyle(true)}
                    aria-label={`Color: ${item.color}`}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: item.color,
                        borderRadius: '50%',
                      }}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* Size Selector */}
            <div>
              <p style={labelStyle}>Size</p>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                style={selectStyle}
              >
                <option value="">Select size</option>
                <option value="xs">XS</option>
                <option value="s">S</option>
                <option value="m">M</option>
                <option value="l">L</option>
                <option value="xl">XL</option>
              </select>
            </div>

            {/* Description */}
            {item.description && (
              <p style={descriptionStyle}>{item.description}</p>
            )}

            {/* Add to Queue Button */}
            <button
              style={addButtonStyle}
              onClick={handleAddToQueue}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(121, 61, 176, 0.4)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(121, 61, 176, 0.3)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Add to Fitting Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
