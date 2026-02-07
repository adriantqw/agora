import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import LookCard from './LookCard';
import CarouselDots from './CarouselDots';

const LookCarousel = ({ looks, onSelectLook }) => {
  const [activeIndex, setActiveIndex] = useState(1); // Start with middle item

  const handlePrevious = () => {
    if (activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    }
  };

  const handleNext = () => {
    if (activeIndex < looks.length - 1) {
      setActiveIndex(activeIndex + 1);
    }
  };

  const handleDotClick = (index) => {
    setActiveIndex(index);
    onSelectLook(looks[index]);
  };

  const handleLookCardClick = (look, index) => {
    setActiveIndex(index);
    onSelectLook(look);
  };

  const containerStyle = {
    position: 'relative',
    width: '100%',
    padding: '0 48px', // Space for arrow buttons
  };

  const arrowButtonStyle = (disabled) => ({
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#FFFFFF',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    opacity: disabled ? '0.5' : '1',
    zIndex: 10,
  });

  const carouselTrackStyle = {
    display: 'flex',
    transition: 'transform 0.5s ease-out',
    transform: `translateX(calc(-${activeIndex * 100}% / 3 + 33.33%))`,
  };

  const carouselItemStyle = {
    width: 'calc(100% / 3)',
    height: '35vh',
    flexShrink: 0,
    padding: '0 8px',
  };

  const leftArrowStyle = {
    ...arrowButtonStyle(activeIndex === 0),
    left: '0',
  };

  const rightArrowStyle = {
    ...arrowButtonStyle(activeIndex === looks.length - 1),
    right: '0',
  };

  return (
    <div style={containerStyle}>
      {/* Previous Arrow */}
      <button
        style={leftArrowStyle}
        onClick={handlePrevious}
        disabled={activeIndex === 0}
        aria-label="Previous look"
        onMouseEnter={(e) => {
          if (activeIndex > 0) {
            e.currentTarget.style.backgroundColor = '#F7FAFC';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#FFFFFF';
        }}
      >
        <ChevronLeft size={20} color="#4A5568" />
      </button>

      {/* Next Arrow */}
      <button
        style={rightArrowStyle}
        onClick={handleNext}
        disabled={activeIndex === looks.length - 1}
        aria-label="Next look"
        onMouseEnter={(e) => {
          if (activeIndex < looks.length - 1) {
            e.currentTarget.style.backgroundColor = '#F7FAFC';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#FFFFFF';
        }}
      >
        <ChevronRight size={20} color="#4A5568" />
      </button>

      {/* Carousel Track */}
      <div style={carouselTrackStyle}>
        {looks.map((look, index) => (
          <div key={look.id} style={carouselItemStyle}>
            <LookCard
              look={look}
              isActive={index === activeIndex}
              onClick={() => handleLookCardClick(look, index)}
            />
          </div>
        ))}
      </div>

      {/* Pagination Dots */}
      <CarouselDots
        total={looks.length}
        active={activeIndex}
        onChange={handleDotClick}
      />
    </div>
  );
};

export default LookCarousel;
