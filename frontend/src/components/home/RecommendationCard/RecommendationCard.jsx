import { useState } from 'react';

export default function RecommendationCard({
  style,
  tags = [],
  imageUrl,
  onClick,
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        cursor: 'pointer',
        transform: isHovered ? 'scale(1.02)' : 'scale(1)',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Image/Placeholder Box */}
      <div style={{
        aspectRatio: '3/4',
        background: imageUrl ? `url(${imageUrl}) center/cover` : '#E5E7EB',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '12px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: isHovered ? '0 8px 24px rgba(0, 0, 0, 0.12)' : '0 2px 8px rgba(0, 0, 0, 0.06)',
        transition: 'box-shadow 0.2s ease',
      }}>
        {!imageUrl && (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        )}

        {/* Style label overlay on card */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          padding: '6px 12px',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: '600',
          color: '#1a202c',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        }}>
          {style}
        </div>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
        }}>
          {tags.map((tag, index) => (
            <span
              key={index}
              style={{
                padding: '4px 12px',
                fontSize: '12px',
                fontWeight: '500',
                color: '#E8879C',
                background: '#FFF5F7',
                borderRadius: '12px',
                border: '1px solid #FDD5DD',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
