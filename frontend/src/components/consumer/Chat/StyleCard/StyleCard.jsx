import { Check } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useThemeColors } from '../../../../hooks/useThemeColors';
import { useState } from 'react';

export default function StyleCard({ id, label, icon, iconColor, bgColor, isSelected, onSelect }) {
  const colors = useThemeColors();
  const [isHovered, setIsHovered] = useState(false);

  // Dynamically get icon component
  const IconComponent = LucideIcons[icon] || LucideIcons.Heart;

  return (
    <div
      onClick={() => onSelect(id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: isSelected ? 'var(--color-primary-pink-light)' : colors.card.background,
        border: `2px solid ${isSelected ? colors.primary.eggPink : colors.border.subtle}`,
        borderRadius: '16px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        boxShadow: isHovered ? colors.shadow.md : colors.shadow.sm,
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
      }}
    >
      {/* Icon area */}
      <div
        style={{
          width: '100%',
          height: '150px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isSelected ? 'transparent' : colors.card.backgroundAlt,
        }}
      >
        <IconComponent size={36} color={iconColor || colors.primary.eggPink} />
      </div>

      {/* Label */}
      <div
        style={{
          padding: '14px',
          textAlign: 'center',
          fontWeight: '700',
          fontSize: '14px',
          color: colors.text.primary,
        }}
      >
        {label}
      </div>

      {/* Check circle overlay when selected */}
      {isSelected && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: colors.primary.eggPink,
            color: 'white',
            borderRadius: '50%',
            width: '22px',
            height: '22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Check size={14} />
        </div>
      )}
    </div>
  );
}
