import { Sparkles } from 'lucide-react';
import { useThemeColors } from '../../../../hooks/useThemeColors';

export default function AIAvatar({ size = 40 }) {
  const colors = useThemeColors();

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        background: colors.primary.eggPink,
        color: 'white',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 4px 12px rgba(255, 183, 197, 0.3)',
      }}
    >
      <Sparkles size={size * 0.5} />
    </div>
  );
}
