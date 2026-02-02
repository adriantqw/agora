import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header/Header';
import Mascot from '../components/common/Mascot/Mascot';
import { useThemeColors } from '../hooks/useThemeColors';

export default function BrowsePage() {
  const navigate = useNavigate();
  const colors = useThemeColors();

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.page.background,
      fontFamily: '"Inter", -apple-system, sans-serif',
      position: 'relative',
    }}>
      <Header
        variant="full"
        showNav={true}
        onQuizClick={() => navigate('/curate-my-fit')}
      />

      <div style={{
        padding: '64px 48px',
        textAlign: 'center',
        maxWidth: '800px',
        margin: '0 auto',
      }}>
        <h1 style={{
          fontSize: '48px',
          fontWeight: '700',
          color: colors.text.primary,
          marginBottom: '16px',
        }}>
          Browse Collections
        </h1>
        <p style={{
          fontSize: '18px',
          color: colors.text.secondary,
          marginBottom: '48px',
        }}>
          This feature is coming soon! Explore our curated collections.
        </p>

        <button
          onClick={() => navigate('/')}
          style={{
            padding: '16px 32px',
            fontSize: '16px',
            fontWeight: '600',
            color: 'white',
            background: 'linear-gradient(135deg, #F5A5B8 0%, #E8879C 100%)',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(245, 165, 184, 0.3)',
          }}
        >
          Back to Home
        </button>
      </div>

      <Mascot
        message="Take your time browsing!"
        isSearching={false}
        position="bottom-right"
      />
    </div>
  );
}
