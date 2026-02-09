import React from 'react';

const VirtualModel = ({ outfit = [], onLoad }) => {
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: '500px',
    margin: '0 auto',
    padding: '20px',
  };

  React.useEffect(() => {
    if (onLoad) {
      onLoad();
    }
  }, [onLoad]);

  return (
    <div style={containerStyle}>
      {/* Mannequin silhouette SVG */}
      <svg
        width="200"
        height="350"
        viewBox="0 0 200 350"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity: 0.25 }}
      >
        {/* Head */}
        <ellipse cx="100" cy="40" rx="28" ry="32" fill="#7B3FA0" />
        {/* Neck */}
        <rect x="90" y="70" width="20" height="20" rx="4" fill="#7B3FA0" />
        {/* Shoulders */}
        <path d="M60 90 Q100 85 140 90 L150 100 Q100 95 50 100 Z" fill="#7B3FA0" />
        {/* Torso */}
        <path d="M55 100 L65 200 Q100 210 135 200 L145 100 Q100 95 55 100 Z" fill="#7B3FA0" />
        {/* Left arm */}
        <path d="M55 100 L40 110 L30 170 L38 172 L48 115 L55 108 Z" fill="#7B3FA0" />
        {/* Right arm */}
        <path d="M145 100 L160 110 L170 170 L162 172 L152 115 L145 108 Z" fill="#7B3FA0" />
        {/* Left hand */}
        <ellipse cx="34" cy="176" rx="8" ry="10" fill="#7B3FA0" />
        {/* Right hand */}
        <ellipse cx="166" cy="176" rx="8" ry="10" fill="#7B3FA0" />
        {/* Hips / Skirt area */}
        <path d="M65 200 L55 210 Q100 220 145 210 L135 200 Q100 210 65 200 Z" fill="#7B3FA0" />
        {/* Left leg */}
        <path d="M70 210 L65 310 L58 312 L60 315 L78 315 L80 312 L75 210 Z" fill="#7B3FA0" />
        {/* Right leg */}
        <path d="M125 210 L120 310 L122 312 L120 315 L140 315 L142 312 L135 310 L130 210 Z" fill="#7B3FA0" />
        {/* Left foot */}
        <path d="M58 312 L50 318 L48 325 L80 325 L80 315 L58 315 Z" fill="#7B3FA0" />
        {/* Right foot */}
        <path d="M120 315 L120 325 L152 325 L150 318 L142 312 L140 315 Z" fill="#7B3FA0" />
      </svg>
    </div>
  );
};

export default VirtualModel;
