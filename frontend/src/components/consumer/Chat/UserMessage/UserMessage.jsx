import { useThemeColors } from '../../../../hooks/useThemeColors';

export default function UserMessage({ text, timestamp }) {
  const colors = useThemeColors();

  return (
    <div
      style={{
        alignSelf: 'flex-end',
        maxWidth: '80%',
        marginBottom: '10px',
        animation: 'fadeIn 0.4s ease',
      }}
    >
      <div
        style={{
          background: colors.text.primary,
          color: 'white',
          padding: '16px 24px',
          borderRadius: '24px 24px 4px 24px',
          fontSize: '15px',
          fontWeight: '500',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        }}
      >
        {text}
      </div>
    </div>
  );
}
