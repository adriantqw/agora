import React from 'react';

const CarouselDots = ({ total, active, onChange }) => {
  const dotsContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '24px',
  };

  return (
    <div style={dotsContainerStyle}>
      {Array.from({ length: total }).map((_, index) => {
        const isActive = index === active;

        const dotStyle = {
          width: isActive ? '32px' : '8px',
          height: '8px',
          borderRadius: '4px',
          backgroundColor: isActive ? '#793DB0' : '#CBD5E0',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          border: 'none',
          padding: 0,
        };

        return (
          <button
            key={index}
            style={dotStyle}
            onClick={() => onChange(index)}
            aria-label={`Go to look ${index + 1}`}
          />
        );
      })}
    </div>
  );
};

export default CarouselDots;
